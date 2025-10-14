import React from 'react'
import './Home.css'

export default function Home() {
  return (
    <div className="home-page">
      <h1 className="home-title">Welcome to SHIFT Digital Readiness Tool</h1>

      <div className="home-header">
        <span className="crumb">Home – Project description</span>
      </div>

      <section className="card">
        <h1 className="title">SHIFT – ESG Impact Index in Higher Education</h1>

        <ul className="lead-list">
          <li>
            <b>Project goal:</b> to enhance Higher Education Institutions’ (HEIs)
            capacity to contribute to the Sustainable Development Goals (SDGs)
            by assessing and implementing ESG strategies and policies through the
            <i> ESG Impact Index platform</i>.
          </li>
          <li>
            The project equips students, academics, researchers and university staff
            with competences needed to implement and monitor ESG practices, and
            strengthens transnational cooperation through sharing good practices and
            knowledge among universities.
          </li>
          <li>
            The tool allows institutions to monitor progress in ESG, benchmark
            against peers, identify areas for improvement, and plan actions to
            increase their contribution to the SDGs.
          </li>
        </ul>

        <h2 className="subtitle">Scope and functions</h2>
        <ul className="bullets">
          <li>Institutional self-assessment in key ESG areas.</li>
          <li>Graphical representation of results and benchmarking with other HEIs.</li>
          <li>Recommendations for improvement and access to training resources.</li>
          <li>Possibility to retake the evaluation after improvements are implemented.</li>
        </ul>

        <div className="note">
          Description based on materials from the SHIFT project
          (ESG Impact Index in Higher Education).
        </div>
      </section>
    </div>
  )
}
