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

module.exports = { formatEvidenceWithGemini };
