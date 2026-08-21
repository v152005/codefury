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

module.exports = {
  createUserDoc,
  findUserByEmail,
};
