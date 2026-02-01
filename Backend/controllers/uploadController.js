const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const axios = require('axios');

const uploadHistopathologyReport = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const filePath = req.file.path;

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
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
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('AI Engine Response:', error.response.data);
      return res.status(500).json({ message: 'Error from AI engine.', details: error.response.data });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(500).json({ message: 'AI engine did not respond.' });
    }
    // Something happened in setting up the request that triggered an Error
    res.status(500).json({ message: 'Error processing PDF file.' });
  }
};

module.exports = {
  uploadHistopathologyReport,
};
