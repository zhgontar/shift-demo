import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LikertSection, { Item } from '../components/LikertSection'
const nextPath: Record<'E'|'S'|'G', string> = {
  E: '/selfassess/social',
  S: '/selfassess/governance',
  G: '/graphs'
}



type Props = {
  code: 'E' | 'S' | 'G'
  title: string
  // opcjonalnie: wariant wyglądu
  variant?: 'modern' | 'reference'
  // opcjonalnie: start skali (0 lub 1), gdy używasz variant="reference"
  scaleStart?: 0 | 1
}

export default function Category({ code, title, variant = 'modern', scaleStart = 1 }: Props) {
  const [items, setItems] = useState<Item[]>([])
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
  const navigate = useNavigate()

  // pobierz identyfikatory z localStorage
  const assessmentId = localStorage.getItem('assessmentId') || 'demo'
  const userId = localStorage.getItem('userId') || undefined

  // useEffect(() => {
  //   fetch('../../shift_matrix.json')
  //     .then(r => r.json())
  //     .then((rows: any[]) => {
  //       // obsłuż zarówno `title` jak i `question` w JSON
  //       const filtered = rows
  //         .filter(r => r.pillar === code)
  //         .map((r: any) => ({
  //           ...r,
  //           // ujednolicenie, jeśli masz tylko `title` albo tylko `question`
  //           title: r.title ?? r.question
  //         })) as Item[]
  //       setItems(filtered)
  //     })
  //     .catch(err => console.error(`[Category ${code}] matrix load error:`, err))
  // }, [code])
useEffect(() => {
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
  const url = new URL(`${base}/matrix`, window.location.href)
  url.searchParams.set('pillar', code)

  fetch(url.toString())
    .then(r => {
      if (!r.ok) throw new Error('Matrix API error')
      return r.json()
    })
    .then((rows: any[]) => {
      const items = rows.map((r: any) => ({
        id: r.id,
        pillar: r.pillar,
        title: r.title ?? r.question ?? `Question`,
        category: r.category
      })) as Item[]
      setItems(items)
    })
    .catch(err => {
      console.error(`[Category ${code}] Excel matrix load error:`, err)
      setItems([])
    })
}, [code])
  const lsKey = `shift_answers_${code}_v1` as const

  return (
    <LikertSection
      title={`${title} (${code})`}
      lsKey={lsKey}
      area={code}
      items={items}
      // jeżeli chcesz etykiety skrajów skali jak w wzorcu, ustaw variant="reference"
      {...(variant === 'reference'
        ? { variant: 'reference' as const, scaleStart, endLabels: { left: 'Not in place', right: 'Fully in place' } }
        : {})}
      onSubmit={async ({ answers, evidence }) => {
  try {
    // 1) zapisz odpowiedzi
    await fetch(`${base}/assessments/${assessmentId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ area: code, answers, evidence })
    })

    // 2) scoring
    await fetch(`${base}/assessments/${assessmentId}/score`, { method: 'POST' })

    // 3) toast
    localStorage.setItem('toast', 'Section saved & scored')

    // 4) przejdź do następnego kroku (E -> S -> G -> Graphs)
    const nextPath: Record<'E' | 'S' | 'G', string> = {
      E: '/selfassess/social',
      S: '/selfassess/governance',
      G: '/graphs'
    }
    navigate(nextPath[code])

  } catch (err) {
    console.error(`[Category ${code}] submit error:`, err)
    localStorage.setItem('toast', 'Saved locally (server unavailable)')
    // w razie błędu też przejdź dalej, żeby użytkownik nie utknął
    const nextPath: Record<'E' | 'S' | 'G', string> = {
      E: '/selfassess/social',
      S: '/selfassess/governance',
      G: '/graphs'
    }
    navigate(nextPath[code])
  }
}}



    />
  )
}