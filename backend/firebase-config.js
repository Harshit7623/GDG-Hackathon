const admin = require("firebase-admin");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config(); // Load environment variables

let credentials;
const localCredentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS; // Local: Path to key file
const renderCredentialPath = process.env.GOOGLE_CREDENTIAL; // Render: Path to uploaded secret file

if (renderCredentialPath && fs.existsSync(renderCredentialPath)) {
    console.log("🚀 Running on Render: Using GOOGLE_CREDENTIAL ✅");
    credentials = JSON.parse(fs.readFileSync(renderCredentialPath, "utf8"));
} else if (localCredentialPath && fs.existsSync(localCredentialPath)) {
    console.log("🖥️ Running Locally: Using GOOGLE_APPLICATION_CREDENTIALS ✅");
    credentials = JSON.parse(fs.readFileSync(localCredentialPath, "utf8"));
} else {
    console.error("❌ No valid Firebase credentials found!");
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
