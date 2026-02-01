import React from 'react';
import './Histopathology.css';

function Histopathology() {
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);

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
            <p className="text-secondary">NLP-powered extraction of structured clinical data</p>
          </div>
          <button className="btn btn-primary" onClick={analyzeReport} disabled={analyzing}>
            {analyzing ? 'Analyzing...' : '🔍 Analyze Report'}
          </button>
        </div>

        {/* Report Viewer */}
        <div className="report-viewer">
          <h3 className="mb-lg">Pathology Report</h3>
          <div className="report-content">
            <h2 className="report-header">SURGICAL PATHOLOGY REPORT</h2>
            <hr className="report-divider" />

            <p><strong>Patient:</strong> John Doe | <strong>MRN:</strong> 123456 | <strong>Date:</strong> January 15, 2024</p>
            <p><strong>Specimen:</strong> Right frontal lobe tumor resection</p>

            <h3 className="report-section-title">DIAGNOSIS:</h3>
            <p><span className="highlight">GLIOBLASTOMA, IDH-WILDTYPE (WHO GRADE IV)</span></p>

            <h3 className="report-section-title">MICROSCOPIC DESCRIPTION:</h3>
            <p>
              Sections show a highly cellular glial neoplasm with marked nuclear pleomorphism and brisk mitotic activity
              (approximately <span className="highlight">15 mitoses per 10 high-power fields</span>). Areas of <span className="highlight">microvascular proliferation</span> and <span className="highlight">necrosis with pseudopalisading</span> are present. The tumor cells are positive for GFAP and show nuclear
              accumulation of p53 protein. <span className="highlight">IDH1 R132H immunostain is negative</span>.
            </p>

            <h3 className="report-section-title">IMMUNOHISTOCHEMISTRY:</h3>
            <ul>
              <li><span className="highlight">GFAP: Positive</span></li>
              <li><span className="highlight">IDH1 R132H: Negative</span></li>
              <li><span className="highlight">p53: Strong nuclear positivity ({'>'}50% of cells)</span></li>
              <li><span className="highlight">Ki-67: High proliferation index (40%)</span></li>
              <li>ATRX: Retained</li>
            </ul>

            <h3 className="report-section-title">MOLECULAR FINDINGS:</h3>
            <ul>
              <li><span className="highlight">MGMT promoter methylation: Present</span></li>
              <li>EGFR amplification: Detected</li>
              <li>1p/19q codeletion: Absent</li>
            </ul>

            <h3 className="report-section-title">COMMENT:</h3>
            <p>
              The morphologic and immunophenotypic features are consistent with <span className="highlight">glioblastoma, IDH-wildtype</span>,
              according to the WHO 2021 classification. The presence of MGMT promoter methylation suggests potential benefit
              from temozolomide chemotherapy.
            </p>
          </div>
        </div>

        {/* Extracted Structured Data */}
        <div className="card-glass mb-xl">
          <h3>AI-Extracted Structured Data</h3>
          <p className="text-secondary mb-lg">Key clinical information extracted via NLP</p>

          <div className="extracted-data">
            <div className="data-card">
              <div className="card-label">Diagnosis</div>
              <h4 className="mt-sm">Glioblastoma</h4>
              <span className="badge badge-error">WHO Grade IV</span>
            </div>

            <div className="data-card" style={{ borderLeftColor: 'var(--success)' }}>
              <div className="card-label">IDH Status</div>
              <h4 className="mt-sm">Wild-type</h4>
              <span className="badge badge-info">IDH1 R132H Negative</span>
            </div>

            <div className="data-card" style={{ borderLeftColor: 'var(--warning)' }}>
              <div className="card-label">MGMT Promoter</div>
              <h4 className="mt-sm">Methylated</h4>
              <span className="badge badge-success">TMZ Sensitive</span>
            </div>

            <div className="data-card" style={{ borderLeftColor: 'var(--error)' }}>
              <div className="card-label">Ki-67 Index</div>
              <h4 className="mt-sm">40%</h4>
              <span className="badge badge-warning">High Proliferation</span>
            </div>

            <div className="data-card">
              <div className="card-label">Mitotic Activity</div>
              <h4 className="mt-sm">15/10 HPF</h4>
              <span className="badge badge-error">Brisk</span>
            </div>

            <div className="data-card" style={{ borderLeftColor: 'var(--accent-cyan)' }}>
              <div className="card-label">Key Features</div>
              <div className="card-content-sm">
                • Necrosis<br />
                • Microvascular proliferation<br />
                • p53 accumulation
              </div>
            </div>
          </div>
        </div>

        {/* WHO Classification */}
        <div className="grid-2 mb-xl">
          <div className="card-glass">
            <h3>WHO 2021 Classification</h3>
            <div className="classification-box">
              <h4>Glioblastoma, IDH-wildtype</h4>
              <p className="text-secondary mt-md">
                <strong>CNS WHO Grade:</strong> 4<br />
                <strong>Molecular Subtype:</strong> IDH-wildtype<br />
                <strong>Prognosis:</strong> Poor (median OS 12-18 months)<br />
                <strong>Treatment:</strong> Maximal safe resection + RT + TMZ
              </p>
            </div>
          </div>

          <div className="card-glass">
            <h3>Clinical Implications</h3>
            <div className="implications-content">
              <p><strong>Diagnosis Confirmed:</strong> Glioblastoma, WHO Grade IV</p>

              <p className="mt-md"><strong>Favorable Factor:</strong> MGMT promoter methylation suggests good response to temozolomide chemotherapy.</p>

              <p className="mt-md"><strong>Unfavorable Factors:</strong> IDH-wildtype status and high Ki-67 index indicate aggressive tumor biology.</p>

              <p className="mt-md"><strong>Recommendation:</strong> Standard Stupp protocol (surgery + concurrent chemoradiation + adjuvant TMZ)</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-md justify-center">
          <button className="btn btn-secondary" onClick={() => navigate('/genomic-analysis')}>
            ← Back to Genomic Analysis
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/treatment-plan')}>
            View Treatment Plan →
          </button>
          <button className="btn btn-outline" onClick={downloadReport}>
            Download Report
          </button>
        </div>
      </div>
    </>
  );
}

export default Histopathology;
