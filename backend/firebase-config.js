const admin = require("firebase-admin");
require("dotenv").config(); // Load environment variables

const credentials =
    process.env.GOOGLE_CREDENTIALS
        ? JSON.parse(process.env.GOOGLE_CREDENTIALS) // Cloud (Render, Vercel)
        : require(process.env.GOOGLE_APPLICATION_CREDENTIALS); // Local

admin.initializeApp({
    credential: admin.credential.cert(credentials),
});


const db = admin.firestore();

module.exports = { admin, db };
