const admin = require("firebase-admin");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config(); // Load environment variables

let credentials;
const serviceAccountPath = process.env.GOOGLE_CREDENTIALS; // This is a file path, NOT JSON

if (serviceAccountPath) {
    console.log(`🖥️ Using Firebase Key from: ${serviceAccountPath}`);

    if (!fs.existsSync(serviceAccountPath)) {
        console.error("❌ Firebase service account file not found:", serviceAccountPath);
        process.exit(1);
    }

    try {
        const fileContents = fs.readFileSync(serviceAccountPath, "utf8");
        credentials = JSON.parse(fileContents); // ✅ Read file & parse JSON
    } catch (error) {
        console.error("❌ Error reading/parsing Firebase key file:", error);
        process.exit(1);
    }
} else {
    console.error("❌ GOOGLE_CREDENTIALS is not set!");
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
