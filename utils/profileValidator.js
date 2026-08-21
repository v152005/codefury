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

module.exports = {
  validateSignupInput,
  validateLoginInput,
};
