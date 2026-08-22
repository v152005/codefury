const geminiService = require("../services/geminiService");

/**
 * Handles generating simplified question descriptions using AI.
 */
const explain = async (req, res) => {
  try {
    const { question, language } = req.body;
    if (!question || !language) {
      return res.status(400).json({ error: "question and language fields are required." });
    }

    const explanation = await geminiService.explainQuestion(question, language);
    return res.status(200).json({ explanation });
  } catch (error) {
    console.error("AI Explain Controller Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Handles parsing user natural language responses using AI.
 */
const parse = async (req, res) => {
  try {
    const { field, question, response, language } = req.body;
    if (!field || !question || !response || !language) {
      return res.status(400).json({ error: "field, question, response, and language are all required." });
    }

    const parsedData = await geminiService.parseUserResponse(field, question, response, language);
    return res.status(200).json(parsedData);
  } catch (error) {
    console.error("AI Parse Controller Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Handles parsing OCR document text using AI.
 */
const parseDocument = async (req, res) => {
  try {
    const { documentType, ocrText, requiredFields } = req.body;
    if (!documentType || !ocrText || !requiredFields || !Array.isArray(requiredFields)) {
      return res.status(400).json({ error: "documentType, ocrText, and requiredFields (array) are required." });
    }

    const parsedData = await geminiService.parseDocumentText(documentType, ocrText, requiredFields);
    return res.status(200).json(parsedData);
  } catch (error) {
    console.error("AI Parse Document Controller Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  explain,
  parse,
  parseDocument,
};
