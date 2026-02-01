import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-container">
          <Link to="/" className="nav-brand">🧠 NeuroOnco AI</Link>
          <ul className="nav-menu">
            <li>
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            </li>
            <li>
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
            </li>
            <li>
              <a href="/#features" className="nav-link">Features</a>
            </li>
            <li>
              <a href="/#about" className="nav-link">About</a>
            </li>
            <li>
              <Link to="/patients" className="btn btn-primary btn-sm">New Case</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;