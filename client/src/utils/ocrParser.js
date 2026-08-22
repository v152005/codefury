/**
 * Normalizes extra whitespace, tabs, and newlines in text.
 */
export const normalizeWhitespace = (text) => {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
};

/**
 * Basic text cleaning for OCR noise.
 */
export const cleanOCRText = (text) => {
  if (!text) return "";
  // Keep alphanumeric, spaces, newlines, colons, hyphens, slashes, commas, and dots
  return text
    .replace(/[^\w\s\-:,./]/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
};

/**
 * Attempts to extract a value associated with a specific key/label using regular expressions.
 */
export const extractLabeledValue = (text, label) => {
  if (!text || !label) return null;
  
  // Escape regex special chars in label
  const escapedLabel = label.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  
  // Match the label, optional punctuation like : or -, and capture value up to the end of the line
  const regex = new RegExp(`\\b${escapedLabel}\\b\\s*[:\\-]?\\s*([^\\n]+)`, "i");
  const match = text.match(regex);
  
  if (match && match[1]) {
    const val = match[1].trim();
    return val || null;
  }
  
  return null;
};

/**
 * Standard mapping aliases for document fields.
 */
const fieldAliases = {
  fullName: ["Name", "Full Name", "Name of Candidate", "Name of Holder", "Name of Applicant", "Name:"],
  dateOfBirth: ["DOB", "Date of Birth", "Birth Date", "D.O.B"],
  address: ["Address", "Residential Address", "Permanent Address", "Residance"],
  mobileNumber: ["Mobile", "Mobile Number", "Phone", "Phone Number", "Contact"],
  bankAccountNumber: ["Account Number", "Account No", "A/C No", "A/C Number", "Bank A/C"],
  bankBranchName: ["Branch", "Branch Name", "Bank Branch"],
  ppoNumber: ["PPO", "PPO Number", "PPO No", "Pension Payment Order"],
  aadhaarNumber: ["Aadhaar", "Aadhaar Number", "Aadhar", "UID", "Aadhaar No"],
};

/**
 * Performs client-side deterministic field extraction from raw OCR text.
 * @param {string} text - The raw OCR text.
 * @param {Array<string>} requiredFields - Fields requested by the active service.
 * @returns {object} Extracted fields map with confidence scores (1.0 for matches).
 */
export const extractFieldsDeterministically = (text, requiredFields) => {
  const extracted = {};
  const confidence = {};
  
  const cleanedText = cleanOCRText(text);
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  
  for (const field of requiredFields) {
    extracted[field] = null;
    confidence[field] = 0.0;
    
    // Fail-safe Aadhaar number extraction: locate any sequence of 12 digits in the OCR text
    if (field === "aadhaarNumber") {
      const digitsOnly = text.replace(/[^\d]/g, "");
      const match = digitsOnly.match(/\d{12}/);
      if (match) {
        extracted[field] = match[0];
        confidence[field] = 1.0;
        continue;
      }
    }

    // Custom Mobile Number pattern match
    if (field === "mobileNumber") {
      const mobileMatch = cleanedText.match(/\b(?:\+91|0)?[6-9]\d{9}\b/);
      if (mobileMatch) {
        extracted[field] = mobileMatch[0].replace(/^\+91|^0/, "");
        confidence[field] = 1.0;
        continue;
      }
    }

    const aliases = fieldAliases[field] || [];
    for (const alias of aliases) {
      const value = extractLabeledValue(cleanedText, alias);
      if (value) {
        let normalizedValue = normalizeWhitespace(value);
        
        if (field === "dateOfBirth") {
          // Normalize date format if matches DD/MM/YYYY or DD-MM-YYYY
          const dateMatch = normalizedValue.match(/\b([1-9]|0[1-9]|[12]\d|3[01])[-/]([1-9]|0[1-9]|1[0-2])[-/](19\d{2}|20\d{2})\b/);
          if (dateMatch) {
            const d = String(parseInt(dateMatch[1])).padStart(2, "0");
            const m = String(parseInt(dateMatch[2])).padStart(2, "0");
            const y = dateMatch[3];
            normalizedValue = `${y}-${m}-${d}`;
          }
        }
        
        extracted[field] = normalizedValue;
        confidence[field] = 1.0;
        break;
      }
    }
  }

  // Fail-safe fallback for fullName: look directly above DOB or Gender lines
  if (requiredFields.includes("fullName") && !extracted.fullName) {
    const anchorLineIndex = lines.findIndex(l => /DOB|Birth|Date of Birth|Male|Female|Gender/i.test(l));
    if (anchorLineIndex > 0) {
      // Check up to 2 lines above the anchor line
      for (let i = anchorLineIndex - 1; i >= Math.max(0, anchorLineIndex - 2); i--) {
        const line = lines[i];
        // Strip non-alphabetic noise to retrieve the pure text
        const cleanedLine = line.replace(/[^a-zA-Z\s]/g, "").replace(/\s+/g, " ").trim();
        
        // Ensure it is not a common document header or metadata word
        if (
          cleanedLine.length > 3 &&
          !/Government|India|Aadhaar|Union|Authority|Signature|Sahi/i.test(cleanedLine) &&
          !/Male|Female|Gender/i.test(cleanedLine)
        ) {
          extracted.fullName = cleanedLine;
          confidence.fullName = 1.0;
          break;
        }
      }
    }
  }

  return { fields: extracted, confidence };
};
