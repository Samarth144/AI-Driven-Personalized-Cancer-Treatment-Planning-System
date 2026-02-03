import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Grid, Typography, Button, Slider, IconButton, Tooltip, LinearProgress 
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ViewInArIcon from '@mui/icons-material/ViewInAr'; 
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import GradientIcon from '@mui/icons-material/Gradient'; 
import { Chart as ChartJS, RadialLinearScale, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip as ChartTooltip, Legend, Filler } from 'chart.js';
import { Radar, Bar, Line } from 'react-chartjs-2';
import './MRIAnalysis.css';

ChartJS.register(RadialLinearScale, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ChartTooltip, Legend, Filler);

// --- THEME CONSTANTS ---
const colors = {
  bg: '#0B1221',
  glass: 'rgba(22, 32, 50, 0.85)',
  glassDark: 'rgba(11, 18, 33, 0.95)',
  teal: '#059789',
  cyan: '#00F0FF',
  amber: '#F59E0B',
  text: '#F8FAFC',
  muted: '#64748B',
  border: 'rgba(5, 151, 137, 0.3)'
};

// --- DATA ---
const sequences = ['T1', 'T1ce', 'T2', 'FLAIR'];

// --- COMPONENTS ---

// --- COMPONENTS ---

const Viewport = ({ title, color, children }) => (
  <div className="diagnostic-viewport">
    <div className="viewport-header">
      <div className="viewport-dot" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}></div>
      <Typography variant="caption" className="viewport-title" style={{ color: color }}>{title}</Typography>
    </div>
    <div className="viewport-content">
      {children}
    </div>
  </div>
);

const MRIViewer = ({ analysisId, sequence, setSequence, slice, setSlice, viewPlane, setViewPlane, loading }) => {
  const [images, setImages] = useState({ source: null, mask: null, heatmap: null });

  useEffect(() => {
      const fetchImages = async () => {
          if (!analysisId || loading) return;
          try {
              const token = localStorage.getItem('token');
              const headers = { Authorization: `Bearer ${token}` };
              
              // Parallel fetch for speed
              const [sourceRes, maskRes, heatmapRes] = await Promise.all([
                  axios.get(`http://localhost:8000/api/analyses/${analysisId}/slice/${slice}?type=source&plane=${viewPlane}`, { headers }),
                  axios.get(`http://localhost:8000/api/analyses/${analysisId}/slice/${slice}?type=mask&plane=${viewPlane}`, { headers }),
                  axios.get(`http://localhost:8000/api/analyses/${analysisId}/slice/${slice}?type=heatmap&plane=${viewPlane}`, { headers })
              ]);

              setImages({
                  source: sourceRes.data.image,
                  mask: maskRes.data.image,
                  heatmap: heatmapRes.data.image
              });
          } catch (err) {
              console.error("Error fetching slices:", err);
          }
      };

      // Debounce the slider input slightly
      const timeoutId = setTimeout(() => {
          fetchImages();
      }, 100);

      return () => clearTimeout(timeoutId);
  }, [analysisId, slice, sequence, viewPlane]);

  const maxSlices = viewPlane === 'axial' ? 155 : 240;

  return (
    <Box sx={{ height: '60vh', minHeight: '500px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      
      {/* THREE PARALLEL BOXES */}
      <div className="viewer-grid">
        
        {/* 1. SOURCE VIEW */}
        <Viewport title={`SOURCE: ${sequence} (${viewPlane.toUpperCase()})`} color={colors.text}>
           {images.source ? (
               <img src={images.source} alt="MRI Slice" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
           ) : (
               <Box sx={{ 
                 position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                 width: '60%', height: '60%', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)',
                 background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)'
               }} />
           )}
           <Typography variant="caption" className="viewport-label" style={{ color: colors.muted }}>
             RAW_DICOM_DATA
           </Typography>
        </Viewport>

        {/* 2. SEGMENTATION VIEW */}
        <Viewport title="AI SEGMENTATION" color={colors.cyan}>
           {images.mask ? (
               <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                   {/* Background Source for Context */}
                   <img src={images.source} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain', opacity: 0.5 }} />
                   {/* Mask Overlay */}
                   <img src={images.mask} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain' }} />
               </div>
           ) : (
               <motion.div 
                 animate={{ scale: [1, 1.02, 1], opacity: [0.4, 0.6, 0.4] }}
                 transition={{ duration: 4, repeat: Infinity }}
                 style={{ 
                   position: 'absolute', top: '40%', left: '40%', width: '30%', height: '30%', 
                   borderRadius: '40% 60% 70% 30% / 40% 50% 60% 70%', background: colors.cyan, filter: 'blur(20px)' 
                 }} 
               />
           )}
           <Typography variant="caption" className="viewport-label" style={{ color: colors.cyan }}>
             MASK_GENERATED
           </Typography>
        </Viewport>

        {/* 3. HEATMAP VIEW */}
        <Viewport title="GRAD-CAM HEATMAP" color={colors.amber}>
           {images.heatmap ? (
               <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                   {/* Background Source */}
                   <img src={images.source} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain', opacity: 0.3 }} />
                   {/* Heatmap Overlay */}
                   <img src={images.heatmap} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain' }} />
               </div>
           ) : (
               <>
               <Box style={{ 
                 position: 'absolute', inset: 0, 
                 background: 'radial-gradient(circle at 45% 45%, rgba(245, 158, 11, 0.4) 0%, transparent 40%)' 
               }} />
               <Box style={{ 
                 position: 'absolute', inset: 0, 
                 background: 'radial-gradient(circle at 55% 55%, rgba(0, 240, 255, 0.2) 0%, transparent 30%)' 
               }} />
               </>
           )}
           <Typography variant="caption" className="viewport-label" style={{ color: colors.amber }}>
             ACTIVATION_MAP
           </Typography>
        </Viewport>

      </div>

      {/* SHARED CONTROLS HUD */}
      <div className="control-hud">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {sequences.map(seq => (
               <Button 
                 key={seq} size="small" onClick={() => setSequence(seq)}
                 className={`sequence-btn ${sequence === seq ? 'active' : 'inactive'}`}
               >
                 {seq}
               </Button>
            ))}
          </Box>
          <Typography variant="caption" sx={{ color: colors.muted, fontFamily: '"JetBrains Mono"' }}>
            SLICE INDEX: {slice}/{maxSlices}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, width: '100%', px: 4 }}>
          <Typography variant="caption" sx={{ color: colors.muted, minWidth: '40px' }}>SLICE</Typography>
          <Slider 
            value={slice} onChange={(_, v) => setSlice(v)} min={1} max={maxSlices} 
            sx={{ color: colors.cyan, height: 4, '& .MuiSlider-thumb': { width: 12, height: 12, boxShadow: `0 0 10px ${colors.cyan}` } }} 
          />
        </Box>
        
        {/* PLANE SELECTOR */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 1 }}>
            {['axial', 'sagittal', 'coronal'].map((p) => (
              <Button
                key={p}
                size="small"
                onClick={() => setViewPlane(p)}
                className={`sequence-btn ${viewPlane === p ? 'active' : 'inactive'}`}
                sx={{ px: 3, fontSize: '0.7rem' }}
              >
                {p.toUpperCase()}
              </Button>
            ))}
        </Box>
      </div>
    </Box>
  );
};

// 3. METRICS CARD
const MetricCard = ({ label, value, unit, color }) => (
  <div className="metric-card-console">
    <Typography variant="caption" className="metric-label-text">{label}</Typography>
    <Typography variant="h3" className="metric-value-text" style={{ color: color }}>{value}</Typography>
    <Typography variant="caption" className="metric-unit-text" style={{ color: color }}>{unit}</Typography>
  </div>
);

// --- MAIN LAYOUT ---
const MRIAnalysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [model, setModel] = useState('Brain');
  const [slice, setSlice] = useState(75);
  const [sequence, setSequence] = useState('T1ce');
  const [loading, setLoading] = useState(false);
  const [patientId, setPatientId] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [viewPlane, setViewPlane] = useState('axial'); // 'axial', 'sagittal', 'coronal'
  const [metrics, setMetrics] = useState([
    { label: 'Tumor Volume', value: '---', unit: 'cm³', color: colors.cyan },
    { label: 'Edema Volume', value: '---', unit: 'cm³', color: colors.amber },
    { label: 'Tumor Location', value: '---', unit: 'LOBE', color: colors.text },
    { label: 'Confidence', value: '---', unit: 'ACCURACY', color: colors.teal },
  ]);

  // Reset slice when plane changes
  useEffect(() => {
      const mid = viewPlane === 'axial' ? 75 : 120;
      setSlice(mid);
  }, [viewPlane]);

  const [shapeData, setShapeData] = useState({
    labels: ['Sphericity', 'Compactness', 'Elongation', 'Flatness', 'Spiculation'],
    datasets: [{
      label: 'Shape Metrics',
      data: [0, 0, 0, 0, 0],
      backgroundColor: 'rgba(52, 152, 219, 0.2)',
      borderColor: '#3498db',
      borderWidth: 2,
    }],
  });

  const [textureData, setTextureData] = useState({
    labels: ['Contrast', 'Correlation', 'Energy', 'Homogeneity'],
    datasets: [{
      label: 'Texture Values',
      data: [0, 0, 0, 0],
      backgroundColor: ['#3498db', '#1abc9c', '#9b59b6', '#34495e'],
    }],
  });

  const [intensityData, setIntensityData] = useState({
    labels: ['Min', 'Max', 'Mean', 'Median', 'Std Dev', 'Skewness', 'Kurtosis'],
    datasets: [{
      label: 'Intensity Statistics',
      data: [0, 0, 0, 0, 0, 0, 0],
      borderColor: '#8e44ad',
      backgroundColor: 'rgba(142, 68, 173, 0.1)',
      fill: true,
      tension: 0.4
    }],
  });

  const [insight, setInsight] = useState("AI analysis pending. Run segmentation to generate insights.");

  // Parse patientId from URL and fetch data
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get('patientId');
    if (pid) {
        setPatientId(pid);
        fetchPatientData(pid);
        fetchLatestAnalysis(pid);
    } else {
        // Fallback to localStorage if no patientId (legacy support)
        const savedType = localStorage.getItem('selectedCancerType');
        if (savedType) setModel(savedType);
    }
  }, [location.search]);

  const fetchPatientData = async (id) => {
      try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const res = await axios.get(`http://localhost:8000/api/patients/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });

          if (res.data.success) {
              const type = res.data.data.cancerType;
              if (type) setModel(type);
          }
      } catch (err) {
          console.error("Failed to fetch patient data:", err);
      }
  };

  const fetchLatestAnalysis = async (id) => {
      try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const res = await axios.get(`http://localhost:8000/api/analyses/patient/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });

          if (res.data.success && res.data.data.length > 0) {
              const latest = res.data.data[0];
              setAnalysisId(latest.id);
              updateMetricsFromData(latest.data);
          }
      } catch (err) {
          console.error("Failed to fetch analysis history:", err);
      }
  };

  const updateMetricsFromData = (data) => {
      if (!data) return;
      
      if (data.volumetricAnalysis) {
        setMetrics([
            { label: 'Tumor Volume', value: data.volumetricAnalysis.tumorVolume || '0', unit: 'cm³', color: colors.cyan },
            { label: 'Edema Volume', value: data.volumetricAnalysis.edemaVolume || '0', unit: 'cm³', color: colors.amber },
            { label: 'Tumor Location', value: data.tumorLocation || 'Unknown', unit: 'REGION', color: colors.text },
            { label: 'Confidence', value: (data.segmentationConfidence || 0) + '%', unit: 'ACCURACY', color: colors.teal },
        ]);
        
        // Generate insight if present, otherwise fallback logic
        if (data.aiInsight) {
            setInsight(data.aiInsight);
        } else {
            // Simple frontend fallback
            const vol = parseFloat(data.volumetricAnalysis.tumorVolume);
            const loc = data.tumorLocation;
            setInsight(`AI has detected a ${vol > 30 ? 'significant' : 'moderate'} mass in the ${loc}, consistent with identified pathology.`);
        }
      }

      if (data.shapeFeatures) {
          setShapeData(prev => ({
              ...prev,
              datasets: [{ ...prev.datasets[0], data: Object.values(data.shapeFeatures) }]
          }));
      }

      if (data.textureFeatures) {
          setTextureData(prev => ({
              ...prev,
              datasets: [{ ...prev.datasets[0], data: Object.values(data.textureFeatures) }]
          }));
      }

      if (data.intensityStats) {
          setIntensityData(prev => ({
              ...prev,
              datasets: [{ ...prev.datasets[0], data: Object.values(data.intensityStats) }]
          }));
      }
  };

  const handleRunAnalysis = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Authentication token missing. Please login.");
            navigate('/login');
            return;
        }

        // 1. Create Analysis Record
        const createRes = await axios.post('http://localhost:8000/api/analyses', {
            patientId: patientId, // Link analysis to patient
            analysisType: 'mri',
            status: 'pending',
            notes: `MRI Segmentation for ${model} cancer`,
            data: { model: model, sequence: sequence, slice: slice }
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!createRes.data.success) throw new Error("Failed to create analysis record");
        
        const analysisId = createRes.data.data.id;
        setAnalysisId(analysisId);
        console.log("Analysis created:", analysisId);

        // 2. Trigger Segmentation Process
        const processRes = await axios.post(`http://localhost:8000/api/analyses/${analysisId}/process`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (processRes.data.success) {
             console.log("Segmentation result:", processRes.data);
             updateMetricsFromData(processRes.data.data.data);
             alert("Segmentation Completed Successfully!");
        }

    } catch (err) {
        console.error(err);
        alert("Error running analysis: " + (err.response?.data?.message || err.message));
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="mri-analysis-root">
      <div className="fluid-container">

        {/* HEADER & MODEL SELECTOR */}
        <div className="console-header">
          <Typography variant="h4" sx={{ fontFamily: '"Rajdhani"', fontWeight: 700, color: '#fff', mb: 2 }}>
            MRI SEGMENTATION & RADIOMICS
          </Typography>
          <div className="model-selector" style={{ pointerEvents: 'none' }}>
            <Button
              className="model-btn active"
              sx={{ minWidth: '150px' }}
            >
              {model.toUpperCase()} MODEL ACTIVE
            </Button>
          </div>
          
          <Button 
            variant="contained" 
            startIcon={<PlayArrowIcon />}
            className="run-analysis-btn"
            onClick={handleRunAnalysis}
            disabled={loading}
          >
            {loading ? 'PROCESSING...' : 'RUN NEW ANALYSIS'}
          </Button>
        </div>

        {/* MAIN GRID */}
        <Grid container spacing={4} sx={{ width: '95vw', minWidth: 0 }}>
          <Grid item xs={12} lg={7}>
             <MRIViewer 
                analysisId={analysisId}
                viewPlane={viewPlane}
                setViewPlane={setViewPlane}
                loading={loading}
                sequence={sequence} setSequence={setSequence} 
                slice={slice} setSlice={setSlice} 
             />
          </Grid>

          <Grid item xs={12} lg={5}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="overline" sx={{ color: colors.teal, letterSpacing: '2px', fontWeight: 700, display: 'block', fontSize: '1.2rem', pt: '160px', pb: '10px' }}>
                  QUANTITATIVE METRICS
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1, gap: '1rem', justifyContent: 'center', width: '95vw' }}>
                   {metrics.map((m) => (
                     <Grid item xs={6} key={m.label}>
                       <MetricCard {...m} />
                     </Grid>
                   ))}
                </Grid>
              </Box>

              {/* Block 2: Shape Features (Dedicated) */}
              <div className="radiomics-block">
                <Typography variant="overline" className="radiomics-header" sx={{ fontSize: '1.2rem', pb: 4 }}>
                  SHAPE CHARACTERISTICS (RADAR)
                </Typography>
                <div style={{ height: '300px' }}>
                   <Radar data={shapeData} options={{ maintainAspectRatio: false, scales: { r: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { display: false } } } }} />
                </div>
              </div>

              {/* Block 3: Texture & Intensity */}
              <div className="radiomics-block">
                <Typography variant="overline" className="radiomics-header" sx={{ fontSize: '1.2rem', pb: 4 }}>
                  TEXTURE & INTENSITY ANALYTICS
                </Typography>
                
                <Grid container spacing={3} sx={{ justifyContent: 'center', gap: '5rem' }}>
                   <Grid item xs={12} md={6} sx={{ width: '40%' }}>
                     <div style={{ height: '400px' }}>
                        <Typography variant="caption" className="chart-label" sx={{ fontSize: '1rem' }}>TEXTURE (GLCM)</Typography>
                        <Bar data={textureData} options={{ maintainAspectRatio: false, scales: { y: { grid: { color: 'rgba(255,255,255,0.1)' } }, x: { grid: { display: false } } } }} />
                     </div>
                   </Grid>
                   <Grid item xs={12} md={6} sx={{ width: '40%' }}>
                     <div style={{ height: '400px' }}>
                        <Typography variant="caption" className="chart-label" sx={{ fontSize: '1rem' }}>INTENSITY HISTOGRAM</Typography>
                        <Line data={intensityData} options={{ maintainAspectRatio: false, scales: { y: { grid: { color: 'rgba(255,255,255,0.1)' } }, x: { grid: { display: false } } } }} />
                     </div>
                   </Grid>
                </Grid>

                <div className="ai-insight-box">
                  <AutoGraphIcon sx={{ color: colors.teal }} />
                  <Typography variant="caption" className="ai-insight-text">
                    {insight}
                  </Typography>
                </div>
              </div>
            </Box>
          </Grid>
        </Grid>

        {/* NAVIGATION FOOTER */}
        <div className="nav-footer">
           <Button 
             onClick={() => {
                 if (patientId) navigate(`/tumor-3d?patientId=${patientId}`);
                 else alert("No patient loaded.");
             }}
             startIcon={<ViewInArIcon />} 
             className="nav-btn-secondary"
           >
             VIEW IN 3D
           </Button>
           <Button 
             onClick={() => navigate('/explainability')}
             startIcon={<GradientIcon />} 
             className="nav-btn-secondary"
           >
             VIEW EXPLAINABILITY
           </Button>
           <Button 
             variant="outlined" 
             onClick={() => {
                 if (patientId) navigate(`/genomic-analysis?patientId=${patientId}`);
                 else alert("No patient loaded.");
             }}
             endIcon={<ArrowForwardIcon />}
             className="nav-btn-outlined"
           >
             PROCEED TO GENOMICS
           </Button>
        </div>

      </div>
    </div>
  );
};

export default MRIAnalysis;