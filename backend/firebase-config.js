import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Parse the Firebase config from environment variable
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
  });
}

export const db = admin.firestore();
