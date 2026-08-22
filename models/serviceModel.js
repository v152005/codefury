const { db } = require("../config/firebase");

const serviceCollection = db.collection("services");

/**
 * Retrieves all active/enabled services.
 * @returns {Promise<Array>} Array of service objects.
 */
const getAllServices = async () => {
  const snapshot = await serviceCollection.where("enabled", "==", true).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Retrieves a single service by its ID.
 * @param {string} serviceId - The service document ID.
 * @returns {Promise<object|null>} The service object or null.
 */
const getServiceById = async (serviceId) => {
  const doc = await serviceCollection.doc(serviceId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
};

/**
 * Seeds initial service definitions if they do not exist.
 */
const seedServiceDefinitions = async () => {
  const pensionService = {
    name: {
      en: "Pension Certificate",
      kn: "ಪಿಂಚಣಿ ಪ್ರಮಾಣಪತ್ರ",
      hi: "पेंशन प्रमाण पत्र"
    },
    description: {
      en: "Apply for a pension certificate online.",
      kn: "ಪಿಂಚಣಿ ಪ್ರಮಾಣಪತ್ರಕ್ಕಾಗಿ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.",
      hi: "पेंशन प्रमाण पत्र के लिए ऑनलाइन आवेदन करें।"
    },
    category: "government",
    enabled: true,
    questions: [
      {
        id: "fullName",
        type: "text",
        required: true,
        label: {
          en: "What is your full name?",
          kn: "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ಏನು?",
          hi: "आपका पूरा नाम क्या है?"
        }
      },
      {
        id: "dateOfBirth",
        type: "date",
        required: true,
        label: {
          en: "What is your date of birth?",
          kn: "ನಿಮ್ಮ ಜನ್ಮ ದಿನಾಂಕ ಏನು?",
          hi: "आपकी जन्म तिथि क्या है?"
        }
      }
    ]
  };

  await serviceCollection.doc("pension-certificate").set(pensionService);
  console.log("Seeded default 'pension-certificate' service definition.");
};

module.exports = {
  getAllServices,
  getServiceById,
  seedServiceDefinitions,
};
