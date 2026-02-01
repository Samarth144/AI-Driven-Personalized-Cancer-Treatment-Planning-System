import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Explainability.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
} from 'chart.js';
import { Bar, Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
);

function Explainability() {
  const navigate = useNavigate();

  const exportExplanation = () => {
    alert("Explanation report exported! (Simulation)");
  };

  const shapChartData = {
    datasets: [{
      label: 'Feature Impact',
      data: [
        { x: 0.28, y: 6 },
        { x: 0.22, y: 5 },
        { x: 0.19, y: 4 },
        { x: 0.15, y: 3 },
        { x: 0.11, y: 2 },
        { x: 0.05, y: 1 }
      ],
      backgroundColor: 'hsla(210, 100%, 56%, 0.6)',
      borderColor: 'hsl(210, 100%, 56%)',
      pointRadius: 8
    }]
  };

  const shapChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: 'SHAP Value', color: 'hsl(0, 0%, 75%)' },
        ticks: { color: 'hsl(0, 0%, 75%)' },
        grid: { color: 'hsla(0, 0%, 100%, 0.05)' }
      },
      y: {
        title: { display: true, text: 'Feature Rank', color: 'hsl(0, 0%, 75%)' },
        ticks: {
          color: 'hsl(0, 0%, 75%)',
          callback: (value) => {
            const labels = ['', 'Location', 'KPS', 'Age', 'IDH1', 'Volume', 'MGMT'];
            return labels[value] || '';
          }
        },
        grid: { color: 'hsla(0, 0%, 100%, 0.05)' }
      }
    },
    plugins: {
      legend: { labels: { color: 'hsl(0, 0%, 75%)' } }
    }
  };

  const decisionTreeData = {
    labels: ['Input Data', 'MRI Analysis', 'Genomic Profile', 'Clinical History', 'Treatment Options', 'Final Recommendation'],
    datasets: [{
      label: 'Confidence Flow',
      data: [100, 92, 88, 85, 87, 87],
      backgroundColor: [
        'hsla(210, 100%, 56%, 0.8)',
        'hsla(180, 65%, 55%, 0.8)',
        'hsla(270, 70%, 60%, 0.8)',
        'hsla(190, 85%, 65%, 0.8)',
        'hsla(142, 70%, 55%, 0.8)',
        'hsla(210, 100%, 56%, 0.8)'
      ],
      borderRadius: 8
    }]
  };

  const decisionTreeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: 'Confidence (%)', color: 'hsl(0, 0%, 75%)' },
        ticks: { color: 'hsl(0, 0%, 75%)' },
        grid: { color: 'hsla(0, 0%, 100%, 0.05)' }
      },
      x: {
        ticks: { color: 'hsl(0, 0%, 75%)' },
        grid: { color: 'hsla(0, 0%, 100%, 0.05)' }
      }
    },
    plugins: {
      legend: { labels: { color: 'hsl(0, 0%, 75%)' } }
    }
  };

  return (
    <>
      <Navbar />
      <div className="container explainability-container">
        <div className="text-center mb-xl">
          <h1>AI Explainability Dashboard</h1>
          <p className="text-secondary">Transparent insights into AI decision-making process</p>
        </div>

        {/* Model Confidence */}
        <div className="card-glass mb-xl">
          <h3>Model Confidence Breakdown</h3>
          <p className="text-secondary mb-lg">Confidence scores across different analysis components</p>

          <div className="confidence-breakdown">
            <div className="confidence-item">
              <div className="confidence-circle" style={{ '--percentage': '92%' }}>
                <div className="confidence-value">92%</div>
              </div>
              <h4>MRI Segmentation</h4>
              <p className="text-secondary">U-Net model confidence</p>
            </div>

            <div className="confidence-item">
              <div className="confidence-circle" style={{ '--percentage': '88%' }}>
                <div className="confidence-value">88%</div>
              </div>
              <h4>Biomarker Analysis</h4>
              <p className="text-secondary">Genomic interpretation</p>
            </div>

            <div className="confidence-item">
              <div className="confidence-circle" style={{ '--percentage': '87%' }}>
                <div className="confidence-value">87%</div>
              </div>
              <h4>Treatment Recommendation</h4>
              <p className="text-secondary">Protocol optimization</p>
            </div>

            <div className="confidence-item">
              <div className="confidence-circle" style={{ '--percentage': '85%' }}>
                <div className="confidence-value">85%</div>
              </div>
              <h4>Outcome Prediction</h4>
              <p className="text-secondary">Survival forecasting</p>
            </div>
          </div>
        </div>

        {/* SHAP Feature Importance */}
        <div className="grid-2 mb-xl">
          <div className="card-glass">
            <h3>SHAP Feature Importance</h3>
            <p className="text-secondary mb-lg">Top factors influencing treatment recommendation</p>

            <div className="feature-importance">
              <div className="feature-bar">
                <div className="flex justify-between">
                  <strong>MGMT Methylation Status</strong>
                  <span className="text-secondary">0.28</span>
                </div>
                <div className="feature-bar-fill" style={{ width: '93%' }}>High Impact</div>
              </div>

              <div className="feature-bar">
                <div className="flex justify-between">
                  <strong>Tumor Volume</strong>
                  <span className="text-secondary">0.22</span>
                </div>
                <div className="feature-bar-fill" style={{ width: '73%' }}>High Impact</div>
              </div>

              <div className="feature-bar">
                <div className="flex justify-between">
                  <strong>IDH1 Mutation</strong>
                  <span className="text-secondary">0.19</span>
                </div>
                <div className="feature-bar-fill" style={{ width: '63%' }}>Moderate Impact</div>
              </div>

              <div className="feature-bar">
                <div className="flex justify-between">
                  <strong>Patient Age</strong>
                  <span className="text-secondary">0.15</span>
                </div>
                <div className="feature-bar-fill" style={{ width: '50%' }}>Moderate Impact</div>
              </div>

              <div className="feature-bar">
                <div className="flex justify-between">
                  <strong>KPS Score</strong>
                  <span className="text-secondary">0.11</span>
                </div>
                <div className="feature-bar-fill" style={{ width: '37%' }}>Low Impact</div>
              </div>

              <div className="feature-bar">
                <div className="flex justify-between">
                  <strong>Tumor Location</strong>
                  <span className="text-secondary">0.05</span>
                </div>
                <div className="feature-bar-fill" style={{ width: '17%' }}>Low Impact</div>
              </div>
            </div>
          </div>

          <div className="card-glass">
            <h3>SHAP Summary Plot</h3>
            <p className="text-secondary mb-lg">Feature impact distribution</p>
            <div className="chart-wrapper-scatter">
              <Scatter data={shapChartData} options={shapChartOptions} />
            </div>
          </div>
        </div>

        {/* Grad-CAM Visualization */}
        <div className="card-glass mb-xl">
          <h3>Grad-CAM Attention Map</h3>
          <p className="text-secondary mb-lg">Visual explanation of what the model focuses on during MRI analysis</p>

          <div className="grid-2">
            <div>
              <h4 className="mb-md">Original MRI Slice</h4>
              <div className="gradcam-viewer">
                <svg width="100%" height="100%" viewBox="0 0 400 400">
                  <ellipse cx="200" cy="200" rx="150" ry="180" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
                  <ellipse cx="200" cy="200" rx="130" ry="160" fill="#222" stroke="#444" strokeWidth="1" />
                  <ellipse cx="180" cy="180" rx="20" ry="30" fill="#0a0a0a" />
                  <ellipse cx="220" cy="180" rx="20" ry="30" fill="#0a0a0a" />
                  <circle cx="240" cy="170" r="35" fill="#2a2a2a" />
                </svg>
              </div>
            </div>

            <div>
              <h4 className="mb-md">Grad-CAM Heatmap Overlay</h4>
              <div className="gradcam-viewer">
                <svg width="100%" height="100%" viewBox="0 0 400 400">
                  <ellipse cx="200" cy="200" rx="150" ry="180" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
                  <ellipse cx="200" cy="200" rx="130" ry="160" fill="#222" stroke="#444" strokeWidth="1" />
                  <ellipse cx="180" cy="180" rx="20" ry="30" fill="#0a0a0a" />
                  <ellipse cx="220" cy="180" rx="20" ry="30" fill="#0a0a0a" />
                  <circle cx="240" cy="170" r="35" fill="#2a2a2a" />
                </svg>
                <div className="heatmap-overlay"></div>
              </div>
            </div>
          </div>

          <div className="mt-lg">
            <div className="explanation-card">
              <h4>Interpretation</h4>
              <p className="text-secondary">
                The Grad-CAM heatmap shows that the model's attention is primarily focused on the tumor region
                in the right frontal lobe (red area).
                The high activation in this area indicates that the model correctly identified the tumor mass as
                the most important feature for classification.
                Secondary attention (yellow-orange areas) is given to the surrounding edema, which is clinically
                relevant for treatment planning.
              </p>
            </div>
          </div>
        </div>

        {/* Decision Tree */}
        <div className="card-glass mb-xl">
          <h3>Decision Path Visualization</h3>
          <p className="text-secondary mb-lg">Step-by-step reasoning for treatment recommendation</p>

          <div className="chart-wrapper-tree">
            <Bar data={decisionTreeData} options={decisionTreeOptions} />
          </div>
        </div>

        {/* Model Information */}
        <div className="grid-3 mb-xl">
          <div className="stat-card">
            <div className="stat-label">Model Architecture</div>
            <div className="stat-value">U-Net + XGBoost</div>
            <p className="text-secondary">Ensemble approach</p>
          </div>

          <div className="stat-card">
            <div className="stat-label">Training Dataset</div>
            <div className="stat-value">12,500</div>
            <p className="text-secondary">Patient cases</p>
          </div>

          <div className="stat-card">
            <div className="stat-label">Model Version</div>
            <div className="stat-value">v2.3.1</div>
            <p className="text-secondary">Updated: Jan 2024</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-md justify-center">
          <button className="btn btn-secondary" onClick={() => navigate('/treatment-plan')}>
            ← Back to Treatment Plan
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/blockchain-audit')}>
            View Audit Trail →
          </button>
          <button className="btn btn-outline" onClick={exportExplanation}>
            Export Explanation
          </button>
        </div>
      </div>
    </>
  );
}

export default Explainability;
