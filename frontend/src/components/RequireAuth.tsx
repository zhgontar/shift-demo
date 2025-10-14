// src/components/RequireAuth.tsx
import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

export default function RequireAuth() {
  const has = !!localStorage.getItem('assessmentId')
  return has ? <Outlet /> : <Navigate to="/login" replace />
}