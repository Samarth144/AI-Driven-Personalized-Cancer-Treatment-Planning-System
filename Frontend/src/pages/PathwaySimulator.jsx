import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './PathwaySimulator.css';

function PathwaySimulator() {
  const navigate = useNavigate();
  const [activeScenario, setActiveScenario] = useState('standard');

  const handleScenarioSelect = (scenario) => {
    setActiveScenario(scenario);
    // In a real app, this would trigger a data update or recalculation
    // For now, it just updates the UI state as per the simulation
  };

  const printPathway = () => {
    window.print();
  };

  return (
    <>
      <Navbar />
      <div className="container simulator-container">
        <div className="text-center mb-xl">
          <h1>Interactive Treatment Pathway Simulator</h1>
          <p className="text-secondary">Explore different treatment scenarios and compare outcomes</p>
        </div>

        {/* Scenario Selector */}
        <div className="scenario-selector">
          <h3>Select Treatment Scenario</h3>
          <p className="text-secondary">Compare different treatment approaches</p>

          <div className="scenario-options">
            <div 
                className={`scenario-option ${activeScenario === 'standard' ? 'active' : ''}`} 
                onClick={() => handleScenarioSelect('standard')}
            >
              <h4>Standard of Care</h4>
              <p className="text-secondary">Surgery + RT + TMZ</p>
              <div className="mt-sm">
                <span className="badge badge-success">Recommended</span>
              </div>
            </div>

            <div 
                className={`scenario-option ${activeScenario === 'conservative' ? 'active' : ''}`} 
                onClick={() => handleScenarioSelect('conservative')}
            >
              <h4>Conservative</h4>
              <p className="text-secondary">Surgery + RT only</p>
              <div className="mt-sm">
                <span className="badge badge-info">Alternative</span>
              </div>
            </div>

            <div 
                className={`scenario-option ${activeScenario === 'aggressive' ? 'active' : ''}`} 
                onClick={() => handleScenarioSelect('aggressive')}
            >
              <h4>Aggressive</h4>
              <p className="text-secondary">Surgery + RT + TMZ + Immunotherapy</p>
              <div className="mt-sm">
                <span className="badge badge-warning">Experimental</span>
              </div>
            </div>

            <div 
                className={`scenario-option ${activeScenario === 'watchful' ? 'active' : ''}`} 
                onClick={() => handleScenarioSelect('watchful')}
            >
              <h4>Watchful Waiting</h4>
              <p className="text-secondary">Monitoring only</p>
              <div className="mt-sm">
                <span className="badge badge-error">Not Recommended</span>
              </div>
            </div>
          </div>
        </div>

        {/* Treatment Timeline */}
        <div className="card-glass mb-xl">
          <h3 className="mb-lg">Treatment Timeline - Standard of Care</h3>

          <div className="pathway-timeline">
            <div className="timeline-line"></div>

            <div className="timeline-item">
              <div className="timeline-content">
                <div className="timeline-date">Week 0-2</div>
                <h4>Surgical Resection</h4>
                <p className="text-secondary">Maximal safe resection via right frontal craniotomy</p>
                <ul style={{ marginTop: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                  <li>Expected duration: 4-6 hours</li>
                  <li>Hospital stay: 5-7 days</li>
                  <li>Goal: Gross total resection</li>
                </ul>
              </div>
              <div className="timeline-marker">🏥</div>
            </div>

            <div className="timeline-item">
              <div className="timeline-content">
                <div className="timeline-date">Week 3-6</div>
                <h4>Post-Surgical Recovery</h4>
                <p className="text-secondary">Wound healing and functional recovery period</p>
                <ul className="timeline-details">
                  <li>Physical therapy as needed</li>
                  <li>Baseline MRI at week 4</li>
                  <li>Prepare for radiation</li>
                </ul>
              </div>
              <div className="timeline-marker">🏠</div>
            </div>

            <div className="timeline-item">
              <div className="timeline-content">
                <div className="timeline-date">Week 7-12</div>
                <h4>Radiation Therapy</h4>
                <p className="text-secondary">Concurrent chemoradiation with temozolomide</p>
                <ul className="timeline-details">
                  <li>60 Gy in 30 fractions (6 weeks)</li>
                  <li>Daily TMZ 75 mg/m²</li>
                  <li>Weekly monitoring</li>
                </ul>
              </div>
              <div className="timeline-marker">⚡</div>
            </div>

            <div className="timeline-item">
              <div className="timeline-content">
                <div className="timeline-date">Week 13-16</div>
                <h4>Treatment Break</h4>
                <p className="text-secondary">Recovery from radiation effects</p>
                <ul className="timeline-details">
                  <li>Monitor for side effects</li>
                  <li>MRI assessment</li>
                  <li>Blood count recovery</li>
                </ul>
              </div>
              <div className="timeline-marker">⏸️</div>
            </div>

            <div className="timeline-item">
              <div className="timeline-content">
                <div className="timeline-date">Week 17-68</div>
                <h4>Adjuvant Chemotherapy</h4>
                <p className="text-secondary">6-12 cycles of temozolomide</p>
                <ul className="timeline-details">
                  <li>TMZ 150-200 mg/m² days 1-5</li>
                  <li>28-day cycles</li>
                  <li>MRI every 2-3 cycles</li>
                </ul>
              </div>
              <div className="timeline-marker">💊</div>
            </div>

            <div className="timeline-item">
              <div className="timeline-content">
                <div className="timeline-date">Ongoing</div>
                <h4>Surveillance & Follow-up</h4>
                <p className="text-secondary">Long-term monitoring for recurrence</p>
                <ul className="timeline-details">
                  <li>MRI every 3-4 months</li>
                  <li>Clinical assessments</li>
                  <li>Quality of life monitoring</li>
                </ul>
              </div>
              <div className="timeline-marker">📊</div>
            </div>
          </div>
        </div>

        {/* Scenario Comparison */}
        <div className="card-glass mb-xl">
          <h3>Scenario Comparison</h3>
          <p className="text-secondary mb-lg">Compare expected outcomes across different treatment approaches</p>

          <table className="comparison-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Standard of Care</th>
                <th>Conservative</th>
                <th>Aggressive</th>
                <th>Watchful Waiting</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Median OS</strong></td>
                <td><span className="badge badge-success">18 months</span></td>
                <td>14 months</td>
                <td>22 months</td>
                <td>8 months</td>
              </tr>
              <tr>
                <td><strong>Median PFS</strong></td>
                <td><span className="badge badge-success">10 months</span></td>
                <td>7 months</td>
                <td>13 months</td>
                <td>4 months</td>
              </tr>
              <tr>
                <td><strong>Treatment Duration</strong></td>
                <td>12-18 months</td>
                <td>3-4 months</td>
                <td>18-24 months</td>
                <td>N/A</td>
              </tr>
              <tr>
                <td><strong>Side Effect Risk</strong></td>
                <td>Moderate</td>
                <td>Low</td>
                <td>High</td>
                <td>None</td>
              </tr>
              <tr>
                <td><strong>Quality of Life</strong></td>
                <td>Good</td>
                <td>Very Good</td>
                <td>Fair</td>
                <td>Variable</td>
              </tr>
              <tr>
                <td><strong>Cost</strong></td>
                <td>High</td>
                <td>Moderate</td>
                <td>Very High</td>
                <td>Low</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Patient Education */}
        <div className="grid-2 mb-xl">
          <div className="card-glass">
            <h3>What to Expect</h3>
            <div className="patient-education-content">
              <p><strong>Surgery Phase:</strong> The neurosurgeon will remove as much of the tumor as safely
                possible. You'll be in the hospital for about a week.</p>

              <p className="mt-md"><strong>Recovery:</strong> Most patients return to normal activities within 4-6
                weeks. Physical therapy may be recommended.</p>

              <p className="mt-md"><strong>Radiation:</strong> Daily treatments for 6 weeks. Side effects are usually
                mild and manageable.</p>

              <p className="mt-md"><strong>Chemotherapy:</strong> Monthly cycles with breaks. Blood tests will monitor
                your counts.</p>
            </div>
          </div>

          <div className="card-glass">
            <h3>Questions for Your Doctor</h3>
            <ul className="questions-list">
              <li>What are the risks of surgery in my case?</li>
              <li>How will treatment affect my daily life?</li>
              <li>What support services are available?</li>
              <li>How often will I need imaging?</li>
              <li>What are signs of recurrence?</li>
              <li>Are there clinical trials available?</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-md justify-center">
          <button className="btn btn-secondary" onClick={() => navigate('/outcome-prediction')}>
            ← Back to Outcome Prediction
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/explainability')}>
            View AI Explanation →
          </button>
          <button className="btn btn-outline" onClick={printPathway}>
            Print Pathway
          </button>
        </div>
      </div>
    </>
  );
}

export default PathwaySimulator;
