const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

let auth;
let db;
let firebaseConfigError = null;

try {
  let serviceAccount;

  if (
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PROJECT_ID
  ) {
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  } else {
    serviceAccount = require("../firebase-authentication.json");
  }

  const app = initializeApp({
    credential: cert(serviceAccount),
  });

  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  firebaseConfigError = error;
  console.error("Firebase Admin is not configured:", error);
}

module.exports = {
  auth,
  db,
  getFirebaseConfigError: () => firebaseConfigError,
  getFirebaseConfigMessage: () =>
    "Firebase is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY on the server.",
  isFirebaseConfigured: () => Boolean(auth && db),
};