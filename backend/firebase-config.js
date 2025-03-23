const admin = require("firebase-admin");
require("dotenv").config(); // Load environment variables

// Check if GOOGLE_CREDENTIALS is set
if (!process.env.GOOGLE_CREDENTIALS) {
    console.error("❌ GOOGLE_CREDENTIALS is not set!");
    process.exit(1);
}

// Parse credentials and log project_id
let credentials;
try {
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    console.log("✅ Successfully parsed GOOGLE_CREDENTIALS");
    console.log("🟢 Project ID:", credentials.project_id);
} catch (error) {
    console.error("❌ Failed to parse GOOGLE_CREDENTIALS:", error);
    process.exit(1);
}

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(credentials),
});

// Check Firestore connection
const db = admin.firestore();
console.log("🟢 Firestore initialized successfully!");

module.exports = { admin, db };

