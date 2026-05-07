const PDFDocument = require('pdfkit');

/**
 * Generates a professional Daily Plan PDF for the patient.
 */
function generateDailyPlanPDF(patient, tasks, res) {
    const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        info: {
            Title: `Daily Plan - ${patient.firstName} ${patient.lastName}`,
            Author: 'RESONANCE AI Care System'
        }
    });

    // --- COLORS ---
    const COLORS = {
        primary: '#5B6FF6',   // Indigo
        secondary: '#21D4BD', // Teal
        dark: '#071033',      // Deep Navy
        slate: '#64748B',     // Muted Text
        lightBg: '#F8FAFC',   // Light Slate
        morning: '#F59E0B',   // Amber
        afternoon: '#00F0FF', // Cyan
        evening: '#7C5CFF'    // Purple
    };

    // --- HEADER ---
    doc.rect(0, 0, doc.page.width, 100).fill(COLORS.dark);
    
    doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('RESONANCE AI', 50, 35);
    doc.fontSize(10).font('Helvetica').text('ONCOLOGY CARE NETWORK', 50, 60);
    
    doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text('DAILY WELLNESS PLAN', 350, 40, { align: 'right' });
    doc.fontSize(10).font('Helvetica').text(`Issued: ${new Date().toLocaleDateString()}`, 350, 60, { align: 'right' });

    // --- PATIENT INFO BOX ---
    doc.moveDown(5);
    doc.roundedRect(50, 120, 495, 60, 8).fill(COLORS.lightBg);
    doc.fillColor(COLORS.dark).fontSize(12).font('Helvetica-Bold').text(`${patient.firstName} ${patient.lastName}`, 65, 135);
    doc.fillColor(COLORS.slate).fontSize(10).font('Helvetica').text(`MRN: ${patient.mrn}  |  Diagnosis: ${patient.diagnosis}`, 65, 155);

    let currentY = 200;

    // --- TASKS ---
    const TIME_THEMES = {
        morning: { color: COLORS.morning, label: 'GOLDEN MORNING' },
        afternoon: { color: COLORS.afternoon, label: 'VIBRANT AFTERNOON' },
        evening: { color: COLORS.evening, label: 'DEEP EVENING' }
    };

    ['morning', 'afternoon', 'evening'].forEach(time => {
        const timeTasks = tasks.filter(t => t.timeOfDay === time);
        if (timeTasks.length > 0) {
            // Section Header
            doc.fillColor(TIME_THEMES[time].color).fontSize(11).font('Helvetica-Bold').text(TIME_THEMES[time].label, 50, currentY);
            currentY += 15;
            doc.moveTo(50, currentY).lineTo(545, currentY).strokeColor(TIME_THEMES[time].color).lineWidth(1).stroke();
            currentY += 20;

            timeTasks.forEach(task => {
                // Check height to prevent overlap or page break issues
                if (currentY > 700) {
                    doc.addPage();
                    currentY = 50;
                }

                // Task Title
                doc.fillColor(COLORS.dark).fontSize(12).font('Helvetica-Bold').text('□', 50, currentY);
                doc.text(task.title, 70, currentY);
                currentY += 18;

                // Description
                doc.fillColor(COLORS.dark).fontSize(10).font('Helvetica').text(task.description, 70, currentY, { width: 475 });
                const descHeight = doc.heightOfString(task.description, { width: 475 });
                currentY += descHeight + 10;

                // Why It Matters (Insight Box)
                doc.rect(70, currentY, 475, 30).fill(COLORS.lightBg);
                doc.fillColor(COLORS.secondary).fontSize(9).font('Helvetica-Bold').text('INSIGHT:', 80, currentY + 10);
                doc.fillColor(COLORS.slate).fontSize(9).font('Helvetica-Oblique').text(task.whyItMatters, 130, currentY + 10, { width: 400 });
                currentY += 45;
            });
            doc.moveDown();
            currentY += 10;
        }
    });

    // --- FOOTER ---
    const footerY = 750;
    doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor(COLORS.slate).lineWidth(0.5).stroke();
    doc.fontSize(8).fillColor(COLORS.slate).font('Helvetica').text('DISCLAIMER: This plan is tailored specifically to your clinical profile and is here to support—not replace—your oncologist\'s advice. Always consult your care team before implementing changes.', 50, footerY + 15, { align: 'center', width: 495 });

    doc.pipe(res);
    doc.end();
}

/**
 * Generates a high-fidelity Lifestyle Report PDF for the doctor.
 */
function generateLifestyleReportPDF(patient, history, alerts, res) {
    const doc = new PDFDocument({ 
        margin: 50, 
        size: 'A4',
        info: {
            Title: `Lifestyle Report - ${patient.firstName} ${patient.lastName}`,
            Author: 'RESONANCE AI Care System'
        }
    });

    const COLORS = {
        primary: '#5B6FF6',
        secondary: '#21D4BD',
        dark: '#071033',
        slate: '#64748B',
        lightBg: '#F8FAFC',
        danger: '#EF4444',
        warning: '#F59E0B'
    };

    // --- HEADER ---
    doc.rect(0, 0, doc.page.width, 100).fill(COLORS.dark);
    doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('RESONANCE AI', 50, 35);
    doc.fontSize(10).font('Helvetica').text('CLINICAL INTELLIGENCE UNIT', 50, 60);
    
    // Increased width for the title to prevent wrapping
    doc.fontSize(16).text('PATIENT LIFESTYLE REPORT', 250, 40, { width: 295, align: 'right' });
    doc.fontSize(10).font('Helvetica').text(`Range: Last 30 Days | ${new Date().toLocaleDateString()}`, 250, 60, { width: 295, align: 'right' });

    // --- CLINICAL SUMMARY HEADER ---
    doc.moveDown(5);
    doc.fillColor(COLORS.dark).fontSize(14).font('Helvetica-Bold').text(`Clinical Review: ${patient.firstName} ${patient.lastName}`, 50, 120, { width: 495 });
    doc.fillColor(COLORS.slate).fontSize(10).font('Helvetica').text(`MRN: ${patient.mrn}  |  Primary Diagnosis: ${patient.diagnosis}  |  KPS: ${patient.kps || 'N/A'}`, 50, 140, { width: 495 });

    // --- DASHBOARD WIDGETS ---
    const avgAdherence = history.length > 0 
        ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length) 
        : 0;

    // Adherence Card
    doc.roundedRect(50, 165, 240, 70, 8).fill(COLORS.lightBg);
    doc.fillColor(COLORS.slate).fontSize(9).font('Helvetica-Bold').text('OVERALL ADHERENCE', 65, 180);
    doc.fillColor(avgAdherence > 75 ? COLORS.secondary : (avgAdherence > 40 ? COLORS.warning : COLORS.danger))
       .fontSize(24).font('Helvetica-Bold').text(`${avgAdherence}%`, 65, 195);
    
    // Status Card
    doc.roundedRect(305, 165, 240, 70, 8).fill(COLORS.lightBg);
    doc.fillColor(COLORS.slate).fontSize(9).font('Helvetica-Bold').text('CRITICAL ALERTS', 320, 180);
    doc.fillColor(alerts.length > 0 ? COLORS.danger : COLORS.secondary)
       .fontSize(24).font('Helvetica-Bold').text(alerts.length.toString(), 320, 195);
    doc.fontSize(10).fillColor(COLORS.slate).font('Helvetica').text('Events requiring attention', 350, 205);

    let currentY = 260;

    // --- CRITICAL ALERTS & TRENDS ---
    if (alerts.length > 0) {
        doc.fillColor(COLORS.danger).fontSize(11).font('Helvetica-Bold').text('CRITICAL ALERTS & CLINICAL TRENDS', 50, currentY);
        currentY += 15;
        doc.moveTo(50, currentY).lineTo(545, currentY).strokeColor(COLORS.danger).lineWidth(1).stroke();
        currentY += 15;

        alerts.slice(0, 5).forEach(alert => {
            doc.roundedRect(50, currentY, 495, 35, 4).fill('rgba(239, 68, 68, 0.05)');
            doc.fillColor(COLORS.danger).fontSize(9).font('Helvetica-Bold').text(new Date(alert.timestamp).toLocaleDateString(), 60, currentY + 12);
            doc.fillColor(COLORS.dark).fontSize(9).font('Helvetica').text(alert.message, 120, currentY + 12, { width: 410 });
            currentY += 40;
        });
        currentY += 10;
    }

    // --- ACTIVITY LOG TABLE ---
    doc.fillColor(COLORS.primary).fontSize(11).font('Helvetica-Bold').text('30-DAY ADHERENCE LOG', 50, currentY);
    currentY += 15;
    doc.moveTo(50, currentY).lineTo(545, currentY).strokeColor(COLORS.primary).lineWidth(1).stroke();
    currentY += 15;

    // Table Header
    doc.fillColor(COLORS.slate).fontSize(9).font('Helvetica-Bold');
    doc.text('DATE', 60, currentY);
    doc.text('ADHERENCE SCORE', 160, currentY);
    doc.text('TASKS COMPLETED', 300, currentY);
    doc.text('STATUS', 450, currentY);
    currentY += 15;
    doc.moveTo(50, currentY).lineTo(545, currentY).strokeColor(COLORS.lightBg).lineWidth(0.5).stroke();
    currentY += 10;

    history.forEach((day, index) => {
        if (currentY > 750) {
            doc.addPage();
            currentY = 50;
        }

        if (index % 2 === 0) doc.rect(50, currentY - 5, 495, 20).fill(COLORS.lightBg);
        
        doc.fillColor(COLORS.dark).fontSize(9).font('Helvetica').text(day.date, 60, currentY);
        doc.text(`${day.score}%`, 160, currentY);
        doc.text(`${day.tasks.completed} / ${day.tasks.total}`, 300, currentY);
        
        const status = day.score > 80 ? 'EXCELLENT' : (day.score > 50 ? 'STABLE' : 'LOW');
        doc.fillColor(day.score > 80 ? COLORS.secondary : (day.score > 50 ? COLORS.warning : COLORS.danger))
           .font('Helvetica-Bold').text(status, 450, currentY);
        
        currentY += 20;
    });

    // --- FOOTER ---
    doc.fontSize(8).fillColor(COLORS.slate).font('Helvetica').text('RESONANCE AI - Proprietary Clinical Data. This report is intended for medical professionals only.', 50, 780, { align: 'center', width: 495 });

    doc.pipe(res);
    doc.end();
}

module.exports = { generateDailyPlanPDF, generateLifestyleReportPDF };