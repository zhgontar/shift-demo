import React, { useState, useEffect } from 'react'
import './Login.css'

export default function Login() {
  const [email, setEmail] = useState(localStorage.getItem('rememberEmail') || '')
  const [pwd, setPwd] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
  const logoUrl = import.meta.env.VITE_LOGO_URL || '/logotipo_shift.png'
  const projectTitle = import.meta.env.VITE_PROJECT_TITLE || 'SHIFT — Digital Readiness Assessment'

  useEffect(() => {
    const as = localStorage.getItem('assessmentId')
    if (as) {
      // ewentualnie sprawdzenie sesji
    }
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const userEmail = email.trim().toLowerCase()

      // logowanie
      const r1 = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail })
      })
      if (!r1.ok) throw new Error('Login failed')
      const u = await r1.json()
      localStorage.setItem('userEmail', u.email)
      localStorage.setItem('userId', u.userId)
      if (remember) localStorage.setItem('rememberEmail', userEmail)

      // utworzenie assessmentu
      const r2 = await fetch(`${base}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      if (!r2.ok) throw new Error('Assessment creation failed')
      const a = await r2.json()
      localStorage.setItem('assessmentId', a.id)

      setMsg('Login successful — redirecting…')
      window.location.href = '/home'
    } catch (err: any) {
      setMsg(err.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-brand">
          {logoUrl ? <img src={logoUrl} alt="SHIFT" /> : <div className="logo-fallback">SHIFT</div>}
          <div className="brand-title">{projectTitle}</div>
        </div>

        <h1 className="auth-title">Sign in to your account</h1>
        <p className="auth-subtitle">Enter your credentials to start or continue your assessment.</p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="name@organization.edu"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <div className="pwd-wrap">
            <input
              type={show ? 'text' : 'password'}
              placeholder="Your password"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
            />
            <button
              className="eye"
              type="button"
              onClick={() => setShow(s => !s)}
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? '🙈' : '👁️'}
            </button>
          </div>

          <label className="remember">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
            <span>Remember me</span>
          </label>

          <button className="btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {msg && <div className="auth-msg">{msg}</div>}

        <div className="auth-footer">
          <span>Need an account?</span> <a href="https://shift-esg.eu/" target="_blank">Learn more about SHIFT</a>
        </div>
      </div>
    </div>
  )
}