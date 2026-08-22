const { auth } = require("../config/firebase");
const userService = require("../services/userService");

/**
 * Express middleware to authenticate requests via JWT or Firebase ID Token.
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Try verifying as our backend-issued custom JWT token first
    try {
      const decoded = userService.verifyToken(token);
      req.user = decoded;
      return next();
    } catch (jwtErr) {
      // If that fails, try verifying it as a Firebase ID token
      const decodedIdToken = await auth.verifyIdToken(token);
      req.user = {
        uid: decodedIdToken.uid,
        email: decodedIdToken.email,
        name: decodedIdToken.name || "",
      };
      return next();
    }
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
