import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import './MRIAnalysis.css';
import { Chart as ChartJS, RadialLinearScale, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Radar, Bar, Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

ChartJS.register(RadialLinearScale, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

function MRIAnalysis() {
  const [slice, setSlice] = useState(75);
  const [analyzing, setAnalyzing] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = () => {
    setAnalyzing(true);
    setMetrics(null);
    setTimeout(() => {
      setAnalyzing(false);
      setMetrics({
        volume: '38.05',
        edema: '6.64',
        location: 'Temporal Lobe',
        confidence: '83.6'
      });
    }, 2000);
  };

  const shapeData = {
    labels: ['Sphericity', 'Compactness', 'Elongation', 'Flatness', 'Spiculation'],
    datasets: [{
      label: 'Shape Metrics',
      data: [0.82, 0.75, 0.68, 0.71, 0.45],
      backgroundColor: 'rgba(52, 152, 219, 0.2)',
      borderColor: '#3498db',
      borderWidth: 2,
    }],
  };

  const textureData = {
    labels: ['Contrast', 'Correlation', 'Energy', 'Homogeneity'],
    datasets: [{
      label: 'Texture Values',
      data: [45.2, 0.78, 0.34, 0.82],
      backgroundColor: ['#3498db', '#1abc9c', '#9b59b6', '#34495e'],
    }],
  };

  const intensityData = {
    labels: ['Min', 'Max', 'Mean', 'Median', 'Std Dev', 'Skewness', 'Kurtosis'],
    datasets: [{
      label: 'Intensity Statistics',
      data: [12, 245, 128, 135, 42, 0.23, 1.8],
      borderColor: '#8e44ad',
      backgroundColor: 'rgba(142, 68, 173, 0.1)',
      fill: true,
      tension: 0.4
    }],
  };

  return (
    <>
      <Navbar />
      <div className="container page-container">
        <div className="page-header mb-xl flex justify-between items-center">
          <div>
            <h1>MRI Segmentation & Radiomics Analysis</h1>
            <p className="text-secondary">AI-powered tumor segmentation with U-Net architecture</p>
          </div>
          <button className="btn btn-primary" onClick={runAnalysis}>
            {analyzing ? 'Analyzing...' : '🔄 Run Analysis'}
          </button>
        </div>

        {analyzing && (
           <div className="analysis-status mb-xl">
             <div className="spinner"></div>
             <div>
                <h3 className="status-title">Analyzing MRI Data...</h3>
                <p className="status-desc">Processing segmentation and extracting radiomics features</p>
             </div>
           </div>
        )}

        <div className="analysis-grid mb-xl">
          {/* MRI Viewer */}
          <div className="mri-viewer glass-panel">
            <div className="viewer-header mb-md flex justify-between items-center">
              <h3>MRI Viewer with Segmentation Overlay</h3>
              <div className="flex gap-sm">
                <span className="badge badge-primary">T1ce</span>
                <span className="badge badge-info">Slice {slice}/155</span>
              </div>
            </div>

            <div className="mri-canvas-container">
               {analyzing && <div className="scanner-bar"></div>}
               <div className="mri-slice">
                  {/* Simulated MRI Visual */}
                  <div className="brain-structure"></div>
                  <div className="tumor-overlay"></div>
                  <div className="edema-overlay"></div>
               </div>
            </div>

            <div className="slice-controls mt-lg">
               <div className="flex justify-between mb-sm">
                  <span className="text-secondary">Axial Slice</span>
                  <span className="text-secondary">Segmentation Confidence: <strong>{metrics ? metrics.confidence : '92.3'}%</strong></span>
               </div>
               <input 
                 type="range" 
                 min="1" 
                 max="155" 
                 value={slice} 
                 onChange={(e) => setSlice(e.target.value)} 
                 className="slice-slider"
               />
               
               <div className="heatmap-legend mt-md flex items-center gap-sm">
                  <span className="text-secondary text-sm">Grad-CAM Heatmap:</span>
                  <div className="legend-gradient flex-1 h-5 rounded"></div>
                  <span className="text-secondary text-sm">High</span>
               </div>
            </div>

            <div className="grid-3 mt-lg controls-grid">
                <button className="btn btn-sm btn-secondary">T1</button>
                <button className="btn btn-sm btn-primary">T1ce</button>
                <button className="btn btn-sm btn-secondary">T2</button>
                <button className="btn btn-sm btn-secondary">FLAIR</button>
                <button className="btn btn-sm btn-outline">Toggle Overlay</button>
                <button className="btn btn-sm btn-outline">Grad-CAM</button>
            </div>
          </div>

          {/* Metrics Panel */}
          <div className="metrics-panel flex flex-col gap-md">
            <div className="metric-card">
               <div className="metric-label">Tumor Volume</div>
               <div className="metric-value">{metrics ? metrics.volume : '--'}</div>
               <div className="text-secondary">cm³</div>
            </div>
            <div className="metric-card warning">
               <div className="metric-label">Edema Volume</div>
               <div className="metric-value">{metrics ? metrics.edema : '--'}</div>
               <div className="text-secondary">cm³</div>
            </div>
            <div className="metric-card info">
               <div className="metric-label">Tumor Location</div>
               <div className="metric-value">{metrics ? metrics.location : '--'}</div>
            </div>
            <div className="metric-card success">
               <div className="metric-label">Segmentation Confidence</div>
               <div className="metric-value">{metrics ? metrics.confidence : '--'}%</div>
            </div>
          </div>
        </div>

        {/* Radiomics Features */}
        {!analyzing && (
          <div className="card-glass mb-xl">
            <h3>Radiomics Features</h3>
            <p className="text-secondary mb-lg">Quantitative imaging features extracted from tumor region</p>
            
            <div className="grid-3">
               <div>
                 <h4>Shape Features</h4>
                 <div className="chart-container">
                    <Radar data={shapeData} options={{maintainAspectRatio: false}} />
                 </div>
               </div>
               <div>
                 <h4>Texture Features</h4>
                 <div className="chart-container">
                    <Bar data={textureData} options={{maintainAspectRatio: false}} />
                 </div>
               </div>
               <div>
                 <h4>Intensity Features</h4>
                 <div className="chart-container">
                    <Line data={intensityData} options={{maintainAspectRatio: false}} />
                 </div>
               </div>
            </div>
          </div>
        )}

        <div className="flex gap-md justify-center">
            <Link to="/genomic-analysis" className="btn btn-primary">
                Next: Genomic Analysis →
            </Link>
            <Link to="/tumor-3d" className="btn btn-secondary">
                View in 3D
            </Link>
            <Link to="/explainability" className="btn btn-outline">
                View Explainability
            </Link>
        </div>
      </div>
    </>
  );
}

export default MRIAnalysis;