import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Container } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './PrecisionSlide.css';

const PrecisionSlide = ({ data = [], activeIndex = 0, direction, goToSlide }) => {
  const item = data[activeIndex];

  if (!item) return null;

  // Staggered Variants
  const imageVariants = {
    initial: { opacity: 0, x: direction === 'left' ? 150 : -150 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: direction === 'left' ? 50 : -50 },
  };

  const cardVariants = {
    initial: { opacity: 0, x: direction === 'left' ? -150 : 150 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: direction === 'left' ? -50 : 50 },
  };

  return (
    <div className="precision-wrapper">
      <AnimatePresence mode='wait'>
        <div key={item.id} className="precision-slide-content">
          
          {/* 1. THE CINEMATIC IMAGE (Background Layer) */}
          <motion.div
            variants={imageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`precision-image-container ${direction === 'left' ? 'shift-right' : 'shift-left'}`}
          >
            <Box 
              component="img" 
              src={item.img} 
              alt={item.title}
              className="precision-image"
            />
            <div className="precision-image-overlay"></div>
          </motion.div>

          {/* 2. THE CONTENT CARD (Overlay Layer) */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className={`precision-card ${direction === 'left' ? 'dock-left' : 'dock-right'}`}
            style={{ y: '-50%' }} // Force vertical centering
          >
            {/* The "Precision Line" Accent */}
            <div className="precision-accent-line"></div>

            {/* Step Number */}
            <Typography variant="h1" className="precision-bg-number">
              {item.id}
            </Typography>

            {/* Content */}
            <div className="precision-content-inner">
              <Typography variant="overline" className="precision-subtitle">
                {item.subtitle}
              </Typography>
              
              <Typography variant="h4" className="precision-title">
                {item.title}
              </Typography>
              
              <Typography variant="body1" className="precision-desc">
                {item.desc}
              </Typography>

              {/* Dot Indicators */}
              <div className="precision-dots">
                {data.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`precision-dot ${idx === activeIndex ? 'active' : ''}`}
                    onClick={() => goToSlide(idx)}
                  />
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </AnimatePresence>
    </div>
  );
};

const PrecisionCarousel = ({ title, subtitle, data, alignment = 'left' }) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % data.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [data.length]);

  const goToSlide = (newIdx) => setIdx(newIdx);

  return (
    <Box sx={{ py: 10 }}>
      <Container maxWidth="xl">
        {/* Section Header */}
        <Box sx={{ mb: 8, borderLeft: '4px solid #059789', pl: 3, maxWidth: '800px' }}>
          <Typography variant="h3" sx={{ fontFamily: '"Space Grotesk"', fontWeight: 700, color: '#fff', fontSize: { xs: '2rem', md: '2.5rem' } }}>
            {title}
          </Typography>
          <Typography variant="h6" sx={{ color: '#64748B', fontFamily: '"Space Grotesk"', mt: 1, fontWeight: 400, fontSize: '1.1rem' }}>
            {subtitle}
          </Typography>
        </Box>

        <PrecisionSlide 
          data={data} 
          activeIndex={idx} 
          direction={alignment}
          goToSlide={goToSlide}
        />
        
      </Container>
    </Box>
  );
};

export default PrecisionCarousel;
