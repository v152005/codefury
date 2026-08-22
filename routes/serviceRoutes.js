const express = require("express");
const serviceController = require("../controllers/serviceController");

const router = express.Router();

// Define service endpoints
router.get("/", serviceController.getServices);
router.get("/seed", serviceController.seedServices);
router.get("/:serviceId", serviceController.getService);

module.exports = router;
