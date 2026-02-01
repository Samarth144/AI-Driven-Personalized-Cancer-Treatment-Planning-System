import React from 'react';
import Navbar from '../components/Navbar';
import TumorViewer from '../components/TumorViewer';
import { Link } from 'react-router-dom';
import '../components/Tumor3D.css';

function Tumor3DPage() {
  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '2rem' }}>
        <div className="page-header flex justify-between items-center mb-xl">
          <div>
            <h1>3D Tumor Visualization</h1>
            <p className="text-secondary">Interactive WebGL-based brain and tumor model</p>
          </div>
          <div className="flex gap-sm">
            <button className="btn btn-outline">Reset View</button>
            <button className="btn btn-primary">🥽 VR Mode</button>
          </div>
        </div>

        <TumorViewer />

        <div className="grid-3 mb-xl mt-xl">
           <div className="card-glass text-center">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
              <h4>Surgical Access</h4>
              <p className="text-secondary">Right frontal craniotomy recommended</p>
           </div>
           <div className="card-glass text-center">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
              <h4>Critical Structures</h4>
              <p className="text-secondary">Motor cortex proximity: 1.2 cm</p>
           </div>
           <div className="card-glass text-center">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
              <h4>Resectability</h4>
              <p className="text-secondary">Gross total resection feasible</p>
           </div>
        </div>

        <div className="flex gap-md justify-center">
            <Link to="/mri-analysis" className="btn btn-secondary">
                ← Back to MRI Analysis
            </Link>
            <Link to="/treatment-plan" className="btn btn-primary">
                View Treatment Pathway →
            </Link>
            <button className="btn btn-outline">
                Export 3D Model
            </button>
        </div>
      </div>
    </>
  );
}

export default Tumor3DPage;