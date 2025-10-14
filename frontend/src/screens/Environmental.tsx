import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LikertSection, { Item } from '../components/LikertSection'

export default function Environmental() {
  const [items, setItems] = useState<Item[]>([])
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
  const id = localStorage.getItem('assessmentId') || 'demo'
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/shift_matrix.json')
      .then(r => r.json())
      .then((rows: any[]) => {
        const eItems: Item[] = rows.filter(r => r.pillar === 'E')
        setItems(eItems)
      })
      .catch(err => console.error('Error loading matrix:', err))
  }, [])

  return (
    <LikertSection
      title="Environmental (E)"
      lsKey="shift_answers_E_v1"
      area="E"
      items={items}
      variant="reference"
      scaleStart={0}
      endLabels={{ left: 'Not in place', right: 'Fully in place'}}
      onSubmit={async ({ answers, evidence }) => {
        try {
          await fetch(`${base}/assessments/${id}/answers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ area: 'E', answers, evidence })
          })
          await fetch(`${base}/assessments/${id}/score`, { method: 'POST' })
          localStorage.setItem('toast', 'Section saved & scored')
          navigate('/graphs')
        } catch (err) {
          console.error('Submit error:', err)
          localStorage.setItem('toast', 'Saved locally (server unavailable)')
          navigate('/graphs')
        }
      }}
    />
  )
}