import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tumor3DPage from './pages/Tumor3DPage';
import PatientIntake from './pages/PatientIntake';
import GenomicAnalysis from './pages/GenomicAnalysis';
import MRIAnalysis from './pages/MRIAnalysis';
import Histopathology from './pages/Histopathology';
import TreatmentPlan from './pages/TreatmentPlan';
import OutcomePrediction from './pages/OutcomePrediction';
import PathwaySimulator from './pages/PathwaySimulator';
import Explainability from './pages/Explainability';
import BlockchainAudit from './pages/BlockchainAudit';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tumor-3d" element={<Tumor3DPage />} />
        <Route path="/patients" element={<PatientIntake />} />
        <Route path="/genomic-analysis" element={<GenomicAnalysis />} />
        <Route path="/mri-analysis" element={<MRIAnalysis />} />
        <Route path="/histopathology" element={<Histopathology />} />
        <Route path="/treatment-plan" element={<TreatmentPlan />} />
        <Route path="/outcome-prediction" element={<OutcomePrediction />} />
        <Route path="/pathway-simulator" element={<PathwaySimulator />} />
        <Route path="/explainability" element={<Explainability />} />
        <Route path="/blockchain-audit" element={<BlockchainAudit />} />
      </Routes>
    </Router>
  );
}

export default App;