import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import './PatientIntake.css';

function PatientIntake() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: 'Male',
    mrn: '',
    idh1: 'Unknown',
    mgmt: 'Unknown',
    atrx: 'Unknown',
    codeletion: 'Unknown',
    kps: '100 - Normal, no complaints',
    ecog: '0 - Fully active',
    symptoms: '',
    comorbidities: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, fileType) => {
    if (e.target.files.length > 0) {
      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: e.target.files[0]
      }));
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting Patient Data:', { formData, uploadedFiles });
    alert('Patient added successfully! Redirecting to MRI Analysis...');
    // In a real app, use navigate('/mri') here
  };

  const steps = ['Patient Info', 'MRI Upload', 'Genomic Data', 'Clinical History', 'Review'];

  return (
    <>
      <Navbar />
      <div className="intake-container">
        <h1 className="text-center mb-lg">New Patient Intake</h1>
        <p className="text-center text-secondary mb-xl">
          Multimodal data collection for AI-driven treatment planning
        </p>

        {/* Progress Steps */}
        <div className="progress-steps">
          {steps.map((label, index) => {
            const stepNum = index + 1;
            let statusClass = '';
            if (stepNum === currentStep) statusClass = 'active';
            else if (stepNum < currentStep) statusClass = 'completed';

            return (
              <div key={stepNum} className={`step ${statusClass}`}>
                <div className="step-circle">{stepNum}</div>
                <div className="step-label">{label}</div>
              </div>
            );
          })}
        </div>

        <div className="card-glass">
          {/* Step 1: Patient Information */}
          {currentStep === 1 && (
            <div className="form-section active">
              <h2>Patient Information</h2>
              <p className="text-secondary mb-lg">Basic demographic and contact information</p>
              
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Patient Name</label>
                  <input type="text" className="form-input" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-input" name="dob" value={formData.dob} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Medical Record Number</label>
                  <input type="text" className="form-input" name="mrn" value={formData.mrn} onChange={handleInputChange} placeholder="MRN-123456" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: MRI Upload */}
          {currentStep === 2 && (
            <div className="form-section active">
              <h2>MRI Imaging Data</h2>
              <p className="text-secondary mb-lg">Upload T1, T1ce, T2, and FLAIR sequences</p>
              
              <div className="upload-grid">
                {['T1', 'T1ce', 'T2', 'FLAIR'].map(type => (
                  <div key={type} className={`upload-card ${uploadedFiles[`mri_${type}`] ? 'uploaded' : ''}`}>
                    <div className="upload-icon">📁</div>
                    <h4>{type} Sequence</h4>
                    <p className="text-secondary">{uploadedFiles[`mri_${type}`] ? uploadedFiles[`mri_${type}`].name : 'Click to upload'}</p>
                    <input type="file" className="form-file" onChange={(e) => handleFileUpload(e, `mri_${type}`)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Genomic Data */}
          {currentStep === 3 && (
            <div className="form-section active">
              <h2>Genomic & Molecular Data</h2>
              <p className="text-secondary mb-lg">Upload VCF files or enter biomarker status manually</p>

              <div className="form-group">
                <label className="form-label">Upload VCF File (Optional)</label>
                <div className="file-upload">
                    <div className="upload-icon">🧬</div>
                    <p>Drop VCF file here or click to browse</p>
                    <input type="file" className="form-file" accept=".vcf,.vcf.gz" />
                </div>
              </div>

              <div className="grid-2 mt-xl">
                <div className="form-group">
                  <label className="form-label">IDH1 Status</label>
                  <select className="form-select" name="idh1" value={formData.idh1} onChange={handleInputChange}>
                    <option>Unknown</option>
                    <option>Wild-type</option>
                    <option>Mutant</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">MGMT Promoter</label>
                  <select className="form-select" name="mgmt" value={formData.mgmt} onChange={handleInputChange}>
                    <option>Unknown</option>
                    <option>Methylated</option>
                    <option>Unmethylated</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">ATRX Status</label>
                  <select className="form-select" name="atrx" value={formData.atrx} onChange={handleInputChange}>
                    <option>Unknown</option>
                    <option>Wild-type</option>
                    <option>Mutant</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">1p/19q Codeletion</label>
                  <select className="form-select" name="codeletion" value={formData.codeletion} onChange={handleInputChange}>
                    <option>Unknown</option>
                    <option>Present</option>
                    <option>Absent</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Clinical History */}
          {currentStep === 4 && (
            <div className="form-section active">
              <h2>Clinical History & Performance Status</h2>
              <p className="text-secondary mb-lg">Patient symptoms, comorbidities, and functional status</p>

              <div className="form-group">
                <label className="form-label">Chief Complaint & Symptoms</label>
                <textarea className="form-textarea" name="symptoms" value={formData.symptoms} onChange={handleInputChange} placeholder="Describe presenting symptoms..."></textarea>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">KPS Score</label>
                  <select className="form-select" name="kps" value={formData.kps} onChange={handleInputChange}>
                    <option>100 - Normal, no complaints</option>
                    <option>90 - Minor symptoms</option>
                    <option>80 - Normal activity with effort</option>
                    <option>70 - Cares for self</option>
                    <option>60 - Requires occasional assistance</option>
                    <option>50 - Requires considerable assistance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">ECOG Performance Status</label>
                  <select className="form-select" name="ecog" value={formData.ecog} onChange={handleInputChange}>
                    <option>0 - Fully active</option>
                    <option>1 - Restricted in strenuous activity</option>
                    <option>2 - Ambulatory, self-care</option>
                    <option>3 - Limited self-care</option>
                    <option>4 - Completely disabled</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Comorbidities</label>
                <textarea className="form-textarea" name="comorbidities" value={formData.comorbidities} onChange={handleInputChange} placeholder="List existing medical conditions..."></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Upload Pathology Report (PDF)</label>
                <div className={`file-upload ${uploadedFiles.pathology ? 'uploaded' : ''}`}>
                    <div className="upload-icon">📄</div>
                    <p>{uploadedFiles.pathology ? uploadedFiles.pathology.name : 'Drop PDF file here or click to browse'}</p>
                    <input type="file" className="form-file" accept=".pdf" onChange={(e) => handleFileUpload(e, 'pathology')} />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="form-section active">
              <h2>Review & Submit</h2>
              <p className="text-secondary mb-lg">Please review all information before submitting</p>
              
              <div className="review-box">
                <h3 className="mb-md">Patient Information</h3>
                <p><strong>Name:</strong> {formData.name || 'Not provided'}</p>
                <p><strong>DOB:</strong> {formData.dob || 'Not provided'}</p>
                <p><strong>Gender:</strong> {formData.gender}</p>
                <p><strong>MRN:</strong> {formData.mrn || 'Not provided'}</p>
                
                <h3 className="mt-lg mb-md">Uploaded Files</h3>
                <p><strong>MRI Sequences:</strong> {Object.keys(uploadedFiles).filter(k => k.startsWith('mri_')).length} files</p>
                <p><strong>Genomic Data:</strong> {uploadedFiles.vcf ? '1 file' : 'Manual entry'}</p>
                <p><strong>Pathology Report:</strong> {uploadedFiles.pathology ? '1 file' : 'Not uploaded'}</p>
                
                <h3 className="mt-lg mb-md">Biomarker Status</h3>
                <p><strong>IDH1:</strong> {formData.idh1}</p>
                <p><strong>MGMT:</strong> {formData.mgmt}</p>
                <p><strong>ATRX:</strong> {formData.atrx}</p>
                <p><strong>1p/19q:</strong> {formData.codeletion}</p>
                
                <h3 className="mt-lg mb-md">Performance Status</h3>
                <p><strong>KPS:</strong> {formData.kps}</p>
                <p><strong>ECOG:</strong> {formData.ecog}</p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            {currentStep > 1 && (
              <button className="btn btn-secondary" onClick={prevStep}>← Previous</button>
            )}
            <div className="flex-spacer"></div>
            {currentStep < 5 ? (
              <button className="btn btn-primary" onClick={nextStep}>Next →</button>
            ) : (
              <button className="btn btn-success" onClick={handleSubmit}>Submit & Analyze</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default PatientIntake;