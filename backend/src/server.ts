import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { PrismaClient, Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'
import cookieParser from 'cookie-parser'
import { requireAuth } from './middleware/auth'
import jwt from 'jsonwebtoken'
import PDFDocument from 'pdfkit'
import { getMatrixCached, refreshMatrix } from './excelMatrix'
import { scoreAssessmentByCategory } from './scoring'

const app = express()
const prisma = new PrismaClient()
const MATRIX_XLSX = process.env.MATRIX_XLSX || './data/shift_matrix.xlsx'
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';
app.set('trust proxy',1)
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
type LoginBody = {email: string; password: string};
// middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(cookieParser())

// GET /matrix?pillar=E|S|G [&refresh=1]
app.get('/matrix', async (req: Request, res: Response) => {
  try {
    const { pillar, refresh } = req.query as { pillar?: string; refresh?: string }
    const rows = refresh ? refreshMatrix(MATRIX_XLSX) : getMatrixCached(MATRIX_XLSX)
    const filtered = pillar
      ? rows.filter(r => r.pillar === String(pillar).toUpperCase())
      : rows
    res.json(filtered)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to load matrix from Excel' })
  }
})

app.post('/api/auth/login', async (req: Request<{}, {}, LoginBody>, res: Response) => {
  const { email, password } = req.body;
  // TODO: sprawdź użytkownika w DB
  const ok = email && password; // podmień na realną walidację
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ sub: email }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });

  // ✅ cookie dla przeglądarki przez HTTPS na Render
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,        // Render = HTTPS
    sameSite: 'none',    // do cross-site z domeny frontu
    maxAge: 7 * 24 * 3600 * 1000,
    path: '/',
  });

  res.json({ ok: true });
});

function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token =
    (header?.startsWith('Bearer ') ? header.slice(7) : undefined) ||
    req.cookies?.token;

  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'dev');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/me', auth, (_req, res) => {
  res.json({ ok: true });
});

// helpers
const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)

// --- Tworzenie nowego Assessmentu i usera ---
app.post('/assessments', async (req: Request, res: Response) => {
  try {
    const { userEmail } = req.body as { userEmail?: string }

    let userId: string | undefined
    if (userEmail && typeof userEmail === 'string') {
      const email = userEmail.trim().toLowerCase()
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email },
      })
      userId = user.id
    }

    const id = randomUUID()
    await prisma.assessment.create({ data: { id, userId } })
    res.json({ id, userId })
  } catch (e) {
    console.error(e)
    res.status(500).send('Failed to create assessment')
  }
})

// --- Zapis odpowiedzi i notatek ---
app.post('/assessments/:id/answers', async (req: Request, res: Response) => {
  const { id } = req.params
  const { area, answers, evidence, userId } = req.body as {
    area: 'E' | 'S' | 'G'
    answers: Record<string, number>
    evidence?: string
    userId?: string
  }

  if (!id || !area || !answers) {
    return res.status(400).json({ error: 'id, area, answers required' })
  }

  // upewnij się, że user istnieje (jeśli przekazany)
  let uId: string | undefined
  if (userId) {
    uId = userId
    await prisma.user.upsert({
      where: { id: uId },
      update: {},
      create: { id: uId, email: `${uId}@demo.local` },
    })
  }

  // upewnij się, że assessment istnieje
  await prisma.assessment.upsert({
    where: { id },
    update: { userId: uId ?? undefined },
    create: { id, userId: uId },
  })

  // jedna transakcja, bez push (usuwa konflikty typów)
  const tx: Prisma.PrismaPromise<any>[] = [
    ...Object.entries(answers).map(([questionId, value]) =>
      prisma.answer.upsert({
        where: {
          assessmentId_pillar_questionId: {
            assessmentId: id,
            pillar: area,
            questionId,
          },
        },
        update: { value },
        create: { assessmentId: id, pillar: area, questionId, value },
      })
    ),
    ...(typeof evidence === 'string'
      ? [
          prisma.sectionNote.upsert({
            where: {
              assessmentId_pillar: {
                assessmentId: id,
                pillar: area,
              },
            },
            update: { text: evidence },
            create: { assessmentId: id, pillar: area, text: evidence },
          }),
        ]
      : []),
  ]

  await prisma.$transaction(tx)
  res.json({ ok: true })
})

// --- Liczenie punktów (nie zapisuje, tylko zwraca) ---
app.post('/assessments/:id/score', async (req: Request, res: Response) => {
  const { id } = req.params
  const rows = await prisma.answer.findMany({ where: { assessmentId: id } })

  const E = rows.filter((r: { pillar: string }) => r.pillar === 'E').map((r: { value: any }) => r.value)
  const S = rows.filter((r: { pillar: string }) => r.pillar === 'S').map((r: { value: any }) => r.value)
  const G = rows.filter((r: { pillar: string }) => r.pillar === 'G').map((r: { value: any }) => r.value)

  const your = { E: +avg(E).toFixed(2), S: +avg(S).toFixed(2), G: +avg(G).toFixed(2) }
  const overall = +avg([your.E, your.S, your.G].filter((v) => v > 0)).toFixed(2)
  res.json({ ok: true, your, overall })
})

app.post('/assessments/:id/score/detailed', async (req, res) => {
  const { id } = req.params
  const answers = await prisma.answer.findMany({
    where: { assessmentId: id },
    select: { questionId: true, value: true, pillar: true }
  })
  const matrix = getMatrixCached(process.env.MATRIX_XLSX || './data/shift_matrix.xlsx')
  const result = scoreAssessmentByCategory(answers as any, matrix as any)
  res.json(result)
})

// --- Dane dla wykresów ---
app.get('/assessments/:id/scores', async (req: Request, res: Response) => {
  const { id } = req.params
  const rows = await prisma.answer.findMany({ where: { assessmentId: id } })
  const pick = (p: 'E' | 'S' | 'G') => rows.filter((r: { pillar: string }) => r.pillar === p).map((r: { value: any }) => r.value)

  const your = {
    E: +avg(pick('E')).toFixed(2),
    S: +avg(pick('S')).toFixed(2),
    G: +avg(pick('G')).toFixed(2),
  }
  const overallYour = +avg([your.E, your.S, your.G].filter((v) => v > 0)).toFixed(2)

  const avgScores = { E: 3.4, S: 3.1, G: 3.5 }
  const overallAvg = +avg([avgScores.E, avgScores.S, avgScores.G]).toFixed(2)
  const completedCount = await prisma.assessment.count()

  res.json({
    your,
    avg: avgScores,
    overall: { your: overallYour, avg: overallAvg },
    completedCount,
  })
})

// --- PDF report ---
app.get('/assessments/:id/report.pdf', async (req: Request, res: Response) => {
  const { id } = req.params

  // 1) dane do raportu (te same co do wykresów)
  const rows = await prisma.answer.findMany({ where: { assessmentId: id } })
  const pick = (p: 'E'|'S'|'G') => rows.filter((r: { pillar: string }) => r.pillar === p).map((r: { value: any }) => r.value)
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0)

  const your = {
    E: +avg(pick('E')).toFixed(2),
    S: +avg(pick('S')).toFixed(2),
    G: +avg(pick('G')).toFixed(2),
  }
  const avgScores = { E: 3.4, S: 3.1, G: 3.5 } // na razie stałe
  const overallYour = +avg([your.E, your.S, your.G].filter(v=>v>0)).toFixed(2)
  const overallAvg  = +avg([avgScores.E, avgScores.S, avgScores.G]).toFixed(2)

  const notes = await prisma.sectionNote.findMany({ where: { assessmentId: id } })
  const noteMap = Object.fromEntries(notes.map((n: { pillar: any; text: any }) => [n.pillar, n.text]))

  // 2) nagłówki odpowiedzi HTTP
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="shift-report-${id}.pdf"`)

  // 3) generowanie PDF
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  doc.pipe(res)

  // brand / tytuł
  doc
    .fontSize(18).fillColor('#0f172a').text('SHIFT — Digital Readiness Assessment', { align: 'left' })
    .moveDown(0.2)
    .fontSize(11).fillColor('#64748b').text(`Assessment ID: ${id}`)
    .moveDown(0.8)

  // sekcja: podsumowanie
  doc.fontSize(14).fillColor('#0f172a').text('Summary', { underline: true }).moveDown(0.4)
  doc.fontSize(11).fillColor('#0f172a')
  doc.text(`Your overall score: ${overallYour.toFixed(2)}`)
  doc.text(`Project average:    ${overallAvg.toFixed(2)}`)
  doc.moveDown(0.6)

  // sekcja: filary – małe paseczki progress
  const pillars: Array<{key:'E'|'S'|'G'; label:string; your:number; avg:number}> = [
    { key:'E', label:'Environmental', your: your.E, avg: avgScores.E },
    { key:'S', label:'Social',        your: your.S, avg: avgScores.S },
    { key:'G', label:'Governance',    your: your.G, avg: avgScores.G },
  ]

  const leftX = 50
  const barW  = 400
  const barH  = 10
  const lineGap = 30

  doc.fontSize(13).fillColor('#0f172a').text('Pillar scores', { underline: true }).moveDown(0.6)

  pillars.forEach((p, i) => {
    const y = doc.y
    // etykieta
    doc.fontSize(11).fillColor('#334155').text(p.label, leftX, y, { continued: false })
    // tło paska
    const barY = y + 16
    doc.roundedRect(leftX, barY, barW, barH, 5).fillOpacity(0.08).fill('#64748b').fillOpacity(1)

    // your (turkus)
    const wYour = Math.max(0, Math.min(barW, (p.your/5) * barW))
    doc.roundedRect(leftX, barY, wYour, barH, 5).fill('#0f766e')

    // average (niebieski) jako „overlay” outline/linia
    const wAvg = Math.max(0, Math.min(barW, (p.avg/5) * barW))
    doc
      .save()
      .lineWidth(2)
      .strokeColor('#22d3ee')
      .roundedRect(leftX, barY-1, wAvg, barH+2, 5)
      .stroke()
      .restore()

    // liczby
    doc
      .fontSize(10)
      .fillColor('#0f172a')
      .text(`Your: ${p.your.toFixed(2)}   Avg: ${p.avg.toFixed(2)}`, leftX + barW + 12, barY - 2)

    doc.moveDown( (lineGap - 16) / 12 )
  })

  doc.moveDown(0.6)

  // sekcja: Evidence / Notatki
  doc.fontSize(13).fillColor('#0f172a').text('Evidence & Notes', { underline: true }).moveDown(0.4)
  const block = (title:string, txt?:string) => {
    doc.fontSize(11).fillColor('#334155').text(title, { continued: false }).moveDown(0.2)
    doc.fontSize(10).fillColor('#0f172a').text(txt && txt.trim() ? txt : '—', { width: 500 })
    doc.moveDown(0.4)
  }
  block('Environmental', noteMap['E'])
  block('Social',        noteMap['S'])
  block('Governance',    noteMap['G'])

  doc.end()
})


// --- Health check ---
app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }))

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`API on ${PORT}`));