const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { auth, getFirebaseConfigMessage } = require("../config/firebase");
const userModel = require("../models/userModel");

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_codefury_9_0";

/**
 * Hashes a password using PBKDF2.
 * @param {string} password 
 * @returns {object} { salt, hash }
 */
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return { salt, hash };
};

/**
 * Verifies a password against salt and hash.
 * @param {string} password 
 * @param {string} salt 
 * @param {string} hash 
 * @returns {boolean} True if password matches.
 */
const verifyPassword = (password, salt, hash) => {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === verifyHash;
};

/**
 * Registers a user by creating them in Firebase Auth and saving metadata + hashed pass to Firestore.
 */
const registerUser = async (name, email, password) => {
  if (!auth) {
    throw new Error(getFirebaseConfigMessage());
  }

  const existingUser = await userModel.findUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  // Create user in Firebase Authentication
  const userRecord = await auth.createUser({
    email: email.toLowerCase().trim(),
    password: password,
    displayName: name,
  });

  // Hash password for secure Firestore fallback verification
  const { salt, hash } = hashPassword(password);

  // Save details to Firestore
  await userModel.createUserDoc(userRecord.uid, {
    name,
    email: email.toLowerCase().trim(),
    passwordHash: hash,
    salt,
  });

  const user = { uid: userRecord.uid, name, email: email.toLowerCase().trim() };

  // Generate JWT Token
  const token = jwt.sign(
    { uid: user.uid, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
};

/**
 * Authenticates user credentials using the database password hash and issues a JWT.
 */
const authenticateUser = async (email, password) => {
  const user = await userModel.findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = verifyPassword(password, user.salt, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT Token
  const token = jwt.sign(
    { uid: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: { uid: user.id, name: user.name, email: user.email },
    token,
  };
};

/**
 * Verifies a JWT token.
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  registerUser,
  authenticateUser,
  verifyToken,
};
