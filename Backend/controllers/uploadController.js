const pdf = require('pdf-parse');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const uploadMRI = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ message: 'No files uploaded.' });
  }

  const uploadedFiles = {};
  
  // Iterate through the uploaded fields
  Object.keys(req.files).forEach(key => {
      const file = req.files[key][0];
      const relativePath = path.relative(path.join(__dirname, '..'), file.path);
      uploadedFiles[key] = relativePath.replace(/\\/g, '/'); // Normalize path
  });

  res.status(200).json({
      message: 'MRI scans uploaded successfully.',
      files: uploadedFiles
  });
};

const uploadHistopathologyReport = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const filePath = req.file.path;

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const extractedText = data.text;

    // Log the extracted text for debugging
    console.log('Extracted Text from PDF:', extractedText);

    // Send extracted text to AI engine for analysis
    const aiResponse = await axios.post('http://localhost:5000/process_report_text', {
      text: extractedText,
    });

    // Send the AI's response back to the frontend
    res.status(200).json({
      message: 'File uploaded and processed successfully by AI.',
      filename: req.file.filename,
      ...aiResponse.data,
    });
  } catch (error) {
    console.error('Error processing PDF or contacting AI engine:', error.message);
    if (error.response) {
      console.error('AI Engine Response:', error.response.data);
      return res.status(500).json({ message: 'Error from AI engine.', details: error.response.data });
    } else if (error.request) {
      return res.status(500).json({ message: 'AI engine did not respond.' });
    }
    res.status(500).json({ message: 'Error processing PDF file.' });
  }
};

module.exports = {
  uploadHistopathologyReport,
  uploadMRI
};