import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LikertSection, {Item} from '../components/LikertSection'

export default function Governance() {
  const [items, setItems] = useState<Item[]>([])
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
  const id = localStorage.getItem('assessmentId') || 'demo'
  const navigate = useNavigate()

  // Load questions for Governance (G)
  useEffect(() => {
    fetch('/shift_matrix.json')
      .then(r => r.json())
      .then((rows: Item[]) => setItems(rows.filter(x => (x as any).pillar === 'G')))
  }, [])

  return (
    <LikertSection
      title="Governance (G)"
      lsKey="shift_answers_G_v1"
      area="G"
      items={items}
      onSubmit={async ({ answers, evidence }) => {
        await fetch(`${base}/assessments/${id}/answers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ area: 'G', answers, evidence })
        })
        await fetch(`${base}/assessments/${id}/score`, { method: 'POST' })
        localStorage.setItem('toast', 'Section saved & scored')
        navigate('/graphs')
      }}
    />
  )
}
