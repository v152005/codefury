const userService = require("../services/userService");
const { validateSignupInput, validateLoginInput } = require("../utils/profileValidator");

/**
 * Controller handler for user registration.
 */
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const validation = validateSignupInput(name, email, password);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.message });
    }

    const { user, token } = await userService.registerUser(name, email, password);
    return res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

/**
 * Controller handler for user login.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validation = validateLoginInput(email, password);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.message });
    }

    const { user, token } = await userService.authenticateUser(email, password);
    return res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

/**
 * Controller handler to fetch authenticated user profile details.
 */
const getProfile = async (req, res) => {
  try {
    // req.user is populated by the authMiddleware
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
};
