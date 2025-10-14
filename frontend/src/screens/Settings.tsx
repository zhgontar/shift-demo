import React, { useEffect, useState } from 'react'
import './Settings.css'

type SettingsState = {
  fullName: string
  email: string
  institution: string
  unitType: string
  size: string
  country: string
}

const LS_KEY = 'shift_settings_v1'
const DEFAULTS: SettingsState = {
  fullName: '',
  email: '',
  institution: '',
  unitType: 'University',
  size: 'Medium',
  country: 'PL',
}

export default function Settings() {
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
  const [s, setS] = useState<SettingsState>(DEFAULTS)
  const [msg, setMsg] = useState<string | null>(null)

  // wczytaj z localStorage + spróbuj dociągnąć z backendu
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setS({ ...DEFAULTS, ...JSON.parse(raw) })
    } catch {}

    fetch(`${base}/me`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then(u => {
        if (!u) return
        setS(prev => ({
          ...prev,
          fullName: u.name || prev.fullName,
          email: u.email || prev.email,
          institution: u.institution || prev.institution,
          unitType: u.unitType || prev.unitType,
          size: u.size || prev.size,
          country: u.country || prev.country,
        }))
      })
      .catch(() => {})
  }, [base])

  function onChange<K extends keyof SettingsState>(key: K, val: SettingsState[K]) {
    setS(prev => ({ ...prev, [key]: val }))
  }

  async function save() {
    // local
    localStorage.setItem(LS_KEY, JSON.stringify(s))
    // backend (jeśli sesja jest)
    try {
      await fetch(`${base}/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: s.fullName,
          institution: s.institution,
          unitType: s.unitType,
          size: s.size,
          country: s.country,
        }),
      })
    } catch {}
    setMsg('Saved ✔')
    setTimeout(() => setMsg(null), 1500)
  }

  function signOut() {
    localStorage.removeItem(LS_KEY)
    localStorage.removeItem('assessmentId')
    localStorage.removeItem('userEmail')
    window.location.href = '/login'
  }

  return (
    <div className="settings-wrap">
      <div className="settings-card">
        <header className="settings-header">
          <h1>Settings</h1>
          <p>Profile and organization details used for filtering results and reports.</p>
        </header>

        <section className="settings-section">
          <h3>Profile</h3>
          <div className="row">
            <label>Full name</label>
            <input
              value={s.fullName}
              onChange={e => onChange('fullName', e.target.value)}
              placeholder="First and last name"
            />
          </div>
          <div className="row">
            <label>Email</label>
            <input value={s.email} readOnly />
          </div>
        </section>

        <section className="settings-section">
          <h3>Organization</h3>
          <div className="row">
            <label>Organization</label>
            <input
              value={s.institution}
              onChange={e => onChange('institution', e.target.value)}
              placeholder="e.g. University of X — IT Dept."
            />
          </div>
          <div className="row">
            <label>Institution type</label>
            <select value={s.unitType} onChange={e => onChange('unitType', e.target.value)}>
              <option>University</option>
              <option>Faculty/Department</option>
              <option>Institute</option>
              <option>Other</option>
            </select>
          </div>
          <div className="row">
            <label>Size</label>
            <select value={s.size} onChange={e => onChange('size', e.target.value)}>
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
          </div>
          <div className="row">
            <label>Country</label>
            <select value={s.country} onChange={e => onChange('country', e.target.value)}>
              <option>PL</option>
              <option>ES</option>
              <option>CY</option>
              <option>IT</option>
              <option>GR</option>
              <option>DE</option>
              <option>FR</option>
              <option>PT</option>
            </select>
          </div>
        </section>

        <div className="actions">
          <button className="btn primary" onClick={save}>Save</button>
          <button className="btn ghost" onClick={signOut}>Sign out</button>
        </div>

        {msg && <div className="toast">{msg}</div>}
      </div>
    </div>
  )
}
