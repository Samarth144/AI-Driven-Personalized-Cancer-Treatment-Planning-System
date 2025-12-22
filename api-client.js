// ============================================
// API Client for NeuroOnco AI Backend
// Centralized API communication layer
// ============================================

const API_BASE_URL = window.location.origin + '/api';

class APIClient {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Get authentication headers
    getHeaders(isFormData = false) {
        const headers = {};

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(options.isFormData),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);

            // Handle authentication errors
            if (error.message.includes('authorized') || error.message.includes('token')) {
                this.clearToken();
                window.location.href = '/login.html';
            }

            throw error;
        }
    }

    // ============================================
    // Authentication APIs
    // ============================================

    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (data.success && data.data.token) {
            this.setToken(data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data));
        }

        return data;
    }

    async login(credentials) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        if (data.success && data.data.token) {
            this.setToken(data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data));
        }

        return data;
    }

    async getMe() {
        return await this.request('/auth/me');
    }

    logout() {
        this.clearToken();
        window.location.href = '/login.html';
    }

    // ============================================
    // Patient APIs
    // ============================================

    async getPatients(page = 1, limit = 10) {
        return await this.request(`/patients?page=${page}&limit=${limit}`);
    }

    async getPatient(id) {
        return await this.request(`/patients/${id}`);
    }

    async createPatient(patientData) {
        return await this.request('/patients', {
            method: 'POST',
            body: JSON.stringify(patientData)
        });
    }

    async updatePatient(id, patientData) {
        return await this.request(`/patients/${id}`, {
            method: 'PUT',
            body: JSON.stringify(patientData)
        });
    }

    async deletePatient(id) {
        return await this.request(`/patients/${id}`, {
            method: 'DELETE'
        });
    }

    // ============================================
    // Analysis APIs
    // ============================================

    async getPatientAnalyses(patientId) {
        return await this.request(`/analyses/patient/${patientId}`);
    }

    async getAnalysis(id) {
        return await this.request(`/analyses/${id}`);
    }

    async createAnalysis(analysisData) {
        return await this.request('/analyses', {
            method: 'POST',
            body: JSON.stringify(analysisData)
        });
    }

    async processAnalysis(id) {
        return await this.request(`/analyses/${id}/process`, {
            method: 'POST'
        });
    }

    async updateAnalysis(id, analysisData) {
        return await this.request(`/analyses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(analysisData)
        });
    }

    // ============================================
    // Treatment Plan APIs
    // ============================================

    async getPatientTreatments(patientId) {
        return await this.request(`/treatments/patient/${patientId}`);
    }

    async getTreatment(id) {
        return await this.request(`/treatments/${id}`);
    }

    async createTreatment(treatmentData) {
        return await this.request('/treatments', {
            method: 'POST',
            body: JSON.stringify(treatmentData)
        });
    }

    async updateTreatment(id, treatmentData) {
        return await this.request(`/treatments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(treatmentData)
        });
    }

    async approveTreatment(id) {
        return await this.request(`/treatments/${id}/approve`, {
            method: 'POST'
        });
    }

    // ============================================
    // Outcome Prediction APIs
    // ============================================

    async getPatientOutcomes(patientId) {
        return await this.request(`/outcomes/patient/${patientId}`);
    }

    async getOutcome(id) {
        return await this.request(`/outcomes/${id}`);
    }

    async createOutcome(outcomeData) {
        return await this.request('/outcomes', {
            method: 'POST',
            body: JSON.stringify(outcomeData)
        });
    }

    // ============================================
    // Dashboard APIs
    // ============================================

    async getDashboardStats() {
        return await this.request('/dashboard/stats');
    }

    async getRecentPatients(limit = 5) {
        return await this.request(`/dashboard/recent-patients?limit=${limit}`);
    }

    async getRecentAnalyses(limit = 5) {
        return await this.request(`/dashboard/recent-analyses?limit=${limit}`);
    }

    // ============================================
    // Audit Trail APIs
    // ============================================

    async getAuditLogs(page = 1, limit = 20) {
        return await this.request(`/audit?page=${page}&limit=${limit}`);
    }

    async getPatientAuditLogs(patientId) {
        return await this.request(`/audit/patient/${patientId}`);
    }

    async verifyBlockchain() {
        return await this.request('/audit/verify', {
            method: 'POST'
        });
    }

    // ============================================
    // File Upload APIs
    // ============================================

    async uploadFile(file, patientId = null) {
        const formData = new FormData();
        formData.append('file', file);
        if (patientId) {
            formData.append('patientId', patientId);
        }

        return await this.request('/uploads', {
            method: 'POST',
            body: formData,
            isFormData: true
        });
    }

    async uploadMultipleFiles(files, patientId = null) {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        if (patientId) {
            formData.append('patientId', patientId);
        }

        return await this.request('/uploads/multiple', {
            method: 'POST',
            body: formData,
            isFormData: true
        });
    }
}

// Create global API client instance
const api = new APIClient();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, api };
}
