const express = require("express");
const applicationController = require("../controllers/applicationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Apply authMiddleware globally to all application routes
router.use(authMiddleware);

router.post("/", applicationController.createApplication);
router.get("/", applicationController.getUserApplications);
router.get("/:applicationId", applicationController.getApplication);
router.patch("/:applicationId", applicationController.updateApplication);
router.post("/:applicationId/submit", applicationController.submitApplication);

module.exports = router;
