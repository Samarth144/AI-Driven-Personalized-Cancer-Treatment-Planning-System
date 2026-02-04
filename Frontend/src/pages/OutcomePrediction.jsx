import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { 
  Box, Grid, Typography, TextField, Button, InputAdornment, IconButton, LinearProgress, Slider, Chip, Divider
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import TransgenderIcon from '@mui/icons-material/Transgender';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import BiotechIcon from '@mui/icons-material/Biotech';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import axios from 'axios';


const GENOMIC_MARKERS = {
  Brain: [
    { id: 'idh1', label: 'IDH1 Status', sub: 'Isocitrate Dehydrogenase', icon: <BiotechIcon />, options: ['Mutated', 'Wild Type', 'Unknown'] },
    { id: 'mgmt', label: 'MGMT Methylation', sub: 'Promoter Region', icon: <ScatterPlotIcon />, options: ['Methylated', 'Unmethylated', 'Unknown'] }
  ],
  Breast: [
    { id: 'er', label: 'ER (ESR1)', sub: 'Estrogen Receptor', icon: <FavoriteBorderIcon />, options: ['Positive', 'Negative', 'Unknown'] },
    { id: 'pr', label: 'PR (PGR)', sub: 'Progesterone Receptor', icon: <FavoriteBorderIcon />, options: ['Positive', 'Negative', 'Unknown'] },
    { id: 'her2', label: 'HER2 (ERBB2)', sub: 'Human Epidermal Growth Factor', icon: <BiotechIcon />, options: ['Positive', 'Negative', 'Equivocal', 'Unknown'] },
    { id: 'brca', label: 'BRCA Status', sub: 'Breast Cancer Gene', icon: <ScatterPlotIcon />, options: ['Mutated', 'Wild Type', 'Unknown'] },
    { id: 'pdl1', label: 'PD-L1 (CD274)', sub: 'Programmed Death-Ligand 1', icon: <MedicalServicesIcon />, options: ['Positive', 'Negative', 'Not Tested', 'Unknown'] }
  ],
  Lung: [
    { id: 'egfr', label: 'EGFR Mutation', sub: 'Epidermal Growth Factor', icon: <BiotechIcon />, options: ['Mutated', 'Wild Type', 'Unknown'] },
    { id: 'kras', label: 'KRAS Mutation', sub: 'Kirsten Rat Sarcoma', icon: <ScatterPlotIcon />, options: ['Mutated', 'Wild Type', 'Unknown'] },
    { id: 'alk', label: 'ALK Translocation', sub: 'Anaplastic Lymphoma Kinase', icon: <ContentCutIcon />, options: ['Positive', 'Negative', 'Unknown'] },
    { id: 'ros1', label: 'ROS1 Rearrangement', sub: 'Proto-oncogene Tyrosine', icon: <RemoveCircleOutlineIcon />, options: ['Positive', 'Negative', 'Unknown'] },
    { id: 'pdl1', label: 'PD-L1 Expression', sub: 'Immune Checkpoint', icon: <MedicalServicesIcon />, options: ['<1%', '1–49%', '≥50%', 'Unknown'] }
  ],
  Liver: [
    { id: 'afp', label: 'AFP Biomarker', sub: 'Alpha-Fetoprotein', icon: <BiotechIcon />, options: ['Normal', 'Elevated', 'Very High', 'Unknown'] }
  ],
  Pancreas: [
    { id: 'brca', label: 'BRCA Status', sub: 'Breast Cancer Gene', icon: <ScatterPlotIcon />, options: ['Mutated', 'Wild Type', 'Unknown'] }
  ]
};

const GenderTile = ({ icon, label, selected, onClick }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="gender-tile-wrapper">
    <div className={`gender-tile ${selected ? 'selected' : ''}`} onClick={onClick}>
      {React.cloneElement(icon, { className: 'gender-icon' })}
      <span>{label}</span>
    </div>
  </motion.div>
);

const MolecularSwitch = ({ label, sub, icon, options, value, onChange }) => {
  return (
    <div className="molecular-switch">
      <div className="switch-header">
        <div className="switch-icon-box">{React.cloneElement(icon, { sx: { fontSize: 20 } })}</div>
        <div>
          <Typography className="switch-title">{label}</Typography>
          <Typography className="switch-sub">{sub}</Typography>
        </div>
      </div>
      <div className="switch-options">
        {options.map((option) => {
          const isSelected = value === option;
          let type = 'standard';
          if (['Mutant', 'Methylated', 'Present', 'Lost'].includes(option)) type = 'actionable';
          if (option === 'Unknown') type = 'warning';

          return (
            <motion.div key={option} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className={`switch-option ${isSelected ? `selected-${type}` : ''}`}
              onClick={() => onChange(option)}
            >
              <Typography variant="caption">{option}</Typography>
              <div className="status-dot"></div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const TagInput = ({ label, icon, tags, onAdd, onDelete }) => {
  const [input, setInput] = useState('');
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      onAdd(input.trim());
      setInput('');
    }
  };
  return (
    <div className="tag-input-terminal">
      <div className="tag-header">
        {React.cloneElement(icon, { className: 'tag-icon' })}
        <Typography variant="subtitle2">{label}</Typography>
      </div>
      <div className="tag-container">
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.div key={tag} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <Chip label={tag} onDelete={() => onDelete(tag)} className="tech-chip" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <TextField fullWidth placeholder="Type and press Enter..." value={input}
        onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
        variant="standard" className="tag-text-field" InputProps={{ disableUnderline: true }}
      />
    </div>
  );
};

const getKPSColor = (val) => val >= 80 ? '#059789' : val >= 50 ? '#F59E0B' : '#EF4444';
const getECOGDescription = (val) => {
  const desc = [
    "Fully active, able to carry on all pre-disease performance without restriction.",
    "Restricted in physically strenuous activity but ambulatory and able to carry out work.",
    "Ambulatory and capable of all selfcare but unable to carry out any work activities.",
    "Capable of only limited selfcare, confined to bed or chair more than 50% of waking hours.",
    "Completely disabled. Cannot carry on any selfcare. Totally confined to bed or chair."
  ];
  return desc[val] || "";
};


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
  const [evidence, setEvidence] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', dob: '', gender: '', mrn: '', contact: '', diagnosisDate: '', pathologyReport: '', pathologyFile: null,
    cancerType: 'Brain',
    idh1: 'Unknown', mgmt: 'Unknown',
    er: 'Unknown', pr: 'Unknown', her2: 'Unknown', brca: 'Unknown', pdl1: 'Unknown',
    egfr: 'Unknown', alk: 'Unknown', ros1: 'Unknown', kras: 'Unknown', afp: 'Unknown',
    kps: 100, ecog: 0, symptoms: '', comorbidities: '' 
  });

  const handleChange = (field, value) => setFormData({ ...formData, [field]: value });

  const generatePredictions = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/predict_side_effects', formData);
      setOutcomeData(response.data);
      setEvidence(response.data.evidence || []);
    } catch (error) {
      console.error('Error generating predictions:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="container outcome-container">
        <div className="form-terminal">
          <div className="terminal-header">
            <Typography variant="h5">Patient Information</Typography>
          </div>
          <Grid container spacing={4}>
            <Grid item xs={12} md={9}>
              <div className="form-inputs-col">
                <TextField fullWidth label="Full Legal Name" variant="outlined" className="tech-input fixed-width"
                  value={formData.name} onChange={(e) => handleChange('name', e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon /></InputAdornment> }}
                />
                <TextField fullWidth label="Medical Record Number (MRN)" placeholder="e.g. MR-2026-X" className="tech-input fixed-width"
                  value={formData.mrn} onChange={(e) => handleChange('mrn', e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><NumbersOutlinedIcon /></InputAdornment> }}
                />
                <TextField fullWidth label="Contact Number" placeholder="e.g. 9876543210" className="tech-input fixed-width"
                  value={formData.contact} onChange={(e) => handleChange('contact', e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LocalPhoneOutlinedIcon /></InputAdornment> }}
                />
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <TextField fullWidth type="date" label="Date of Birth" className="tech-input fixed-width"
                      value={formData.dob} onChange={(e) => handleChange('dob', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonthOutlinedIcon /></InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth type="date" label="Date of Diagnosis" className="tech-input fixed-width"
                      value={formData.diagnosisDate} onChange={(e) => handleChange('diagnosisDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><EventAvailableOutlinedIcon /></InputAdornment> }}
                    />
                  </Grid>
                </Grid>
              </div>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography className="field-label">Biological Sex / Gender</Typography>
              <div className="gender-selection-col">
                <GenderTile label="MALE" icon={<MaleIcon />} selected={formData.gender === 'male'} onClick={() => handleChange('gender', 'male')} />
                <GenderTile label="FEMALE" icon={<FemaleIcon />} selected={formData.gender === 'female'} onClick={() => handleChange('gender', 'female')} />
                <GenderTile label="OTHER" icon={<TransgenderIcon />} selected={formData.gender === 'other'} onClick={() => handleChange('gender', 'other')} />
              </div>
            </Grid>
          </Grid>
        </div>

        <div className="form-terminal">
          <div className="terminal-header">
            <Typography variant="h5">Genomic Decoder</Typography>
          </div>
          <Box sx={{ mb: 4 }}>
            <Typography className="field-label" sx={{ mb: 2 }}>SELECT CANCER TYPE FOR SPECIALIZED SEGMENTATION</Typography>
            <div className="cancer-type-selector">
              {['Brain', 'Breast', 'Liver', 'Pancreas', 'Lung'].map((type) => (
                <motion.div key={type} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={formData.cancerType === type ? "contained" : "outlined"}
                    onClick={() => handleChange('cancerType', type)}
                    className={`tech-btn-choice ${formData.cancerType === type ? 'active' : ''}`}
                    sx={{ minWidth: '120px' }}
                  >
                    {type}
                  </Button>
                </motion.div>
              ))}
            </div>
          </Box>
          <Grid container spacing={3}>
            {(GENOMIC_MARKERS[formData.cancerType] || GENOMIC_MARKERS.Brain).map((m) => (
              <Grid item xs={12} key={m.id}>
                <MolecularSwitch 
                  label={m.label} sub={m.sub} icon={m.icon} options={m.options} 
                  value={formData[m.id]} onChange={(val) => handleChange(m.id, val)}
                />
              </Grid>
            ))}
          </Grid>
        </div>

        <div className="form-terminal">
          <div className="terminal-header">
            <Typography variant="h5">Clinical History</Typography>
          </div>
          <Grid container spacing={2} className="performance-grid">
            <Grid item xs={12} md={3}>
              <div className="performance-terminal-box" style={{ '--kps-color': getKPSColor(formData.kps) }}>
                <div className="score-header">
                  <Typography className="kps-label">KPS Score</Typography>
                  <Typography className="kps-value">{formData.kps}%</Typography>
                </div>
                <Slider
                  value={formData.kps}
                  onChange={(_, val) => handleChange('kps', val)}
                  step={10} marks min={0} max={100}
                  className="tech-slider"
                />
                <Typography variant="caption" className="score-desc">
                  <span>{formData.kps >= 80 ? "Normal" : formData.kps >= 50 ? "Assisted" : "Hosp."}</span>
                </Typography>
              </div>
            </Grid>

            <Grid item xs={12} md={3}>
              <div className="performance-terminal-box">
                <Typography className="ecog-label">ECOG Score (0-4)</Typography>
                <div className="ecog-selector">
                  {[0, 1, 2, 3, 4].map((score) => (
                    <Button key={score} onClick={() => handleChange('ecog', score)}
                      className={`ecog-btn ${formData.ecog === score ? 'active' : ''}`}>
                      {score}
                    </Button>
                  ))}
                </div>
                <Typography variant="caption" className="ecog-desc-text">
                  {getECOGDescription(formData.ecog).substring(0, 30)}...
                </Typography>
              </div>
            </Grid>

            <Grid item xs={12} md={3}>
              <TagInput 
                label="SYMPTOMS" icon={<MedicalServicesIcon />}
                tags={formData.symptoms ? formData.symptoms.split(',').filter(s => s) : []}
                onAdd={(t) => handleChange('symptoms', formData.symptoms ? `${formData.symptoms},${t}` : t)}
                onDelete={(t) => handleChange('symptoms', formData.symptoms.split(',').filter(x => x !== t).join(','))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TagInput 
                label="COMORBIDITIES" icon={<FavoriteBorderIcon />}
                tags={formData.comorbidities ? formData.comorbidities.split(',').filter(s => s) : []}
                onAdd={(t) => handleChange('comorbidities', formData.comorbidities ? `${formData.comorbidities},${t}` : t)}
                onDelete={(t) => handleChange('comorbidities', formData.comorbidities.split(',').filter(x => x !== t).join(','))}
              />
            </Grid>
          </Grid>
        </div>

        <div className="flex justify-between items-center mb-xl">
          <div>
            <h1>Outcome & Toxicity Prediction</h1>
            <p className="text-secondary">AI-powered survival forecasting and side-effect modeling</p>
          </div>
          <button className="btn btn-primary" onClick={generatePredictions} disabled={loading}>
            {loading ? 'Generating...' : '📈 Generate Predictions'}
          </button>
        </div>

        {outcomeData && (
          <>
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
            ) : outcomeData && Object.entries(outcomeData.sideEffects).map(([name, risk]) => (
                <div key={name} className="side-effect-card">
                    <div className="flex justify-between items-center mb-sm">
                        <strong>{name.replace(/([A-Z])/g, ' $1').trim()}</strong>
                        <span className="badge badge-warning">{risk}%</span>
                    </div>
                    <div className="risk-meter">
                        <div className="risk-fill" style={{ width: `${risk}%` }}></div>
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

        {/* Evidence Section */}
        {evidence.length > 0 && (
          <div className="card-glass mb-xl">
            <details>
              <summary style={{ cursor: 'pointer', color: 'white' }}>
                <h3>Evidence from Literature</h3>
                <p className="text-secondary mb-lg">Sources used for prediction (click to expand)</p>
              </summary>
              <div className="evidence-grid">
                {evidence.map((item, index) => (
                  <div key={index} className="evidence-card">
                    <p className="evidence-text">{item.text}</p>
                    <p className="evidence-source">{item.source} - Page {item.page}</p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Action Buttons */}
          </>
        )}

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
