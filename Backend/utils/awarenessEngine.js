const { OpenAI } = require("openai");

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/**
 * Generates a hyper-personalized daily to-do list using Groq.
 */
async function generateDailyTasks(patient, questionnaire, yesterdayLog = null) {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY missing");
    }

    const clinicalSummary = `
      - Diagnosis: ${patient.diagnosis}
      - Cancer Type: ${patient.cancerType}
      - KPS: ${patient.kps}
      - Core Symptoms: ${Array.isArray(patient.symptoms) ? patient.symptoms.join(', ') : 'None'}
      - Comorbidities: ${Array.isArray(patient.comorbidities) ? patient.comorbidities.join(', ') : 'None'}
    `;

    const morningBaseline = `
      - TODAY'S STATUS:
        * Fuel/Nutrition: ${questionnaire.fuelStatus} (${questionnaire.fuelComment || 'No comment'})
        * Symptoms Reported: ${questionnaire.symptoms || 'None reported'}
        * Energy Level: ${questionnaire.energyLevel}/5
    `;

    const trendContext = yesterdayLog ? `
      - YESTERDAY'S MONITORING (TREND ANALYSIS):
        * Yesterday's Energy: ${yesterdayLog.energyLevel}/5
        * Yesterday's Symptoms: ${yesterdayLog.symptoms || 'None'}
        * Yesterday's Fuel: ${yesterdayLog.fuelStatus}
    ` : `
      - YESTERDAY'S MONITORING (GENERIC BASELINE - USE FOR INITIAL CALIBRATION):
        * Yesterday's Energy: 3/5
        * Yesterday's Symptoms: Baseline stable, mild fatigue
        * Yesterday's Fuel: good
    `;

    const prompt = `
    ROLE: You are a Lead Oncology Nurse and Care Coordinator.
    TASK: Generate a 100% personalized daily wellness plan for a cancer patient.
    STRICTNESS: You MUST NOT provide generic advice. Every task MUST be a direct reaction to the patient's clinical profile, today's assessment, and the trend from yesterday.

    LOGIC CONSTRAINTS (MANDATORY):
    1. TREND ANALYSIS: Compare TODAY'S STATUS vs YESTERDAY'S MONITORING.
       - If symptoms are worsening (e.g., pain yesterday was "mild", today is "moderate"), increase "Critical" monitoring tasks.
       - If energy is declining, remove physical tasks and replace with rest/recovery.
    2. NUTRITIONAL REACTIVITY:
       - If fuelStatus is "struggling", tasks MUST focus on high-calorie liquids, anti-emetic timing, or "small-bite" strategies.
    3. CLINICAL ADAPTATION:
       - Adjust tasks based on Diagnosis and KPS. A patient with KPS 50 cannot have a "10-minute walk" task; they need "bedside mobility".
    4. SAFETY:
       - If "red flag" symptoms appear in today's assessment, the first task MUST be a specific monitoring or "contact care team" instruction.

    OUTPUT FORMAT: Return ONLY a strict JSON object. No preamble.
    {
      "morning": [taskObj],
      "afternoon": [taskObj],
      "evening": [taskObj]
    }
    taskObj: { "title": string, "description": string, "whyItMatters": string, "isCritical": boolean }

    PATIENT DATA:
    ${clinicalSummary}
    ${morningBaseline}
    ${trendContext}

    LANGUAGE: Empathetic, precise, and authoritative.
    `;

    try {
        const response = await groq.chat.completions.create({
            model: GROQ_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1, // Lower temperature for stricter adherence to logic
            response_format: { type: "json_object" }
        });

        const parsed = JSON.parse(response.choices[0].message.content);
        return parsed;
        
    } catch (error) {
        console.error("Error generating daily tasks with Groq:", error);
        // Fallback tasks if AI fails
        return {
            morning: [{ title: "Morning Hydration", description: "Drink 500ml of water", whyItMatters: "Stay hydrated for treatment", isCritical: true }],
            afternoon: [{ title: "Light Walk", description: "10 minute gentle walk", whyItMatters: "Maintain mobility", isCritical: false }],
            evening: [{ title: "Rest & Reflect", description: "Prepare for sleep", whyItMatters: "Recovery is key", isCritical: false }]
        };
    }
}

module.exports = { generateDailyTasks };