import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ScienceIcon from '@mui/icons-material/Science';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import './SlideButton.css';

const SlideButton = ({ onComplete }) => {
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 200], [1, 0]);
  const bgOpacity = useTransform(x, [0, 200], [0.1, 0.4]);

  const handleDragEnd = () => {
    if (x.get() > 200) {
      setIsCompleted(true);
      if (onComplete) onComplete();
      else navigate('/patients');
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
    }
  };

  return (
    <div className="slide-btn-container">
      <motion.div 
        className="slide-btn-bg" 
        style={{ opacity: bgOpacity }} 
      />
      <motion.div className="slide-btn-text" style={{ opacity }}>
        Slide to Initialize
      </motion.div>
      <motion.div
        className="slide-btn-handle"
        drag="x"
        dragConstraints={{ left: 0, right: 210 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
      >
        {isCompleted ? <ScienceIcon /> : <KeyboardArrowRightIcon />}
      </motion.div>
    </div>
  );
};

export default SlideButton;
