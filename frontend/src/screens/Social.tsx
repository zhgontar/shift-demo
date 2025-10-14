import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LikertSection, { Item } from '../components/LikertSection'

export default function Social() {
  const [items, setItems] = useState<Item[]>([])
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
  const id = localStorage.getItem('assessmentId') || 'demo'
  const navigate = useNavigate()

  // Load Social questions from shift_matrix.json
  useEffect(() => {
    fetch('/shift_matrix.json')
      .then(r => r.json())
      .then((rows: any[]) => {
        const sItems: Item[] = rows.filter(r => r.pillar === 'S')
        setItems(sItems)
      })
      .catch(err => console.error('Error loading matrix (S):', err))
  }, [])

  return (
    <LikertSection
      title="Social (S)"
      lsKey="shift_answers_S_v1"
      area="S"
      items={items}
      // jeśli chcesz wersję ze skrajami skali (Not in place / Fully in place), dopisz:
      // variant="reference" scaleStart={1} endLabels={{ left: 'Low', right: 'High' }}
      onSubmit={async ({ answers, evidence }) => {
        try {
          await fetch(`${base}/assessments/${id}/answers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ area: 'S', answers, evidence })
          })
          await fetch(`${base}/assessments/${id}/score`, { method: 'POST' })
          localStorage.setItem('toast', 'Section saved & scored')
          navigate('/graphs')
        } catch (err) {
          console.error('Submit error (S):', err)
          localStorage.setItem('toast', 'Saved locally (server unavailable)')
          navigate('/graphs')
        }
      }}
    />
  )
}