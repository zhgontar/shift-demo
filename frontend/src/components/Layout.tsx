import React from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
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

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthed, logout } = useAuth();

  return (
    <>
      <nav style={{ display:'flex', gap: 8, padding: 8, borderBottom:'1px solid #ddd' }}>
        <button disabled={!isAuthed}>Self Assess</button>
        <button disabled={!isAuthed}>Graphs</button>
        {!isAuthed ? (
          <a href="/login">Login</a>
        ) : (
          <button onClick={() => logout()}>Logout</button>
        )}
      </nav>
      <main>{children}</main>
    </>
  );
}


