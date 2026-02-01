import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './OutcomePrediction.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  BarElement
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  BarElement
);

function OutcomePrediction() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [outcomeData, setOutcomeData] = useState(null);

  // Initial load simulation
  useEffect(() => {
    generatePredictions();
  }, []);

  // Helper to generate mock data matching app.js logic
  const generateMockOutcomeData = () => {
    return {
      overallSurvival: {
        median: Math.floor(Math.random() * 24 + 12),
        range: [Math.floor(Math.random() * 12 + 6), Math.floor(Math.random() * 36 + 24)]
      },
      progressionFreeSurvival: {
        median: Math.floor(Math.random() * 12 + 6),
        range: [Math.floor(Math.random() * 6 + 3), Math.floor(Math.random() * 18 + 12)]
      },
      sideEffects: {
        fatigue: (Math.random() * 40 + 30).toFixed(1),
        nausea: (Math.random() * 30 + 20).toFixed(1),
        cognitiveImpairment: (Math.random() * 25 + 15).toFixed(1),
        hematologicToxicity: (Math.random() * 20 + 10).toFixed(1)
      },
      qualityOfLife: (Math.random() * 20 + 60).toFixed(1)
    };
  };

  const generatePredictions = async () => {
    setLoading(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    const data = generateMockOutcomeData();
    setOutcomeData(data);
    setLoading(false);
  };

  const downloadReport = () => {
    alert("Report downloaded! (Simulation)");
  };

  // Chart Data Configurations
  const months = Array.from({ length: 61 }, (_, i) => i);
  const survivalChartData = {
    labels: months,
    datasets: [
      {
        label: 'Overall Survival',
        data: months.map(m => 100 * Math.exp(-0.03 * m)),
        borderColor: 'hsl(210, 100%, 56%)',
        backgroundColor: 'hsla(210, 100%, 56%, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Progression-Free Survival',
        data: months.map(m => 100 * Math.exp(-0.05 * m)),
        borderColor: 'hsl(180, 65%, 55%)',
        backgroundColor: 'hsla(180, 65%, 55%, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const survivalChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: 'Months', color: 'hsl(0, 0%, 75%)' },
        ticks: { color: 'hsl(0, 0%, 75%)' },
        grid: { color: 'hsla(0, 0%, 100%, 0.05)' }
      },
      y: {
        title: { display: true, text: 'Survival Probability (%)', color: 'hsl(0, 0%, 75%)' },
        ticks: { color: 'hsl(0, 0%, 75%)' },
        grid: { color: 'hsla(0, 0%, 100%, 0.05)' },
        min: 0,
        max: 100
      }
    },
    plugins: {
      legend: { labels: { color: 'hsl(0, 0%, 75%)' } }
    }
  };

  const riskChartData = {
    labels: ['Low Risk', 'Moderate Risk', 'High Risk'],
    datasets: [{
      data: [25, 45, 30],
      backgroundColor: [
        'hsla(142, 70%, 55%, 0.8)',
        'hsla(45, 95%, 60%, 0.8)',
        'hsla(0, 75%, 60%, 0.8)'
      ]
    }]
  };

  const factorsChartData = {
    labels: ['Age', 'KPS', 'Tumor Size', 'MGMT', 'IDH1', 'Location'],
    datasets: [{
      label: 'Impact on Prognosis',
      data: [65, 85, 75, 90, 80, 70],
      backgroundColor: 'hsla(270, 70%, 60%, 0.8)',
      borderRadius: 8
    }]
  };

  const timelineChartData = {
    labels: ['Baseline', '3 mo', '6 mo', '12 mo', '18 mo', '24 mo'],
    datasets: [
      {
        label: 'Tumor Volume',
        data: [100, 40, 35, 45, 50, 55],
        borderColor: 'hsl(0, 75%, 60%)',
        backgroundColor: 'hsla(0, 75%, 60%, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Quality of Life',
        data: [75, 65, 70, 68, 65, 63],
        borderColor: 'hsl(142, 70%, 55%)',
        backgroundColor: 'hsla(142, 70%, 55%, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <>
      <Navbar />
      <div className="container outcome-container">
        <div className="flex justify-between items-center mb-xl">
          <div>
            <h1>Outcome & Toxicity Prediction</h1>
            <p className="text-secondary">AI-powered survival forecasting and side-effect modeling</p>
          </div>
          <button className="btn btn-primary" onClick={generatePredictions} disabled={loading}>
            {loading ? 'Generating...' : '📈 Generate Predictions'}
          </button>
        </div>

        {/* Key Predictions */}
        <div className="prediction-grid">
          <div className="prediction-card survival-gauge-high">
            <h3 className="card-title-white">Overall Survival</h3>
            <div className="prediction-value">
              {loading ? '--' : outcomeData?.overallSurvival?.median}
            </div>
            <div className="prediction-range">
              {loading ? 'Median months' : `Range: ${outcomeData?.overallSurvival?.range[0]}-${outcomeData?.overallSurvival?.range[1]} months`}
            </div>
          </div>

          <div className="prediction-card prediction-card-accent survival-gauge-high">
            <h3 className="card-title-white">Progression-Free Survival</h3>
            <div className="prediction-value">
              {loading ? '--' : outcomeData?.progressionFreeSurvival?.median}
            </div>
            <div className="prediction-range">
              {loading ? 'Median months' : `Range: ${outcomeData?.progressionFreeSurvival?.range[0]}-${outcomeData?.progressionFreeSurvival?.range[1]} months`}
            </div>
          </div>

          <div className="prediction-card prediction-card-warm">
            <h3 className="card-title-white">Quality of Life</h3>
            <div className="prediction-value">
              {loading ? '--' : outcomeData?.qualityOfLife}
            </div>
            <div className="prediction-range">Predicted score (0-100)</div>
          </div>
        </div>

        {/* Survival Curves */}
        <div className="survival-curves">
          <h3 className="mb-lg">Survival Probability Curves</h3>
          <div className="chart-wrapper-survival">
            <Line data={survivalChartData} options={survivalChartOptions} />
          </div>
        </div>

        {/* Side Effects Prediction */}
        <div className="card-glass mb-xl">
          <h3>Predicted Side Effects & Toxicity</h3>
          <p className="text-secondary mb-lg">Probability of experiencing treatment-related adverse events</p>

          <div className="side-effects-grid">
            {loading ? (
                <div className="text-secondary">Calculating risks...</div>
            ) : outcomeData && [
                { name: 'Fatigue', risk: outcomeData.sideEffects.fatigue, color: 'var(--warning)' },
                { name: 'Nausea', risk: outcomeData.sideEffects.nausea, color: 'var(--warning)' },
                { name: 'Cognitive Impairment', risk: outcomeData.sideEffects.cognitiveImpairment, color: 'var(--error)' },
                { name: 'Hematologic Toxicity', risk: outcomeData.sideEffects.hematologicToxicity, color: 'var(--error)' }
            ].map((effect, idx) => (
                <div key={idx} className="side-effect-card">
                    <div className="flex justify-between items-center mb-sm">
                        <strong>{effect.name}</strong>
                        <span className="badge badge-warning">{effect.risk}%</span>
                    </div>
                    <div className="risk-meter">
                        <div className="risk-fill" style={{ width: `${effect.risk}%` }}></div>
                    </div>
                </div>
            ))}
          </div>
        </div>

        {/* Risk Stratification */}
        <div className="grid-2 mb-xl">
          <div className="card-glass">
            <h3>Risk Stratification</h3>
            <div className="chart-wrapper-risk">
              <Doughnut data={riskChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: 'hsl(0, 0%, 75%)' } } } }} />
            </div>
          </div>

          <div className="card-glass">
            <h3>Prognostic Factors</h3>
            <div className="chart-wrapper-risk">
              <Bar 
                data={factorsChartData} 
                options={{ 
                    indexAxis: 'y', 
                    maintainAspectRatio: false,
                    scales: {
                        x: { ticks: { color: 'hsl(0, 0%, 75%)' }, grid: { color: 'hsla(0, 0%, 100%, 0.05)' } },
                        y: { ticks: { color: 'hsl(0, 0%, 75%)' }, grid: { color: 'hsla(0, 0%, 100%, 0.05)' } }
                    },
                    plugins: { legend: { labels: { color: 'hsl(0, 0%, 75%)' } } }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="card-glass mb-xl">
          <h3>Predicted Treatment Timeline & Outcomes</h3>
          <p className="text-secondary mb-lg">Expected progression over time</p>

          <div className="chart-wrapper-risk">
             <Line 
                data={timelineChartData} 
                options={{
                    maintainAspectRatio: false,
                    scales: {
                        x: { ticks: { color: 'hsl(0, 0%, 75%)' }, grid: { color: 'hsla(0, 0%, 100%, 0.05)' } },
                        y: { ticks: { color: 'hsl(0, 0%, 75%)' }, grid: { color: 'hsla(0, 0%, 100%, 0.05)' } }
                    },
                    plugins: { legend: { labels: { color: 'hsl(0, 0%, 75%)' } } }
                }}
             />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-md justify-center">
          <button className="btn btn-secondary" onClick={() => navigate('/treatment-plan')}>
            ← Back to Treatment Plan
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/pathway-simulator')}>
            Simulate Treatment Pathway →
          </button>
          <button className="btn btn-outline" onClick={downloadReport}>
            Download Report
          </button>
        </div>
      </div>
    </>
  );
}

export default OutcomePrediction;