import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Grid, Typography, Button, IconButton, Chip, TablePagination, CircularProgress 
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// --- THEME CONSTANTS ---
const colors = {
  bg: '#0B1221',
  glass: 'rgba(22, 32, 50, 0.8)',
  glassHover: 'rgba(22, 32, 50, 1)',
  teal: '#059789',
  cyan: '#00F0FF',
  amber: '#F59E0B',
  green: '#10B981',
  text: '#F8FAFC',
  muted: '#64748B',
  border: 'rgba(5, 151, 137, 0.3)'
};

// --- COMPONENTS ---

const StatItem = ({ label, value, unit }) => (
  <Box sx={{ px: 3, borderRight: `1px solid ${colors.border}`, '&:last-child': { borderRight: 'none' } }}>
    <Typography variant="h4" sx={{ fontFamily: '"Rajdhani"', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
      {value}
    </Typography>
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
      <Typography variant="caption" sx={{ color: colors.cyan, fontFamily: '"JetBrains Mono"', fontWeight: 700 }}>
        {unit}
      </Typography>
      <Typography variant="caption" sx={{ color: colors.muted, fontFamily: '"Space Grotesk"' }}>
        {label}
      </Typography>
    </Box>
  </Box>
);

const PatientRow = ({ p, index, onClick }) => {
  // Database models might use status or we can derive it from pathologyAnalysis
  const status = p.pathologyAnalysis ? 'Analyzed' : 'Intake';
  const isComplete = status === 'Analyzed';
  const statusColor = isComplete ? colors.green : colors.amber;
  
  const formattedDate = p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }) : 'N/A';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }} 
      transition={{ delay: index * 0.1 }}
    >
      <Box 
        onClick={onClick}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2.5, 
          mb: 1.5,
          bgcolor: colors.glass, 
          borderRadius: '4px',
          borderLeft: `4px solid ${statusColor}`, // Status Indicator Bar
          transition: 'all 0.2s',
          cursor: 'pointer',
          '&:hover': { 
            bgcolor: colors.glassHover, 
            transform: 'translateX(5px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }
        }}
      >
        
        {/* ID & Identity */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '25%' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#fff', fontFamily: '"Space Grotesk"', fontWeight: 700 }}>
              {p.firstName} {p.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.muted, fontFamily: '"JetBrains Mono"' }}>
              MRN: {p.mrn}
            </Typography>
          </Box>
        </Box>

        {/* Diagnosis */}
        <Box sx={{ width: '30%' }}>
          <Typography variant="body2" sx={{ color: isComplete ? colors.cyan : colors.muted, fontFamily: '"Space Grotesk"' }}>
            {p.diagnosis 
              ? (p.diagnosis.toLowerCase().includes('cancer') ? p.diagnosis : `${p.diagnosis} Cancer`) 
              : 'Pending Analysis'}
          </Typography>
        </Box>

        {/* Date */}
        <Box sx={{ width: '20%' }}>
          <Typography variant="caption" sx={{ color: '#fff', fontFamily: '"Space Grotesk"' }}>
            {formattedDate}
          </Typography>
        </Box>

        {/* Status */}
        <Box sx={{ width: '15%' }}>
          <Chip 
            label={status.toUpperCase()} 
            size="small" 
            sx={{ 
              bgcolor: `${statusColor}20`, 
              color: statusColor, 
              fontFamily: '"Rajdhani"', 
              fontWeight: 700,
              border: `1px solid ${statusColor}40`,
              letterSpacing: '1px'
            }} 
          />
        </Box>

        {/* Action */}
        <Box sx={{ width: '10%', textAlign: 'right' }}>
           <IconButton size="small" sx={{ color: colors.teal }}>
             <ArrowForwardIosIcon fontSize="inherit" />
           </IconButton>
        </Box>

      </Box>
    </motion.div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [dbStats, setDbStats] = useState([]);
  const [dbPatients, setDbPatients] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Fetch Stats
        const statsRes = await axios.get('http://localhost:8000/api/dashboard/stats', config);
        if (statsRes.data.success) {
          const s = statsRes.data.data.overview;
          setDbStats([
            { label: 'Total Patients', value: String(s.totalPatients).padStart(2, '0'), unit: 'CASES' },
            { label: 'Active Analyses', value: String(s.totalAnalyses).padStart(2, '0'), unit: 'RUNNING' },
            { label: 'Treatment Plans', value: String(s.activeTreatments).padStart(2, '0'), unit: 'GENERATED' },
            { label: 'Avg Confidence', value: '92%', unit: 'AI SCORE' },
          ]);
        }

        // 2. Fetch Recent Patients
        const patientsRes = await axios.get('http://localhost:8000/api/dashboard/recent-patients?limit=50', config);
        if (patientsRes.data.success) {
          setDbPatients(patientsRes.data.data);
        }
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedPatients = dbPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, py: 6, px: { xs: 2, md: 6 } }}>
      <Container maxWidth="xl">
        
        {/* --- HEADER SECTION --- */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" sx={{ fontFamily: '"Rajdhani"', fontWeight: 700, color: '#fff' }}>
            CLINICAL DASHBOARD
          </Typography>
          <Typography variant="body1" sx={{ color: colors.muted, fontFamily: '"Space Grotesk"', mt: 1 }}>
            Manage patient cohorts and view AI-driven analysis results.
          </Typography>
        </Box>

        {/* --- STATS RAIL --- */}
        <Box sx={{ 
          bgcolor: 'rgba(22, 32, 50, 0.6)', 
          border: `1px solid ${colors.border}`, 
          borderRadius: '12px', 
          p: 3, 
          mb: 6,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          backdropFilter: 'blur(10px)',
          minHeight: '100px'
        }}>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', px: 3, gap: 2 }}>
                <CircularProgress size={20} sx={{ color: colors.teal }} />
                <Typography variant="caption" sx={{ color: colors.muted }}>Synchronizing Clinical Metrics...</Typography>
            </Box>
          ) : dbStats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </Box>

        {/* --- PATIENT LIST HEADER --- */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontFamily: '"Rajdhani"', fontWeight: 700, color: '#fff' }}>
            PATIENT CASES
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton sx={{ color: colors.muted, border: '1px solid rgba(255,255,255,0.1)' }}>
              <SearchIcon />
            </IconButton>
            <IconButton sx={{ color: colors.muted, border: '1px solid rgba(255,255,255,0.1)' }}>
              <FilterListIcon />
            </IconButton>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/patients')}
              sx={{ 
                bgcolor: colors.teal, 
                color: '#fff', 
                fontFamily: '"Space Grotesk"', 
                fontWeight: 700,
                '&:hover': { bgcolor: colors.cyan, color: '#000' } 
              }}
            >
              ADD NEW PATIENT
            </Button>
          </Box>
        </Box>

        {/* --- TABLE HEADERS (Visual Only) --- */}
        <Box sx={{ display: 'flex', px: 3, mb: 1 }}>
          <Typography variant="caption" sx={{ width: '25%', color: colors.muted }}>PATIENT IDENTITY</Typography>
          <Typography variant="caption" sx={{ width: '30%', color: colors.muted }}>PRIMARY DIAGNOSIS</Typography>
          <Typography variant="caption" sx={{ width: '20%', color: colors.muted }}>DATE ADDED</Typography>
          <Typography variant="caption" sx={{ width: '15%', color: colors.muted }}>STATUS</Typography>
          <Typography variant="caption" sx={{ width: '10%', textAlign: 'right', color: colors.muted }}>ACTION</Typography>
        </Box>

        {/* --- PATIENT ROWS --- */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minHeight: '200px' }}>
          {loading ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: colors.teal }} />
             </Box>
          ) : displayedPatients.length === 0 ? (
             <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <Typography sx={{ color: colors.muted }}>No clinical records found in database.</Typography>
             </Box>
          ) : (
            displayedPatients.map((p, index) => (
              <PatientRow 
                key={p.id} 
                p={p} 
                index={index} 
                onClick={() => navigate(`/patient-profile?patientId=${p.id}`)} 
              />
            ))
          )}
        </Box>

        {/* --- PAGINATION --- */}
        <TablePagination
          component="div"
          count={dbPatients.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            color: colors.muted,
            borderTop: `1px solid ${colors.border}`,
            '.MuiTablePagination-select': {
              color: colors.text,
              fontFamily: '"Space Grotesk"',
            },
            '.MuiTablePagination-selectIcon': {
              color: colors.teal,
            },
            '.MuiTablePagination-displayedRows': {
              fontFamily: '"Space Grotesk"',
            },
            '.MuiTablePagination-actions': {
              color: colors.teal,
            },
            '.MuiIconButton-root': {
              color: colors.teal,
              '&.Mui-disabled': {
                color: 'rgba(255, 255, 255, 0.3)',
              }
            }
          }}
        />

      </Container>
    </Box>
  );
};

export default Dashboard;