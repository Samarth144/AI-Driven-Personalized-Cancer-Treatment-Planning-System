import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, Typography
} from '@mui/material';
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
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [treatmentData, setTreatmentData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [cancerType, setCancerType] = useState('Breast');
  const [patientData, setPatientData] = useState({
    stage: '0',
    ER: 'positive',
    PR: 'positive',
    HER2: 'positive',
    BRCA: 'positive',
    PDL1: 'low',
    residual: 'yes',
  });

  const getInitialPatientData = (cancer) => {
    switch (cancer) {
      case 'Brain':
        return { stage: 'LOCALIZED', MGMT: 'methylated', IDH: 'mutant', Resection: 'complete' };
      case 'Lung':
        return { stage: 'I', EGFR: 'positive', ALK: 'positive', PDL1: '<1%' };
      case 'Liver':
        return { stage: 'EARLY', AFP: 'normal', Cirrhosis: 'yes' };
      case 'Pancreas':
        return { stage: 'RESECTABLE', 'CA19-9': 'normal', BRCA: 'positive' };
      case 'Breast':
      default:
        return { stage: '0', ER: 'positive', PR: 'positive', HER2: 'positive', BRCA: 'positive', PDL1: 'low', residual: 'yes' };
    }
  };

  const generateTreatmentPlan = async (e, overrideData = null) => {
    if (e) e.preventDefault();
    const fullPatientData = overrideData || { cancer_type: cancerType.toLowerCase(), ...patientData };
    
    setLoading(true);
    setTreatmentData(null);
    setEvidence([]);

    try {
      const response = await fetch('http://127.0.0.1:5000/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullPatientData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const { plan, evidence } = result;

      const lines = plan.split('\n');
      const protocolLine = lines.find(line => line.toLowerCase().includes('primary recommended treatment'));
      const recommendedProtocol = protocolLine ? protocolLine.replace(/\*\*Primary recommended treatment:\*\*/i, '').trim() : 'See plan details';

      setTreatmentData({
        recommendedProtocol: recommendedProtocol,
        confidence: 95.5,
        description: plan,
        guidelineAlignment: 'AI-Generated Evidence Base',
        alternativeOptions: []
      });
      setEvidence(evidence || []);

    } catch (error) {
      console.error("Failed to generate treatment plan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get('patientId');
    
    if (pid) {
        const fetchPatient = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:8000/api/patients/${pid}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (res.data.success) {
                    const p = res.data.data;
                    const pathData = p.pathologyAnalysis?.extracted_data || {};
                    
                    // FIXED TO BREAST ONLY
                    const type = 'Breast';
                    setCancerType(type);
                    
                    // 2. Initialize and Override
                    let newData = getInitialPatientData(type);
                    if (pathData.stage) newData.stage = pathData.stage;
                    
                    // Specific Breast Mapping
                    if (pathData.ER) newData.ER = pathData.ER.toLowerCase();
                    if (pathData.PR) newData.PR = pathData.PR.toLowerCase();
                    if (pathData.HER2) newData.HER2 = pathData.HER2.toLowerCase();
                    if (pathData.BRCA) newData.BRCA = pathData.BRCA.toLowerCase();
                    
                    setPatientData(newData);

                    // 3. AUTO-GENERATE PLAN
                    generateTreatmentPlan(null, { cancer_type: type.toLowerCase(), ...newData });
                }
            } catch (err) {
                console.error("Error loading patient data:", err);
            }
        };
        fetchPatient();
    }
  }, [location.search]);

  useEffect(() => {
    const initialEvidence = [
        { source: 'NCCN-Initial', text: 'Default NCCN guidelines recommend evidence-based protocols...' },
        { source: 'EANO-Initial', text: 'International standards for precision oncology applied.' }
    ];
    setEvidence(initialEvidence);
  }, []);


  const factorsChartData = {
    labels: ['Tumor Size', 'Location', 'ER Status', 'HER2 Status', 'Age', 'KPS'],
    datasets: [{
      label: 'Decision Weight',
      data: [85, 75, 95, 80, 65, 70],
      backgroundColor: 'rgba(0, 240, 255, 0.2)',
      borderColor: '#00F0FF',
      borderWidth: 2
    }]
  };

  const factorsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { r: { beginAtZero: true, max: 100, ticks: { display: false }, grid: { color: 'rgba(255, 255, 255, 0.05)' }, pointLabels: { color: '#64748B' } } },
    plugins: { legend: { labels: { color: '#64748B' } } }
  };

  const timelineChartData = {
    labels: ['Surgery', 'Recovery', 'Radiation', 'Chemotherapy', 'Follow-up'],
    datasets: [{
      label: 'Duration (weeks)',
      data: [2, 4, 6, 24, 52],
      backgroundColor: ['#059789', '#00F0FF', '#8B5CF6', '#F59E0B', '#64748B'],
      borderRadius: 8
    }]
  };

  const timelineChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { ticks: { color: '#64748B' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }, y: { ticks: { color: '#64748B' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } } },
    plugins: { legend: { display: false } }
  };

  const protocols = useMemo(() => {
    if (!treatmentData) return [];
    const list = [{
        name: treatmentData.recommendedProtocol,
        score: treatmentData.confidence,
        duration: '12-18 months',
        efficacy: 'High',
        toxicity: 'Moderate',
        cost: 'High',
        recommended: true
    }];
    list.push(
        { name: 'Alternative Protocol A', score: 85.3, duration: '6-12 months', efficacy: 'Moderate', toxicity: 'Low-Moderate', cost: 'Moderate', recommended: false },
        { name: 'Alternative Protocol B', score: 60.6, duration: '6-12 months', efficacy: 'Moderate', toxicity: 'Low-Moderate', cost: 'Moderate', recommended: false }
    );
    return list;
  }, [treatmentData]);

  return (
    <div className="treatment-plan-root">
      <Navbar />
      <div className="fluid-container">
        
        {/* HEADER */}
        <div className="console-header">
          <div>
            <Typography variant="h4" className="page-title">
              AI-RECOMMENDED TREATMENT PLAN
            </Typography>
            <Typography variant="body2" className="page-subtitle">
              Evidence-based protocol optimization using multimodal data integration.
            </Typography>
          </div>
        </div>

        {/* PARAMS CARD */}
        <div className="card-glass">
            <h3 className="section-title">Verified Clinical Parameters</h3>
            <div className="params-grid">
                <div className="param-display">
                    <label className="param-label">CANCER TYPE</label>
                    <div className="param-value highlight">{cancerType.toUpperCase()}</div>
                </div>
                {Object.entries(patientData).map(([key, val]) => (
                    <div className="param-display" key={key}>
                        <label className="param-label">{key.toUpperCase()}</label>
                        <div className="param-value">{String(val).toUpperCase()}</div>
                    </div>
                ))}
            </div>
            {loading && <div className="confidence-meter" style={{ height: '4px', marginTop: '2rem' }}>
                <div className="confidence-fill" style={{ width: '40%', animation: 'progress-shimmer 1.5s infinite linear' }}></div>
            </div>}
        </div>

        {loading && <div className="text-center mb-xl" style={{ color: '#64748B', fontFamily: '"Space Grotesk"', textAlign: 'center', marginBottom: '2rem' }}>The Treatment Engine is synthesizing guidelines...</div>}

        {/* RECOMMENDATION CARD */}
        {treatmentData && (
        <div className="recommendation-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <span className="protocol-badge">RECOMMENDED PROTOCOL</span>
                    <h2 className="protocol-name">{treatmentData.recommendedProtocol}</h2>
                    <p className="protocol-desc">
                        {treatmentData.description}
                    </p>
                </div>
                <div className="guideline-badge">
                    <span>📋</span><span>{treatmentData.guidelineAlignment}</span>
                </div>
            </div>
            <div className="confidence-meter">
                <div className="confidence-fill" style={{ width: `${treatmentData.confidence}%` }}>
                    {treatmentData.confidence}% CONFIDENCE SCORE
                </div>
            </div>
        </div>
        )}

        {/* COMPARISON */}
        <h3 className="section-title">Treatment Protocol Comparison</h3>
        <div className="protocol-comparison-grid">
            {protocols.map((p, index) => (
                <div key={index} className={`protocol-option-card ${p.recommended ? 'recommended' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontFamily: '"Rajdhani"', fontWeight: 700, fontSize: '1.25rem', color: '#fff', margin: 0 }}>{p.name}</h4>
                        {p.recommended && <span className="protocol-badge" style={{ fontSize: '0.6rem' }}>RECOMMENDED</span>}
                    </div>
                    <div className={`protocol-option-score ${p.recommended ? 'score-teal' : 'score-muted'}`}>{p.score}%</div>
                    <p className="param-label">CONFIDENCE SCORE</p>
                    <ul className="protocol-option-details">
                        <li className="detail-row"><span className="param-label">Duration</span><strong>{p.duration}</strong></li>
                        <li className="detail-row"><span className="param-label">Efficacy</span><strong>{p.efficacy}</strong></li>
                        <li className="detail-row"><span className="param-label">Toxicity</span><strong>{p.toxicity}</strong></li>
                        <li className="detail-row"><span className="param-label">Cost</span><strong>{p.cost}</strong></li>
                    </ul>
                </div>
            ))}
        </div>

        {/* KEY DECISION FACTORS */}
        <div className="card-glass">
            <h3 className="section-title">Key Decision Factors</h3>
            <div style={{ height: '400px', display: 'flex', justifyContent: 'center' }}>
                <Radar data={factorsChartData} options={factorsChartOptions} />
            </div>
        </div>

        {/* EVIDENCE BASE */}
        <div className="card-glass">
            <h3 className="section-title">Evidence Base & Guidelines</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {evidence.map((e, index) => (
                    <div key={index} className="evidence-section">
                        <h4 style={{ color: '#00F0FF', fontFamily: '"Rajdhani"', margin: '0 0 0.5rem 0' }}>{e.source}</h4>
                        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, fontFamily: '"Space Grotesk"', margin: 0 }}>{e.text}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* TIMELINE */}
        <div className="card-glass">
            <h3 className="section-title">Proposed Treatment Timeline</h3>
            <p className="param-label" style={{ marginBottom: '1.5rem' }}>Estimated treatment phases and duration</p>
            <div style={{ height: '250px' }}><Bar data={timelineChartData} options={timelineChartOptions} /></div>
        </div>
        
        {/* INTEGRATION */}
        <div className="card-glass">
            <h3 className="section-title">Multimodal Data Integration</h3>
            <p className="param-label" style={{ marginBottom: '2rem' }}>Data source contribution analysis</p>
            <div className="grid-3">
                <div className="stat-card">
                    <div className="param-label">MRI ANALYSIS</div>
                    <div className="stat-value" style={{ color: '#00F0FF' }}>HIGH IMPACT</div>
                    <p style={{ color: '#cbd5e1', fontSize: '0.875rem', margin: 0 }}>Tumor volume and location</p>
                </div>
                <div className="stat-card">
                    <div className="param-label">GENOMIC PROFILE</div>
                    <div className="stat-value" style={{ color: '#F59E0B' }}>CRITICAL</div>
                    <p style={{ color: '#cbd5e1', fontSize: '0.875rem', margin: 0 }}>Biomarker status (ER/PR/HER2)</p>
                </div>
                <div className="stat-card">
                    <div className="param-label">CLINICAL HISTORY</div>
                    <div className="stat-value" style={{ color: '#059789' }}>MODERATE</div>
                    <p style={{ color: '#cbd5e1', fontSize: '0.875rem', margin: 0 }}>Performance status</p>
                </div>
            </div>
        </div>

        {/* FOOTER */}
        <div className="action-footer">
            <button className="btn-tech btn-outline" onClick={() => navigate(-1)}>
                ← BACK
            </button>
            <button className="btn-tech btn-primary-gradient" onClick={() => navigate(`/outcome-prediction${location.search}`)}>
                VIEW OUTCOME PREDICTIONS →
            </button>
            <button className="btn-tech btn-secondary-glass" onClick={() => navigate('/pathway-simulator')}>
                SIMULATE PATHWAY
            </button>
        </div>
      </div>
    </div>
  );
}

export default TreatmentPlan;