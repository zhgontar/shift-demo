import React from 'react'
import { Link } from 'react-router-dom'
import './SelfAssess.css'

export default function SelfAssess() {
  const areas = [
    {
      n: 'E',
      title: 'Environmental',
      desc: 'Policies and practices that reduce environmental footprint and foster sustainability.',
      to: '/selfassess/environmental',
    },
    {
      n: 'S',
      title: 'Social',
      desc: 'Inclusion, wellbeing, equality, student engagement and community contribution.',
      to: '/selfassess/social',
    },
    {
      n: 'G',
      title: 'Governance',
      desc: 'Transparency, leadership, strategy, ethics and reporting in ESG context.',
      to: '/selfassess/governance',
    },
  ]

  return (
    <div className="sa-wrap">
      <div className="sa-card">
        <h1 className="sa-title">
          Self-assessment: ESG in Higher Education
        </h1>
        <p className="sa-intro">
          The SHIFT ESG Impact Index allows institutions to self-evaluate
          their practices in three main dimensions: Environmental, Social,
          and Governance. Please select one of the areas below to begin.
        </p>

        <div className="sa-buttons">
          {areas.map(a => (
            <Link key={a.n} to={a.to} className="sa-btn">
              <span className="sa-btn-num">{a.n}</span>
              <div>
                <div className="sa-btn-title">{a.title}</div>
                <div className="sa-btn-desc">{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}