import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, Container, Typography, Button, IconButton, LinearProgress, Grid, Chip, Divider
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArticleIcon from '@mui/icons-material/Article'; 
import ScienceIcon from '@mui/icons-material/Science'; 
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import Navbar from '../components/Navbar';
import './Histopathology.css';

// --- SUB-COMPONENTS FOR EXTRACTION MATRIX ---

const ReceptorBadge = ({ label, value, full, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <Box sx={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
      p: 2, mb: 1.5, borderRadius: '4px',
      bgcolor: 'rgba(255,255,255,0.02)', 
      border: `1px solid rgba(255,255,255,0.05)`,
      transition: 'all 0.3s',
      '&:hover': { borderColor: '#00F0FF', bgcolor: 'rgba(0, 240, 255, 0.05)' }
    }}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontFamily: '"Rajdhani"', fontWeight: 700, color: '#fff' }}>
            {label}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontFamily: '"Space Grotesk"', fontSize: '0.85rem' }}>
            {full}
          </Typography>
        </Box>
      </Box>
      
      <Chip 
        label={value ? value.toUpperCase() : 'N/A'} 
        icon={<CheckCircleIcon style={{ fontSize: 14 }} />}
        size="small"
        sx={{ 
          bgcolor: value?.toLowerCase() === 'positive' ? `rgba(0, 240, 255, 0.2)` : 'rgba(255,255,255,0.1)', 
          color: value?.toLowerCase() === 'positive' ? '#00F0FF' : '#64748B', 
          border: `1px solid ${value?.toLowerCase() === 'positive' ? '#00F0FF' : 'transparent'}`,
          fontFamily: '"JetBrains Mono"', fontWeight: 700,
          height: '24px'
        }} 
      />
    </Box>
  </motion.div>
);

const ClinicalField = ({ label, value, icon, large = false }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      {icon && React.cloneElement(icon, { sx: { fontSize: 16, color: '#00F0FF' } })}
      <Typography variant="caption" sx={{ color: '#64748B', fontFamily: '"Space Grotesk"', letterSpacing: '1px' }}>
        {label.toUpperCase()}
      </Typography>
    </Box>
    <Typography 
      variant={large ? "h4" : "h6"} 
      sx={{ 
        fontFamily: '"Rajdhani"', 
        fontWeight: 700, 
        color: '#fff',
        lineHeight: 1.1,
        textShadow: large ? `0 0 20px rgba(0, 240, 255, 0.4)` : 'none'
      }}
    >
      {value || '---'}
    </Typography>
  </Box>
);

const ConnectionBadge = ({ patientId }) => (
  <Box sx={{ 
    display: 'inline-flex', alignItems: 'center', gap: '8px', 
    background: 'rgba(0, 240, 255, 0.1)', border: '1px solid #00F0FF', 
    borderRadius: '4px', padding: '4px 12px', marginTop: '8px' 
  }}>
    {patientId ? <LinkIcon sx={{ fontSize: 16, color: '#00F0FF' }} /> : <LinkOffIcon sx={{ fontSize: 16, color: '#64748B' }} />}
    <span style={{ color: '#00F0FF', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.9rem', fontWeight: 600 }}>
      LINKED PATIENT CASE: {patientId ? patientId.split('-')[0].toUpperCase() : 'NULL'}
    </span>
  </Box>
);

function Histopathology() {
  const navigate = useNavigate();
  const location = useLocation();
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [patientId, setPatientId] = useState(null);

  // Auto-load if patientId is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get('patientId');
    if (pid && pid !== 'null' && pid !== 'undefined') {
      setPatientId(pid);
      fetchAndAnalyzeReport(pid);
    }
  }, [location.search]);

  const fetchAndAnalyzeReport = async (pid) => {
      setUploading(true);
      try {
          const token = localStorage.getItem('token');
          const response = await axios.post(`http://localhost:8000/api/patients/${pid}/analyze-pathology`, {}, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
              setAnalysisResult(response.data);
          }
      } catch (error) {
          console.error("Auto-analysis failed:", error);
      } finally {
          setUploading(false);
      }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setAnalysisResult(null); 
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('histopathology_pdf', selectedFile);

    setUploading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/uploads/histopathology', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAnalysisResult(response.data);
      alert('File uploaded and analyzed successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error.response?.data?.message || 'Error uploading file. Please try again.';
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box className="histo-container">
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 6, mt: 4 }}>

        <div className="histo-header">
          <div className="flex justify-between items-center mb-xl histo-header-content">
            <div>
              <h1 className="histo-title">HISTOPATHOLOGY REPORT ANALYSIS</h1>
              <ConnectionBadge patientId={patientId} />
            </div>
          </div>

          {/* PROCESSING STATE */}
          {patientId && !analysisResult && (
              <div className="card-glass mb-xl processing-card">
                  <div className="spinner-icon" />
                  <h3 className="processing-title">ANALYZING LINKED PATIENT RECORD</h3>
                  <p className="processing-text">
                    Retrieving pathology document from secure storage and running NLP extraction...
                  </p>
              </div>
          )}

          {/* MANUAL UPLOAD */}
          {!patientId && !analysisResult && (
              <div className="card-glass mb-xl upload-card">
              <h3 style={{ fontFamily: '"Rajdhani", sans-serif' }}>Upload Histopathology PDF</h3>
              <p className="text-secondary mb-lg">The AI will analyze the report and suggest a treatment plan based on established guidelines.</p>
              <div className="flex items-center gap-md">
                  <input type="file" accept="application/pdf" onChange={handleFileChange} className="file-input" />
                  <button className="btn btn-primary" onClick={handleFileUpload} disabled={uploading || !selectedFile}>
                  {uploading ? 'Uploading & Analyzing...' : 'Upload & Analyze'}
                  </button>
              </div>
              </div>
          )}

          {analysisResult && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <Box className="card-glass mb-xl results-card">
                
                <Box className="results-header">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AutoAwesomeIcon sx={{ color: '#00F0FF' }} />
                    <Typography className="results-title">AI-EXTRACTED STRUCTURED DATA</Typography>
                  </Box>
                </Box>

                <Box sx={{ p: 4 }}>
                  <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
                    {/* LEFT COL: BIOMARKERS */}
                    <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="overline" sx={{ color: '#00F0FF', display: 'block', mb: 2, fontSize: '1.1rem', fontWeight: 700, letterSpacing: '2px' }}>RECEPTOR STATUS</Typography>
                      <ReceptorBadge label="ER" value={analysisResult.extracted_data?.ER} full="Estrogen Receptor" index={0} />
                      <ReceptorBadge label="PR" value={analysisResult.extracted_data?.PR} full="Progesterone Receptor" index={1} />
                      <ReceptorBadge label="HER2" value={analysisResult.extracted_data?.HER2} full="Human Epidermal Growth Factor" index={2} />
                    </Grid>

                    <Grid item xs={false} md={1} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                      <Divider orientation="vertical" sx={{ borderColor: 'rgba(255,255,255,0.1)', height: '100%' }} />
                    </Grid>

                    {/* RIGHT COL: CLINICAL DETAILS */}
                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ mb: 2 }}><Chip label={(analysisResult.extracted_data?.cancer_type || 'UNKNOWN').toUpperCase()} sx={{ bgcolor: '#00F0FF', color: '#000', fontFamily: '"Rajdhani"', fontWeight: 800, fontSize: '1rem', borderRadius: '4px', px: 1.5, height: '32px' }} /></Box>
                        <ClinicalField label="Primary Diagnosis" value={analysisResult.extracted_data?.diagnosis} icon={<LocalHospitalIcon />} large />
                        <Box sx={{ display: 'flex', gap: 6, mt: 1 }}>
                                                  <Box>
                                                    <Typography variant="caption" sx={{ color: '#64748B', fontFamily: '"Space Grotesk"', display: 'block', mb: 1, fontSize: '0.9rem', fontWeight: 700 }}>TNM STAGE</Typography>
                                                    <Box sx={{ width: 75, height: 75, borderRadius: '50%', border: `3px solid #00F0FF`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px rgba(0, 240, 255, 0.5)` }}><Typography variant="h2" sx={{ fontFamily: '"Rajdhani"', fontWeight: 800, color: '#fff', fontSize: '2.2rem' }}>{analysisResult.extracted_data?.stage || '---'}</Typography></Box>
                                                  </Box>
                                                  <Box>
                                                    <Typography variant="caption" sx={{ color: '#64748B', fontFamily: '"Space Grotesk"', display: 'block', mb: 1, fontSize: '0.9rem', fontWeight: 700 }}>GRADE</Typography>
                                                    <Typography variant="h2" sx={{ fontFamily: '"Rajdhani"', fontWeight: 800, color: '#00F0FF', fontSize: '2.8rem', lineHeight: 1 }}>G2</Typography>
                                                  </Box>                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </motion.div>
          )}

          {!analysisResult && !uploading && (
            <div className="report-viewer report-viewer-card">
              <h3 className="mb-lg" style={{ fontFamily: '"Rajdhani", sans-serif', color: '#fff' }}>Pathology Report</h3>
              <div className="report-content">
                <h2 className="report-header" style={{ fontFamily: '"Rajdhani", sans-serif' }}>SURGICAL PATHOLOGY REPORT</h2>
                <hr className="report-divider" />
                <p style={{ fontFamily: '"Space Grotesk", sans-serif' }}><i>Upload a report to begin analysis. The original report content will be replaced by the AI's findings.</i></p>
              </div>
            </div>
          )}

          <div className="flex gap-md justify-center action-buttons">
            <button className="btn btn-back" onClick={() => navigate(`/genomic-analysis?patientId=${patientId}`)}>← Back to Genomic Analysis</button>
            <button className="btn btn-view-plan" onClick={() => navigate(`/treatment-plan?patientId=${patientId}`)} disabled={!analysisResult}>View Full Treatment Plan →</button>
          </div>
        </div>
      </Container>
    </Box>
  );
}

export default Histopathology;