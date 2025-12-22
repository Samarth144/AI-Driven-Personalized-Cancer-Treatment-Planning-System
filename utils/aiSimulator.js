// AI Processing Simulator
// Simulates AI model processing for various analysis types

const generateMockAnalysis = (type, inputData = {}) => {
    const generators = {
        mri: () => ({
            tumorVolume: (Math.random() * 50 + 10).toFixed(2),
            tumorLocation: ['Frontal Lobe', 'Temporal Lobe', 'Parietal Lobe', 'Occipital Lobe'][Math.floor(Math.random() * 4)],
            edemaVolume: (Math.random() * 30 + 5).toFixed(2),
            segmentationConfidence: (Math.random() * 20 + 80).toFixed(1),
            radiomics: {
                sphericity: (Math.random() * 0.3 + 0.7).toFixed(3),
                compactness: (Math.random() * 0.4 + 0.6).toFixed(3),
                surfaceArea: (Math.random() * 1000 + 500).toFixed(2),
                texture: {
                    contrast: (Math.random() * 100).toFixed(2),
                    correlation: (Math.random()).toFixed(3),
                    energy: (Math.random()).toFixed(3),
                    homogeneity: (Math.random()).toFixed(3)
                }
            },
            tumorGrade: ['Grade II', 'Grade III', 'Grade IV'][Math.floor(Math.random() * 3)],
            enhancementPattern: ['Ring-enhancing', 'Heterogeneous', 'Homogeneous', 'Non-enhancing'][Math.floor(Math.random() * 4)]
        }),

        genomic: () => ({
            idh1: Math.random() > 0.5 ? 'Mutant' : 'Wild-type',
            mgmt: Math.random() > 0.5 ? 'Methylated' : 'Unmethylated',
            atrx: Math.random() > 0.5 ? 'Mutant' : 'Wild-type',
            codeletion1p19q: Math.random() > 0.7 ? 'Present' : 'Absent',
            tp53: Math.random() > 0.6 ? 'Mutant' : 'Wild-type',
            egfr: Math.random() > 0.4 ? 'Amplified' : 'Normal',
            treatmentSensitivity: {
                temozolomide: (Math.random() * 40 + 60).toFixed(1),
                radiation: (Math.random() * 30 + 70).toFixed(1),
                immunotherapy: (Math.random() * 50 + 30).toFixed(1),
                bevacizumab: (Math.random() * 40 + 40).toFixed(1)
            },
            molecularSubtype: ['Proneural', 'Classical', 'Mesenchymal', 'Neural'][Math.floor(Math.random() * 4)]
        }),

        histopathology: () => ({
            whoGrade: ['Grade I', 'Grade II', 'Grade III', 'Grade IV'][Math.floor(Math.random() * 4)],
            histologicalType: ['Glioblastoma', 'Astrocytoma', 'Oligodendroglioma', 'Mixed Glioma'][Math.floor(Math.random() * 4)],
            cellularity: (Math.random() * 40 + 60).toFixed(1),
            necrosisPresent: Math.random() > 0.5,
            necrosisPercentage: Math.random() > 0.5 ? (Math.random() * 30 + 5).toFixed(1) : '0',
            mitoses: Math.floor(Math.random() * 20),
            ki67Index: (Math.random() * 40 + 10).toFixed(1),
            vascularProliferation: Math.random() > 0.6,
            infiltrationPattern: ['Diffuse', 'Focal', 'Multifocal'][Math.floor(Math.random() * 3)]
        }),

        treatment: (patientData) => ({
            recommendedProtocol: ['Surgery + RT + TMZ', 'Surgery + RT', 'RT + TMZ', 'Surgery Only', 'Concurrent Chemoradiation'][Math.floor(Math.random() * 5)],
            confidence: (Math.random() * 15 + 85).toFixed(1),
            alternativeOptions: [
                {
                    protocol: 'Surgery + RT',
                    confidence: (Math.random() * 20 + 70).toFixed(1),
                    rationale: 'Alternative approach with reduced toxicity'
                },
                {
                    protocol: 'RT + TMZ',
                    confidence: (Math.random() * 20 + 60).toFixed(1),
                    rationale: 'Non-surgical option for inoperable cases'
                }
            ],
            guidelineAlignment: ['NCCN', 'EANO'][Math.floor(Math.random() * 2)],
            rationale: 'Based on tumor characteristics, molecular profile, and patient performance status'
        }),

        outcome: () => ({
            overallSurvival: {
                median: Math.floor(Math.random() * 24 + 12),
                range: {
                    min: Math.floor(Math.random() * 12 + 6),
                    max: Math.floor(Math.random() * 36 + 24)
                },
                confidence: (Math.random() * 15 + 80).toFixed(1)
            },
            progressionFreeSurvival: {
                median: Math.floor(Math.random() * 12 + 6),
                range: {
                    min: Math.floor(Math.random() * 6 + 3),
                    max: Math.floor(Math.random() * 18 + 12)
                },
                confidence: (Math.random() * 15 + 80).toFixed(1)
            },
            sideEffects: {
                fatigue: (Math.random() * 40 + 30).toFixed(1),
                nausea: (Math.random() * 30 + 20).toFixed(1),
                cognitiveImpairment: (Math.random() * 25 + 15).toFixed(1),
                hematologicToxicity: (Math.random() * 20 + 10).toFixed(1)
            },
            qualityOfLife: {
                score: (Math.random() * 20 + 60).toFixed(1),
                timeline: Array.from({ length: 12 }, (_, i) => ({
                    month: i + 1,
                    score: (Math.random() * 30 + 60).toFixed(1)
                }))
            }
        })
    };

    return generators[type] ? generators[type](inputData) : {};
};

const simulateProcessing = (duration = 2000) => {
    return new Promise(resolve => setTimeout(resolve, duration));
};

module.exports = {
    generateMockAnalysis,
    simulateProcessing
};
