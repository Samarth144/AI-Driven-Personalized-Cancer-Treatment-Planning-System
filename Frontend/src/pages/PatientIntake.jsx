import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Grid, Typography, TextField, Button, InputAdornment, IconButton, LinearProgress, Slider, Chip, Divider
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import TransgenderIcon from '@mui/icons-material/Transgender';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import BiotechIcon from '@mui/icons-material/Biotech';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import './PatientIntake.css';

const markers = [
  { id: 'idh1', label: 'IDH1/2 Status', sub: 'Isocitrate Dehydrogenase', icon: <BiotechIcon />, options: ['Mutant', 'Wild-type', 'Unknown'] },
  { id: 'mgmt', label: 'MGMT Methylation', sub: 'Promoter Region', icon: <ScatterPlotIcon />, options: ['Methylated', 'Unmethylated', 'Unknown'] },
  { id: 'atrx', label: 'ATRX Status', sub: 'Alpha Thalassemia', icon: <RemoveCircleOutlineIcon />, options: ['Lost', 'Retained', 'Unknown'] },
  { id: 'codeletion', label: '1p/19q Co-deletion', sub: 'Chromosome Arms', icon: <ContentCutIcon />, options: ['Present', 'Absent', 'Unknown'] }
];

const getKPSColor = (val) => val >= 80 ? '#059789' : val >= 50 ? '#F59E0B' : '#EF4444';
const getECOGDescription = (val) => {
  const desc = [
    "Fully active, able to carry on all pre-disease performance without restriction.",
    "Restricted in physically strenuous activity but ambulatory and able to carry out work.",
    "Ambulatory and capable of all selfcare but unable to carry out any work activities.",
    "Capable of only limited selfcare, confined to bed or chair more than 50% of waking hours.",
    "Completely disabled. Cannot carry on any selfcare. Totally confined to bed or chair."
  ];
  return desc[val] || "";
};

const TechStepper = ({ activeStep = 1 }) => {
  const steps = ["Identity", "MRI Scan", "Genomics", "History", "Review"];
  return (
    <Box className="stepper-container">
      <div className="stepper-track"></div>
      <div className="stepper-progress" style={{ width: `${(activeStep - 1) * 25}%` }}></div>
      <div className="stepper-nodes">
        {steps.map((label, index) => {
          const isActive = index + 1 === activeStep;
          return (
            <div key={label} className={`stepper-node ${isActive ? 'active' : ''}`}>
              <div className="node-dot"></div>
              <span className="node-label">{label}</span>
            </div>
          );
        })}
      </div>
    </Box>
  );
};

const GenderTile = ({ icon, label, selected, onClick }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="gender-tile-wrapper">
    <div className={`gender-tile ${selected ? 'selected' : ''}`} onClick={onClick}>
      {React.cloneElement(icon, { className: 'gender-icon' })}
      <span>{label}</span>
    </div>
  </motion.div>
);

const MolecularSwitch = ({ label, sub, icon, options, value, onChange }) => {
  return (
    <div className="molecular-switch">
      <div className="switch-header">
        <div className="switch-icon-box">{React.cloneElement(icon, { sx: { fontSize: 20 } })}</div>
        <div>
          <Typography className="switch-title">{label}</Typography>
          <Typography className="switch-sub">{sub}</Typography>
        </div>
      </div>
      <div className="switch-options">
        {options.map((option) => {
          const isSelected = value === option;
          let type = 'standard';
          if (['Mutant', 'Methylated', 'Present', 'Lost'].includes(option)) type = 'actionable';
          if (option === 'Unknown') type = 'warning';

          return (
            <motion.div key={option} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className={`switch-option ${isSelected ? `selected-${type}` : ''}`}
              onClick={() => onChange(option)}
            >
              <Typography variant="caption">{option}</Typography>
              <div className="status-dot"></div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const TagInput = ({ label, icon, tags, onAdd, onDelete }) => {
  const [input, setInput] = useState('');
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      onAdd(input.trim());
      setInput('');
    }
  };
  return (
    <div className="tag-input-terminal">
      <div className="tag-header">
        {React.cloneElement(icon, { className: 'tag-icon' })}
        <Typography variant="subtitle2">{label}</Typography>
      </div>
      <div className="tag-container">
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.div key={tag} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <Chip label={tag} onDelete={() => onDelete(tag)} className="tech-chip" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <TextField fullWidth placeholder="Type and press Enter..." value={input}
        onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
        variant="standard" className="tag-text-field" InputProps={{ disableUnderline: true }}
      />
    </div>
  );
};

const UploadZone = ({ type, label, file, onUpload, onDelete, index }) => {
  const [isScanning, setIsScanning] = useState(false);
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        onUpload(type, e.target.files[0]);
      }, 1500);
    }
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <Box className={`upload-zone ${file ? 'has-file' : ''}`} component="label">
        {!file && <input type="file" hidden onChange={handleFileSelect} />}
        <AnimatePresence mode="wait">
          {isScanning ? (
            <motion.div key="scanning" className="scanning-container">
              <Typography variant="caption" className="scanning-text">PARSING DICOM HEADERS...</Typography>
              <LinearProgress className="tech-progress" />
            </motion.div>
          ) : file ? (
            <motion.div key="file" className="file-info-container">
              <CheckCircleIcon className="success-icon" />
              <Typography variant="h6">{type} READY</Typography>
              <Box className="file-name-box">
                <DescriptionIcon className="file-icon" />
                <Typography variant="caption">{file.name.substring(0, 15)}...</Typography>
              </Box>
              <IconButton className="delete-btn" onClick={(e) => { e.preventDefault(); onDelete(type); }}><DeleteOutlineIcon /></IconButton>
            </motion.div>
          ) : (
            <motion.div key="idle" className="idle-container">
              <div className="upload-icon-box"><CloudUploadIcon /></div>
              <Typography variant="h5">{type}</Typography>
              <Typography variant="caption">{label}</Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </motion.div>
  );
};

const ReviewBlock = ({ title, icon, onEdit, children, status = 'valid' }) => {
  const isError = status === 'error';
  return (
    <div className={`review-block ${isError ? 'error' : ''}`}>
      <div className="review-block-header">
        <div className="review-block-title-box">
          {React.cloneElement(icon, { className: 'review-block-icon' })}
          <Typography variant="subtitle2">{title}</Typography>
        </div>
        <Button startIcon={<EditIcon />} className="edit-btn" onClick={onEdit}>EDIT</Button>
      </div>
      <div className="review-block-content">{children}</div>
      <div className="review-block-watermark">{icon}</div>
    </div>
  );
};

const StatusChip = ({ label, type }) => {
  let statusClass = 'muted';
  if (['Mutant', 'Methylated', 'Present', 'Lost'].includes(type)) statusClass = 'cyan';
  if (['Wild-type', 'Unmethylated', 'Retained', 'Absent'].includes(type)) statusClass = 'teal';
  if (['Unknown', 'NONE'].includes(type)) statusClass = 'red';

  return (
    <div className={`status-chip status-chip-${statusClass}`}>
      <div className="status-chip-dot"></div>
      <Typography variant="caption">{label}</Typography>
    </div>
  );
};

const PatientIntake = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({ 
    name: '', dob: '', gender: '', mrn: '', contact: '', diagnosisDate: '', pathologyReport: '', pathologyFile: null,
    idh1: 'Unknown', mgmt: 'Unknown', atrx: 'Unknown', codeletion: 'Unknown',
    kps: 100, ecog: 0, symptoms: '', comorbidities: '' 
  });
  const [uploadedFiles, setUploadedFiles] = useState({});

  const handleChange = (field, value) => setFormData({ ...formData, [field]: value });
  const handleMRIUpload = (type, file) => setUploadedFiles(prev => ({ ...prev, [`mri_${type}`]: file }));
  const handleMRIDelete = (type) => setUploadedFiles(prev => {
    const newFiles = { ...prev };
    delete newFiles[`mri_${type}`];
    return newFiles;
  });

  return (
    <Box className="intake-container">
      <Grid container spacing={4} className="intake-grid">
        {currentStep === 1 && (
          <Grid item xs={12} className="preview-column">
            <Box className="preview-wrapper">
              <Typography variant="h3" className="page-title">NEW CASE</Typography>
              <Typography variant="body1" className="page-subtitle">Initialize multimodal data collection.</Typography>
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="id-card">
                  <div className="holo-bar"></div>
                  
                  {/* Holographic Image Portal */}
                  <div className="id-card-portal">
                    <div className="portal-circle"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=400&q=80" 
                      alt="Neural Scan" 
                      className="portal-image" 
                    />
                  </div>

                  <div className="id-header">
                    <div className="id-avatar"><BadgeOutlinedIcon /></div>
                    <div>
                      <span className="id-label">PATIENT PREVIEW</span>
                      <h4 className="id-name">{formData.name || "ENTER NAME..."}</h4>
                    </div>
                  </div>
                  <div className="id-details">
                    <div className="id-field"><span>MRN</span><p>{formData.mrn || "---"}</p></div>
                    <div className="id-field"><span>DOB</span><p>{formData.dob || "--/--/--"}</p></div>
                    <div className="id-field"><span>CONTACT</span><p>{formData.contact || "---"}</p></div>
                    <div className="id-field"><span>DIAGNOSIS</span><p>{formData.diagnosisDate || "--/--/--"}</p></div>
                  </div>
                </div>
              </motion.div>
            </Box>
          </Grid>
        )}

        <Grid item xs={12}>
          <TechStepper activeStep={currentStep} />
          <AnimatePresence mode="wait">
            {currentStep === 1 ? (
              <motion.div key="step1" className="step-motion-wrapper" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                <div className="form-terminal">
                  <div className="terminal-header">
                    <Typography variant="h5">01 // PATIENT INFORMATION</Typography>
                    <span className="req-badge">REQ_FIELDS: ALL</span>
                  </div>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={9}>
                      <div className="form-inputs-col">
                        <TextField fullWidth label="Full Legal Name" variant="outlined" className="tech-input"
                          value={formData.name} onChange={(e) => handleChange('name', e.target.value)}
                          InputProps={{ startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon /></InputAdornment> }}
                        />
                        <TextField fullWidth label="Medical Record Number (MRN)" placeholder="e.g. MR-2026-X" className="tech-input"
                          value={formData.mrn} onChange={(e) => handleChange('mrn', e.target.value)}
                          InputProps={{ startAdornment: <InputAdornment position="start"><NumbersOutlinedIcon /></InputAdornment> }}
                        />
                        <TextField fullWidth label="Contact Number" placeholder="e.g. 9876543210" className="tech-input"
                          value={formData.contact} onChange={(e) => handleChange('contact', e.target.value)}
                          InputProps={{ startAdornment: <InputAdornment position="start"><LocalPhoneOutlinedIcon /></InputAdornment> }}
                        />
                        <Grid container spacing={3}>
                          <Grid item xs={6}>
                            <TextField fullWidth type="date" label="Date of Birth" className="tech-input"
                              value={formData.dob} onChange={(e) => handleChange('dob', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonthOutlinedIcon /></InputAdornment> }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField fullWidth type="date" label="Date of Diagnosis" className="tech-input"
                              value={formData.diagnosisDate} onChange={(e) => handleChange('diagnosisDate', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              InputProps={{ startAdornment: <InputAdornment position="start"><EventAvailableOutlinedIcon /></InputAdornment> }}
                            />
                          </Grid>
                        </Grid>
                        <Box sx={{ mt: 2 }}>
                          <Typography className="field-label">Clinical Pathology Report (PDF/IMG)</Typography>
                          <UploadZone 
                            type="PATHOLOGY" 
                            label="Upload biopsy or surgical report" 
                            file={formData.pathologyFile} 
                            onUpload={(_, file) => handleChange('pathologyFile', file)} 
                            onDelete={() => handleChange('pathologyFile', null)} 
                            index={4} 
                          />
                        </Box>
                      </div>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography className="field-label">Biological Sex / Gender</Typography>
                      <div className="gender-selection-col">
                        <GenderTile label="MALE" icon={<MaleIcon />} selected={formData.gender === 'Male'} onClick={() => handleChange('gender', 'Male')} />
                        <GenderTile label="FEMALE" icon={<FemaleIcon />} selected={formData.gender === 'Female'} onClick={() => handleChange('gender', 'Female')} />
                        <GenderTile label="OTHER" icon={<TransgenderIcon />} selected={formData.gender === 'Other'} onClick={() => handleChange('gender', 'Other')} />
                      </div>
                    </Grid>
                  </Grid>
                  <div className="terminal-footer">
                    <Button variant="contained" className="tech-btn" onClick={() => setCurrentStep(2)}>PROCEED TO MRI UPLOAD</Button>
                  </div>
                </div>
              </motion.div>
            ) : currentStep === 2 ? (
              <motion.div key="step2" className="step-motion-wrapper" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="form-terminal">
                  <div className="terminal-header">
                    <Typography variant="h5">02 // MRI ACQUISITION</Typography>
                    <span className="req-badge">SUPPORTED: .NII, .DCM, .GZ</span>
                  </div>
                  <Grid container spacing={4} className="mri-grid">
                    <Grid item xs={12} className="mri-grid-item"><UploadZone type="T1" label="T1-Weighted Sequence" file={uploadedFiles['mri_T1']} onUpload={handleMRIUpload} onDelete={handleMRIDelete} index={0} /></Grid>
                    <Grid item xs={12} className="mri-grid-item"><UploadZone type="T1ce" label="T1-Contrast Enhanced" file={uploadedFiles['mri_T1ce']} onUpload={handleMRIUpload} onDelete={handleMRIDelete} index={1} /></Grid>
                    <Grid item xs={12} className="mri-grid-item"><UploadZone type="T2" label="T2-Weighted Sequence" file={uploadedFiles['mri_T2']} onUpload={handleMRIUpload} onDelete={handleMRIDelete} index={2} /></Grid>
                    <Grid item xs={12} className="mri-grid-item"><UploadZone type="FLAIR" label="Fluid Attenuated Inversion Recovery" file={uploadedFiles['mri_FLAIR']} onUpload={handleMRIUpload} onDelete={handleMRIDelete} index={3} /></Grid>
                  </Grid>
                  <div className="terminal-footer">
                    <Button variant="text" className="tech-btn-text" onClick={() => setCurrentStep(1)}>BACK</Button>
                    <Button variant="contained" className="tech-btn" onClick={() => setCurrentStep(3)}>PROCEED TO GENOMICS</Button>
                  </div>
                </div>
              </motion.div>
            ) : currentStep === 3 ? (
              <motion.div key="step3" className="step-motion-wrapper" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="form-terminal">
                  <div className="terminal-header">
                    <div>
                      <Typography variant="h5">03 // GENOMIC DECODER</Typography>
                      <span className="req-badge">MOLECULAR MARKERS</span>
                    </div>
                    <Button startIcon={<FileUploadOutlinedIcon />} className="vcf-import-btn" variant="outlined" size="small">
                      IMPORT .VCF FILE
                    </Button>
                  </div>
                  <Grid container spacing={3}>
                    {markers.map((m) => (
                      <Grid item xs={12} key={m.id}>
                        <MolecularSwitch 
                          label={m.label} sub={m.sub} icon={m.icon} options={m.options} 
                          value={formData[m.id]} onChange={(val) => handleChange(m.id, val)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  <div className="decoder-footer">
                    <HelpOutlineIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                    <Typography variant="caption">
                      Marking "Unknown" will trigger the Uncertainty Quantification Engine for this parameter.
                    </Typography>
                  </div>
                  <div className="terminal-footer">
                    <Button variant="text" className="tech-btn-text" onClick={() => setCurrentStep(2)}>BACK</Button>
                    <Button variant="contained" className="tech-btn" onClick={() => setCurrentStep(4)}>PROCEED TO HISTORY</Button>
                  </div>
                </div>
              </motion.div>
            ) : currentStep === 4 ? (
              <motion.div key="step4" className="step-motion-wrapper" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="form-terminal">
                  <div className="terminal-header">
                    <Typography variant="h5">04 // CLINICAL HISTORY</Typography>
                    <span className="req-badge">PATIENT PERFORMANCE</span>
                  </div>
                                    <Grid container spacing={2} className="performance-grid">
                                      <Grid item xs={12} md={4}>
                                        <div className="performance-terminal-box" style={{ '--kps-color': getKPSColor(formData.kps) }}>
                                          <div className="score-header">
                                            <Typography className="kps-label">KPS Score</Typography>
                                            <Typography className="kps-value">{formData.kps}%</Typography>
                                          </div>
                                          <Slider
                                            value={formData.kps}
                                            onChange={(_, val) => handleChange('kps', val)}
                                            step={10} marks min={0} max={100}
                                            className="tech-slider"
                                          />
                                          <Typography variant="caption" className="score-desc">
                                            <span>{formData.kps >= 80 ? "Normal" : formData.kps >= 50 ? "Assisted" : "Hosp."}</span>
                                          </Typography>
                                        </div>
                                      </Grid>
                  
                                      <Grid item xs={12} md={2.6}>
                                        <div className="performance-terminal-box">
                                          <Typography className="ecog-label">ECOG Score (0-4)</Typography>
                                          <div className="ecog-selector">
                                            {[0, 1, 2, 3, 4].map((score) => (
                                              <Button key={score} onClick={() => handleChange('ecog', score)}
                                                className={`ecog-btn ${formData.ecog === score ? 'active' : ''}`}>
                                                {score}
                                              </Button>
                                            ))}
                                          </div>
                                          <Typography variant="caption" className="ecog-desc-text">
                                            {getECOGDescription(formData.ecog).substring(0, 30)}...
                                          </Typography>
                                        </div>
                                      </Grid>
                  
                                      <Grid item xs={12} md={2.7}>
                                        <TagInput 
                                          label="SYMPTOMS" icon={<MedicalServicesIcon />}
                                          tags={formData.symptoms ? formData.symptoms.split(',').filter(s => s) : []}
                                          onAdd={(t) => handleChange('symptoms', formData.symptoms ? `${formData.symptoms},${t}` : t)}
                                          onDelete={(t) => handleChange('symptoms', formData.symptoms.split(',').filter(x => x !== t).join(','))}
                                        />
                                      </Grid>
                                      <Grid item xs={12} md={2.7}>
                                        <TagInput 
                                          label="COMORBIDITIES" icon={<FavoriteBorderIcon />}
                                          tags={formData.comorbidities ? formData.comorbidities.split(',').filter(s => s) : []}
                                          onAdd={(t) => handleChange('comorbidities', formData.comorbidities ? `${formData.comorbidities},${t}` : t)}
                                          onDelete={(t) => handleChange('comorbidities', formData.comorbidities.split(',').filter(x => x !== t).join(','))}
                                        />
                                      </Grid>
                                    </Grid>
                  <div className="terminal-footer">
                    <Button variant="text" className="tech-btn-text" onClick={() => setCurrentStep(3)}>BACK</Button>
                    <Button variant="contained" className="tech-btn" onClick={() => setCurrentStep(5)}>REVIEW CASE</Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="step5" className="step-motion-wrapper" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <div className="form-terminal">
                  <div className="terminal-header">
                    <div>
                      <Typography variant="h5">05 // PROTOCOL VERIFICATION</Typography>
                      <span className="req-badge">CONFIRM DATA INTEGRITY</span>
                    </div>
                  </div>

                  <Grid container spacing={3}>
                    {/* 1. IDENTITY BLOCK */}
                    <Grid item xs={12} md={4}>
                      <ReviewBlock title="PATIENT IDENTITY" icon={<FingerprintIcon />} onEdit={() => setCurrentStep(1)}>
                        <div className="review-data-stack">
                          <div>
                            <span className="data-label">FULL NAME</span>
                            <Typography className="data-value-lg">{formData.name || '---'}</Typography>
                          </div>
                          <div className="data-row">
                            <div>
                              <span className="data-label">MRN</span>
                              <Typography className="data-value-mono">{formData.mrn || '---'}</Typography>
                            </div>
                            <div>
                              <span className="data-label">DIAGNOSIS</span>
                              <Typography className="data-value">{formData.diagnosisDate || '---'}</Typography>
                            </div>
                          </div>
                        </div>
                      </ReviewBlock>
                    </Grid>

                    {/* 2. MRI ACQUISITION BLOCK */}
                    <Grid item xs={12} md={4}>
                      <ReviewBlock 
                        title="MRI SEQUENCES" 
                        icon={<ViewInArIcon />} 
                        status={Object.keys(uploadedFiles).filter(k => k.startsWith('mri_')).length === 0 ? 'error' : 'valid'}
                        onEdit={() => setCurrentStep(2)}
                      >
                        {Object.keys(uploadedFiles).filter(k => k.startsWith('mri_')).length === 0 ? (
                          <div className="error-display">
                            <ErrorOutlineIcon className="error-icon-big" />
                            <Typography variant="body2">NO SEQUENCES DETECTED</Typography>
                            <span className="error-sub">T1, T1ce, T2, FLAIR Required</span>
                          </div>
                        ) : (
                          <div className="mri-review-list">
                            {['T1', 'T1ce', 'T2', 'FLAIR'].map(seq => (
                              <div key={seq} className={`mri-seq-badge ${uploadedFiles[`mri_${seq}`] ? 'active' : 'inactive'}`}>
                                {seq}
                              </div>
                            ))}
                          </div>
                        )}
                      </ReviewBlock>
                    </Grid>

                    {/* 3. MOLECULAR PROFILE BLOCK */}
                    <Grid item xs={12} md={4}>
                      <ReviewBlock title="GENOMIC PROFILE" icon={<BiotechIcon />} onEdit={() => setCurrentStep(3)}>
                        <div className="genomic-review-stack">
                          <div className="review-item-between">
                            <Typography variant="body2">IDH1 Status</Typography>
                            <StatusChip label={formData.idh1} type={formData.idh1} />
                          </div>
                          <Divider className="review-divider" />
                          <div className="review-item-between">
                            <Typography variant="body2">MGMT Methylation</Typography>
                            <StatusChip label={formData.mgmt} type={formData.mgmt} />
                          </div>
                        </div>
                      </ReviewBlock>
                    </Grid>
                  </Grid>

                  <div className="terminal-footer-final">
                    {Object.keys(uploadedFiles).filter(k => k.startsWith('mri_')).length === 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Typography className="critical-error-text">
                          [!] CRITICAL ERROR: INSUFFICIENT IMAGING DATA. ANALYSIS LOCKED.
                        </Typography>
                      </motion.div>
                    )}
                    <Button
                      variant="contained"
                      className="tech-btn-launch"
                      disabled={Object.keys(uploadedFiles).filter(k => k.startsWith('mri_')).length === 0}
                      endIcon={<PlayArrowIcon />}
                      onClick={() => navigate('/mri-analysis')}
                    >
                      {Object.keys(uploadedFiles).filter(k => k.startsWith('mri_')).length === 0 ? 'AWAITING DATA...' : 'INITIALIZE TREATMENT ENGINE'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientIntake;