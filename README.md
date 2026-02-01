# RESONANCE - AI-Driven Personalized Cancer Treatment Planning System

A comprehensive full-stack application for personalized cancer treatment planning using multimodal AI analysis.

## 🚀 Features

- **Multimodal AI Analysis**: MRI segmentation, genomic biomarker interpretation, and histopathology NLP
- **Treatment Optimization**: Evidence-based protocol recommendations aligned with NCCN/EANO guidelines
- **Outcome Prediction**: Survival forecasting (OS/PFS) and side-effect risk modeling
- **3D Visualization**: Interactive tumor visualization with AR/VR support
- **Explainable AI**: SHAP-based feature importance and Grad-CAM visualizations
- **Blockchain Audit Trail**: Immutable record keeping with data provenance tracking
- **Role-Based Access Control**: Separate interfaces for oncologists, patients, and researchers

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - Or use MongoDB Atlas (cloud database) - [Sign up](https://www.mongodb.com/cloud/atlas)
- **npm** (comes with Node.js)

## 🛠️ Installation

### 1. Clone or Navigate to Project Directory

```bash
cd "c:\Users\Adity\OneDrive\Documents\congress\Techfista Hackathon"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

The `.env` file is already created with default values. Update if needed:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/neuroOnco-ai
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=30d
```

**For MongoDB Atlas (Cloud Database):**
Replace `MONGO_URI` with your Atlas connection string:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/neuroOnco-ai
```

### 4. Start MongoDB (if using local installation)

**Windows:**
```bash
# MongoDB should start automatically as a service
# Or manually start it:
mongod
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
# Or
brew services start mongodb-community
```

## 🚀 Running the Application

### Development Mode (with auto-restart)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The application will be available at:
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 👤 User Accounts

### Creating Your First Account

1. Navigate to http://localhost:5000
2. Click "Create Account" on the login page
3. Fill in your details and select a role:
   - **Oncologist**: Full access to patient management and treatment planning
   - **Researcher**: Access to AI models, explainability tools, and audit trails
   - **Admin**: Full system access

### Default Test Account (Optional)

You can create a test account via the registration page or use the API:

```bash
# Using curl (Windows PowerShell)
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"name":"Dr. Test User","email":"test@example.com","password":"test123","role":"oncologist"}'
```

## 📁 Project Structure

```
Techfista Hackathon/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/              # Request handlers
│   ├── authController.js
│   ├── patientController.js
│   ├── analysisController.js
│   ├── treatmentController.js
│   ├── outcomeController.js
│   ├── auditController.js
│   ├── dashboardController.js
│   └── uploadController.js
├── middleware/               # Express middleware
│   ├── auth.js              # JWT authentication
│   └── errorHandler.js      # Error handling
├── models/                   # Mongoose schemas
│   ├── User.js
│   ├── Patient.js
│   ├── Analysis.js
│   ├── TreatmentPlan.js
│   ├── OutcomePrediction.js
│   └── AuditLog.js
├── routes/                   # API routes
│   ├── auth.js
│   ├── patients.js
│   ├── analyses.js
│   ├── treatments.js
│   ├── outcomes.js
│   ├── audit.js
│   ├── dashboard.js
│   └── uploads.js
├── utils/                    # Utility functions
│   ├── generateToken.js
│   └── aiSimulator.js
├── uploads/                  # Uploaded files
├── Frontend Files:
│   ├── index.html           # Landing page
│   ├── login.html           # Authentication
│   ├── dashboard.html       # Main dashboard
│   ├── patient-intake.html  # Patient registration
│   ├── mri-analysis.html    # MRI analysis
│   ├── genomic-analysis.html
│   ├── histopathology.html
│   ├── treatment-plan.html
│   ├── outcome-prediction.html
│   ├── pathway-simulator.html
│   ├── tumor-3d.html
│   ├── explainability.html
│   ├── blockchain-audit.html
│   ├── styles.css           # Global styles
│   ├── app.js               # Frontend logic
│   └── api-client.js        # API communication
├── server.js                 # Express server
├── package.json
└── .env                      # Environment variables
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get single patient
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Analyses
- `GET /api/analyses/patient/:patientId` - Get patient analyses
- `GET /api/analyses/:id` - Get single analysis
- `POST /api/analyses` - Create analysis
- `POST /api/analyses/:id/process` - Process analysis with AI
- `PUT /api/analyses/:id` - Update analysis

### Treatment Plans
- `GET /api/treatments/patient/:patientId` - Get patient treatments
- `GET /api/treatments/:id` - Get single treatment
- `POST /api/treatments` - Generate treatment plan
- `PUT /api/treatments/:id` - Update treatment
- `POST /api/treatments/:id/approve` - Approve treatment

### Outcomes
- `GET /api/outcomes/patient/:patientId` - Get patient outcomes
- `GET /api/outcomes/:id` - Get single outcome
- `POST /api/outcomes` - Generate outcome prediction

### Dashboard
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/recent-patients` - Get recent patients
- `GET /api/dashboard/recent-analyses` - Get recent analyses

### Audit Trail
- `GET /api/audit` - Get all audit logs
- `GET /api/audit/patient/:patientId` - Get patient audit logs
- `POST /api/audit/verify` - Verify blockchain integrity

### File Uploads
- `POST /api/uploads` - Upload single file
- `POST /api/uploads/multiple` - Upload multiple files

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for user passwords
- **Role-Based Access Control**: Different permissions for different user roles
- **CORS Protection**: Cross-origin resource sharing configuration
- **Helmet Security Headers**: HTTP security headers
- **Input Validation**: Request validation and sanitization
- **Blockchain Audit Trail**: Immutable logging with hash chaining

## 🧪 Testing the Application

### 1. Create a User Account
Navigate to http://localhost:5000 and register

### 2. Create a Patient
Go to "New Case" and fill in patient details

### 3. Run an Analysis
Upload MRI scans or genomic data and process with AI

### 4. Generate Treatment Plan
Based on analysis results, generate personalized treatment recommendations

### 5. View Outcome Predictions
See survival forecasts and side-effect predictions

### 6. Check Audit Trail
View the blockchain-verified audit trail of all actions

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env` file
- For Atlas, verify network access and credentials

### Port Already in Use
- Change PORT in `.env` file to a different number (e.g., 5001)
- Or kill the process using port 5000

### Authentication Issues
- Clear browser localStorage and cookies
- Re-register or login again
- Check JWT_SECRET in `.env` file

### File Upload Errors
- Ensure `uploads/` directory exists
- Check file size limits (default: 100MB)
- Verify file type is allowed (images, PDFs, DICOM, NIfTI)

## 📝 Development Notes

- The AI processing is currently simulated with mock data
- In production, integrate with real AI models for MRI segmentation, genomic analysis, etc.
- Replace mock data generators in `utils/aiSimulator.js` with actual model inference
- Consider adding rate limiting for production deployment
- Set up proper logging and monitoring

## 🤝 Contributing

This is a demonstration project for the Techfista Hackathon. For production use:
1. Integrate real AI models
2. Add comprehensive testing
3. Implement proper error logging
4. Set up CI/CD pipeline
5. Add API documentation (Swagger/OpenAPI)
6. Implement data backup strategies

## 📄 License

MIT License - See LICENSE file for details

## ⚠️ Disclaimer

This system is for demonstration purposes only. Not for clinical use without proper validation and regulatory approval.

## 📧 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for advancing personalized cancer treatment**
