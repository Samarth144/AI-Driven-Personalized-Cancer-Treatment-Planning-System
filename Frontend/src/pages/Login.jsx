import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Login.css';

function Login() {
  const [role, setRole] = useState('oncologist');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, validation would happen here
    navigate('/dashboard');
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-box">
          <h2 className="login-title">Secure Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Select Role</label>
              <select 
                className="form-select login-select" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="oncologist">Oncologist</option>
                <option value="researcher">Researcher</option>
                <option value="admin">System Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Email ID</label>
              <input type="email" placeholder="dr.smith@hospital.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" required />
            </div>
            <button type="submit" className="submit-btn">Access Dashboard</button>
            <div className="forgot-password-container">
              <a href="#" className="forgot-password-link">Forgot Password?</a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
