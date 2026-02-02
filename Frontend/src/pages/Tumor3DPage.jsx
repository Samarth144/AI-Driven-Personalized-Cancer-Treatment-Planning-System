import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Typography, Button, IconButton, Switch, Tooltip, Chip, Slider
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ReplayIcon from '@mui/icons-material/Replay';
import VREyeIcon from '@mui/icons-material/Visibility';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DownloadIcon from '@mui/icons-material/Download';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import LayersIcon from '@mui/icons-material/Layers';
import BiotechIcon from '@mui/icons-material/Biotech';
import OpacityIcon from '@mui/icons-material/Opacity';
import './Tumor3DPage.css';

// --- THEME CONSTANTS ---
const colors = {
  bg: '#0B1221',
  teal: '#059789',
  cyan: '#00F0FF',
  amber: '#F59E0B',
  red: '#EF4444',
  text: '#F8FAFC',
  muted: '#64748B',
  border: 'rgba(5, 151, 137, 0.3)'
};

// --- SUB-COMPONENTS ---

const ControlToggle = ({ label, active, onToggle }) => (
  <Box sx={{ 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2,
    p: 1.5, borderRadius: '4px', bgcolor: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.05)`
  }}>
    <Typography variant="body2" sx={{ fontFamily: '"Space Grotesk"', color: '#fff' }}>{label}</Typography>
    <Switch 
      checked={active} 
      onChange={onToggle}
      sx={{
        '& .MuiSwitch-switchBase.Mui-checked': { color: colors.cyan },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: colors.cyan },
      }}
    />
  </Box>
);

const MetricBox = ({ label, value, unit, highlight = false }) => (
  <Box sx={{ 
    p: 2, mb: 2, borderRadius: '4px', 
    bgcolor: highlight ? 'rgba(0, 240, 255, 0.1)' : 'rgba(0,0,0,0.2)',
    border: `1px solid ${highlight ? colors.cyan : 'rgba(255,255,255,0.1)'}`,
    textAlign: 'center'
  }}>
    <Typography variant="h4" sx={{ fontFamily: '"Rajdhani"', fontWeight: 700, color: highlight ? colors.cyan : '#fff' }}>
      {value}
    </Typography>
    <Typography variant="caption" sx={{ color: highlight ? colors.cyan : colors.muted, fontFamily: '"Space Grotesk"', display: 'block' }}>
      {label} {unit && <span style={{ opacity: 0.6 }}>({unit})</span>}
    </Typography>
  </Box>
);

const AlertBox = ({ icon, label, sub }) => (
  <Box className="alert-pulse" sx={{ 
    display: 'flex', gap: 2, p: 2, mb: 3, 
    bgcolor: 'rgba(245, 158, 11, 0.1)', 
    border: `1px solid ${colors.amber}`, 
    borderRadius: '4px',
    alignItems: 'center'
  }}>
    <Box sx={{ color: colors.amber }}>{icon}</Box>
    <Box>
      <Typography variant="subtitle2" sx={{ fontFamily: '"Rajdhani"', fontWeight: 700, color: colors.amber, lineHeight: 1 }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ fontFamily: '"Space Grotesk"', color: '#fff' }}>
        {sub}
      </Typography>
    </Box>
  </Box>
);

const ThreeDViewport = ({ volume, location, analysisId, layers, brainOpacity, setBrainOpacity }) => {
  const viewerRef = React.useRef(null);
  const [isRotating, setIsRotating] = useState(true);

  const updateMaterials = () => {
    if (!viewerRef.current || !viewerRef.current.model) return;
    const model = viewerRef.current.model;
    
    model.materials.forEach((mat) => {
      const name = mat.name.toLowerCase();
      if (name.includes('tumor')) {
        mat.pbrMetallicRoughness.baseColorFactor[3] = layers.tumor ? 1 : 0;
      }
      if (name.includes('brain')) {
        const opacity = layers.brain ? brainOpacity : 0;
        mat.pbrMetallicRoughness.baseColorFactor[3] = opacity;
      }
    });
  };

  useEffect(() => {
    updateMaterials();
  }, [layers, brainOpacity]);

  const handleFullscreen = () => {
    if (viewerRef.current) {
      if (viewerRef.current.requestFullscreen) {
        viewerRef.current.requestFullscreen();
      } else if (viewerRef.current.webkitRequestFullscreen) {
        viewerRef.current.webkitRequestFullscreen();
      } else if (viewerRef.current.msRequestFullscreen) {
        viewerRef.current.msRequestFullscreen();
      }
    }
  };

  const modelUrl = analysisId 
    ? `http://localhost:8000/api/analyses/${analysisId}/model?token=${localStorage.getItem('token')}`
    : `http://localhost:8000/api/analyses/test/model?modelName=tumor_with_brain_new1.glb&token=${localStorage.getItem('token')}`;

  return (
    <Box className="viewport-3d" sx={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div className="viewport-grid-bg"></div>

      <model-viewer
        ref={viewerRef}
        src={modelUrl}
        camera-controls
        auto-rotate={isRotating}
        ar
        ar-modes="scene-viewer webxr quick-look"
        exposure="1.0"
        shadow-intensity="1"
        onLoad={updateMaterials}
        style={{ width: '100%', flex: 1, background: 'transparent' }}
      >
      </model-viewer>

      {/* BRAIN OPACITY SLIDER OVERLAY */}
      <Box sx={{ 
        position: 'absolute', bottom: 80, right: 30, 
        bgcolor: 'rgba(22, 32, 50, 0.8)', p: 2, borderRadius: '8px',
        border: `1px solid ${colors.border}`, width: '40px', height: '200px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1
      }}>
        <Tooltip title="Brain Opacity" placement="left">
          <OpacityIcon sx={{ color: colors.cyan, fontSize: 20 }} />
        </Tooltip>
        <Slider
          orientation="vertical"
          value={brainOpacity}
          min={0}
          max={1}
          step={0.01}
          onChange={(_, v) => setBrainOpacity(v)}
          sx={{
            color: colors.cyan,
            '& .MuiSlider-thumb': {
              width: 12, height: 12,
              '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 8px ${colors.cyan}33` },
            },
            '& .MuiSlider-track': { border: 'none' },
            '& .MuiSlider-rail': { opacity: 0.3, backgroundColor: colors.muted },
          }}
        />
      </Box>

      {/* HUD OVERLAY: LOCATION LABEL */}
      <Box sx={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none' }}>
        <Chip 
          icon={<BiotechIcon style={{ color: colors.cyan }} />} 
          label={location || "LOADING MODEL..."} 
          className="hud-chip"
        />
        <Typography variant="caption" sx={{ display: 'block', color: colors.muted, mt: 0.5, fontFamily: '"JetBrains Mono"' }}>
          VOL: {volume || "---"} cm³
        </Typography>
      </Box>

      {/* BOTTOM TOOLBAR */}
      <Box sx={{ 
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        bgcolor: 'rgba(22, 32, 50, 0.9)', border: `1px solid ${colors.border}`, borderRadius: '50px',
        p: 1, display: 'flex', gap: 1
      }}>
        <IconButton sx={{ color: '#fff' }} onClick={() => viewerRef.current.cameraOrbit = '0deg 75deg 105%'}>
          <ReplayIcon />
        </IconButton>
        <IconButton sx={{ color: '#fff' }} onClick={handleFullscreen}>
          <FullscreenIcon />
        </IconButton>
        <IconButton sx={{ color: '#fff' }}><SearchIcon /></IconButton>
        <IconButton sx={{ color: '#fff' }} onClick={() => setIsRotating(!isRotating)}>
          {isRotating ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <IconButton sx={{ color: '#fff' }}><CameraAltIcon /></IconButton>
      </Box>
    </Box>
  );
};

// --- MAIN LAYOUT ---
const Tumor3DPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [layers, setLayers] = useState({ tumor: true, edema: true, brain: true, landmarks: false, wireframe: true });
  const [brainOpacity, setBrainOpacity] = useState(0.25);
  const [patientData, setPatientData] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [analysisMetrics, setAnalysisMetrics] = useState({ 
    volume: null, 
    edema: null, 
    necrosis: null, 
    enhancing: null, 
    location: 'SCANNING...', 
    sphericity: null 
  });

  const toggleLayer = (key) => setLayers({ ...layers, [key]: !layers[key] });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get('patientId');
    if (pid && pid !== 'null' && pid !== 'undefined') {
        fetchPatientAndAnalysis(pid);
    }
  }, [location.search]);

  const fetchPatientAndAnalysis = async (pid) => {
      try {
          const token = localStorage.getItem('token');
          const [pRes, aRes] = await Promise.all([
              axios.get(`http://localhost:8000/api/patients/${pid}`, { headers: { Authorization: `Bearer ${token}` } }),
              axios.get(`http://localhost:8000/api/analyses/patient/${pid}`, { headers: { Authorization: `Bearer ${token}` } })
          ]);

          if (pRes.data.success) setPatientData(pRes.data.data);
          if (aRes.data.success && aRes.data.data.length > 0) {
              const latest = aRes.data.data[0];
              setAnalysisId(latest.id);
              const data = latest.data;
              
              const newMetrics = {};
              if (data.volumetricAnalysis?.tumorVolume) newMetrics.volume = data.volumetricAnalysis.tumorVolume;
              if (data.volumetricAnalysis?.edemaVolume) newMetrics.edema = data.volumetricAnalysis.edemaVolume;
              if (data.volumetricAnalysis?.necrosisVolume) newMetrics.necrosis = data.volumetricAnalysis.necrosisVolume;
              if (data.volumetricAnalysis?.enhancingVolume) newMetrics.enhancing = data.volumetricAnalysis.enhancingVolume;
              
              if (data.tumorLocation) newMetrics.location = data.tumorLocation;
              if (data.shapeFeatures?.sphericity) newMetrics.sphericity = data.shapeFeatures.sphericity;
              
              setAnalysisMetrics(prev => ({ ...prev, ...newMetrics }));
          }
      } catch (err) {
          console.error("Error fetching data for 3D view:", err);
      }
  };

  return (
    <Box className="tumor-3d-root">
      
      {/* 1. HEADER */}
      <Box sx={{ px: 4, py: 2, borderBottom: `1px solid rgba(255,255,255,0.05)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontFamily: '"Rajdhani"', fontWeight: 700, color: '#fff' }}>
            SURGICAL DIGITAL TWIN
          </Typography>
          <Typography variant="caption" sx={{ color: colors.muted, fontFamily: '"Space Grotesk"' }}>
            {patientData ? `CASE: ${patientData.firstName} ${patientData.lastName} | MRN: ${patientData.mrn}` : 'Interactive 3D Surgical Planning Station'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
           <Button variant="outlined" startIcon={<DownloadIcon />} sx={{ color: colors.muted, borderColor: 'rgba(255,255,255,0.1)' }}>
             EXPORT MESH (.GLB)
           </Button>
        </Box>
      </Box>

      {/* 2. MAIN COCKPIT AREA */}
      <Box className="cockpit-container">
        
        {/* LEFT PANEL */}
        <Box sx={{ width: '300px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box className="glass-panel">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <LayersIcon sx={{ color: colors.teal }} />
              <Typography variant="subtitle2" sx={{ fontFamily: '"Rajdhani"', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>
                DISPLAY LAYERS
              </Typography>
            </Box>
            <ControlToggle label="Show Tumor" active={layers.tumor} onToggle={() => toggleLayer('tumor')} />
            <ControlToggle label="Show Edema" active={layers.edema} onToggle={() => toggleLayer('edema')} />
            <ControlToggle label="Show Brain" active={layers.brain} onToggle={() => toggleLayer('brain')} />
            <ControlToggle label="Show Landmarks" active={layers.landmarks} onToggle={() => toggleLayer('landmarks')} />
            <ControlToggle label="Wireframe Mode" active={layers.wireframe} onToggle={() => toggleLayer('wireframe')} />
          </Box>

          <Box className="glass-panel" sx={{ flex: 1 }}>
             <Typography variant="subtitle2" sx={{ fontFamily: '"Rajdhani"', fontWeight: 700, color: '#fff', mb: 2 }}>
                ANATOMICAL STRUCTURES
              </Typography>
              {['Frontal Lobe', 'Temporal Lobe', 'Parietal Lobe', 'Motor Cortex', 'Tumor Mass', 'Vascular Bundle'].map(item => (
                <Chip 
                  key={item} label={item} 
                  sx={{ 
                    m: 0.5, bgcolor: 'rgba(255,255,255,0.05)', color: colors.muted, 
                    border: '1px solid rgba(255,255,255,0.1)', fontFamily: '"Space Grotesk"',
                    fontSize: '0.7rem'
                  }} 
                />
              ))}
          </Box>
        </Box>

        {/* CENTER PANEL */}
        <ThreeDViewport 
            volume={analysisMetrics.volume} 
            location={analysisMetrics.location} 
            analysisId={analysisId} 
            layers={layers}
            brainOpacity={brainOpacity}
            setBrainOpacity={setBrainOpacity}
        />

        {/* RIGHT PANEL */}
        <Box sx={{ width: '300px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box className="glass-panel" sx={{ flex: 1 }}>
             <Typography variant="overline" sx={{ color: colors.cyan, letterSpacing: '2px', fontWeight: 700, display: 'block', mb: 2 }}>
                VOLUMETRIC DATA
             </Typography>
             
             {analysisMetrics.volume && (
                <MetricBox label="Tumor Volume" value={analysisMetrics.volume} unit="cm³" highlight />
             )}

             {analysisMetrics.edema && (
                <MetricBox label="Edema Volume" value={analysisMetrics.edema} unit="cm³" highlight />
             )}

             {analysisMetrics.enhancing && (
                <MetricBox label="Active Core" value={analysisMetrics.enhancing} unit="cm³" highlight />
             )}

             {analysisMetrics.necrosis && (
                <MetricBox label="Necrosis" value={analysisMetrics.necrosis} unit="cm³" highlight />
             )}

             {analysisMetrics.sphericity && (
                <MetricBox label="Sphericity Index" value={analysisMetrics.sphericity} highlight />
             )}
          </Box>
        </Box>
      </Box>

      {/* 3. FOOTER NAVIGATION */}
      <Box sx={{ 
        p: 2, borderTop: `1px solid rgba(255,255,255,0.05)`, 
        display: 'flex', justifyContent: 'space-between', bgcolor: colors.bg 
      }}>
        <Button 
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon />} 
            sx={{ color: colors.muted, fontFamily: '"Space Grotesk"', '&:hover': { color: '#fff' } }}
        >
          Return to Analysis
        </Button>
        <Button 
          onClick={() => navigate(`/treatment-plan?patientId=${new URLSearchParams(location.search).get('patientId')}`)}
          endIcon={<ArrowForwardIcon />} 
          variant="contained"
          sx={{ 
            bgcolor: colors.teal, color: '#fff', fontFamily: '"Rajdhani"', fontWeight: 700, px: 4,
            '&:hover': { bgcolor: colors.cyan, color: '#000' }
          }}
        >
          VIEW TREATMENT PATHWAY
        </Button>
      </Box>

    </Box>
  );
};

export default Tumor3DPage;