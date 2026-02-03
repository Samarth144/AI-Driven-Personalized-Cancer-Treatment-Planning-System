import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './GenomicAnalysis.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

import axios from 'axios';
import { useLocation } from 'react-router-dom';

function GenomicAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [genomicData, setGenomicData] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [patientData, setPatientData] = useState(null);

  // Helper to generate mock data exactly like the original app.js logic
  const generateMockGenomicData = (type) => {
    const isBrain = type === 'Brain';
    return {
      idh1: isBrain ? (Math.random() > 0.5 ? 'Mutant' : 'Wild-type') : 'N/A',
      mgmt: isBrain ? (Math.random() > 0.5 ? 'Methylated' : 'Unmethylated') : 'N/A',
      atrx: isBrain ? (Math.random() > 0.5 ? 'Mutant' : 'Wild-type') : 'N/A',
      codeletion1p19q: isBrain ? (Math.random() > 0.7 ? 'Present' : 'Absent') : 'N/A',
      treatmentSensitivity: {
        temozolomide: parseFloat((Math.random() * 40 + 60).toFixed(1)),
        radiation: parseFloat((Math.random() * 30 + 70).toFixed(1)),
        immunotherapy: parseFloat((Math.random() * 50 + 30).toFixed(1)),
        pcv: parseFloat((Math.random() * 30 + 50).toFixed(1))
      }
    };
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get('patientId');
    if (pid && pid !== 'null') {
        setPatientId(pid);
        fetchPatientData(pid);
    }
  }, [location.search]);

  const fetchPatientData = async (pid) => {
      try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://localhost:8000/api/patients/${pid}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
              setPatientData(res.data.data);
              const profile = res.data.data.genomicProfile || {};
              setGenomicData({
                  idh1: profile.idh1 || 'Unknown',
                  mgmt: profile.mgmt || 'Unknown',
                  atrx: profile.atrx || 'Unknown',
                  codeletion1p19q: profile.codeletion1p19q || 'Unknown',
                  treatmentSensitivity: {
                    temozolomide: 0,
                    radiation: 0,
                    immunotherapy: 0,
                    pcv: 0
                  }
              });
          }
      } catch (err) {
          console.error("Failed to fetch patient data", err);
      }
  };

  const runGenomicAnalysis = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        
        // 1. Create Analysis Record
        const createRes = await axios.post('http://localhost:8000/api/analyses', {
            patientId: patientId,
            analysisType: 'genomic',
            status: 'completed', // For now, mock completion
            data: generateMockGenomicData(patientData?.cancerType)
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (createRes.data.success) {
            setGenomicData(createRes.data.data.data);
        }
    } catch (err) {
        console.error("Analysis failed", err);
    } finally {
        setLoading(false);
    }
  };

  // Chart data calculations
  const sensitivityChartData = useMemo(() => {
    if (!genomicData) return null;
    return {
      labels: ['Temozolomide', 'Radiation Therapy', 'Immunotherapy', 'PCV Chemotherapy'],
      datasets: [{
        label: 'Treatment Sensitivity (%)',
        data: [
          genomicData.treatmentSensitivity.temozolomide,
          genomicData.treatmentSensitivity.radiation,
          genomicData.treatmentSensitivity.immunotherapy,
          genomicData.treatmentSensitivity.pcv
        ],
        backgroundColor: [
          'hsla(210, 100%, 56%, 0.8)',
          'hsla(180, 65%, 55%, 0.8)',
          'hsla(270, 70%, 60%, 0.8)',
          'hsla(190, 85%, 65%, 0.8)'
        ],
        borderRadius: 8
      }]
    };
  }, [genomicData]);

  const classificationChartData = {
    labels: ['IDH-mutant', 'IDH-wildtype', 'Oligodendroglioma', 'Other'],
    datasets: [{
      data: [35, 45, 15, 5],
      backgroundColor: [
        'hsla(210, 100%, 56%, 0.8)',
        'hsla(270, 70%, 60%, 0.8)',
        'hsla(180, 65%, 55%, 0.8)',
        'hsla(0, 0%, 60%, 0.5)'
      ]
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
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

  const variants = [
    { gene: 'IDH1', variant: 'R132H', type: 'Missense', frequency: '42%', actionability: 'high', significance: 'Favorable prognosis, TMZ sensitive' },
    { gene: 'TP53', variant: 'R273C', type: 'Missense', frequency: '38%', actionability: 'medium', significance: 'Associated with astrocytoma' },
    { gene: 'EGFR', variant: 'Amplification', type: 'CNV', frequency: '15%', actionability: 'high', significance: 'Potential targeted therapy' },
    { gene: 'PTEN', variant: 'Loss', type: 'Deletion', frequency: '22%', actionability: 'medium', significance: 'Poor prognosis marker' },
    { gene: 'TERT', variant: 'C228T', type: 'Promoter', frequency: '55%', actionability: 'low', significance: 'Telomerase activation' }
  ];

  return (
    <>
      <div className="container genomic-container">
        <div className="flex justify-between items-center mb-xl">
          <div>
            <h1>Genomic & Molecular Biomarker Analysis</h1>
            <p className="text-secondary">AI-powered interpretation of key cancer biomarkers</p>
          </div>
          <button className="btn btn-primary" onClick={runGenomicAnalysis} disabled={loading}>
            {loading ? 'Analyzing...' : '🧬 Analyze Biomarkers'}
          </button>
        </div>

        {/* Key Biomarkers */}
        <div className="biomarker-grid">
          {/* IDH1 */}
          <div className="biomarker-card">
            <div className="biomarker-header">
              <div className="icon-circle">🧬</div>
              <span className="badge badge-info">IDH1</span>
            </div>
            <h3>IDH1 Status</h3>
            <div className="biomarker-status">
              {loading ? '--' : (genomicData?.idh1 || '--')}
            </div>
            <p className="text-secondary">Isocitrate Dehydrogenase 1 mutation status</p>

            <div className="mt-md">
              <div className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)' }}>
                Treatment Sensitivity
              </div>
              <div className="sensitivity-bar">
                <div 
                  className="sensitivity-fill" 
                  style={{ width: loading ? '0%' : `${genomicData?.treatmentSensitivity?.temozolomide || 0}%` }}
                >
                  {loading ? '' : `${genomicData?.treatmentSensitivity?.temozolomide || 0}%`}
                </div>
              </div>
            </div>
          </div>

          {/* MGMT */}
          <div className="biomarker-card">
            <div className="biomarker-header">
              <div className="icon-circle">🔬</div>
              <span className="badge badge-info">MGMT</span>
            </div>
            <h3>MGMT Promoter</h3>
            <div className="biomarker-status">
               {loading ? '--' : (genomicData?.mgmt || '--')}
            </div>
            <p className="text-secondary">Methylation status - TMZ sensitivity predictor</p>

            <div className="mt-md">
              <div className="text-secondary sensitivity-label">
                Temozolomide Sensitivity
              </div>
              <div className="sensitivity-bar">
                <div 
                  className="sensitivity-fill" 
                  style={{ width: loading ? '0%' : `${genomicData?.treatmentSensitivity?.temozolomide || 0}%` }}
                >
                  {loading ? '' : `${genomicData?.treatmentSensitivity?.temozolomide || 0}%`}
                </div>
              </div>
            </div>
          </div>

          {/* ATRX */}
          <div className="biomarker-card">
            <div className="biomarker-header">
              <div className="icon-circle">🧪</div>
              <span className="badge badge-info">ATRX</span>
            </div>
            <h3>ATRX Status</h3>
            <div className="biomarker-status">
              {loading ? '--' : (genomicData?.atrx || '--')}
            </div>
            <p className="text-secondary">Alpha-thalassemia/mental retardation syndrome X-linked</p>

            <div className="mt-md">
              <div className="text-secondary sensitivity-label">
                Prognostic Indicator
              </div>
              <div className="sensitivity-bar">
                <div 
                  className="sensitivity-fill" 
                  style={{ width: loading ? '0%' : '94.1%' }}
                >
                  {loading ? '' : '94.1%'}
                </div>
              </div>
            </div>
          </div>

          {/* 1p/19q */}
          <div className="biomarker-card">
            <div className="biomarker-header">
              <div className="icon-circle">📊</div>
              <span className="badge badge-info">1p/19q</span>
            </div>
            <h3>1p/19q Codeletion</h3>
            <div className="biomarker-status">
              {loading ? '--' : (genomicData?.codeletion1p19q || '--')}
            </div>
            <p className="text-secondary">Chromosomal codeletion - oligodendroglioma marker</p>

            <div className="mt-md">
              <div className="text-secondary sensitivity-label">
                Chemotherapy Response
              </div>
              <div className="sensitivity-bar">
                <div 
                  className="sensitivity-fill" 
                  style={{ width: loading ? '0%' : `${genomicData?.treatmentSensitivity?.pcv || 0}%` }}
                >
                  {loading ? '' : `${genomicData?.treatmentSensitivity?.pcv || 0}%`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Treatment Sensitivity Chart */}
                  <div className="card-glass mb-xl">
                  <h3>Treatment Sensitivity Predictions</h3>
                  <p className="text-secondary mb-lg">Based on genomic biomarker profile</p>
        
                  <div className="chart-wrapper-lg">
                    {!loading && genomicData && <Bar data={sensitivityChartData} options={chartOptions} />}
                  </div>
                </div>
        {/* Variant Analysis */}
        <div className="card-glass mb-xl">
          <h3>Detected Variants & Actionability</h3>
          <p className="text-secondary mb-lg">Clinically relevant genomic variants with treatment implications</p>

          <table className="variant-table">
            <thead>
              <tr>
                <th>Gene</th>
                <th>Variant</th>
                <th>Type</th>
                <th>Frequency</th>
                <th>Actionability</th>
                <th>Clinical Significance</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center text-secondary">Analyzing...</td>
                </tr>
              ) : (
                variants.map((v, index) => (
                  <tr key={index}>
                    <td><strong>{v.gene}</strong></td>
                    <td><code className="variant-code">{v.variant}</code></td>
                    <td>{v.type}</td>
                    <td>{v.frequency}</td>
                    <td><span className={`actionability-badge actionability-${v.actionability}`}>{v.actionability.toUpperCase()}</span></td>
                    <td>{v.significance}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Molecular Classification */}
        <div className="grid-2 mb-xl">
          <div className="card-glass">
            <h3>Molecular Classification</h3>
            <div className="chart-wrapper-md">
              <Doughnut data={classificationChartData} options={{ ...chartOptions, plugins: { legend: { position: 'bottom', labels: { color: 'hsl(0, 0%, 75%)' } } } }} />
            </div>
          </div>

          <div className="card-glass">
            <h3>Biomarker Summary</h3>
            <div className="text-secondary">
              {loading || !genomicData ? (
                'Run analysis to generate biomarker summary...'
              ) : (
                <div className="summary-text">
                  <p><strong>Molecular Subtype:</strong> {genomicData.idh1 === 'Mutant' ? 'IDH-mutant Astrocytoma' : 'IDH-wildtype Glioblastoma'}</p>
                  
                  <p className="mt-md"><strong>Key Findings:</strong></p>
                  <ul className="summary-list">
                    <li>IDH1 {genomicData.idh1} - {genomicData.idh1 === 'Mutant' ? 'Better prognosis expected' : 'Aggressive phenotype'}</li>
                    <li>MGMT {genomicData.mgmt} - {genomicData.mgmt === 'Methylated' ? 'Good TMZ response predicted' : 'Limited TMZ benefit'}</li>
                    <li>ATRX {genomicData.atrx} - {genomicData.atrx === 'Mutant' ? 'Consistent with lower-grade' : 'Higher-grade features'}</li>
                    <li>1p/19q {genomicData.codeletion1p19q} - {genomicData.codeletion1p19q === 'Present' ? 'Oligodendroglioma confirmed' : 'Astrocytic lineage'}</li>
                  </ul>
                  
                  <p className="mt-md"><strong>Treatment Implications:</strong></p>
                  <p>Based on the biomarker profile, {genomicData.mgmt === 'Methylated' ? 'temozolomide chemotherapy is strongly recommended' : 'alternative chemotherapy regimens should be considered'}. {genomicData.idh1 === 'Mutant' ? 'IDH inhibitors may be beneficial.' : 'Standard of care with radiation and chemotherapy is recommended.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-md justify-center">
          <button className="btn btn-secondary" onClick={() => navigate('/mri-analysis')}>
            ← Back to MRI Analysis
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/treatment-plan')}>
            Next: Treatment Planning →
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/histopathology')}>
            View Histopathology
          </button>
        </div>
      </div>
    </>
  );
}

export default GenomicAnalysis;
