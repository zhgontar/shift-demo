import React, { useEffect, useMemo, useState } from 'react'
import './Likert.css'

export interface Item {
  id: string
  pillar?: 'E' | 'S' | 'G'
  title?: string
  question?: string
  help?: string
  weight?: number
}

type Answer = 0 | 1 | 2 | 3 | 4 | 5

type Props = {
  title: string
  lsKey: string
  area: 'E' | 'S' | 'G'
  items: Item[]
  onSubmit: (payload: {
    answers: Record<string, Answer>
    evidence: string
  }) => Promise<void> | void
  variant?: 'modern' | 'reference'
  scaleStart?: 0 | 1
  endLabels?: { left?: string; right?: string }
}

export default function LikertSection({
  title,
  lsKey,
  area,
  items,
  onSubmit,
  variant = 'modern',
  scaleStart = 1,
  endLabels = { left: 'Not in place', right: 'Fully in place' },
}: Props) {
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [evidence, setEvidence] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // 🔹 Load saved data
  useEffect(() => {
    const raw = localStorage.getItem(lsKey)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { answers?: Record<string, number>; evidence?: string }
        const a: Record<string, Answer> = {}
        items.forEach(it => {
          const v = parsed.answers?.[it.id]
          if (v !== undefined && [0,1,2,3,4,5].includes(v)) a[it.id] = v as Answer
        })
        setAnswers(a)
        setEvidence(parsed.evidence || '')
      } catch {/* ignore */}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lsKey, items.map(i => i.id).join('|')])

  // 🔹 Autosave
  useEffect(() => {
    localStorage.setItem(lsKey, JSON.stringify({ answers, evidence }))
  }, [answers, evidence, lsKey])

  const total = items.length
  const answered = useMemo(() => Object.keys(answers).length, [answers])
  const pct = total ? Math.round((answered / total) * 100) : 0
  const avg = useMemo(() => {
    const vals = Object.values(answers)
      .map(v => Number(v))
      .filter(v => !isNaN(v))
    if (vals.length === 0) return null
    const sum = vals.reduce((a, b) => a + b, 0)
    return +(sum / vals.length).toFixed(2)
  }, [answers])

  const setValue = (id: string, v: Answer) => setAnswers(p => ({ ...p, [id]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({ answers, evidence })
      setMsg('✅ Section submitted')
    } catch {
      setMsg('Saved locally (server unavailable)')
    } finally {
      setSubmitting(false)
      setTimeout(() => setMsg(null), 1500)
    }
  }

  return (
    <div className="lk-page">
      <div className="lk-crumb">Self-assessment – {title}</div>

      <section className="lk-card lk-intro">
        <h1>{title}</h1>
        <div className="lk-scale-info">
          <div><b>Scale 1–5</b></div>
          <div>1 – Not applicable / doesn’t exist</div>
          <div>5 – Fully applicable / exists in all areas</div>
        </div>
      </section>

      <form onSubmit={submit}>
        {/* ===================== PYTANIA ===================== */}
        <div className={variant === 'reference' ? 'ref-list' : 'lk-questions'}>
          {items.map((q, idx) => {
            const text = (q as any).title ?? q.question ?? ''
            const scale = [0, 1, 2, 3, 4, 5].slice(scaleStart === 1 ? 1 : 0)

            return variant === 'reference' ? (
              // ----------------- REFERENCE VARIANT -----------------
              <article key={q.id} className="ref-q">
                <div className="ref-head">
                  <div className="ref-num">{idx + 1}.</div>
                  <div className="ref-title">{text}</div>
                </div>

                {/* Linia 1: punkty 0..5 */}
                <div className="ref-scale">
                  {scale.map(v => (
                    <label key={v} className={`ref-radio ${answers[q.id] === v ? 'on' : ''}`}>
                      <input
                        type="radio"
                        name={q.id}
                        value={v}
                        checked={answers[q.id]===v}
                        onChange={() => setValue(q.id, v as Answer)}
                      />
                      <span className="dot" />
                      <span className="v">{v}</span>
                    </label>
                  ))}
                                  {/* Linia 2: opisy końców */}
                <div className="ref-ends">
                  <span className="ref-hint left">{endLabels.left}</span>
                  <span className='ref-sep'> - </span>
                  <span className="ref-hint right">{endLabels.right}</span>
                </div>

                </div>

              </article>
            ) : (
              // ----------------- MODERN VARIANT -----------------
              <article key={q.id} className="lk-q">
                <header className="lk-q-head">
                  <div className={`lk-q-num lk-${area}`}>{idx + 1}</div>
                  <div className="lk-q-title">{text}</div>
                  {q.help ? <div className="lk-help" title={q.help}>?</div> : <div />}
                </header>

                <div className="lk-likert">
                  {[1, 2, 3, 4, 5].map(v => (
                    <label key={v} className={`lk-dot ${answers[q.id] === v ? 'on' : ''}`}>
                      <input
                        type="radio"
                        name={q.id}
                        value={v}
                        checked={answers[q.id] === v}
                        onChange={() => setValue(q.id, v as Answer)}
                      />
                      <span className="lk-circle"></span>
                      <span className="lk-val">{v}</span>
                    </label>
                  ))}
                </div>
              </article>
            )
          })}
        </div>

        {/* ===================== EVIDENCE ===================== */}
        <section className="lk-card">
          <label className="lk-notes-label">Evidence / notes (optional)</label>
          <textarea
            className="lk-notes"
            value={evidence}
            onChange={e => setEvidence(e.target.value)}
            placeholder="Links, documents, brief notes…"
          />
        </section>

        {/* ===================== FOOTER ===================== */}
        <div className="lk-footer">
          <div className="lk-progress">
            <div className="lk-bar">
              <span style={{ width: `${pct}%` }} />
            </div>
            <div className="lk-progress-meta">
              {answered}/{total} · {pct}%
            </div>
            {avg !== null && <div className="lk-score">Avg: <b>{avg}</b>/5</div>}
          </div>
          <div className="lk-actions">
            <button
              type="button"
              className="btn ghost"
              onClick={() => { setMsg('💾 Draft saved'); setTimeout(() => setMsg(null), 1200) }}
            >
              Save draft
            </button>
            <button type="submit" className="btn primary" disabled={submitting || !total}>
              {submitting ? 'Submitting…' : 'Submit section'}
            </button>
          </div>
        </div>

        {msg && <div className="lk-msg">{msg}</div>}
      </form>
    </div>
  )
}