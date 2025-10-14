// Training screen placeholder
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './Training.css'

type Module = {
  slug: string
  pillar: 'E'|'S'|'G'
  title: string
  subtitle: string
  durationMin: number
  level: 'Intro'|'Intermediate'|'Advanced'
  outcomes: string[]
  extUrl?: string // opcjonalny link do materiału zewnętrznego (np. shift-esg.eu)
}

const ALL_MODULES: Module[] = [
  // ENVIRONMENTAL
  {
    slug: 'e-foundations',
    pillar: 'E',
    title: 'Environmental foundations',
    subtitle: 'Policies, footprint, and campus sustainability',
    durationMin: 35,
    level: 'Intro',
    outcomes: [
      'Understand the ESG E-dimension scope at HEIs',
      'Identify key environmental indicators (energy, waste, mobility)',
      'Learn how to set a baseline and monitor progress',
    ],
  },
  {
    slug: 'e-action-plan',
    pillar: 'E',
    title: 'Environmental action planning',
    subtitle: 'Targets, KPIs and stakeholder engagement',
    durationMin: 45,
    level: 'Intermediate',
    outcomes: [
      'Define measurable goals and KPIs',
      'Co-create an action plan with staff & students',
      'Link to SDGs and reporting cycles',
    ],
  },

  // SOCIAL
  {
    slug: 's-inclusion',
    pillar: 'S',
    title: 'Inclusion & wellbeing',
    subtitle: 'Equality, accessibility and student engagement',
    durationMin: 40,
    level: 'Intro',
    outcomes: [
      'Recognize social indicators (DEI, wellbeing, accessibility)',
      'Map risks and support services',
      'Design student engagement activities',
    ],
  },
  {
    slug: 's-community-impact',
    pillar: 'S',
    title: 'Community impact & partnerships',
    subtitle: 'Service learning and outreach',
    durationMin: 35,
    level: 'Intermediate',
    outcomes: [
      'Plan community-based initiatives',
      'Measure impact with simple metrics',
      'Report outcomes to stakeholders',
    ],
  },

  // GOVERNANCE
  {
    slug: 'g-strategy',
    pillar: 'G',
    title: 'ESG strategy & governance',
    subtitle: 'Leadership, transparency and ethics',
    durationMin: 50,
    level: 'Intro',
    outcomes: [
      'Draft an ESG policy and governance model',
      'Clarify roles, responsibilities and committees',
      'Set a transparent reporting process',
    ],
  },
  {
    slug: 'g-reporting',
    pillar: 'G',
    title: 'ESG reporting & improvement loop',
    subtitle: 'Data, dashboards and continuous improvement',
    durationMin: 45,
    level: 'Advanced',
    outcomes: [
      'Choose a reporting standard fit for HEIs',
      'Build a simple dashboard (E/S/G)',
      'Run annual review & improvement cycle',
    ],
  },
]

const PILLAR_LABEL: Record<'E'|'S'|'G', string> = {
  E: 'Environmental', S: 'Social', G: 'Governance'
}

export default function Training() {
  const [q, setQ] = useState('')
  const [pillar, setPillar] = useState<'ALL'|'E'|'S'|'G'>('ALL')
  const [done, setDone] = useState<Record<string, boolean>>({})

  // wczytaj/zapisz postęp w localStorage
  useEffect(() => {
    const raw = localStorage.getItem('trainingDone')
    if (raw) setDone(JSON.parse(raw))
  }, [])
  useEffect(() => {
    localStorage.setItem('trainingDone', JSON.stringify(done))
  }, [done])

  const list = useMemo(() => {
    return ALL_MODULES.filter(m => {
      const byPillar = pillar === 'ALL' || m.pillar === pillar
      const byQuery = (m.title+m.subtitle+m.outcomes.join(' ')).toLowerCase().includes(q.toLowerCase())
      return byPillar && byQuery
    })
  }, [pillar, q])

  return (
    <div className="tr-wrap">
      <h1 className="tr-title">Training modules (SHIFT)</h1>
      <p className="tr-intro">
        Learn how to implement ESG at your institution. Pick a module from the E (Environmental), S (Social) or G (Governance) pillars.
      </p>

      {/* Filters */}
      <div className="tr-filters">
        <select value={pillar} onChange={e => setPillar(e.target.value as any)} className="tr-select">
          <option value="ALL">All pillars</option>
          <option value="E">Environmental</option>
          <option value="S">Social</option>
          <option value="G">Governance</option>
        </select>
        <input
          placeholder="Search topics…"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="tr-input"
        />
      </div>

      {/* Grid of modules */}
      <div className="tr-grid">
        {list.map(m => (
          <article key={m.slug} className={`tr-card tr-${m.pillar.toLowerCase()}`}>
            <div className="tr-card-top">
              <span className={`tr-pill tr-${m.pillar}`}>{PILLAR_LABEL[m.pillar]}</span>
              <span className="tr-level">{m.level}</span>
            </div>

            <h2 className="tr-card-title">{m.title}</h2>
            <p className="tr-card-sub">{m.subtitle}</p>

            <ul className="tr-outcomes">
              {m.outcomes.map((o,i) => <li key={i}>{o}</li>)}
            </ul>

            <div className="tr-card-bottom">
              <span className="tr-time">⏱ {m.durationMin} min</span>
              <div className="tr-actions">
                <Link to={`/training/${m.slug}`} className="tr-btn">Open</Link>
                <button
                  className={`tr-btn ${done[m.slug] ? 'tr-done' : ''}`}
                  onClick={() => setDone(d => ({...d, [m.slug]: !d[m.slug]}))}
                  aria-pressed={!!done[m.slug]}
                >
                  {done[m.slug] ? '✓ Done' : 'Mark as done'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="tr-note">
        Content outline aligned with SHIFT – ESG Impact Index in Higher Education (E, S, G pillars). Use this page to host links, slides, videos or SCORM packages.
      </div>
    </div>
  )
}