const pdfLibrary = require('pdf-parse');
if (pdfLibrary.PDFParse) {
    console.log('Prototype methods:', Object.getOwnPropertyNames(pdfLibrary.PDFParse.prototype));
}
