import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './screens/Login'
import Home from './screens/Home'
import Category from './screens/Category'
import Graphs from './screens/Graphs'
import Settings from './screens/Settings'
import Training from './screens/Training'
import Layout from './components/Layout'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/selfassess" element={<Navigate to="/selfassess/environmental" replace/>} />
        <Route path="/selfassess/environmental" element={<Category code="E" title="Environmental" />} />
        <Route path="/selfassess/social" element={<Category code="S" title="Social" />} />
        <Route path="/selfassess/governance" element={<Category code="G" title="Governance" />} />
        <Route path="/graphs" element={<Graphs />} />
        <Route path="/training" element={<Training />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  )
}
