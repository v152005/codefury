/**
 * Validates signup parameters.
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @returns {object} { isValid, message }
 */
const validateSignupInput = (name, email, password) => {
  if (!name || name.trim().length < 2) {
    return { isValid: false, message: "Name must be at least 2 characters long." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return { isValid: false, message: "Please enter a valid email address." };
  }

  if (!password || password.length < 6) {
    return { isValid: false, message: "Password must be at least 6 characters long." };
  }

  return { isValid: true };
};

/**
 * Validates login parameters.
 * @param {string} email 
 * @param {string} password 
 * @returns {object} { isValid, message }
 */
const validateLoginInput = (email, password) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return { isValid: false, message: "Please enter a valid email address." };
  }

  if (!password || password.length < 1) {
    return { isValid: false, message: "Password cannot be empty." };
  }

  return { isValid: true };
};

/**
 * Validates user profile data.
 * @param {object} profileData 
 * @returns {object} { isValid, message }
 */
const validateProfileInput = (profileData) => {
  if (!profileData) {
    return { isValid: false, message: "Profile data is required." };
  }

  const { displayName, preferredLanguage, accessibilityNeeds, interactionPreferences } = profileData;

  // Validate displayName if provided
  if (displayName !== undefined && (typeof displayName !== "string" || displayName.trim().length === 0)) {
    return { isValid: false, message: "Display name must be a non-empty string." };
  }

  // Validate preferredLanguage
  const supportedLanguages = ["en", "hi", "kn"];
  if (!preferredLanguage || !supportedLanguages.includes(preferredLanguage)) {
    return { isValid: false, message: "Preferred language must be one of: en, hi, kn." };
  }

  // Validate accessibilityNeeds
  const supportedNeeds = ["reading", "hearing", "interaction", "understanding", "voice", "visual", "none"];
  if (!Array.isArray(accessibilityNeeds)) {
    return { isValid: false, message: "Accessibility needs must be an array." };
  }
  for (const need of accessibilityNeeds) {
    if (!supportedNeeds.includes(need)) {
      return { isValid: false, message: `Unsupported accessibility need: ${need}.` };
    }
  }

  // Validate interactionPreferences
  if (!interactionPreferences || typeof interactionPreferences !== "object") {
    return { isValid: false, message: "Interaction preferences must be an object." };
  }
  const supportedPrefs = ["voiceInput", "voiceOutput", "transcription", "conversationalGuidance", "simplifiedInstructions"];
  for (const pref of supportedPrefs) {
    if (interactionPreferences[pref] !== undefined && typeof interactionPreferences[pref] !== "boolean") {
      return { isValid: false, message: `Preference '${pref}' must be a boolean.` };
    }
  }

  return { isValid: true };
};

module.exports = {
  validateSignupInput,
  validateLoginInput,
  validateProfileInput,
};
