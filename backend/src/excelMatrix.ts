import * as XLSX from 'xlsx'

export type MatrixRow = {
  id: string
  pillar: 'E' | 'S' | 'G'
  title: string
  category?: string
  subcategory?: string
  weight?: number
}

let CACHE: MatrixRow[] | null = null

function normalizeHeader(h?: string): string {
  if (!h) return ''
  const k = h.trim().toLowerCase()
  // mapuj popularne nagłówki
  if (k === 'question' || k === 'pytanie') return 'title'
  if (k === 'pillar' || k === 'filar') return 'pillar'
  if (k === 'id' || k === 'qid') return 'id'
  if (k === 'category' || k === 'kategoria') return 'category'
  if (k === 'subcategory' || k === 'podkategoria') return 'subcategory'
  if (k === 'weight' || k === 'waga') return 'weight'
  return h
}

export function loadMatrixFromXlsx(filePath: string): MatrixRow[] {
  const wb = XLSX.readFile(filePath)
  // użyj pierwszego arkusza
  const wsName = wb.SheetNames[0]
  const ws = wb.Sheets[wsName]
  const rows = XLSX.utils.sheet_to_json<any>(ws, { defval: '' }) as any[]

  // normalizacja nagłówków
  const headerRow = XLSX.utils.sheet_to_json<any>(ws, { header: 1, range: 0, blankrows: false })[0] as string[] | undefined
  const headerMap: Record<string, string> = {}
  if (headerRow && headerRow.length) {
    for (const h of headerRow) {
      headerMap[h] = normalizeHeader(h)
    }
  }

  const out: MatrixRow[] = rows.map((r, idx) => {
    const get = (name: string) => {
      // szukaj po znormalizowanych nagłówkach lub bezpośrednio
      const direct = r[name]
      if (direct !== undefined && direct !== null && direct !== '') return String(direct)
      const key = Object.keys(r).find(k => normalizeHeader(k) === name)
      return key ? String(r[key]) : ''
    }
    const pillar = (get('pillar') || '').trim().toUpperCase()
    const title  = (get('title')  || '').trim()
    const id     = (get('id')     || '').trim() || `${pillar || 'X'}${idx + 1}`

    return {
      id,
      pillar: pillar as 'E'|'S'|'G',
      title,
      category: (get('category') || '').trim() || undefined,
      subcategory: (get('subcategory') || '').trim() || undefined,
      weight: Number(get('weight')) || undefined
    }
  })
  // odfiltruj wiersze bez filaru/pytania
  return out.filter(r => (r.pillar === 'E' || r.pillar === 'S' || r.pillar === 'G') && r.title.length > 0)
}

/** Jednorazowe ładowanie do cache */
export function getMatrixCached(filePath: string): MatrixRow[] {
  if (!CACHE) {
    CACHE = loadMatrixFromXlsx(filePath)
  }
  return CACHE
}

/** Wymuś przeładowanie (np. po podmianie pliku) */
export function refreshMatrix(filePath: string): MatrixRow[] {
  CACHE = loadMatrixFromXlsx(filePath)
  return CACHE
}
