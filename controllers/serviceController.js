const serviceModel = require("../models/serviceModel");

/**
 * Gets all enabled services.
 */
const getServices = async (req, res) => {
  try {
    const services = await serviceModel.getAllServices();
    return res.status(200).json({ services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Gets a single service by ID.
 */
const getService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await serviceModel.getServiceById(serviceId);
    if (!service) {
      return res.status(404).json({ error: "Service not found." });
    }
    return res.status(200).json({ service });
  } catch (error) {
    console.error("Error fetching service:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Seeding endpoint to load initial services.
 */
const seedServices = async (req, res) => {
  try {
    await serviceModel.seedServiceDefinitions();
    return res.status(200).json({ message: "Services seeded successfully." });
  } catch (error) {
    console.error("Error seeding services:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getServices,
  getService,
  seedServices,
};
