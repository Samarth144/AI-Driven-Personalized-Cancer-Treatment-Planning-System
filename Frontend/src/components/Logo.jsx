import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const Logo = ({ size = 40, showText = true }) => {
  // Brand Colors
  const cyan = '#00F0FF';
  const teal = '#059789';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      
      {/* --- THE ICON MARK --- */}
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial="rest"
        whileHover="hover"
        animate="pulse"
      >
        {/* Gradients */}
        <defs>
          <linearGradient id="resonanceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cyan} />
            <stop offset="100%" stopColor={teal} />
          </linearGradient>
        </defs>

        {/* Outer Arc (Magnetic Field) */}
        <motion.path
          d="M20 50 A 30 30 0 1 1 80 50" // Semicircle arc
          stroke="url(#resonanceGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeOpacity="0.3"
          variants={{
            pulse: { scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3], transition: { duration: 3, repeat: Infinity } }
          }}
          style={{ originX: '50%', originY: '50%' }}
        />

        {/* Middle Arc (Targeting) */}
        <motion.path
          d="M30 50 A 20 20 0 1 1 70 50"
          stroke="url(#resonanceGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeOpacity="0.6"
          variants={{
            pulse: { scale: [1, 1.02, 1], transition: { duration: 3, repeat: Infinity, delay: 0.2 } }
          }}
          style={{ originX: '50%', originY: '50%' }}
        />

        {/* Central Pulse (The "Resonance" Frequency) */}
        <motion.path
          d="M10 50 L 35 50 L 45 25 L 55 75 L 65 50 L 90 50"
          stroke="#F8FAFC" // White core signal
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Glowing Dot (The "Point of Care") */}
        <motion.circle 
            cx="65" cy="50" r="4" fill={cyan} 
            animate={{ boxShadow: [`0 0 0px ${cyan}`, `0 0 10px ${cyan}`, `0 0 0px ${cyan}`] }}
        />

      </motion.svg>

      {/* --- THE WORDMARK --- */}
      {showText && (
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Rajdhani", sans-serif',
              fontWeight: 700,
              lineHeight: 0.8,
              letterSpacing: '0.05em',
              background: `linear-gradient(90deg, #F8FAFC, ${cyan})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase',
              fontSize: { xs: '1.2rem', md: '1.5rem' } // Responsive font size
            }}
          >
            RESONANCE
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              color: '#059789', // Teal Subtext
              letterSpacing: '0.2em',
              fontSize: '0.6rem',
              display: 'block',
              mt: 0.5,
              fontWeight: 600
            }}
          >
            PRECISION ONCOLOGY
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Logo;
