const serviceModel = require("../models/serviceModel");
const applicationModel = require("../models/applicationModel");
const { validateServiceAnswers } = require("../utils/serviceValidator");

/**
 * Initializes a new application context with status IN_PROGRESS.
 */
const createApplication = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({ error: "serviceId is required." });
    }

    // Fetch service schema to verify it exists
    const service = await serviceModel.getServiceById(serviceId);
    if (!service) {
      return res.status(404).json({ error: "Service not found." });
    }

    // Check if there is already an IN_PROGRESS application for this user and service
    const existingApps = await applicationModel.getUserApplications(uid);
    const activeApp = existingApps.find(app => app.serviceId === serviceId && (app.status === "IN_PROGRESS" || app.status === "in_progress"));
    
    if (activeApp) {
      return res.status(200).json({
        success: true,
        applicationId: activeApp.applicationId,
        status: activeApp.status,
        application: activeApp,
      });
    }

    // Create and save application
    const app = await applicationModel.createApplication(uid, serviceId);

    return res.status(201).json({
      success: true,
      applicationId: app.applicationId,
      status: app.status,
      application: app,
    });
  } catch (error) {
    console.error("Error creating application:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Updates application answers during form progression (intermediate updates).
 */
const updateApplication = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { applicationId } = req.params;
    const { answers } = req.body;

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ error: "answers object is required." });
    }

    const app = await applicationModel.getApplicationById(applicationId);
    if (!app) {
      return res.status(404).json({ error: "Application not found." });
    }

    // Authorization check
    if (app.userId !== uid) {
      return res.status(403).json({ error: "Access denied. You do not own this application." });
    }

    // Fetch service definition to validate fields
    const service = await serviceModel.getServiceById(app.serviceId);
    if (!service) {
      return res.status(404).json({ error: "Service schema not found." });
    }

    const mergedAnswers = {
      ...app.answers,
      ...answers,
    };

    // Validate only format of updated fields (skip required validations)
    const validation = validateServiceAnswers(service.questions, mergedAnswers, true);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.message });
    }

    await applicationModel.updateApplicationAnswers(applicationId, mergedAnswers);

    const updatedApp = await applicationModel.getApplicationById(applicationId);
    return res.status(200).json({
      success: true,
      application: updatedApp,
    });
  } catch (error) {
    console.error("Error updating application answers:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Submits the completed application and sets status to SUBMITTED.
 * Enforces all required field checks.
 */
const submitApplication = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { applicationId } = req.params;

    const app = await applicationModel.getApplicationById(applicationId);
    if (!app) {
      return res.status(404).json({ error: "Application not found." });
    }

    // Authorization check
    if (app.userId !== uid) {
      return res.status(403).json({ error: "Access denied. You do not own this application." });
    }

    // Fetch service schema
    const service = await serviceModel.getServiceById(app.serviceId);
    if (!service) {
      return res.status(404).json({ error: "Service schema not found." });
    }

    // Validate ALL required fields
    const validation = validateServiceAnswers(service.questions, app.answers, false);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.message });
    }

    await applicationModel.submitApplication(applicationId);

    return res.status(200).json({
      success: true,
      applicationId,
      status: "SUBMITTED",
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Fetches all applications for the authenticated user.
 */
const getUserApplications = async (req, res) => {
  try {
    const uid = req.user.uid;
    const applications = await applicationModel.getUserApplications(uid);
    return res.status(200).json({ applications });
  } catch (error) {
    console.error("Error fetching user applications:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Fetches details of a specific application with authorization check.
 */
const getApplication = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { applicationId } = req.params;

    const app = await applicationModel.getApplicationById(applicationId);
    if (!app) {
      return res.status(404).json({ error: "Application not found." });
    }

    // Authorization check
    if (app.userId !== uid) {
      return res.status(403).json({ error: "Access denied. You do not own this application." });
    }

    return res.status(200).json({ application: app });
  } catch (error) {
    console.error("Error fetching application details:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createApplication,
  updateApplication,
  submitApplication,
  getUserApplications,
  getApplication,
};
