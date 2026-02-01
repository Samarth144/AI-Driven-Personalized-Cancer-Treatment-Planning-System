import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Dashboard.css';

function Dashboard() {
  const patients = [
    { id: '17680637', name: 'John Doe', diagnosis: 'Glioblastoma Multiforme', date: 'Jan 15, 2024', status: 'completed' },
    { id: '17680637', name: 'Jane Smith', diagnosis: 'Anaplastic Astrocytoma', date: 'Feb 20, 2024', status: 'In Progress' },
    { id: '17680637', name: 'Robert Johnson', diagnosis: 'Oligodendroglioma', date: 'Mar 10, 2024', status: 'completed' },
    { id: '17680681', name: 'John Doe', diagnosis: 'Pending diagnosis', date: 'Jan 10, 2026', status: 'In Progress' },
    { id: '17680689', name: 'Yash Rajput', diagnosis: 'Pending diagnosis', date: 'Jan 10, 2026', status: 'In Progress' },
    { id: '17680698', name: 'Yash Rajput', diagnosis: 'Pending diagnosis', date: 'Jan 11, 2026', status: 'In Progress' },
  ];

  return (
    <>
      <Navbar />
      
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="container">
          <h1>Clinical Dashboard</h1>
          <p>Manage patients and view analysis results</p>
        </div>
      </div>

      <div className="container">
        {/* Quick Actions */}
        <div className="quick-actions">
          <Link to="/patients" className="action-card">
            <div className="action-card-icon">➕</div>
            <div>New Patient</div>
          </Link>
          <Link to="/mri" className="action-card">
            <div className="action-card-icon">🔬</div>
            <div>MRI Analysis</div>
          </Link>
          <Link to="/genomics" className="action-card">
            <div className="action-card-icon">🧬</div>
            <div>Genomic Analysis</div>
          </Link>
          <Link to="/treatment" className="action-card">
            <div className="action-card-icon">💊</div>
            <div>Treatment Plans</div>
          </Link>
          <Link to="/tumor-3d" className="action-card">
            <div className="action-card-icon">🎯</div>
            <div>3D Visualization</div>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid-4 mb-xl">
          <div className="stat-card">
            <div className="stat-value">6</div>
            <div className="stat-label">Total Patients</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">4</div>
            <div className="stat-label">Active Analyses</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">3</div>
            <div className="stat-label">Treatment Plans</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">87%</div>
            <div className="stat-label">Avg Confidence</div>
          </div>
        </div>

        {/* Patient List */}
        <div className="patient-list">
          <div className="flex justify-between items-center mb-lg">
            <h2>Patient Cases</h2>
            <Link to="/patients" className="btn btn-primary">+ Add New Patient</Link>
          </div>

          <div className="search-bar">
            <input type="text" className="form-input" placeholder="Search patients by ID, name, or diagnosis..." />
          </div>

          <div className="patient-list-container">
            {/* Header Row */}
            <div className="patient-item header">
              <div>Patient ID</div>
              <div>Name & Diagnosis</div>
              <div>Date Added</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {/* Rows */}
            {patients.map((patient, index) => (
              <div key={index} className="patient-item">
                <div><span className="badge badge-primary">{patient.id}</span></div>
                <div>
                  <div className="patient-name">{patient.name}</div>
                  <div className="patient-diagnosis">{patient.diagnosis}</div>
                </div>
                <div className="text-secondary">{patient.date}</div>
                <div>
                  <span className={`badge ${patient.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                    {patient.status}
                  </span>
                </div>
                <div>
                  <button className="btn btn-sm btn-primary">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
