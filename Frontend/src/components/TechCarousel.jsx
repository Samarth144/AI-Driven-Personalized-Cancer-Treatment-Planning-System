import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import './TechCarousel.css';

const TechCarousel = ({ data, reverse, title, subtitle }) => {
  const [index, setIndex] = useState(0);

  // Auto-cycle every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [index]);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % data.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + data.length) % data.length);
  };

  const currentItem = data[index];

  return (
    <div className="tech-carousel-section">
      {/* Section Title */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" className="tech-carousel-title">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="subtitle1" className="tech-carousel-subtitle">
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* The Carousel Container */}
      <div className="tech-carousel-container">
        {/* Navigation Buttons */}
        <IconButton onClick={prevSlide} className="tech-carousel-nav-btn">
          <ArrowBackIosNewIcon />
        </IconButton>

        {/* --- ANIMATION ZONE --- */}
        <div className={`tech-carousel-content-wrapper ${reverse ? 'reverse' : ''}`}>
          <AnimatePresence mode='wait'>
            
            {/* 1. THE IMAGE BLOCK (Neural Orb) */}
            <motion.div
              key={`img-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="neural-image-wrapper"
            >
              <Box
                component="img"
                src={currentItem.img}
                alt={currentItem.title}
                className="neural-image"
              />
              {/* Spinning Ring */}
              <div className="neural-spin-ring"></div>
            </motion.div>

            {/* 2. THE CONNECTING LINE */}
            <motion.div 
               className="neural-connect-line"
               initial={{ scaleX: 0 }}
               animate={{ scaleX: 1 }}
               transition={{ duration: 0.5, delay: 0.2 }}
            ></motion.div>

            {/* 3. THE TEXT BLOCK (Data Node) */}
            <motion.div
              key={`txt-${index}`}
              initial={{ opacity: 0, x: reverse ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reverse ? -50 : 50 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="neural-text-wrapper"
            >
              <div className="neural-text-box">
                <div className="neural-header">
                  <Typography variant="h5" className="neural-heading">
                    {currentItem.title}
                  </Typography>
                  <Typography variant="h4" className="neural-icon">
                    {currentItem.icon}
                  </Typography>
                </div>
                
                <Typography variant="body1" className="neural-desc">
                  {currentItem.desc}
                </Typography>

                {/* Technical ID Tag */}
                <Typography variant="caption" className="neural-footer">
                  ID: SYS_MOD_0{index + 1} // STATUS: ACTIVE
                </Typography>
              </div>
            </motion.div>

          </AnimatePresence>
        </div>

        <IconButton onClick={nextSlide} className="tech-carousel-nav-btn">
          <ArrowForwardIosIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default TechCarousel;
