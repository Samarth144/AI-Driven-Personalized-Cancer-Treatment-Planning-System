import React, { useState } from 'react';
import { 
  Box, Container, Grid, Typography, Button, IconButton, Chip, TablePagination 
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'; // New Patient
import ScienceIcon from '@mui/icons-material/Science'; // MRI
import BiotechIcon from '@mui/icons-material/Biotech'; // Genomic
import MedicationIcon from '@mui/icons-material/Medication'; // Treatment
import ViewInArIcon from '@mui/icons-material/ViewInAr'; // 3D

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

// --- DATA ---
const stats = [
  { label: 'Total Patients', value: '06', unit: 'CASES' },
  { label: 'Active Analyses', value: '04', unit: 'RUNNING' },
  { label: 'Treatment Plans', value: '03', unit: 'GENERATED' },
  { label: 'Avg Confidence', value: '87%', unit: 'AI SCORE' },
];

const quickActions = [
  { label: 'New Patient', icon: <PersonAddAlt1Icon />, color: colors.cyan, path: '/patients' },
  { label: 'MRI Analysis', icon: <ScienceIcon />, color: colors.teal, path: '/mri-analysis' },
  { label: 'Genomic Data', icon: <BiotechIcon />, color: '#8B5CF6', path: '/genomic-analysis' }, // Purple for DNA
  { label: 'Treatment Plans', icon: <MedicationIcon />, color: '#EC4899', path: '/treatment-plan' }, // Pink for Meds
  { label: '3D Visuals', icon: <ViewInArIcon />, color: colors.amber, path: '/tumor-3d' },
];

const patients = [
  { id: '17680637', name: 'John Doe', diagnosis: 'Glioblastoma Multiforme', date: 'Jan 15, 2024', status: 'Completed' },
  { id: '17680637', name: 'Jane Smith', diagnosis: 'Anaplastic Astrocytoma', date: 'Feb 20, 2024', status: 'In Progress' },
  { id: '17680637', name: 'Robert Johnson', diagnosis: 'Oligodendroglioma', date: 'Mar 10, 2024', status: 'Completed' },
  { id: '17680681', name: 'John Doe', diagnosis: 'Pending Diagnosis', date: 'Jan 10, 2026', status: 'In Progress' },
  { id: '17680689', name: 'Yash Rajput', diagnosis: 'Pending Diagnosis', date: 'Jan 10, 2026', status: 'In Progress' },
  { id: '17680698', name: 'Yash Rajput', diagnosis: 'Pending Diagnosis', date: 'Jan 11, 2026', status: 'In Progress' },
];

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

const ActionTile = ({ label, icon, color, onClick }) => (
  <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }}>
    <Box 
      onClick={onClick}
      sx={{ 
        p: 2, 
        bgcolor: 'rgba(255,255,255,0.03)', 
        borderRadius: '8px', 
        border: `1px solid rgba(255,255,255,0.05)`,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': { bgcolor: `${color}15`, borderColor: color, boxShadow: `0 0 20px ${color}20` }
      }}
    >
      <Box sx={{ color: color, mb: 1, '& svg': { fontSize: 30 } }}>{icon}</Box>
      <Typography variant="caption" sx={{ color: '#fff', fontFamily: '"Space Grotesk"', fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  </motion.div>
);

const PatientRow = ({ p, index, onClick }) => {
  const isComplete = p.status.toLowerCase() === 'completed';
  const statusColor = isComplete ? colors.green : colors.amber;

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
              {p.name}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.muted, fontFamily: '"JetBrains Mono"' }}>
              ID: {p.id}
            </Typography>
          </Box>
        </Box>

        {/* Diagnosis */}
        <Box sx={{ width: '30%' }}>
          <Typography variant="body2" sx={{ color: isComplete ? colors.cyan : colors.muted, fontFamily: '"Space Grotesk"' }}>
            {p.diagnosis}
          </Typography>
        </Box>

        {/* Date */}
        <Box sx={{ width: '20%' }}>
          <Typography variant="caption" sx={{ color: '#fff', fontFamily: '"Space Grotesk"' }}>
            {p.date}
          </Typography>
        </Box>

        {/* Status */}
        <Box sx={{ width: '15%' }}>
          <Chip 
            label={p.status} 
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedPatients = patients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, py: 6, px: { xs: 2, md: 6 } }}>
      <Container maxWidth="xl">
        
        {/* --- HEADER SECTION --- */}
        <Grid container spacing={4} alignItems="flex-end" sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h3" sx={{ fontFamily: '"Rajdhani"', fontWeight: 700, color: '#fff' }}>
              CLINICAL DASHBOARD
            </Typography>
            <Typography variant="body1" sx={{ color: colors.muted, fontFamily: '"Space Grotesk"', mt: 1 }}>
              Manage patient cohorts and view AI-driven analysis results.
            </Typography>
          </Grid>

          {/* QUICK ACTIONS ROW (Top Right) */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { md: 'flex-end' } }}>
               {quickActions.map((action) => (
                 <ActionTile 
                    key={action.label} 
                    {...action} 
                    onClick={() => navigate(action.path)}
                  />
               ))}
            </Box>
          </Grid>
        </Grid>

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
          backdropFilter: 'blur(10px)'
        }}>
          {stats.map((stat) => (
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {displayedPatients.map((p, index) => (
            <PatientRow key={index} p={p} index={index} onClick={() => navigate('/treatment-plan')} />
          ))}
        </Box>

        {/* --- PAGINATION --- */}
        <TablePagination
          component="div"
          count={patients.length}
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