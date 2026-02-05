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
    model: "gemini-2.5-flash", // Using a stable model
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096 // Increased token limit
    }
  });

  const allEvidenceText = evidence.map(e => e.text).join("\n\n---\n\n");

  const prompt = `
    You are an expert medical AI assistant. You will be provided with raw clinical evidence from various sources.
    Your task is to synthesize this evidence into a concise, patient-friendly summary.

    Focus on explaining the key findings and their implications in simple, clear language.
    Do NOT generate a treatment plan or recommendations. Only summarize the provided evidence.
    Avoid quoting directly from the source material.

    Here is the clinical evidence to summarize:
    ${allEvidenceText}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    return text;
  } catch (error) {
    console.error("Error formatting evidence with Gemini:", error);
    throw new Error("Failed to format evidence using Gemini API.");
  }
}

/**
 * Formats a dictionary of side effects into a human-readable summary using the Gemini API.
 * @param {object} sideEffects - A dictionary of side effects and their risk percentages.
 * @param {object} patientData - The patient's data to provide context.
 * @returns {Promise<string>} The formatted side effects summary as a text string.
 */
async function formatSideEffectsWithGemini(sideEffects, patientData) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY missing");
    }

    if (typeof sideEffects !== 'object' || Object.keys(sideEffects).length === 0) {
        return "No side effect data provided for formatting.";
    }

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash", // Using a stable model
        generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 4096
        }
    });

    const sideEffectsText = Object.entries(sideEffects)
        .map(([key, value]) => `- ${key.replace(/([A-Z])/g, ' $1').trim()}: ${value}% risk`)
        .join('\n');

    const prompt = `
      You are an expert oncology AI assistant. You will be provided with a patient's clinical data and a list of predicted treatment side effect risks.
      Your task is to synthesize this information into a concise, well-formatted summary suitable for a clinical dashboard.

      **Instructions:**
      1.  Start with a brief introductory sentence.
      2.  Use markdown for clarity:
          - Use **bolding** for the title like "**Potential Side Effects Summary**".
          - Use bullet points (\`*\`) for the list of side effects.
      3.  After the list, provide a short, easy-to-understand paragraph that explains the key risks and what they mean for the patient.
      4.  Keep the tone professional, empathetic, and clear.

      **Patient Data:**
      \`\`\`json
      ${JSON.stringify(patientData, null, 2)}
      \`\`\`

      **Predicted Side Effect Risks:**
      ${sideEffectsText}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        return text;
    } catch (error) {
        console.error("Error formatting side effects with Gemini:", error);
        // Provide a simple fallback if the API fails
        return `**Potential Side Effects Summary**\n\nBased on the patient's clinical profile, the following potential side effects have been identified:\n\n${sideEffectsText.replace(/- /g, '* ')}`;
    }
}

module.exports = { formatEvidenceWithGemini, formatSideEffectsWithGemini };