import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

function Home() {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <h1 className="hero-title">AI-Driven Personalized Brain Tumor Treatment Planning</h1>
          <p className="hero-subtitle">
            Multimodal AI-powered clinical decision support for optimized, evidence-based cancer treatment protocols
          </p>
          <div className="hero-cta">
            <Link to="/patients" className="btn btn-primary btn-lg">Start New Analysis</Link>
            <Link to="/dashboard" className="btn btn-secondary btn-lg">View Dashboard</Link>
            <Link to="/tumor-3d" className="btn btn-outline btn-lg">Explore 3D Visualization</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <h2>Comprehensive Multimodal AI Analysis</h2>
            <p className="text-secondary">Integrating cutting-edge AI technologies for personalized treatment planning</p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="icon-circle">🔬</div>
              <h3>MRI Segmentation & Radiomics</h3>
              <p>Advanced U-Net based tumor segmentation with comprehensive radiomics analysis including volume, shape, location, and edema metrics.</p>
              <Link to="/mri-analysis" className="btn btn-sm btn-outline mt-md">Explore →</Link>
            </div>

            <div className="feature-card">
              <div className="icon-circle">🧬</div>
              <h3>Genomic Biomarker Interpretation</h3>
              <p>Automated analysis of IDH1, MGMT, ATRX, and 1p/19q status with treatment sensitivity predictions and actionability mapping.</p>
              <Link to="/genomic-analysis" className="btn btn-sm btn-outline mt-md">Explore →</Link>
            </div>

            <div className="feature-card">
              <div className="icon-circle">📊</div>
              <h3>Histopathology NLP Extraction</h3>
              <p>Natural language processing of pathology reports to extract structured clinical data and WHO grade classification.</p>
              <Link to="/histopathology" className="btn btn-sm btn-outline mt-md">Explore →</Link>
            </div>

            <div className="feature-card">
              <div className="icon-circle">💊</div>
              <h3>Treatment Optimization Engine</h3>
              <p>Evidence-based protocol recommendations aligned with NCCN/EANO guidelines using multimodal data fusion.</p>
              <Link to="/treatment-plan" className="btn btn-sm btn-outline mt-md">Explore →</Link>
            </div>

            <div className="feature-card">
              <div className="icon-circle">📈</div>
              <h3>Outcome & Toxicity Forecasting</h3>
              <p>Survival predictions (OS/PFS) and side-effect risk modeling for informed decision-making.</p>
              <Link to="/outcome-prediction" className="btn btn-sm btn-outline mt-md">Explore →</Link>
            </div>

            <div className="feature-card">
              <div className="icon-circle">🎯</div>
              <h3>3D AR/VR Tumor Visualization</h3>
              <p>Interactive 3D brain models with tumor overlay, anatomical landmarks, and VR-ready visualization.</p>
              <Link to="/tumor-3d" className="btn btn-sm btn-outline mt-md">Explore →</Link>
            </div>

            <div className="feature-card">
              <div className="icon-circle">🛤️</div>
              <h3>Treatment Pathway Simulator</h3>
              <p>Interactive timeline for shared decision-making with what-if scenario comparison capabilities.</p>
              <Link to="/pathway-simulator" className="btn btn-sm btn-outline mt-md">Explore →</Link>
            </div>

            <div className="feature-card">
              <div className="icon-circle">🔍</div>
              <h3>AI Explainability Dashboard</h3>
              <p>SHAP-based feature importance and Grad-CAM visualizations for transparent AI decision-making.</p>
              <Link to="/explainability" className="btn btn-sm btn-outline mt-md">Explore →</Link>
            </div>

            <div className="feature-card">
              <div className="icon-circle">🔐</div>
              <h3>Blockchain Audit Trail</h3>
              <p>Immutable record keeping with data provenance tracking and model version history.</p>
              <Link to="/blockchain-audit" className="btn btn-sm btn-outline mt-md">Explore →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">98.5%</div>
              <div className="stat-label">Segmentation Accuracy</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">92%</div>
              <div className="stat-label">Treatment Prediction Accuracy</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">15min</div>
              <div className="stat-label">Average Analysis Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">1000+</div>
              <div className="stat-label">Cases Analyzed</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section">
        <div className="container">
          <div className="grid-2">
            <div>
              <h2>About NeuroOnco AI</h2>
              <p>NeuroOnco AI is a state-of-the-art Clinical Decision Support System (CDSS) designed to assist oncologists, neurosurgeons, and tumor boards in making evidence-based treatment decisions for brain tumor patients.</p>
              <p>By integrating multimodal data sources including MRI imaging, genomic biomarkers, histopathology reports, and clinical history, our AI engine provides personalized treatment recommendations with unprecedented accuracy and transparency.</p>
              <p>Our system leverages cutting-edge deep learning models, natural language processing, and blockchain technology to deliver secure, auditable, and explainable clinical insights.</p>
            </div>
            <div className="card-glass">
              <h3>Key Capabilities</h3>
              <ul className="capabilities-list">
                <li className="capability-item">✓ Multimodal data integration (MRI, genomics, pathology)</li>
                <li className="capability-item">✓ AI-powered tumor segmentation and radiomics</li>
                <li className="capability-item">✓ Evidence-based treatment recommendations</li>
                <li className="capability-item">✓ Survival and toxicity prediction models</li>
                <li className="capability-item">✓ 3D/AR/VR tumor visualization</li>
                <li className="capability-item">✓ SHAP and Grad-CAM explainability</li>
                <li style={{ padding: '0.5rem 0' }}>✓ Blockchain-backed audit trail</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Get Started with NeuroOnco AI</h2>
            <p>Choose your role to access the appropriate interface and tools</p>

            <div className="role-cards">
              <Link to="/dashboard" className="role-card">
                <h3>👨‍⚕️ Oncologist</h3>
                <p>Access full clinical decision support tools and patient management</p>
              </Link>

              <div className="role-card">
                <h3>🧑‍⚕️ Patient</h3>
                <p>View personalized treatment pathways and educational resources</p>
              </div>

              <div className="role-card">
                <h3>🔬 Researcher</h3>
                <p>Explore AI models, explainability tools, and audit trails</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container">
          <div className="text-center">
            <p className="text-secondary">© 2024 NeuroOnco AI - Advanced AI-Driven Cancer Treatment Planning System</p>
            <p className="text-tertiary footer-disclaimer">For demonstration purposes only. Not for clinical use without proper validation and regulatory approval.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;