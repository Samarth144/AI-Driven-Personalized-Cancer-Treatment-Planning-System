import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, InputAdornment, IconButton, Tooltip 
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import HubIcon from '@mui/icons-material/Hub';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import './Login.css';

const AuthPortal = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'oncologist'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        // Store token and user data
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data));
        navigate('/dashboard');
      } else {
        alert(result.message || 'Authentication Failed');
      }
    } catch (error) {
      console.error('Auth Error:', error);
      alert('Could not connect to the Security Server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-portal-container">
      <div className="auth-background-grid"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="auth-terminal-wrapper"
      >
        <div className="auth-terminal">
          <div className="terminal-header">
            <div className="system-status">
              <div className="status-blinker"></div>
              <Typography variant="caption">SYSTEM: RESONANCE // SECURITY_LVL: 4</Typography>
            </div>
            <Typography variant="h4" className="terminal-title">
              {isLogin ? 'NEURAL LINK' : 'PERSONNEL ONBOARDING'}
            </Typography>
            <Typography variant="caption" className="terminal-subtitle">
              {isLogin ? 'Establish secure connection to Oncology Command' : 'Initialize new medical personnel record'}
            </Typography>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                >
                  <TextField
                    fullWidth
                    label="PERSONNEL NAME"
                    name="name"
                    className="tech-input auth-input"
                    onChange={handleChange}
                    required={!isLogin}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><PersonOutlineIcon /></InputAdornment>,
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <TextField
              fullWidth
              label="ACCESS IDENTIFIER (EMAIL)"
              name="email"
              type="email"
              className="tech-input auth-input"
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start"><AlternateEmailIcon /></InputAdornment>,
              }}
            />

            <TextField
              fullWidth
              label="SECURITY KEY (PASSWORD)"
              name="password"
              type="password"
              className="tech-input auth-input"
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockOutlinedIcon /></InputAdornment>,
              }}
            />

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  key="role-field"
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                >
                  <TextField
                    select
                    fullWidth
                    label="ASSIGNED ROLE"
                    name="role"
                    className="tech-input auth-input"
                    value={formData.role}
                    onChange={handleChange}
                    SelectProps={{ native: true }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><HubIcon /></InputAdornment>,
                    }}
                  >
                    <option value="oncologist">ONCOLOGIST</option>
                    <option value="researcher">RESEARCHER</option>
                    <option value="admin">SYSTEM ADMIN</option>
                  </TextField>
                </motion.div>
              )}
            </AnimatePresence>

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              className="auth-launch-btn"
              disabled={loading}
              startIcon={isLogin ? <FingerprintIcon /> : <AssignmentIndIcon />}
            >
              {loading ? 'INITIALIZING...' : (isLogin ? 'AUTHORIZE ACCESS' : 'CREATE PROTOCOL')}
            </Button>
          </form>

          <div className="auth-footer">
            <Typography variant="caption" className="toggle-text">
              {isLogin ? "No personnel record found?" : "Existing operative detected?"}
            </Typography>
            <Button 
              className="auth-toggle-btn" 
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'INITIALIZE ONBOARDING' : 'BYPASS TO NEURAL LINK'}
            </Button>
          </div>
        </div>
      </motion.div>
    </Box>
  );
};

export default AuthPortal;