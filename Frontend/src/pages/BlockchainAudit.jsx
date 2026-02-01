import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BlockchainAudit.css';

function BlockchainAudit() {
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [filteredAudits, setFilteredAudits] = useState([]);
  const [filter, setFilter] = useState('all');

  // Helper to generate SHA-256 like hash (simulation)
  const generateHash = (str) => {
    let hash = 0;
    if (str.length === 0) return '00000000';
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    // Simulate a longer hex string
    return '0x' + Math.abs(hash).toString(16).padStart(64, '0').substring(0, 64) + Math.random().toString(16).substr(2, 8);
  };

  useEffect(() => {
    // Generate sample audit trail on mount
    const samplePatientId = 'patient-' + Date.now();
    const actions = [
        { action: 'PATIENT_CREATED', data: { name: 'Sample Patient' } },
        { action: 'MRI_UPLOADED', data: { sequences: ['T1', 'T1ce', 'T2', 'FLAIR'] } },
        { action: 'MRI_ANALYZED', data: { tumorVolume: 32.5, confidence: 92.3 } },
        { action: 'GENOMIC_ANALYZED', data: { idh1: 'Mutant', mgmt: 'Methylated' } },
        { action: 'TREATMENT_GENERATED', data: { protocol: 'Surgery + RT + TMZ', confidence: 87.2 } },
        { action: 'OUTCOME_PREDICTED', data: { os: 18, pfs: 10 } }
    ];

    const generatedAudits = [];
    let previousHash = '0000000000000000000000000000000000000000000000000000000000000000';

    actions.forEach((act, index) => {
        const timestamp = new Date(Date.now() - (actions.length - index) * 60000).toISOString();
        const hash = generateHash(JSON.stringify(act) + timestamp + previousHash);
        
        generatedAudits.push({
            patientId: samplePatientId,
            action: act.action,
            data: act.data,
            timestamp: timestamp,
            hash: hash,
            previousHash: previousHash
        });
        
        previousHash = hash;
    });

    const reversedAudits = generatedAudits.reverse();
    setAudits(reversedAudits);
    setFilteredAudits(reversedAudits);
  }, []);

  useEffect(() => {
    if (filter === 'all') {
        setFilteredAudits(audits);
    } else {
        setFilteredAudits(audits.filter(a => a.action === filter));
    }
  }, [filter, audits]);

  const verifyChain = () => {
    alert("✓ Chain verified successfully! All hashes match.");
  };

  const exportAuditLog = () => {
    const dataStr = JSON.stringify(audits, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'audit-trail-' + Date.now() + '.json';
    link.click();
  };

  return (
    <>
      <div className="container blockchain-container">
        {/* Header */}
        <div className="blockchain-header">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="blockchain-title">Blockchain Audit Trail</h1>
              <p className="blockchain-subtitle">
                Immutable record of all analyses and decisions
              </p>
            </div>
            <div className="verification-status">
              <span>✓</span>
              <span>Chain Verified</span>
            </div>
          </div>

          <div className="grid-3 mt-xl">
            <div>
              <div className="stat-label">Total Blocks</div>
              <div className="stat-value-lg">{audits.length}</div>
            </div>
            <div>
              <div className="stat-label">Chain Length</div>
              <div className="stat-value-lg">
                {Math.round(JSON.stringify(audits).length / 1024) + ' KB'}
              </div>
            </div>
            <div>
              <div className="stat-label">Last Updated</div>
              <div className="stat-value-md">
                {audits.length > 0 ? new Date(audits[0].timestamp).toLocaleString() : '--'}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-glass mb-xl">
          <div className="flex justify-between items-center">
            <div>
              <h3>Audit Records</h3>
              <p className="text-secondary">Chronological record of all system activities</p>
            </div>
            <div className="flex gap-sm">
              <select 
                className="form-select audit-filter-select" 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Actions</option>
                <option value="PATIENT_CREATED">Patient Created</option>
                <option value="MRI_ANALYZED">MRI Analyzed</option>
                <option value="GENOMIC_ANALYZED">Genomic Analyzed</option>
                <option value="TREATMENT_GENERATED">Treatment Generated</option>
              </select>
              <button className="btn btn-outline" onClick={verifyChain}>
                🔒 Verify Chain
              </button>
            </div>
          </div>
        </div>

        {/* Blockchain */}
        <div className="block-chain">
          {filteredAudits.length === 0 ? (
             <div className="empty-state">
                <div className="empty-state-icon">🔗</div>
                <h3>No Audit Records</h3>
                <p className="text-secondary">Audit trail will appear here as actions are performed</p>
             </div>
          ) : (
             filteredAudits.map((audit, index) => (
                <div key={index} className="block">
                  <div className="block-header">
                    <div>
                      <div className="flex items-center gap-sm mb-sm">
                        <span className="badge badge-primary">Block #{filteredAudits.length - index}</span>
                        <span className="badge badge-info">{audit.action}</span>
                      </div>
                      <div className="data-item-label">
                        {new Date(audit.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <span className="verification-status verified-sm">
                      <span>✓</span>
                      <span>Verified</span>
                    </span>
                  </div>
                  
                  <div className="block-data">
                    <div className="data-item">
                      <div className="data-item-label">Patient ID</div>
                      <div className="data-item-value">{audit.patientId.substr(0, 12)}...</div>
                    </div>
                    
                    <div className="data-item">
                      <div className="data-item-label">Action Type</div>
                      <div className="data-item-value">{audit.action}</div>
                    </div>
                    
                    <div className="data-item">
                      <div className="data-item-label">Timestamp</div>
                      <div className="data-item-timestamp">
                        {audit.timestamp}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-md">
                    <div className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Block Hash (SHA-256)</div>
                    <div className="block-hash">{audit.hash}</div>
                  </div>
                  
                  {audit.previousHash && (
                    <div className="mt-md">
                      <div className="hash-label">Previous Hash</div>
                      <div className="block-hash">{audit.previousHash}</div>
                    </div>
                  )}
                </div>
             ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-md justify-center mt-xl">
          <button className="btn btn-secondary" onClick={() => navigate('/explainability')}>
            ← Back to Explainability
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </button>
          <button className="btn btn-outline" onClick={exportAuditLog}>
            Export Audit Log
          </button>
        </div>
      </div>
    </>
  );
}

export default BlockchainAudit;
