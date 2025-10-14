import React, { useEffect, useMemo, useState } from 'react'
import './Graphs.css'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList
} from 'recharts'

type Scores = {
  your: { E: number; S: number; G: number }
  avg: { E: number; S: number; G: number }
  overall: { your: number; avg: number } // 0..5
  completedCount: number
}

type DetailedCategory = {
  category: string
  questions: number
  mean: number       // 1..5
  maxPoints: number  // budżet punktowy kategorii
  points: number     // zdobyte punkty
}

type DetailedPillar = {
  pillar: 'E'|'S'|'G'
  categories: DetailedCategory[]
  points: number     // suma punktów kategorii (0..pillarMax)
}

type DetailedScore = {
  pillars: DetailedPillar[]
  totalPoints: number         // 0..385
  maturity: 'Initial'|'Developing'|'Established'|'Leading'
}

export default function Graphs() {
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
  const assessmentId = localStorage.getItem('assessmentId') || 'demo'

  const [data, setData] = useState<Scores | null>(null)
  const [detailed, setDetailed] = useState<DetailedScore | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Filters (from Settings)
  const [unitType, setUnitType] = useState<string>('University')
  const [size, setSize] = useState<string>('Medium')
  const [country, setCountry] = useState<string>('PL')

  // toast
  useEffect(() => {
    const t = localStorage.getItem('toast')
    if (t) {
      setToast(t)
      localStorage.removeItem('toast')
      const timer = setTimeout(() => setToast(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  // filters from Settings
  useEffect(() => {
    try {
      const raw = localStorage.getItem('shift_settings_v1')
      if (raw) {
        const s = JSON.parse(raw)
        if (s.unitType) setUnitType(s.unitType)
        if (s.size) setSize(s.size)
        if (s.country) setCountry(s.country)
      }
    } catch {}
  }, [])

  async function loadScores() {
    try {
      setErr(null)
      const qs = new URLSearchParams()
      if (unitType) qs.set('unitType', unitType)
      if (size) qs.set('size', size)
      if (country) qs.set('country', country)

      // Simple scores (GET)
      const res = await fetch(`${base}/assessments/${assessmentId}/scores?` + qs.toString())
      if (!res.ok) throw new Error('No server data')
      const json = (await res.json()) as Scores
      setData(json)

      // Detailed by category (POST)
      const res2 = await fetch(`${base}/assessments/${assessmentId}/score/detailed`, { method: 'POST' })
      if (!res2.ok) throw new Error('No detailed data')
      const det = (await res2.json()) as DetailedScore
      setDetailed(det)
    } catch {
      // fallback mock
      const mock: Scores = {
        your: { E: 3.8, S: 3.2, G: 3.9 },
        avg: { E: 3.4, S: 3.1, G: 3.5 },
        overall: { your: 3.63, avg: 3.33 },
        completedCount: 19
      }
      setData(mock)
      setDetailed({
        pillars: [
          { pillar:'E', points: 52, categories:[
            { category:'Energy', questions:3, mean:3.9, maxPoints:23, points:17.94 },
            { category:'Carbon', questions:3, mean:3.6, maxPoints:24, points:17.28 },
            { category:'Water', questions:3, mean:3.4, maxPoints:23, points:15.64 }
          ]},
          { pillar:'S', points: 118, categories:[
            { category:'Inclusion', questions:3, mean:3.3, maxPoints:58, points:38.28 },
            { category:'Wellbeing', questions:3, mean:3.1, maxPoints:58, points:35.96 }
          ]},
          { pillar:'G', points: 103, categories:[
            { category:'Governance', questions:3, mean:4.0, maxPoints:70, points:56.0 },
            { category:'Ethics', questions:3, mean:3.5, maxPoints:70, points:49.0 }
          ]}
        ],
        totalPoints: 273,
        maturity: 'Established'
      })
      setErr('Showing mock data (server unavailable)')
    }
  }

  useEffect(() => { loadScores() }, [base, assessmentId, unitType, size, country])

  const radarData = useMemo(
    () =>
      data
        ? [
            { dim: 'E', your: data.your.E, avg: data.avg.E },
            { dim: 'S', your: data.your.S, avg: data.avg.S },
            { dim: 'G', your: data.your.G, avg: data.avg.G }
          ]
        : [],
    [data]
  )
  const bars = radarData
  // dane punktowe per filar (E/S/G) z detailed
const pointBars = useMemo(() => {
  if (!detailed) return []
  const find = (k:'E'|'S'|'G') => detailed.pillars.find(p => p.pillar === k)?.points ?? 0
  return [
    { key: 'E', label: 'Environmental', points: Number(find('E').toFixed(1)), max: 70 },
    { key: 'S', label: 'Social',        points: Number(find('S').toFixed(1)), max: 175 },
    { key: 'G', label: 'Governance',    points: Number(find('G').toFixed(1)), max: 140 },
  ]
}, [detailed])

  async function downloadPdf() {
    try {
      const qs = new URLSearchParams()
      if (unitType) qs.set('unitType', unitType)
      if (size) qs.set('size', size)
      if (country) qs.set('country', country)
      const r = await fetch(`${base}/assessments/${assessmentId}/report.pdf?` + qs.toString(), {
        credentials: 'include'
      })
      if (!r.ok) throw new Error('Report generation failed')
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `shift-report-${assessmentId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Report generation failed.')
    }
  }

  return (
    <div className="graphs-wrap">
      <div className="graphs-card">
        <h1 className="graphs-title">Graphs and charts</h1>
        <p className="graphs-intro">
          If the results highlight areas for improvement, explore the SHIFT training modules.
        </p>

        {toast && <div className="graphs-toast">{toast}</div>}
        {err && <div className="graphs-warning">ℹ️ {err}</div>}

        {/* Stat tiles */}
        <div className="stats-grid">
          <Stat title="Your average score" value={data?.overall.your} />
          <Stat title="Average score (benchmark)" value={data?.overall.avg} />
          <Stat title="Completed assessments" value={data?.completedCount} integer />
        </div>

        {/* maturity + total points if available */}
        {detailed && (
          <div className="maturity-row">
            <div className="maturity-pill">
              <div className="maturity-k">Maturity</div>
              <div className="maturity-v">{detailed.maturity}</div>
            </div>
            <div className="maturity-pill">
              <div className="maturity-k">Total points</div>
              <div className="maturity-v">{detailed.totalPoints.toFixed(0)} / 385</div>
            </div>
          </div>
        )}

        <hr className="graphs-sep" />

        {/* Charts */}
<div className="charts-grid">
  {/* RADAR (profil 0..5 dla kształtu) */}
  <div className="chart-block">
    <h3 className="chart-title">ESG profile (radar)</h3>
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="dim" />
          <PolarRadiusAxis angle={30} domain={[0, 5]} />
          <Radar name="Your score" dataKey="your" stroke="#0f766e" fill="#0f766e" fillOpacity={0.4} dot />
          <Radar name="Average"   dataKey="avg"  stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} dot />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* BAR (punkty per filar) */}
  <div className="chart-block">
    <h3 className="chart-title">Points by pillar</h3>
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={280}>
  <BarChart data={pointBars} margin={{ top: 12, right: 8, left: 0, bottom: 8 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="label" />
    <YAxis domain={[0, 180]} tickFormatter={(v) => `${v}`} />
    <Tooltip
      formatter={(v: any, k: any) =>
        k === 'max' ? [`${v} (max)`, 'Max'] : [`${Number(v).toFixed(1)} pts`, 'Your points']
      }
    />
    <Legend />

    {/* Tło: maksymalna liczba punktów */}
    <Bar dataKey="max" name="Max" fill="#e2e8f0" radius={[4, 4, 0, 0]} />

    {/* Twoje punkty + etykiety liczbowo (custom content zamiast formattera) */}
    <Bar dataKey="points" name="Your points" fill="#0f766e" radius={[4, 4, 0, 0]}>
      <LabelList
        dataKey="points"
        position="top"
        content={(props: any) => {
          const { x, y, width, value } = props
          if (value == null) return null
          const cx = x + width / 2
          const cy = y - 6
          return (
            <text x={cx} y={cy} textAnchor="middle" fontSize={12} fill="#0f172a">
              {Number(value).toFixed(1)}
            </text>
          )
        }}
      />
    </Bar>
  </BarChart>
</ResponsiveContainer>


    </div>
    {/* podsumowanie całkowite */}
    {detailed && (
      <div style={{textAlign:'center', marginTop:6, color:'#334155', fontWeight:600}}>
        Total: {Math.round(detailed.totalPoints)} / 385 &nbsp;|&nbsp; Maturity: {detailed.maturity}
      </div>
    )}
  </div>
</div>




        {/* === NEW: by category (from detailed) === */}
        {detailed && (
          <>
            <h3 className="bycat-title">Scores by category</h3>
            <div className="bycat-grid">
              {detailed.pillars.map(p => (
                <div className="bycat-card" key={p.pillar}>
                  <div className="bycat-head">
                    <span className={`pill pill-${p.pillar}`}>{p.pillar}</span>
                    <span className="bycat-points">{p.points.toFixed(1)}</span>
                    <span className="bycat-sub">points</span>
                  </div>
                  <table className="bycat-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Mean</th>
                        <th>Points</th>
                        <th style={{width: '45%'}}>Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.categories.map(c => {
                        const pct = c.maxPoints > 0 ? Math.round((c.points / c.maxPoints) * 100) : 0
                        return (
                          <tr key={c.category}>
                            <td>{c.category}</td>
                            <td>{c.mean.toFixed(2)}</td>
                            <td>{c.points.toFixed(1)} / {c.maxPoints.toFixed(1)}</td>
                            <td>
                              <div className="bar">
                                <div className={`bar-fill bar-${p.pillar}`} style={{ width: `${pct}%` }} />
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Filters */}
        <div className="filters">
          <div className="filters-title">Filter the data</div>
          <div className="filters-row">
            <select className="filter-input" value={unitType} onChange={(e) => setUnitType(e.target.value)}>
              <option disabled>Institution type</option>
              <option>University</option>
              <option>Faculty / Department</option>
              <option>Institute</option>
              <option>Other</option>
            </select>
            <select className="filter-input" value={size} onChange={(e) => setSize(e.target.value)}>
              <option disabled>Size</option>
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
            <select className="filter-input" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option disabled>Country</option>
              <option>PL</option><option>ES</option><option>CY</option><option>IT</option><option>GR</option>
            </select>
            <button className="filter-btn" onClick={loadScores}>Apply filters</button>
          </div>
        </div>

        {/* PDF export */}
        <div style={{ marginTop: 12 }}>
          <button className="filter-btn" onClick={downloadPdf}>
            Download PDF report
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ title, value, integer }: { title: string; value?: number | null; integer?: boolean }) {
  const display = value == null ? '—' : integer ? Math.round(value).toString() : Number(value).toFixed(2)
  return (
    <div className="stat">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{display}</div>
      <div className="stat-sub">Out of a total 5</div>
    </div>
  )
}