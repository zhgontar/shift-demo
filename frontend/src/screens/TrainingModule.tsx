import React from 'react'
import { Link, useParams } from 'react-router-dom'
import './Training.css'

export default function TrainingModule() {
  const { slug } = useParams<{ slug: string }>()
  // w prawdziwej apce wyciągasz dane po slug z API; tu wykorzystaj ten sam zestaw co w Training.tsx
  return (
    <div className="tr-wrap">
      <div className="tr-breadcrumb"><Link to="/training">← Back to modules</Link></div>
      <h1 className="tr-title">Module: {slug}</h1>
      <p className="tr-intro">
        This is a placeholder for the module content. Embed slides, video or link to external material (e.g., shift-esg.eu).
      </p>

      <div className="tr-detail">
        <h3>Suggested structure</h3>
        <ol>
          <li>Short intro (why this topic matters)</li>
          <li>Checklist or rubric aligned with ESG indicators</li>
          <li>Case example from a HEI</li>
          <li>Downloadable template (action plan / policy draft)</li>
          <li>Self-reflection questions and next steps</li>
        </ol>
      </div>
    </div>
  )
}