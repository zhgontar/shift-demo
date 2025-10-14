import React from 'react'
import './Layout.css' // 👈 zapewni style .logout-btn z Layout.css

export default function LogoutButton() {
  function handleLogout() {
    localStorage.removeItem('assessmentId')
    localStorage.removeItem('userId')
    localStorage.removeItem('rememberEmail')
    window.location.href = '/login'
  }

  return (
    <button className="logout-btn" onClick={handleLogout}>
      🚪 Logout
    </button>
  )
}
