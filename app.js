// ============================================
// AI-Driven Cancer Treatment Planning System
// Core Application Logic & Utilities
// ============================================

// ============================================
// State Management (Updated for Backend API)
// ============================================
const AppState = {
  currentPatient: null,
  patients: [],
  analyses: {},

  init() {
    this.loadFromStorage();
  },

  loadFromStorage() {
    const stored = localStorage.getItem('cancerTreatmentData');
    if (stored) {
      const data = JSON.parse(stored);
      this.patients = data.patients || [];
      this.analyses = data.analyses || {};
    }
  },

  saveToStorage() {
    localStorage.setItem('cancerTreatmentData', JSON.stringify({
      patients: this.patients,
      analyses: this.analyses
    }));
  },

  setCurrentPatient(patientId) {
    this.currentPatient = this.patients.find(p => p.id === patientId);
  },

  addPatient(patient) {
    this.patients.push(patient);
    this.saveToStorage();
  },

  updateAnalysis(patientId, analysisType, data) {
    if (!this.analyses[patientId]) {
      this.analyses[patientId] = {};
    }
    this.analyses[patientId][analysisType] = data;
    this.saveToStorage();
  },

  getAnalysis(patientId, analysisType) {
    return this.analyses[patientId]?.[analysisType];
  }
};

// ============================================
// Router
// ============================================
const Router = {
  routes: {
    '/': 'index.html',
    '/dashboard': 'dashboard.html',
    '/patient-intake': 'patient-intake.html',
    '/mri-analysis': 'mri-analysis.html',
    '/genomic-analysis': 'genomic-analysis.html',
    '/histopathology': 'histopathology.html',
    '/treatment-plan': 'treatment-plan.html',
    '/outcome-prediction': 'outcome-prediction.html',
    '/pathway-simulator': 'pathway-simulator.html',
    '/tumor-3d': 'tumor-3d.html',
    '/explainability': 'explainability.html',
    '/blockchain-audit': 'blockchain-audit.html'
  },

  navigate(path) {
    const page = this.routes[path];
    if (page) {
      window.location.href = page;
    }
  },

  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page.replace('.html', '');
  }
};

// ============================================
// UI Components
// ============================================
const UI = {
  // Show toast notification
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${this.getToastIcon(type)}</span>
        <span class="toast-message">${message}</span>
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  getToastIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  },

  // Show loading spinner
  showLoader(container) {
    const loader = document.createElement('div');
    loader.className = 'loader-container';
    loader.innerHTML = '<div class="spinner"></div>';
    container.appendChild(loader);
    return loader;
  },

  hideLoader(loader) {
    if (loader) loader.remove();
  },

  // Create modal
  createModal(title, content, actions = []) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const actionsHTML = actions.map(action =>
      `<button class="btn ${action.class}" onclick="${action.onclick}">${action.text}</button>`
    ).join('');

    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="btn-icon" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        <div class="modal-footer">
          ${actionsHTML}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);

    return overlay;
  }
};

// ============================================
// Data Utilities
// ============================================
const DataUtils = {
  // Generate unique ID
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Format date
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  // Simulate AI processing delay
  async simulateProcessing(duration = 2000) {
    return new Promise(resolve => setTimeout(resolve, duration));
  },

  // Generate mock analysis results
  generateMockAnalysis(type) {
    const generators = {
      mri: () => ({
        tumorVolume: (Math.random() * 50 + 10).toFixed(2),
        tumorLocation: ['Frontal Lobe', 'Temporal Lobe', 'Parietal Lobe', 'Occipital Lobe'][Math.floor(Math.random() * 4)],
        edemaVolume: (Math.random() * 30 + 5).toFixed(2),
        segmentationConfidence: (Math.random() * 20 + 80).toFixed(1),
        radiomics: {
          sphericity: (Math.random() * 0.3 + 0.7).toFixed(3),
          compactness: (Math.random() * 0.4 + 0.6).toFixed(3),
          surfaceArea: (Math.random() * 1000 + 500).toFixed(2)
        }
      }),

      genomic: () => ({
        idh1: Math.random() > 0.5 ? 'Mutant' : 'Wild-type',
        mgmt: Math.random() > 0.5 ? 'Methylated' : 'Unmethylated',
        atrx: Math.random() > 0.5 ? 'Mutant' : 'Wild-type',
        codeletion1p19q: Math.random() > 0.7 ? 'Present' : 'Absent',
        treatmentSensitivity: {
          temozolomide: (Math.random() * 40 + 60).toFixed(1),
          radiation: (Math.random() * 30 + 70).toFixed(1),
          immunotherapy: (Math.random() * 50 + 30).toFixed(1)
        }
      }),

      treatment: () => ({
        recommendedProtocol: ['Surgery + RT + TMZ', 'Surgery + RT', 'RT + TMZ', 'Watchful Waiting'][Math.floor(Math.random() * 4)],
        confidence: (Math.random() * 15 + 85).toFixed(1),
        alternativeOptions: [
          { protocol: 'Surgery + RT', confidence: (Math.random() * 20 + 70).toFixed(1) },
          { protocol: 'RT + TMZ', confidence: (Math.random() * 20 + 60).toFixed(1) }
        ],
        guidelineAlignment: ['NCCN', 'EANO'][Math.floor(Math.random() * 2)]
      }),

      outcome: () => ({
        overallSurvival: {
          median: Math.floor(Math.random() * 24 + 12),
          range: [Math.floor(Math.random() * 12 + 6), Math.floor(Math.random() * 36 + 24)]
        },
        progressionFreeSurvival: {
          median: Math.floor(Math.random() * 12 + 6),
          range: [Math.floor(Math.random() * 6 + 3), Math.floor(Math.random() * 18 + 12)]
        },
        sideEffects: {
          fatigue: (Math.random() * 40 + 30).toFixed(1),
          nausea: (Math.random() * 30 + 20).toFixed(1),
          cognitiveImpairment: (Math.random() * 25 + 15).toFixed(1),
          hematologicToxicity: (Math.random() * 20 + 10).toFixed(1)
        },
        qualityOfLife: (Math.random() * 20 + 60).toFixed(1)
      })
    };

    return generators[type] ? generators[type]() : {};
  }
};

// ============================================
// Chart Utilities (using Chart.js)
// ============================================
const ChartUtils = {
  defaultOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'hsl(0, 0%, 75%)',
          font: {
            family: 'Inter, sans-serif'
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'hsla(0, 0%, 100%, 0.05)'
        },
        ticks: {
          color: 'hsl(0, 0%, 75%)'
        }
      },
      y: {
        grid: {
          color: 'hsla(0, 0%, 100%, 0.05)'
        },
        ticks: {
          color: 'hsl(0, 0%, 75%)'
        }
      }
    }
  },

  createBarChart(ctx, data, options = {}) {
    return new Chart(ctx, {
      type: 'bar',
      data: data,
      options: { ...this.defaultOptions, ...options }
    });
  },

  createLineChart(ctx, data, options = {}) {
    return new Chart(ctx, {
      type: 'line',
      data: data,
      options: { ...this.defaultOptions, ...options }
    });
  },

  createDoughnutChart(ctx, data, options = {}) {
    return new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: 'hsl(0, 0%, 75%)',
              font: {
                family: 'Inter, sans-serif'
              }
            }
          }
        },
        ...options
      }
    });
  },

  createRadarChart(ctx, data, options = {}) {
    return new Chart(ctx, {
      type: 'radar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            grid: {
              color: 'hsla(0, 0%, 100%, 0.05)'
            },
            ticks: {
              color: 'hsl(0, 0%, 75%)',
              backdropColor: 'transparent'
            },
            pointLabels: {
              color: 'hsl(0, 0%, 75%)'
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: 'hsl(0, 0%, 75%)',
              font: {
                family: 'Inter, sans-serif'
              }
            }
          }
        },
        ...options
      }
    });
  }
};

// ============================================
// File Upload Handler
// ============================================
const FileUpload = {
  setupDropZone(dropZoneElement, callback) {
    const fileInput = dropZoneElement.querySelector('.form-file');

    dropZoneElement.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      callback(files);
    });

    dropZoneElement.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZoneElement.classList.add('drag-over');
    });

    dropZoneElement.addEventListener('dragleave', () => {
      dropZoneElement.classList.remove('drag-over');
    });

    dropZoneElement.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZoneElement.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files);
      callback(files);
    });
  },

  displayFileInfo(file) {
    return `
      <div class="file-info">
        <span class="file-name">${file.name}</span>
        <span class="file-size">${DataUtils.formatFileSize(file.size)}</span>
      </div>
    `;
  }
};

// ============================================
// Blockchain Utilities
// ============================================
const BlockchainUtils = {
  async generateHash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  createAuditRecord(patientId, action, data) {
    return {
      id: DataUtils.generateId(),
      patientId,
      action,
      timestamp: new Date().toISOString(),
      data,
      hash: null // Will be generated
    };
  },

  async saveAuditRecord(record) {
    record.hash = await this.generateHash(record);

    const audits = JSON.parse(localStorage.getItem('auditTrail') || '[]');
    audits.push(record);
    localStorage.setItem('auditTrail', JSON.stringify(audits));

    return record;
  },

  getAuditTrail(patientId = null) {
    const audits = JSON.parse(localStorage.getItem('auditTrail') || '[]');
    return patientId ? audits.filter(a => a.patientId === patientId) : audits;
  }
};

// ============================================
// Initialize App
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  AppState.init();

  // Add smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});

// ============================================
// Export for use in other scripts
// ============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AppState,
    Router,
    UI,
    DataUtils,
    ChartUtils,
    FileUpload,
    BlockchainUtils
  };
}
