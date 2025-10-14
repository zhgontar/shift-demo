export type MatrixRow = {
  id: string
  pillar: 'E'|'S'|'G'
  title: string
  category?: string
  weight?: number
  categoryWeight?: number
}

export type AnswerRow = { questionId: string; value: number; pillar: 'E'|'S'|'G' }

const PILLAR_MAX = { E: 70, S: 175, G: 140 } as const
type PillarKey = keyof typeof PILLAR_MAX

export type CategoryScore = {
  category: string
  questions: number
  mean: number
  maxPoints: number
  points: number
}

export type PillarScore = {
  pillar: PillarKey
  categories: CategoryScore[]
  points: number
}

export type ScoreResult = {
  pillars: PillarScore[]
  totalPoints: number
  maturity: 'Initial'|'Developing'|'Established'|'Leading'
}

function maturityFromTotal(total: number): ScoreResult['maturity'] {
  if (total >= 301) return 'Leading'
  if (total >= 201) return 'Established'
  if (total >= 101) return 'Developing'
  return 'Initial'
}

export function scoreAssessmentByCategory(
  answers: AnswerRow[],
  matrix: MatrixRow[]
): ScoreResult {
  const metaByQ = new Map(matrix.map(m => [m.id, m]))
  const per: Record<PillarKey, Record<string, number[]>> = { E:{}, S:{}, G:{} }

  for (const a of answers) {
    const meta = metaByQ.get(a.questionId)
    if (!meta) continue
    const P = (meta.pillar || a.pillar) as PillarKey
    if (!['E','S','G'].includes(P)) continue
    const cat = (meta.category || 'General').trim()
    if (!per[P][cat]) per[P][cat] = []
    const v = Math.max(1, Math.min(5, Number(a.value)))
    per[P][cat].push(v)
  }

  const catWeight: Record<PillarKey, Record<string, number>> = { E:{}, S:{}, G:{} }
  for (const m of matrix) {
    const P = m.pillar as PillarKey
    if (!['E','S','G'].includes(P)) continue
    const cat = (m.category || 'General').trim()
    const w = Number(m.categoryWeight)
    if (Number.isFinite(w) && w! > 0) {
      catWeight[P][cat] = (catWeight[P][cat] || 0) + w!
    }
  }

  const pillars: PillarScore[] = (['E','S','G'] as PillarKey[]).map(P => {
    const cats = per[P]
    const catNames = Object.keys(cats)
    if (catNames.length === 0) return { pillar: P, categories: [], points: 0 }

    const pillarBudget = PILLAR_MAX[P]
    const totalW = Object.keys(catWeight[P]).length
      ? Object.values(catWeight[P]).reduce((a,b)=>a+b,0)
      : 0

    let weights: Record<string, number> = {}
    if (totalW > 0) {
      for (const c of catNames) weights[c] = catWeight[P][c] || 0
    } else {
      for (const c of catNames) weights[c] = 1
    }
    const sumW = Object.values(weights).reduce((a,b)=>a+b,0)

    const categories: CategoryScore[] = catNames.map(c => {
      const vals = cats[c]
      const mean = +(vals.reduce((a,b)=>a+b,0) / vals.length).toFixed(2)
      const maxPoints = +(pillarBudget * (weights[c] / sumW)).toFixed(2)
      const points = +((mean / 5) * maxPoints).toFixed(2)
      return { category: c, questions: vals.length, mean, maxPoints, points }
    }).sort((a,b)=>a.category.localeCompare(b.category))

    const points = +(categories.reduce((a,b)=>a+b.points,0)).toFixed(2)
    return { pillar: P, categories, points }
  })

  const totalPoints = +(pillars.reduce((a,p)=>a+p.points,0)).toFixed(2)
  const maturity = maturityFromTotal(totalPoints)
  return { pillars, totalPoints, maturity }
}
