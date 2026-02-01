import React from 'react';
import { useLocation } from 'react-router-dom';
import MiniFooter from './MiniFooter';

const GlobalFooter = () => {
  const location = useLocation();
  
  // Don't show MiniFooter on Home page (path '/') because it has the full Footer
  if (location.pathname === '/') {
    return null;
  }

  return <MiniFooter />;
};

export default GlobalFooter;
