import React from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import LogoutButton from './LogoutButton'
import './Layout.css'

function LinkItem({
  to,
  icon,
  label,
  disabled
}: { to: string; icon: string; label: string; disabled?: boolean }) {
  if (disabled) {
    return (
      <div className="menu-link disabled" aria-disabled="true" title="Available after sign in">
        <span>{icon}</span><span>{label}</span>
      </div>
    )
  }
  return (
    <NavLink to={to} className="menu-link">
      <span>{icon}</span><span>{label}</span>
    </NavLink>
  )
}

export default function Layout() {
  const authed = !!localStorage.getItem('assessmentId')
  const { pathname } = useLocation()

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">SHIFT</div>
          <div className="brand-sub">ESG Impact Index</div>
        </div>

        <nav className="menu">
          <NavLink to="/home" className="menu-link"><span>🏠</span><span>Home</span></NavLink>

          <div className="menu-group">Auth</div>
          <NavLink to="/login" className={`menu-link ${pathname==='/login' ? 'active' : ''}`}>
            <span>🔐</span><span>Login</span>
          </NavLink>

          <div className="menu-group">Self-assessment</div>
          <LinkItem to="/selfassess/environmental" icon="🌿" label="Environmental" disabled={!authed} />
          <LinkItem to="/selfassess/social"        icon="🤝" label="Social"        disabled={!authed} />
          <LinkItem to="/selfassess/governance"    icon="🏛" label="Governance"    disabled={!authed} />

          <div className="menu-group">Results & setup</div>
          <LinkItem to="/graphs"   icon="📊" label="Graphs"   disabled={!authed} />
          <LinkItem to="/training" icon="📚" label="Training" disabled={!authed} />
          <LinkItem to="/settings" icon="⚙" label="Settings" disabled={!authed} />
        </nav>

        <div className="sidebar-bottom">
          {authed ? (
            <LogoutButton />
          ) : (
            <div className="signin-note">Sign in to unlock the menu</div>
          )}
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
