const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini client using key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "dummy_api_key_for_compilation";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Generates a simplified, accessible explanation for a question in the user's language.
 * @param {string} question - The original question label.
 * @param {string} language - Target language code ('en', 'hi', 'kn').
 * @returns {Promise<string>} The simplified explanation.
 */
const explainQuestion = async (question, language) => {
  if (!process.env.GEMINI_API_KEY) {
    return `Fallback Explanation: Please provide answers for ${question}.`;
  }

  const prompt = `
You are an accessibility assistant designed to help people with low digital literacy.
Explain the following question in simple, clear language:
Question: "${question}"
Preferred language of explanation: "${language}" (use code "en" for English, "hi" for Hindi, "kn" for Kannada).

Rules:
- Preserve the original meaning and context.
- Do not add any new requirements.
- Do not remove important constraints.
- Respond ONLY in the requested language. Do not output English if language is "kn" or "hi".
- Keep the explanation concise and direct (1-3 sentences maximum).
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return responseText.trim();
  } catch (error) {
    console.error("Gemini explainQuestion API error:", error);
    // Fallback to plain label explanation to ensure the form remains functional
    return `Please provide the requested information for: ${question}.`;
  }
};

/**
 * Attempts to parse a spoken date string and normalize it to YYYY-MM-DD.
 * Supports English and Kannada month names/digits.
 */
const tryNormalizeDate = (text) => {
  if (!text) return null;
  
  // Extract 4-digit year
  const yearMatch = text.match(/\b(19\d{2}|20\d{2})\b/);
  if (!yearMatch) return null;
  const year = parseInt(yearMatch[1]);

  // Extract day (1 to 31)
  const dayMatch = text.match(/\b([1-9]|[12]\d|3[01])(st|nd|rd|th)?\b/);
  const day = dayMatch ? parseInt(dayMatch[1]) : 1; // default to 1st

  // Extract month
  const lowerText = text.toLowerCase();
  const months = [
    { names: ["january", "jan", "ಜನವ", "जनव"], value: "01" },
    { names: ["february", "feb", "ಫೆ", "फ़र"], value: "02" },
    { names: ["march", "mar", "ಮಾರ್", "मार"], value: "03" },
    { names: ["april", "apr", "ಏಪ್ರಿ", "अप्"], value: "04" },
    { names: ["may", "ಮೇ", "मई"], value: "05" },
    { names: ["june", "jun", "ಜೂ", "जू"], value: "06" },
    { names: ["july", "jul", "ಜು", "जु"], value: "07" },
    { names: ["august", "aug", "ಆಗ", "अग"], value: "08" },
    { names: ["september", "sep", "ಸೆಪ್", "सित"], value: "09" },
    { names: ["october", "oct", "ಅಕ್", "अक्"], value: "10" },
    { names: ["november", "nov", "ನವೆ", "नव"], value: "11" },
    { names: ["december", "dec", "ಡಿಸೆ", "दिस"], value: "12" }
  ];
  
  let monthValue = "01";
  let matched = false;
  for (const m of months) {
    if (m.names.some(name => lowerText.includes(name))) {
      monthValue = m.value;
      matched = true;
      break;
    }
  }

  // Fallback to check if numeric date format like DD/MM/YYYY or DD-MM-YYYY is present
  if (!matched) {
    const numericMatch = text.match(/\b([1-9]|[12]\d|3[01])[-/]([1-9]|0[1-9]|1[0-2])[-/](19\d{2}|20\d{2})\b/);
    if (numericMatch) {
      const d = String(parseInt(numericMatch[1])).padStart(2, "0");
      const m = String(parseInt(numericMatch[2])).padStart(2, "0");
      const y = numericMatch[3];
      return `${y}-${m}-${d}`;
    }
  }

  const formattedDay = String(day).padStart(2, "0");
  return `${year}-${monthValue}-${formattedDay}`;
};

/**
 * Parses conversational transcript response and extracts structured value.
 * @param {string} field - The database field ID.
 * @param {string} question - The question asked.
 * @param {string} response - The user's spoken transcript.
 * @param {string} language - Preferred language code ('en', 'hi', 'kn').
 * @returns {Promise<object>} JSON schema containing { field, value, confidence, needsConfirmation, clarification }.
 */
const parseUserResponse = async (field, question, response, language) => {
  if (!response) {
    return {
      field,
      value: "",
      confidence: 1.0,
      needsConfirmation: false,
      clarification: ""
    };
  }

  const cleanResp = response.toLowerCase().trim();

  // Instant normalization for Yes/No / negative answers (like PPO number question)
  const negativeAnswers = [
    "no", "nope", "nah", "none", "don't have", "do not have", "no ppo", "no number", "not have",
    "nahi", "nahi hai", "na", "galat",
    "illa", "thappu", "beda", "nanage illa",
    "ಇಲ್ಲ", "ತಪ್ಪು", "ಬೇಡ", "ನನ್ನ ಬಳಿ ಇಲ್ಲ",
    "नहीं", "नहीं है", "ना"
  ];
  if (negativeAnswers.some(neg => cleanResp === neg || cleanResp.startsWith(neg))) {
    return {
      field,
      value: "No",
      confidence: 1.0,
      needsConfirmation: false,
      clarification: ""
    };
  }

  const affirmativeAnswers = [
    "yes", "yeah", "yep", "i have", "have", "yes i have", "yes have",
    "haan", "ha", "sahi", "theek", "ji haan",
    "haudu", "haudhu", "sari", "ide", "nanna bali ide",
    "ಹೌದು", "ಸರಿ", "ಇದೆ", "ನನ್ನ ಬಳಿ ಇದೆ",
    "हाँ", "हाँ है", "सही"
  ];
  if (affirmativeAnswers.some(aff => cleanResp === aff)) {
    return {
      field,
      value: "Yes",
      confidence: 1.0,
      needsConfirmation: false,
      clarification: ""
    };
  }

  // Pre-process date fields using local normalizer for absolute accuracy and zero latency
  if (field === "dateOfBirth" || question.toLowerCase().includes("date") || question.toLowerCase().includes("birth")) {
    const normalized = tryNormalizeDate(response);
    if (normalized) {
      return {
        field,
        value: normalized,
        confidence: 1.0,
        needsConfirmation: false,
        clarification: ""
      };
    }
  }

  if (!process.env.GEMINI_API_KEY) {
    return {
      field,
      value: response,
      confidence: 1.0,
      needsConfirmation: false,
      clarification: ""
    };
  }

  const prompt = `
You are an API designed to extract a structured field value from a user's conversational response.

Context:
Field Name: "${field}"
Question: "${question}"
User Transcript: "${response}"
User Language: "${language}" (en/hi/kn)

Task:
Extract the value for this field from the user transcript. Normalize dates to "YYYY-MM-DD" if possible.
You MUST respond with a JSON object containing:
{
  "field": "${field}",
  "value": "<extracted normalized value, or null if ambiguous or cannot extract>",
  "confidence": <float between 0.0 and 1.0 representing your extraction confidence>,
  "needsConfirmation": <boolean indicating if the value should be confirmed (true if confidence < 0.90 or response is ambiguous)>,
  "clarification": "<polite clarification question in user's language if value is null or needsConfirmation is true, otherwise empty string>"
}
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error("Gemini parseUserResponse API error:", error);
    let fallbackValue = response;
    if (field === "dateOfBirth" || question.toLowerCase().includes("date") || question.toLowerCase().includes("birth")) {
      const normalized = tryNormalizeDate(response);
      if (normalized) fallbackValue = normalized;
    }
    // Fallback to normalized response with 1.0 confidence so form can proceed
    return {
      field,
      value: fallbackValue,
      confidence: 1.0,
      needsConfirmation: false,
      clarification: ""
    };
  }
};

/**
 * Parses OCR document text and extracts the required fields using Gemini.
 * @param {string} documentType - The type of document (e.g. 'aadhaar', 'marksheet', 'ration_card').
 * @param {string} ocrText - The raw OCR text scanned from the document.
 * @param {Array<string>} requiredFields - The fields required to be extracted.
 * @returns {Promise<object>} Extraction result containing { documentType, fields, confidence }.
 */
const parseDocumentText = async (documentType, ocrText, requiredFields) => {
  if (!process.env.GEMINI_API_KEY) {
    const emptyFields = {};
    const defaultConfidence = {};
    requiredFields.forEach(f => {
      emptyFields[f] = null;
      defaultConfidence[f] = 0.0;
    });
    return {
      documentType,
      fields: emptyFields,
      confidence: defaultConfidence
    };
  }

  const prompt = `
You are a document parser designed to extract specific structured fields from OCR text.

Context:
Document Type: "${documentType}"
Required Fields to Extract: ${JSON.stringify(requiredFields)}
Raw OCR Text:
"""
${ocrText}
"""

Task:
Extract the value of the requested fields from the OCR text.
For each requested field, return its extracted normalized value (or null if it is missing or not present in the OCR text).
Normalize dates to "YYYY-MM-DD" if possible.
Normalize names to Title Case.

You MUST respond with a JSON object exactly containing:
{
  "documentType": "${documentType}",
  "fields": {
    // For each requested field:
    "fieldName": "extracted_value_or_null"
  },
  "confidence": {
    // For each requested field: a confidence float between 0.0 and 1.0 representing extraction accuracy
    "fieldName": 0.95
  }
}
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error("Gemini parseDocumentText API error:", error);
    const emptyFields = {};
    const defaultConfidence = {};
    requiredFields.forEach(f => {
      emptyFields[f] = null;
      defaultConfidence[f] = 0.0;
    });
    return {
      documentType,
      fields: emptyFields,
      confidence: defaultConfidence
    };
  }
};

module.exports = {
  explainQuestion,
  parseUserResponse,
  parseDocumentText,
};
