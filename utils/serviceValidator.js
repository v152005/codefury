/**
 * Validates submitted answers against a service questions schema.
 * @param {Array} questions - Array of question definitions from the service schema.
 * @param {object} answers - Key-value map of submitted answers.
 * @param {boolean} skipRequired - If true, bypasses required field validation (used for intermediate updates).
 * @returns {object} { isValid, message }
 */
const validateServiceAnswers = (questions, answers, skipRequired = false) => {
  if (!answers || typeof answers !== "object") {
    return { isValid: false, message: "Answers are required and must be an object." };
  }

  for (const question of questions) {
    const value = answers[question.id];
    const labelText = (question.label && typeof question.label === "object") 
      ? (question.label.en || Object.values(question.label)[0]) 
      : (question.label || question.id);

    // Check if required
    if (question.required && !skipRequired) {
      if (value === undefined || value === null || String(value).trim() === "") {
        return { isValid: false, message: `"${labelText}" is required.` };
      }
    }

    // Run validation if a value is provided
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      const trimmedValue = String(value).trim();

      // Check date format
      if (question.type === "date") {
        const dateParsed = Date.parse(trimmedValue);
        if (isNaN(dateParsed)) {
          return { isValid: false, message: `Please enter a valid date for "${labelText}".` };
        }
      }

      // Check custom patterns (like phone regex)
      if (question.validation && question.validation.pattern) {
        try {
          const regex = new RegExp(question.validation.pattern);
          if (!regex.test(trimmedValue)) {
            return { isValid: false, message: `Please enter a valid format for "${labelText}".` };
          }
        } catch (err) {
          console.error(`Invalid regex pattern for question ${question.id}:`, err);
        }
      }
    }
  }

  return { isValid: true };
};

module.exports = {
  validateServiceAnswers,
};
