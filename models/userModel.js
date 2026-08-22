const { db } = require("../config/firebase");

const userCollection = db.collection("users");

/**
 * Creates a new user document in Firestore.
 * @param {string} uid - Firebase Auth user ID.
 * @param {object} userData - User metadata (email, name, password hash, salt).
 */
const createUserDoc = async (uid, userData) => {
  await userCollection.doc(uid).set({
    ...userData,
    createdAt: new Date(),
  });
};

/**
 * Finds a user by email in Firestore.
 * @param {string} email - Email address to search for.
 * @returns {object|null} The user object or null.
 */
const findUserByEmail = async (email) => {
  const querySnapshot = await userCollection
    .where("email", "==", email.toLowerCase().trim())
    .limit(1)
    .get();
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

/**
 * Updates user profile details in Firestore.
 * @param {string} uid - Firebase Auth user ID.
 * @param {object} profileData - Profile attributes to update.
 */
const updateUserProfile = async (uid, profileData) => {
  await userCollection.doc(uid).update({
    ...profileData,
    updatedAt: new Date(),
  });
};

/**
 * Finds a user by document ID (uid) in Firestore.
 * @param {string} uid - Document ID to search for.
 * @returns {object|null} The user object or null.
 */
const findUserById = async (uid) => {
  const doc = await userCollection.doc(uid).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
};

module.exports = {
  createUserDoc,
  findUserByEmail,
  updateUserProfile,
  findUserById,
};
