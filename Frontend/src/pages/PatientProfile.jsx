import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Grid, Typography, Button, IconButton, Chip, Divider, CircularProgress, Paper
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ScienceIcon from '@mui/icons-material/Science'; // MRI
import BiotechIcon from '@mui/icons-material/Biotech'; // Genomic
import MedicationIcon from '@mui/icons-material/Medication'; // Treatment
import ViewInArIcon from '@mui/icons-material/ViewInAr'; // 3D
import AssignmentIcon from '@mui/icons-material/Assignment'; // Pathology
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import TimelineIcon from '@mui/icons-material/Timeline';

// --- THEME CONSTANTS ---
const colors = {
  bg: '#0B1221',
  glass: 'rgba(22, 32, 50, 0.8)',
  glassHover: 'rgba(22, 32, 50, 1)',
  teal: '#059789',
  cyan: '#00F0FF',
  amber: '#F59E0B',
  border: 'rgba(5, 151, 137, 0.3)',
  muted: '#64748B'
};

const ProfileActionTile = ({ label, icon, color, onClick }) => (
  <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }} style={{ flex: 1 }}>
    <Box 
      onClick={onClick}
      sx={{ 
        p: 3, 
        bgcolor: 'rgba(255,255,255,0.03)', 
        borderRadius: '12px', 
        border: `1px solid rgba(255,255,255,0.05)`,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        '&:hover': { bgcolor: `${color}15`, borderColor: color, boxShadow: `0 0 25px ${color}20` }
      }}
    >
      <Box sx={{ color: color, '& svg': { fontSize: 32 } }}>{icon}</Box>
      <Typography variant="button" sx={{ color: '#fff', fontFamily: '"Rajdhani"', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '1px' }}>
        {label}
      </Typography>
    </Box>
  </motion.div>
);

const InfoBlock = ({ label, value, icon, color = colors.cyan }) => (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="caption" sx={{ color: colors.muted, display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {label}
            </Typography>
            <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600, fontFamily: '"Space Grotesk"' }}>
                {value || 'Not Specified'}
            </Typography>
        </Box>
    </Box>
);

const PatientProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);

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
                    setPatient(res.data.data);
                }
            } catch (err) {
                console.error("Error loading patient profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPatient();
    }
  }, [location.search]);

  if (loading) return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: colors.teal }} />
    </Box>
  );

  if (!patient) return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 4 }}>
        <Typography variant="h5" color="error">Patient profile not found or access denied.</Typography>
    </Box>
  );

  const pidQuery = `?patientId=${patient.id}`;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, py: 6 }}>
      <Container maxWidth="xl">
        
        {/* HEADER */}
        <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconButton onClick={() => navigate('/dashboard')} sx={{ color: colors.teal, border: '1px solid rgba(5, 151, 137, 0.3)' }}>
                <ArrowBackIcon />
            </IconButton>
            <Box>
                <Typography variant="h3" sx={{ color: '#fff', mb: 0.5 }}>
                    Patient Profile
                </Typography>
                <Typography variant="body2" sx={{ color: colors.muted, fontFamily: '"Space Grotesk"' }}>
                    Clinical file for {patient.firstName} {patient.lastName} | MRN: {patient.mrn}
                </Typography>
            </Box>
        </Box>

        <Grid container spacing={4}>
            
            {/* LEFT COL: CORE DATA */}
            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 4, bgcolor: colors.glass, border: `1px solid ${colors.border}`, borderRadius: '16px' }}>
                    <Typography variant="h6" sx={{ color: colors.cyan, mb: 4, fontFamily: '"Rajdhani"', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1 }}>
                        Personal Information
                    </Typography>
                    
                    <InfoBlock label="Full Name" value={`${patient.firstName} ${patient.lastName}`} icon={<PersonIcon />} />
                    <InfoBlock label="Date of Birth" value={new Date(patient.dateOfBirth).toLocaleDateString()} icon={<CalendarMonthIcon />} />
                    <InfoBlock label="Gender" value={patient.gender.toUpperCase()} icon={<FingerprintIcon />} />
                    <InfoBlock label="Contact" value={patient.phone || patient.email} icon={<LocalHospitalIcon />} />
                    
                    <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.05)' }} />

                    <Typography variant="h6" sx={{ color: colors.teal, mb: 4, fontFamily: '"Rajdhani"', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1 }}>
                        Clinical Baseline
                    </Typography>
                    
                    <InfoBlock label="Primary Diagnosis" value={patient.diagnosis} icon={<AssignmentIcon />} color={colors.amber} />
                    <InfoBlock label="Cancer Type" value={patient.cancerType} icon={<ScienceIcon />} color={colors.teal} />
                    <InfoBlock label="KPS Score" value={`${patient.kps}%`} icon={<TimelineIcon />} color={colors.cyan} />
                    <InfoBlock label="ECOG Status" value={patient.performanceStatus} icon={<MedicationIcon />} color={colors.amber} />
                </Paper>
            </Grid>

            {/* RIGHT COL: QUICK ACTIONS & HISTORY */}
            <Grid item xs={12} md={8}>
                
                {/* QUICK ACTIONS GRID */}
                <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontFamily: '"Rajdhani"', letterSpacing: '1px' }}>
                    MODULE ACCESS
                </Typography>
                <Grid container spacing={2} sx={{ mb: 6 }}>
                    <Grid item xs={6} sm={4} md={2.4}>
                        <ProfileActionTile label="MRI Analysis" icon={<ScienceIcon />} color={colors.teal} onClick={() => navigate(`/mri-analysis${pidQuery}`)} />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2.4}>
                        <ProfileActionTile label="Pathology" icon={<AssignmentIcon />} color={colors.amber} onClick={() => navigate(`/histopathology${pidQuery}`)} />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2.4}>
                        <ProfileActionTile label="Genomics" icon={<BiotechIcon />} color="#8B5CF6" onClick={() => navigate(`/genomic-analysis${pidQuery}`)} />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2.4}>
                        <ProfileActionTile label="Treatment" icon={<MedicationIcon />} color="#EC4899" onClick={() => navigate(`/treatment-plan${pidQuery}`)} />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2.4}>
                        <ProfileActionTile label="3D Scene" icon={<ViewInArIcon />} color={colors.cyan} onClick={() => navigate(`/tumor-3d${pidQuery}`)} />
                    </Grid>
                </Grid>

                {/* CLINICAL SUMMARY CARDS */}
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <Typography variant="overline" sx={{ color: colors.muted }}>Reported Symptoms</Typography>
                            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {patient.symptoms?.map(s => <Chip key={s} label={s} size="small" sx={{ bgcolor: 'rgba(5, 151, 137, 0.1)', color: colors.teal, borderRadius: '4px' }} />) || 'None reported'}
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <Typography variant="overline" sx={{ color: colors.muted }}>Comorbidities</Typography>
                            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {patient.comorbidities?.map(c => <Chip key={c} label={c} size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: colors.amber, borderRadius: '4px' }} />) || 'None reported'}
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <Typography variant="overline" sx={{ color: colors.muted }}>Genomic / Biomarker Status</Typography>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                {Object.entries(patient.genomicProfile || {}).map(([key, val]) => (
                                    <Grid item xs={6} sm={3} key={key}>
                                        <Typography variant="caption" sx={{ color: colors.muted, display: 'block' }}>{key.toUpperCase()}</Typography>
                                        <Typography variant="body2" sx={{ color: colors.cyan, fontWeight: 700 }}>{val}</Typography>
                                    </Grid>
                                ))}
                                {Object.keys(patient.genomicProfile || {}).length === 0 && <Typography sx={{ p: 2, color: colors.muted }}>No genomic profile data synced.</Typography>}
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>

            </Grid>
        </Grid>

      </Container>
    </Box>
  );
};

export default PatientProfile;