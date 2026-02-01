import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Histopathology.css';

function Histopathology() {
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setAnalysisResult(null); // Reset previous results
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('histopathology_pdf', selectedFile);

    setUploading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/uploads/histopathology', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAnalysisResult(response.data);
      alert('File uploaded and analyzed successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error.response?.data?.message || 'Error uploading file. Please try again.';
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const analyzeReport = () => {
    setAnalyzing(true);
    // Simulate NLP processing
    setTimeout(() => {
      setAnalyzing(false);
      alert("Analysis complete! (Simulation)");
    }, 2000);
  };

  const downloadReport = () => {
    alert("Downloading report... (Simulation)");
  };

  return (
    <>
      <div className="histo-header">
        <div className="flex justify-between items-center mb-xl">
          <div>
            <h1>Histopathology Report Analysis</h1>
            <p className="text-secondary">Upload a report to have the AI extract key data and generate a treatment plan.</p>
          </div>
        </div>

        {/* PDF Uploader */}
        <div className="card-glass mb-xl">
          <h3>Upload Histopathology PDF</h3>
          <p className="text-secondary mb-lg">The AI will analyze the report and suggest a treatment plan based on established guidelines.</p>
          <div className="flex items-center gap-md">
            <input type="file" accept="application/pdf" onChange={handleFileChange} className="file-input" />
            <button className="btn btn-primary" onClick={handleFileUpload} disabled={uploading || !selectedFile}>
              {uploading ? 'Uploading & Analyzing...' : 'Upload & Analyze'}
            </button>
          </div>
        </div>

        {analysisResult && (
          <>
            {/* Extracted Structured Data */}
            <div className="card-glass mb-xl">
              <h3>AI-Extracted Structured Data</h3>
              <p className="text-secondary mb-lg">Key clinical information extracted by the AI from the uploaded report.</p>
              <div className="extracted-data">
                {Object.entries(analysisResult.extracted_data).map(([key, value]) => (
                  <div className="data-card" key={key}>
                    <div className="card-label">{key.replace(/_/g, ' ').toUpperCase()}</div>
                    <h4 className="mt-sm">{value}</h4>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Generated Treatment Plan */}
            <div className="card-glass mb-xl">
              <h3>AI-Generated Treatment Plan</h3>
              <div className="treatment-plan-content" dangerouslySetInnerHTML={{ __html: analysisResult.plan }} />
            </div>

            {/* Evidence Section */}
            <div className="card-glass mb-xl">
              <h3>Evidence from Clinical Guidelines</h3>
              <div className="evidence-content">
                {analysisResult.evidence.map((item, index) => (
                  <div key={index} className="evidence-item">
                    <p>{item.text}</p>
                    <span className="evidence-path">{item.path}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Report Viewer (Placeholder) */}
        {!analysisResult && (
          <div className="report-viewer">
            <h3 className="mb-lg">Pathology Report</h3>
            <div className="report-content">
              <h2 className="report-header">SURGICAL PATHOLOGY REPORT</h2>
              <hr className="report-divider" />
              <p><i>Upload a report to begin analysis. The original report content will be replaced by the AI's findings.</i></p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-md justify-center">
          <button className="btn btn-secondary" onClick={() => navigate('/genomic-analysis')}>
            ← Back to Genomic Analysis
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/treatment-plan')} disabled={!analysisResult}>
            View Full Treatment Plan →
          </button>
        </div>
      </div>
    </>
  );
}

export default Histopathology;

