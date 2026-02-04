import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './PathwaySimulator.css';

function PathwaySimulator() {
  const navigate = useNavigate();
  const [activeScenario, setActiveScenario] = useState('standard');

  const handleScenarioSelect = (scenario) => {
    setActiveScenario(scenario);
  };

  return (
    <div className="pathway-simulator-root">
      <Navbar />
      <div className="fluid-container">
        
        {/* HEADER */}
        <div className="console-header">
          <div>
            <h1 className="page-title">INTERACTIVE PATHWAY SIMULATOR</h1>
            <p className="page-subtitle">Simulate longitudinal outcomes across varying treatment protocols.</p>
          </div>
        </div>

        {/* SCENARIO SELECTOR */}
        <div className="scenario-selector">
          <h3 className="section-title">Select Treatment Scenario</h3>
          <p className="section-desc">Compare expected trajectories for different clinical approaches.</p>

          <div className="scenario-options">
            <div 
                className={`scenario-option ${activeScenario === 'standard' ? 'active' : ''}`} 
                onClick={() => handleScenarioSelect('standard')}
            >
              <div className="scenario-title">Standard of Care</div>
              <p className="scenario-desc">Maximal Resection + RT + Adjuvant TMZ</p>
              <span className="scenario-badge badge-success">RECOMMENDED</span>
            </div>

            <div 
                className={`scenario-option ${activeScenario === 'conservative' ? 'active' : ''}`} 
                onClick={() => handleScenarioSelect('conservative')}
            >
              <div className="scenario-title">Conservative</div>
              <p className="scenario-desc">Biopsy/Partial Resection + Hypofractionated RT</p>
              <span className="scenario-badge badge-info">ALTERNATIVE</span>
            </div>

            <div 
                className={`scenario-option ${activeScenario === 'aggressive' ? 'active' : ''}`} 
                onClick={() => handleScenarioSelect('aggressive')}
            >
              <div className="scenario-title">Aggressive Experimental</div>
              <p className="scenario-desc">Standard + TTFields + Immunotherapy Trial</p>
              <span className="scenario-badge badge-warning">EXPERIMENTAL</span>
            </div>

            <div 
                className={`scenario-option ${activeScenario === 'watchful' ? 'active' : ''}`} 
                onClick={() => handleScenarioSelect('watchful')}
            >
              <div className="scenario-title">Palliative / Watchful</div>
              <p className="scenario-desc">Symptom Management Only</p>
              <span className="scenario-badge badge-error">CONTRAINDICATED</span>
            </div>
          </div>
        </div>

        {/* TREATMENT TIMELINE */}
        <div className="timeline-card">
          <h3 className="section-title">Projected Timeline - Standard Protocol</h3>
          <p className="section-desc">Estimated milestones based on current clinical guidelines.</p>

          <div className="pathway-timeline">
            <div className="timeline-line"></div>

            <div className="timeline-item">
              <div className="timeline-content">
                <div className="timeline-date">WEEK 0-2</div>
                <div className="timeline-title">Surgical Intervention</div>
                <p className="timeline-desc">Maximal safe resection via craniotomy aimed at Gross Total Resection (GTR).</p>
                <ul className="timeline-details">
                  <li>Duration: 4-6 hours</li>
                  <li>Inpatient: 5-7 days</li>
                  <li>Post-op MRI: Within 48 hours</li>
                </ul>
              </div>
              <div className="timeline-marker">🏥</div>
            </div>

            <div className="timeline-item">
              <div className="timeline-content">
                <div className="timeline-date">WEEK 3-6</div>
                <div className="timeline-title">Recovery & Planning</div>
                <p className="timeline-desc">Wound healing, staple removal, and radiation simulation mapping.</p>
                <ul className="timeline-details">
                  <li>Pathology Confirmation</li>
                  <li>Molecular Profiling (MGMT/IDH)</li>
                  <li>Mask Fitting</li>
                </ul>
              </div>
              <div className="timeline-marker">🧬</div>
            </div>

            <div className="timeline-item">
              <div className="timeline-content">
                <div className="timeline-date">WEEK 7-12</div>
                <div className="timeline-title">Concurrent Chemoradiation</div>
                <p className="timeline-desc">Stupp Protocol: 60Gy Radiation + Daily Temozolomide.</p>
                <ul className="timeline-details">
                  <li>30 Fractions (M-F)</li>
                  <li>TMZ 75mg/m² daily</li>
                  <li>Weekly CBC monitoring</li>
                </ul>
              </div>
              <div className="timeline-marker">⚡</div>
            </div>

            <div className="timeline-item">
              <div className="timeline-content">
                <div className="timeline-date">WEEK 17-68</div>
                <div className="timeline-title">Adjuvant Chemotherapy</div>
                <p className="timeline-desc">Maintenance Temozolomide cycles (5 days on, 23 days off).</p>
                <ul className="timeline-details">
                  <li>6-12 Cycles total</li>
                  <li>Dose escalation to 150-200mg/m²</li>
                  <li>MRI Surveillance every 2 cycles</li>
                </ul>
              </div>
              <div className="timeline-marker">💊</div>
            </div>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="comparison-card">
          <h3 className="section-title">Outcome Forecasting</h3>
          <p className="section-desc">AI-predicted metrics based on selected scenario vs. baseline.</p>

          <table className="comparison-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Standard of Care</th>
                <th>Conservative</th>
                <th>Aggressive</th>
                <th>Watchful</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="metric-label">Median Overall Survival</td>
                <td style={{ color: '#22C55E', fontWeight: 700 }}>18.2 Months</td>
                <td>14.1 Months</td>
                <td>22.5 Months</td>
                <td style={{ color: '#EF4444' }}>8.4 Months</td>
              </tr>
              <tr>
                <td className="metric-label">Progression-Free Survival</td>
                <td style={{ color: '#22C55E', fontWeight: 700 }}>10.5 Months</td>
                <td>7.2 Months</td>
                <td>13.1 Months</td>
                <td>4.0 Months</td>
              </tr>
              <tr>
                <td className="metric-label">Quality of Life Score</td>
                <td>Good (85%)</td>
                <td>Very Good (92%)</td>
                <td>Fair (70%)</td>
                <td>Variable</td>
              </tr>
              <tr>
                <td className="metric-label">Toxicity Risk</td>
                <td>Moderate</td>
                <td>Low</td>
                <td>High</td>
                <td>None</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="action-footer">
          <button className="btn-tech btn-secondary" onClick={() => navigate('/treatment-plan')}>
            ← BACK TO PLAN
          </button>
        </div>

      </div>
    </div>
  );
}

export default PathwaySimulator;