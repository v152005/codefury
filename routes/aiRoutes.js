const express = require("express");
const aiController = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Apply authMiddleware globally to all AI endpoints
router.use(authMiddleware);

router.post("/explain", aiController.explain);
router.post("/parse-response", aiController.parse);

module.exports = router;
