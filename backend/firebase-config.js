const admin = require("firebase-admin");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config(); // Load environment variables

let credentials;

// Check if running on Render (uses GOOGLE_CREDENTIALS)
if (process.env.RENDER) {
    console.log("🚀 Running on Render: Using `GOOGLE_CREDENTIALS`");

    try {
        const serviceAccountPath = process.env.GOOGLE_CREDENTIALS; // Path to secret file on Render
        credentials = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    } catch (error) {
        console.error("❌ Failed to load Render credentials:", error);
        process.exit(1);
    }
} else {
    // Running locally (uses GOOGLE_APPLICATION_CREDENTIALS)
    console.log("🖥️ Running Locally: Using `GOOGLE_APPLICATION_CREDENTIALS`");

    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.error("❌ GOOGLE_APPLICATION_CREDENTIALS is not set!");
        process.exit(1);
    }

    try {
        credentials = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    } catch (error) {
        console.error("❌ Error loading Firebase key file:", error);
        process.exit(1);
    }
}

// ✅ Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(credentials),
    });
    console.log("✅ Firebase Admin initialized successfully!");
}

const db = admin.firestore();
console.log("🟢 Firestore connected!");

module.exports = { admin, db };
