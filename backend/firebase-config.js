const admin = require("firebase-admin");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config(); // Load environment variables

let credentials;
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (serviceAccountPath) {
    console.log("🖥️ Running Locally: Using `GOOGLE_APPLICATION_CREDENTIALS`");

    if (!fs.existsSync(serviceAccountPath)) {
        console.error("❌ Firebase service account file not found:", serviceAccountPath);
        process.exit(1);
    }

    try {
        credentials = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    } catch (error) {
        console.error("❌ Error parsing Firebase key file:", error);
        process.exit(1);
    }
} else {
    console.error("❌ GOOGLE_APPLICATION_CREDENTIALS is not set!");
    process.exit(1);
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
