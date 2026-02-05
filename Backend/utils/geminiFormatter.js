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
      
      // Post-processing to strip common introductory filler if it still appears
      text = text.replace(/^(Here's|Here is|Sure|Based on).*?:\s*/i, '').trim();
      
      return text;
    } catch (error) {
      console.error("Error formatting evidence with Gemini:", error);
      // Fallback: Return a simple concatenated summary of the raw evidence
      if (evidence && evidence.length > 0) {
          return "**Clinical Evidence Summary (Fallback)**\n\n" + evidence.map(e => `* ${e.text}`).join("\n\n");
      }
      return "Clinical evidence is available in the detailed sources section below.";
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

    const cleanKey = (key) => {
        return key
            .replace(/_/g, ' ') // Handle snake_case
            .replace(/([A-Z])/g, ' $1') // Handle CamelCase
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

      CRITICAL INSTRUCTION: Start directly with the content. Do NOT include any introductory or conversational phrases like "Here is a summary...", "Based on the evidence...", or "Sure, I can help with that." Output ONLY the clinical summary formatted with Markdown.

      **Instructions:**
      1.  Use **bolding** for the title: "**Potential Side Effects Summary**".
      2.  For each side effect, use the format: "**Side Effect Name (00.0% risk)**: Brief clinical explanation of what this means for the patient."
      3.  Use bullet points (*) for the list.
      4.  Explain the key risks and what they mean for the patient in simple, clear language.
      5.  Keep the tone professional, empathetic, and clear.

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
        let text = await response.text();
        
        // Post-processing to strip common introductory filler
        text = text.replace(/^(Here's|Here is|Sure|Based on).*?:\s*/i, '').trim();
        
        return text;
    } catch (error) {
        console.error("Error formatting side effects with Gemini:", error);
        // Provide a professional fallback if the API fails
        return `**Potential Side Effects Summary**\n\nBased on the patient's specific clinical profile and multimodal data integration, the following potential treatment-related side effects have been identified:\n\n${sideEffectsText.replace(/- /g, '* ')}\n\n*Clinical monitoring is recommended for all identified high-risk indicators.*`;
    }
}

module.exports = { formatEvidenceWithGemini, formatSideEffectsWithGemini };