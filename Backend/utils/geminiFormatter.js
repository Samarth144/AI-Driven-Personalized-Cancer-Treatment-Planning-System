const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Formats an array of evidence objects into a patient-friendly summary using the Gemini API.
 * @param {Array<object>} evidence - An array of evidence objects, each with a 'text' property.
 * @returns {Promise<string>} The formatted evidence as a text string.
 */
async function formatEvidenceWithGemini(evidence) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing");
  }

  if (!Array.isArray(evidence) || evidence.length === 0) {
    return "No specific evidence provided for formatting.";
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096
    }
  });

  const allEvidenceText = evidence.map(e => e.text).join("\n\n---\n\n");

  const prompt = `
    You are an expert medical AI assistant. You will be provided with raw clinical evidence from various sources.
    Your task is to synthesize this evidence into a concise, patient-friendly summary.

    CRITICAL INSTRUCTION: Start directly with the summary content. Do NOT include any introductory or conversational phrases like "Here is a summary...", "Based on the evidence...", or "Sure, I can help with that." Output ONLY the clinical facts formatted with Markdown.

    Focus on explaining the key findings and their implications in simple, clear language.
    Do NOT generate a treatment plan or recommendations. Only summarize the provided evidence.
    Avoid quoting directly from the source material. Use bullet points and bold headers for clarity.

    Here is the clinical evidence to summarize:
    ${allEvidenceText}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = await response.text();

    // Post-processing to strip common introductory filler
    text = text.replace(/^(Here's|Here is|Sure|Based on).*?:\s*/i, '').trim();

    return text;
  } catch (error) {
    console.error("Error formatting evidence with Gemini:", error);
    if (evidence && evidence.length > 0) {
      return "**Clinical Evidence Summary (Fallback)**\n\n" + evidence.map(e => `* ${e.text}`).join("\n\n");
    }
    return "Clinical evidence is available in the detailed sources section below.";
  }
}

/**
 * Formats a dictionary of side effects into a human-readable summary using the Gemini API.
 */
async function formatSideEffectsWithGemini(sideEffects, patientData) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing");
  }

  if (typeof sideEffects !== 'object' || Object.keys(sideEffects).length === 0) {
    return "No side effect data provided for formatting.";
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 4096
    }
  });

  const cleanKey = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const sideEffectsText = Object.entries(sideEffects)
    .map(([key, value]) => `- **${cleanKey(key)} (${value}% risk)**`)
    .join('\n');

  const prompt = `
      You are an expert oncology AI assistant. You will be provided with a patient's clinical data and a list of predicted treatment side effect risks.
      Your task is to synthesize this information into a concise, well-formatted summary suitable for a clinical dashboard.

      CRITICAL INSTRUCTION: Start directly with the content. Do NOT include any introductory or conversational phrases. Output ONLY the clinical summary formatted with Markdown.

      **Instructions:**
      1. Use **bolding** for the title: "**Potential Side Effects Summary**".
      2. For each side effect, use the format: "**Side Effect Name (00.0% risk)**: Brief clinical explanation."
      3. Use bullet points (*) for the list.

      **Patient Data:**
      ${JSON.stringify(patientData, null, 2)}

      **Predicted Side Effect Risks:**
      ${sideEffectsText}
    `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = await response.text();
    text = text.replace(/^(Here's|Here is|Sure|Based on).*?:\s*/i, '').trim();
    return text;
  } catch (error) {
    console.error("Error formatting side effects with Gemini:", error);
    return `**Potential Side Effects Summary**\n\n${sideEffectsText.replace(/- /g, '* ')}`;
  }
}

async function generatePathwayWithGemini(plan) {
  console.log("--- Starting generatePathwayWithGemini ---");
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing");
  }

  if (!plan) return [];

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const recommendedProtocol = plan.recommendedProtocol || (plan.planData && plan.planData.primary_treatment) || "Standard Protocol";
  const rationale = plan.rationale || (plan.planData && plan.planData.clinical_rationale) || "Standard clinical protocol.";
  const alternatives = plan.alternativeOptions || (plan.planData && plan.planData.alternatives) || [];

  const alternativesText = Array.isArray(alternatives)
    ? alternatives.map(o => typeof o === 'string' ? o : (o.protocol || o.treatment || "Alternative")).join(', ')
    : "None";

  const prompt = `
    You are an AI clinical pathway generator. Create a detailed 12-week timeline for:
    Protocol: ${recommendedProtocol}
    Rationale: ${rationale}
    Alternatives: ${alternativesText}

    Output ONLY a JSON array of objects with keys: "title", "duration", "description", "details" (string array), "marker" (emoji).
    Weeks 1 to 12.
    `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating pathway:", error);
    return [];
  }
}

async function generateDetailedSimulationPathway(inputs) {
  console.log("--- Starting generateDetailedSimulationPathway ---");
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro", generationConfig: { responseMimeType: "application/json" } });

  const prompt = `
    You are an expert oncology AI assistant. Generate a detailed, week-by-week treatment pathway simulation for a cancer patient based on the provided clinical inputs.
    
    The timeline must strictly follow these MEDICAL ACCURACY RULES:
    - Follow NCCN or standard oncology treatment timelines.
    - Chemotherapy cycles typically occur every 1–3 weeks.
    - Radiotherapy occurs 5 days/week for several weeks.
    - Surgery recovery typically takes 2–6 weeks.
    - Side effects must progress realistically based on the treatment.
    - Recovery improves gradually over time.

    INPUT DATA:
    Patient Information:
    - Age: ${inputs.age || 'N/A'}
    - Gender: ${inputs.gender || 'N/A'}
    - Cancer Type: ${inputs.cancerType || 'N/A'}
    - Tumor Location: ${inputs.tumorLocation || 'N/A'}
    - Tumor Size: ${inputs.tumorSize || 'N/A'}
    - Tumor Grade: ${inputs.tumorGrade || 'N/A'}
    - Stage: ${inputs.cancerStage || 'N/A'}

    Genomic / Biomarkers:
    - MGMT Status: ${inputs.mgmtStatus || 'N/A'}
    - EGFR Status: ${inputs.egfrStatus || 'N/A'}
    - IDH Mutation: ${inputs.idhStatus || 'N/A'}

    Treatment Plan:
    - Surgery: ${inputs.surgery || 'No'}
    - Chemotherapy: ${inputs.chemotherapy || 'None'}
    - Radiotherapy: ${inputs.radiotherapy || 'No'}
    - Targeted Therapy: ${inputs.targetedTherapy || 'None'}

    Simulation Duration:
    - Total weeks: ${inputs.numberOfWeeks || 12}

    OUTPUT REQUIREMENTS:
    Generate a strictly formatted JSON object containing a "simulation" array of objects.
    Each object in the array represents ONE WEEK of the pathway.
    Ensure "week" corresponds to the week number (1, 2, 3...) up to the total specified duration.

    JSON FORMAT STRICT REQUIREMENT:
    {
      "simulation": [
        {
          "week": 1,
          "treatment": {
            "drug_name": "String or N/A",
            "dose": "String or N/A",
            "radiation_session": "String or N/A",
            "surgery_recovery_stage": "String or N/A"
          },
          "condition": {
            "energy_level": "High | Medium | Low",
            "pain_level": "Low | Medium | High",
            "functional_ability": "String description"
          },
          "symptoms": ["String", "String"],
          "recovery_progress": {
            "tumor_response": "Shrinking | Stable | Monitoring | Growing",
            "body_recovery_percentage": "String like '10%'"
          },
          "recommendations": ["String", "String"],
          "risk_level": "Low | Medium | High",
          "summary": "String summary of the week"
        }
      ]
    }
    
    Return ONLY valid JSON.
    `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    console.log("Raw Gemini Detailed Simulation Response:", text);
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating detailed simulation:", error);
    return { simulation: [] };
  }
}

module.exports = {
  formatEvidenceWithGemini,
  formatSideEffectsWithGemini,
  generatePathwayWithGemini,
  generateDetailedSimulationPathway
};