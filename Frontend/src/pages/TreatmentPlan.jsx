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

  const handleCancerTypeChange = (e) => {
    const newCancerType = e.target.value;
    setCancerType(newCancerType);
    setPatientData(getInitialPatientData(newCancerType));
  };

  const handlePatientDataChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const generateTreatmentPlan = async (e) => {
    e.preventDefault();
    const fullPatientData = { cancer_type: cancerType.toLowerCase(), ...patientData };
    console.log("Generating formatted plan for:", fullPatientData);

    setLoading(true);
    setTreatmentData(null);
    setEvidence([]); // Clear previous evidence

    try {
      const response = await fetch('/api/treatments/generate-formatted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullPatientData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server returned an error:", response.status, errorText);
        let errorMessage = errorText;
        try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || JSON.stringify(errorJson);
        } catch (e) {
            // Not JSON
        }
        throw new Error(`Failed to generate plan. Server responded with: ${errorMessage}`);
      }

      const result = await response.json();
      console.log("Formatted backend response:", result);

      if (!result.success || !result.data) {
        throw new Error('Backend did not return a valid plan or formatted evidence.');
      }

      const { rawPlan, formattedEvidence } = result.data;

      // Extract the first line of the raw plan as the recommended protocol for display
      const recommendedProtocol = rawPlan.split('\n')[0].trim() || 'AI Recommended Protocol';

      const adaptedData = {
        recommendedProtocol: recommendedProtocol,
        confidence: 98.7, // Static confidence for now
        description: rawPlan, // Display the raw plan from the AI engine
        guidelineAlignment: 'AI-Generated',
        alternativeOptions: []
      };

      setTreatmentData(adaptedData);
      // Set the evidence section with the Gemini-formatted evidence
      setEvidence([{ source: 'AI Evidence Summary', text: formattedEvidence }]);


    } catch (error) {
      console.error("Failed to generate formatted treatment plan:", error);
      setEvidence([{ source: 'Error', text: error.message }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial evidence is now set by the generateTreatmentPlan function
    setEvidence([]);
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
    scales: { r: { beginAtZero: true, max: 100, ticks: { color: 'hsl(0, 0%, 75%)' }, grid: { color: 'hsla(0, 0%, 100%, 0.05)' }, pointLabels: { color: 'hsl(0, 0%, 75%)' } } },
    plugins: { legend: { labels: { color: 'hsl(0, 0%, 75%)' } } }
  };

  const timelineChartData = {
    labels: ['Surgery', 'Recovery', 'Radiation', 'Chemotherapy', 'Follow-up'],
    datasets: [{
      label: 'Duration (weeks)',
      data: [2, 4, 6, 24, 52],
      backgroundColor: ['hsla(210, 100%, 56%, 0.8)', 'hsla(180, 65%, 55%, 0.8)', 'hsla(270, 70%, 60%, 0.8)', 'hsla(190, 85%, 65%, 0.8)', 'hsla(142, 70%, 55%, 0.8)'],
      borderRadius: 8
    }]
  };

  const timelineChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { ticks: { color: 'hsl(0, 0%, 75%)' }, grid: { color: 'hsla(0, 0%, 100%, 0.05)' } }, y: { ticks: { color: 'hsl(0, 0%, 75%)' }, grid: { color: 'hsla(0, 0%, 100%, 0.05)' } } },
    plugins: { legend: { labels: { color: 'hsl(0, 0%, 75%)' } } }
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
    // This part can be enhanced to parse alternatives from the AI response
    list.push(
        { name: 'Alternative Protocol A', score: 85.3, duration: '6-12 months', efficacy: 'Moderate', toxicity: 'Low-Moderate', cost: 'Moderate', recommended: false },
        { name: 'Alternative Protocol B', score: 60.6, duration: '6-12 months', efficacy: 'Moderate', toxicity: 'Low-Moderate', cost: 'Moderate', recommended: false },
        { name: 'Watchful Waiting', score: 45.2, duration: 'Ongoing', efficacy: 'N/A', toxicity: 'None', cost: 'Low', recommended: false }
    );
    return list;
  }, [treatmentData]);

  const renderBreastInputs = () => (
    <>
      <div className="form-group"><label>Stage</label><select name="stage" value={patientData.stage} onChange={handlePatientDataChange}>{['0', 'I', 'II', 'III', 'IV'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
      <div className="form-group"><label>ER</label><select name="ER" value={patientData.ER} onChange={handlePatientDataChange}>{['positive', 'negative'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
      <div className="form-group"><label>PR</label><select name="PR" value={patientData.PR} onChange={handlePatientDataChange}>{['positive', 'negative'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
      <div className="form-group"><label>HER2</label><select name="HER2" value={patientData.HER2} onChange={handlePatientDataChange}>{['positive', 'negative'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
      <div className="form-group"><label>BRCA</label><select name="BRCA" value={patientData.BRCA} onChange={handlePatientDataChange}>{['positive', 'negative'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
      <div className="form-group"><label>PD-L1</label><select name="PDL1" value={patientData.PDL1} onChange={handlePatientDataChange}>{['low', '>=10', '>=50', 'unknown'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
      <div className="form-group"><label>Residual disease</label><select name="residual" value={patientData.residual} onChange={handlePatientDataChange}>{['yes', 'no'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
    </>
  );

  const renderBrainInputs = () => (
    <>
      <div className="form-group"><label>WHO Grade</label><select name="stage" value={patientData.stage} onChange={handlePatientDataChange}>{['LOCALIZED', 'RECURRENT'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
      <div className="form-group"><label>MGMT Methylation</label><select name="MGMT" value={patientData.MGMT} onChange={handlePatientDataChange}>{['methylated', 'unmethylated'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
      <div className="form-group"><label>IDH Status</label><select name="IDH" value={patientData.IDH} onChange={handlePatientDataChange}>{['mutant', 'wild-type'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
      <div className="form-group"><label>Resection Status</label><select name="Resection" value={patientData.Resection} onChange={handlePatientDataChange}>{['complete', 'partial', 'biopsy'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
    </>
  );

  const renderLungInputs = () => (
    <>
        <div className="form-group"><label>Stage</label><select name="stage" value={patientData.stage} onChange={handlePatientDataChange}>{['I', 'II', 'III', 'IV'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
        <div className="form-group"><label>EGFR</label><select name="EGFR" value={patientData.EGFR} onChange={handlePatientDataChange}>{['positive', 'negative'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
        <div className="form-group"><label>ALK</label><select name="ALK" value={patientData.ALK} onChange={handlePatientDataChange}>{['positive', 'negative'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
        <div className="form-group"><label>PD-L1</label><select name="PDL1" value={patientData.PDL1} onChange={handlePatientDataChange}>{['<1%', '1-49%', '>=50%'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
    </>
  );

  const renderLiverInputs = () => (
    <>
        <div className="form-group"><label>BCLC Stage</label><select name="stage" value={patientData.stage} onChange={handlePatientDataChange}>{['EARLY', 'INTERMEDIATE', 'ADVANCED'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
        <div className="form-group"><label>AFP Levels</label><select name="AFP" value={patientData.AFP} onChange={handlePatientDataChange}>{['normal', 'elevated'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
        <div className="form-group"><label>Cirrhosis</label><select name="Cirrhosis" value={patientData.Cirrhosis} onChange={handlePatientDataChange}>{['yes', 'no'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
    </>
  );

    const renderPancreasInputs = () => (
    <>
        <div className="form-group"><label>Stage</label><select name="stage" value={patientData.stage} onChange={handlePatientDataChange}>{['RESECTABLE', 'LOCALLY_ADVANCED', 'METASTATIC'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
        <div className="form-group"><label>CA19-9</label><select name="CA19-9" value={patientData['CA19-9']} onChange={handlePatientDataChange}>{['normal', 'elevated'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
        <div className="form-group"><label>BRCA</label><select name="BRCA" value={patientData.BRCA} onChange={handlePatientDataChange}>{['positive', 'negative'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
    </>
    );

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-3xl)' }}>
        <div className="flex justify-between items-center mb-xl">
          <div><h1>AI-Recommended Treatment Plan</h1><p className="text-secondary">Evidence-based protocol optimization using multimodal data</p></div>
        </div>

        <div className="card-glass mb-xl">
            <h3 className="mb-lg">Treatment Optimization Engine</h3>
            <form onSubmit={generateTreatmentPlan}>
                <div className="form-group"><label>Select Cancer Type</label><select value={cancerType} onChange={handleCancerTypeChange}>{['Breast', 'Brain', 'Lung', 'Liver', 'Pancreas'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <div className="grid-dynamic">
                    {cancerType === 'Breast' && renderBreastInputs()}
                    {cancerType === 'Brain' && renderBrainInputs()}
                    {cancerType === 'Lung' && renderLungInputs()}
                    {cancerType === 'Liver' && renderLiverInputs()}
                    {cancerType === 'Pancreas' && renderPancreasInputs()}
                </div>
                <button type="submit" className="btn btn-primary mt-lg" disabled={loading} style={{width: '100%'}}>{loading ? 'Generating...' : '🎯 Generate Plan'}</button>
            </form>
        </div>

        {loading && <div className="text-center text-secondary">Loading... The AI is thinking.</div>}

        {treatmentData && (
        <div className="recommendation-card" id="primaryRecommendation">
            <div className="flex justify-between items-start">
                <div>
                    <span className="badge" style={{ background: 'white', color: 'var(--bg-primary)' }}>RECOMMENDED</span>
                    <h2 className="mt-md">{treatmentData.recommendedProtocol}</h2>
                    <p style={{ whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.9)', fontSize: '1.125rem' }}>
                        {treatmentData.description}
                    </p>
                </div>
                <div className="guideline-badge" style={{ background: 'white', color: 'var(--bg-primary)' }}><span>📋</span><span>{treatmentData.guidelineAlignment}</span></div>
            </div>
            <div className="confidence-meter"><div className="confidence-fill" style={{ width: loading ? '0%' : `${treatmentData.confidence}%` }}>{loading ? '' : `${treatmentData.confidence}% Confidence`}</div></div>
        </div>
        )}

        <h3 className="mb-lg">Treatment Protocol Comparison</h3>
        <div className="protocol-comparison">{protocols.map((p, index) => (<div key={index} className={`protocol-card ${p.recommended ? 'recommended' : ''}`}><div className="protocol-header"><h4>{p.name}</h4>{p.recommended && <span className="badge badge-success">RECOMMENDED</span>}</div><div className="protocol-score">{p.score}%</div><p className="text-secondary">Confidence Score</p><ul className="protocol-details"><li><span className="text-secondary">Duration</span><strong>{p.duration}</strong></li><li><span className="text-secondary">Efficacy</span><strong>{p.efficacy}</strong></li><li><span className="text-secondary">Toxicity</span><strong>{p.toxicity}</strong></li><li><span className="text-secondary">Cost</span><strong>{p.cost}</strong></li></ul></div>))}</div>

        <div className="grid-2 mb-xl">
            <div className="card-glass">
                <h3>Evidence Base & Guidelines</h3>
                {evidence && evidence.length > 0 ? (
                    evidence.map((e, index) => (
                        <div key={index} className="evidence-section">
                            <h4>{e.source}</h4>
                            <p className="text-secondary">{e.text}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-secondary">No evidence retrieved.</p>
                )}
            </div>

            <div className="card-glass"><h3>Key Decision Factors</h3><div style={{ height: '300px' }}><Radar data={factorsChartData} options={factorsChartOptions} /></div></div>
        </div>

        <div className="card-glass mb-xl"><h3>Proposed Treatment Timeline</h3><p className="text-secondary mb-lg">Estimated treatment phases and duration</p><div style={{ height: '250px' }}><Bar data={timelineChartData} options={timelineChartOptions} /></div></div>
        <div className="card-glass mb-xl"><h3>Multimodal Data Integration</h3><p className="text-secondary mb-lg">How different data sources contributed to this recommendation</p><div className="grid-3"><div className="stat-card"><div className="stat-label">MRI Analysis</div><div className="stat-value" style={{ fontSize: '1.5rem' }}>High Impact</div><p className="text-secondary" style={{ fontSize: '0.875rem' }}>Tumor volume and location</p></div><div className="stat-card"><div className="stat-label">Genomic Profile</div><div className="stat-value" style={{ fontSize: '1.5rem' }}>Critical</div><p className="text-secondary" style={{ fontSize: '0.875rem' }}>MGMT methylation status</p></div><div className="stat-card"><div className="stat-label">Clinical History</div><div className="stat-value" style={{ fontSize: '1.5rem' }}>Moderate</div><p className="text-secondary" style={{ fontSize: '0.875rem' }}>Performance status</p></div></div></div>
        <div className="flex gap-md justify-center"><button className="btn btn-secondary" onClick={() => navigate('/genomic-analysis')}>← Back to Genomic Analysis</button><button className="btn btn-primary" onClick={() => navigate('/outcome-prediction')}>View Outcome Predictions →</button><button className="btn btn-outline" onClick={() => navigate('/pathway-simulator')}>Simulate Treatment Pathway</button><button className="btn btn-outline" onClick={() => navigate('/explainability')}>View AI Explanation</button></div>
      </div>
    </>
  );
}

export default TreatmentPlan;
