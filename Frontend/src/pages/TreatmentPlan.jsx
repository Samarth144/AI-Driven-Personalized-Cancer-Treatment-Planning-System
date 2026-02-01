import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './TreatmentPlan.css';
import {
  Chart as ChartJS,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function TreatmentPlan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [treatmentData, setTreatmentData] = useState(null);

  // Helper to generate mock data matching app.js logic
  const generateMockTreatmentData = () => {
    // Protocol options
    const protocols = ['Surgery + RT + TMZ', 'Surgery + RT', 'RT + TMZ', 'Watchful Waiting'];
    const selectedProtocol = protocols[Math.floor(Math.random() * protocols.length)];

    return {
      recommendedProtocol: selectedProtocol,
      confidence: (Math.random() * 15 + 85).toFixed(1),
      description: 'Based on comprehensive multimodal analysis',
      guidelineAlignment: ['NCCN', 'EANO'][Math.floor(Math.random() * 2)],
      alternativeOptions: [
        { protocol: 'Surgery + RT', confidence: (Math.random() * 20 + 70).toFixed(1) },
        { protocol: 'RT + TMZ', confidence: (Math.random() * 20 + 60).toFixed(1) }
      ]
    };
  };

  const generateTreatmentPlan = async () => {
    setLoading(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const data = generateMockTreatmentData();
    setTreatmentData(data);
    setLoading(false);
  };

  // Initial load simulation
  useEffect(() => {
    // Start with the specific example data requested
    const initialData = {
        recommendedProtocol: 'Surgery + RT + TMZ',
        confidence: 87.9,
        description: 'Based on comprehensive multimodal analysis',
        guidelineAlignment: 'NCCN',
        alternativeOptions: [
            // These are just placeholders to structure the comparison loop
            // The comparison list is hardcoded below to match the specific request content
            { protocol: 'Surgery + RT', confidence: 85.3 },
            { protocol: 'RT + TMZ', confidence: 60.6 }
        ]
    };
    setTreatmentData(initialData);
  }, []);


  const factorsChartData = {
    labels: ['Tumor Size', 'Location', 'MGMT Status', 'IDH Status', 'Age', 'KPS'],
    datasets: [{
      label: 'Decision Weight',
      data: [85, 75, 95, 80, 65, 70],
      backgroundColor: 'hsla(210, 100%, 56%, 0.2)',
      borderColor: 'hsl(210, 100%, 56%)',
      borderWidth: 2
    }]
  };

  const factorsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { color: '#94A3B8', backdropColor: 'transparent' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: '#F8FAFC', font: { size: 12 } }
      }
    },
    plugins: {
      legend: { labels: { color: '#94A3B8' } }
    }
  };

  const timelineChartData = {
    labels: ['Surgery', 'Recovery', 'Radiation', 'Chemotherapy', 'Follow-up'],
    datasets: [{
      label: 'Duration (weeks)',
      data: [2, 4, 6, 24, 52],
      backgroundColor: [
        '#5B6FF6',
        '#21D4BD',
        '#7C5CFF',
        '#3B82F6',
        '#22C55E'
      ],
      borderRadius: 8
    }]
  };

  const timelineChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: '#94A3B8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      y: {
        ticks: { color: '#94A3B8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    },
    plugins: {
      legend: { labels: { color: '#94A3B8' } }
    }
  };

  // Construct protocol comparison list based on current data
  const protocols = useMemo(() => {
    if (!treatmentData) return [];
    
    // Logic to build the list dynamically based on the random generation
    // but prioritizing the specific content structure requested
    const list = [
        {
            name: treatmentData.recommendedProtocol,
            score: treatmentData.confidence,
            duration: '12-18 months',
            efficacy: 'High',
            toxicity: 'Moderate',
            cost: 'High',
            recommended: true
        }
    ];

    // Add alternatives (mock logic to match the 3 extra cards)
    if (treatmentData.recommendedProtocol === 'Surgery + RT + TMZ') {
         list.push(
            { name: 'Surgery + RT', score: 85.3, duration: '6-12 months', efficacy: 'Moderate', toxicity: 'Low-Moderate', cost: 'Moderate', recommended: false },
            { name: 'RT + TMZ', score: 60.6, duration: '6-12 months', efficacy: 'Moderate', toxicity: 'Low-Moderate', cost: 'Moderate', recommended: false },
            { name: 'Watchful Waiting', score: 45.2, duration: 'Ongoing', efficacy: 'N/A', toxicity: 'None', cost: 'Low', recommended: false }
         );
    } else {
        // Fallback for random generation to keep the grid populated
        list.push(
            { name: 'Alternative Protocol A', score: (Math.random() * 20 + 60).toFixed(1), duration: '6-12 months', efficacy: 'Moderate', toxicity: 'Moderate', cost: 'Moderate', recommended: false },
            { name: 'Alternative Protocol B', score: (Math.random() * 20 + 40).toFixed(1), duration: 'Varies', efficacy: 'Low', toxicity: 'Low', cost: 'Low', recommended: false },
             { name: 'Watchful Waiting', score: 45.2, duration: 'Ongoing', efficacy: 'N/A', toxicity: 'None', cost: 'Low', recommended: false }
        );
    }
    
    return list;
  }, [treatmentData]);


  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-3xl)' }}>
        <div className="flex justify-between items-center mb-xl">
          <div>
            <h1>AI-Recommended Treatment Plan</h1>
            <p className="text-secondary">Evidence-based protocol optimization using multimodal data</p>
          </div>
          <button className="btn btn-primary" onClick={generateTreatmentPlan} disabled={loading}>
            {loading ? 'Generating...' : '🎯 Generate Plan'}
          </button>
        </div>

        {treatmentData && (
        <div className="recommendation-card" id="primaryRecommendation">
            <div className="flex justify-between items-start">
                <div>
                    <span className="badge badge-recommended">RECOMMENDED</span>
                    <h2 className="mt-md">{treatmentData.recommendedProtocol}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.125rem' }}>
                        {treatmentData.description}
                    </p>
                </div>
                <div className="guideline-badge guideline-badge-themed">
                    <span>📋</span>
                    <span>{treatmentData.guidelineAlignment}</span>
                </div>
            </div>

            <div className="confidence-meter">
                <div 
                    className="confidence-fill confidence-fill-themed" 
                    style={{ 
                        width: loading ? '0%' : `${treatmentData.confidence}%`
                    }}
                >
                    {loading ? '' : `${treatmentData.confidence}% Confidence`}
                </div>
            </div>
        </div>
        )}

        {/* Protocol Comparison */}
        <h3 className="mb-lg">Treatment Protocol Comparison</h3>
        <div className="protocol-comparison">
            {loading ? (
                 <div className="text-secondary">Updating protocols...</div>
            ) : (
                protocols.map((p, index) => (
                    <div key={index} className={`protocol-card ${p.recommended ? 'recommended' : ''}`}>
                        <div className="protocol-header">
                            <h4>{p.name}</h4>
                            {p.recommended && <span className="badge badge-success">RECOMMENDED</span>}
                        </div>
                        
                        <div className="protocol-score">{p.score}%</div>
                        <p className="text-secondary">Confidence Score</p>
                        
                        <ul className="protocol-details">
                            <li>
                            <span className="text-secondary">Duration</span>
                            <strong>{p.duration}</strong>
                            </li>
                            <li>
                            <span className="text-secondary">Efficacy</span>
                            <strong>{p.efficacy}</strong>
                            </li>
                            <li>
                            <span className="text-secondary">Toxicity</span>
                            <strong>{p.toxicity}</strong>
                            </li>
                            <li>
                            <span className="text-secondary">Cost</span>
                            <strong>{p.cost}</strong>
                            </li>
                        </ul>
                    </div>
                ))
            )}
        </div>

        {/* Evidence Base */}
        <div className="grid-2 mb-xl">
            <div className="card-glass">
                <h3>Evidence Base & Guidelines</h3>
                <div className="evidence-section">
                    <h4>NCCN Guidelines Alignment</h4>
                    <p className="text-secondary">National Comprehensive Cancer Network recommendations for brain tumors</p>
                    <div className="mt-md">
                        <span className="badge badge-success">✓ Aligned</span>
                        <span className="text-secondary ml-sm">Grade 1 Evidence</span>
                    </div>
                </div>

                <div className="evidence-section">
                    <h4>EANO Guidelines Alignment</h4>
                    <p className="text-secondary">European Association of Neuro-Oncology clinical practice guidelines</p>
                    <div className="mt-md">
                        <span className="badge badge-success">✓ Aligned</span>
                        <span className="text-secondary ml-sm">Strong Recommendation</span>
                    </div>
                </div>
            </div>

            <div className="card-glass">
                <h3>Key Decision Factors</h3>
                <div style={{ height: '300px' }}>
                    <Radar data={factorsChartData} options={factorsChartOptions} />
                </div>
            </div>
        </div>

        {/* Treatment Timeline */}
        <div className="card-glass mb-xl">
            <h3>Proposed Treatment Timeline</h3>
            <p className="text-secondary mb-lg">Estimated treatment phases and duration</p>

            <div style={{ height: '250px' }}>
                <Bar data={timelineChartData} options={timelineChartOptions} />
            </div>
        </div>

        {/* Supporting Data */}
        <div className="card-glass mb-xl">
            <h3>Multimodal Data Integration</h3>
            <p className="text-secondary mb-lg">How different data sources contributed to this recommendation</p>

            <div className="grid-3">
                <div className="stat-card">
                    <div className="stat-label">MRI Analysis</div>
                    <div className="stat-value stat-value-sm">High Impact</div>
                    <p className="text-secondary stat-desc">Tumor volume and location</p>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Genomic Profile</div>
                    <div className="stat-value stat-value-sm">Critical</div>
                    <p className="text-secondary stat-desc">MGMT methylation status</p>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Clinical History</div>
                    <div className="stat-value stat-value-sm">Moderate</div>
                    <p className="text-secondary stat-desc">Performance status</p>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-md justify-center">
            <button className="btn btn-secondary" onClick={() => navigate('/genomic-analysis')}>
                ← Back to Genomic Analysis
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/outcome-prediction')}>
                View Outcome Predictions →
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/pathway-simulator')}>
                Simulate Treatment Pathway
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/explainability')}>
                View AI Explanation
            </button>
        </div>
      </div>
    </>
  );
}

export default TreatmentPlan;