const pdfLibrary = require('pdf-parse');
console.log('Type:', typeof pdfLibrary);
console.log('Keys:', Object.keys(pdfLibrary));

if (pdfLibrary.default) {
    console.log('Default export keys:', Object.keys(pdfLibrary.default));
}
