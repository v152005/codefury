const { db, getFirebaseConfigMessage } = require("../config/firebase");

const getApplicationCollection = () => {
  if (!db) {
    throw new Error(getFirebaseConfigMessage());
  }

  return db.collection("applications");
};

const createApplication = async (uid, serviceId) => {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const applicationId = `APP-2026-${randomSuffix}`;

  const applicationData = {
    applicationId,
    serviceId,
    userId: uid,
    status: "IN_PROGRESS",
    answers: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await getApplicationCollection().doc(applicationId).set(applicationData);
  return applicationData;
};

/**
 * Updates application answers in Firestore.
 * @param {string} applicationId - Application ID.
 * @param {object} answers - Updated answers map.
 */
const updateApplicationAnswers = async (applicationId, answers) => {
  await getApplicationCollection().doc(applicationId).update({
    answers,
    updatedAt: new Date(),
  });
};

/**
 * Submits an application by changing status to SUBMITTED.
 * @param {string} applicationId - Application ID.
 */
const submitApplication = async (applicationId) => {
  await getApplicationCollection().doc(applicationId).update({
    status: "SUBMITTED",
    updatedAt: new Date(),
  });
};

/**
 * Retrieves all applications submitted by a specific user.
 * @param {string} uid - User ID.
 * @returns {Promise<Array>} List of application objects.
 */
const getUserApplications = async (uid) => {
  const snapshot = await getApplicationCollection().where("userId", "==", uid).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Retrieves an application by ID.
 * @param {string} applicationId - Application ID.
 * @returns {Promise<object|null>} The application object or null.
 */
const getApplicationById = async (applicationId) => {
  const doc = await getApplicationCollection().doc(applicationId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
};

module.exports = {
  createApplication,
  updateApplicationAnswers,
  submitApplication,
  getUserApplications,
  getApplicationById,
};
