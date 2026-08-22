const express = require("express");
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Apply authMiddleware globally to all profile routes
router.use(authMiddleware);

router.post("/", profileController.createOrUpdateProfile);
router.get("/", profileController.getProfile);

module.exports = router;
