import React from 'react';
import './MiniFooter.css';

const MiniFooter = () => {
  return (
    <footer className="mini-footer-root">
      <div className="mini-footer-links">
        {['Privacy Policy', 'Terms of Service', 'Audit Log', 'GitHub'].map((text) => (
          <a key={text} href="#" className="mini-footer-link">
            {text}
          </a>
        ))}
      </div>
    </footer>
  );
};

export default MiniFooter;
