const admin = require("firebase-admin");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config(); // Load environment variables

let credentials;

try {
    // First try to get credentials from environment variable
    if (process.env.GOOGLE_CREDENTIALS) {
        console.log("🚀 Running with environment credentials ✅");
        credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    } 
    // Fallback to local file if environment variable is not set
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        const localCredentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        if (fs.existsSync(localCredentialPath)) {
            console.log("🖥️ Running Locally: Using GOOGLE_APPLICATION_CREDENTIALS ✅");
            credentials = JSON.parse(fs.readFileSync(localCredentialPath, "utf8"));
        } else {
            throw new Error(`Credentials file not found at: ${localCredentialPath}`);
        }
    } else {
        throw new Error("No valid Firebase credentials found! Please set GOOGLE_CREDENTIALS environment variable");
    }

    // Validate credentials
    if (!credentials.project_id) {
        throw new Error("Invalid credentials: project_id is missing");
    }

    // ✅ Initialize Firebase Admin
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(credentials),
            projectId: credentials.project_id,
            storageBucket: `${credentials.project_id}.appspot.com`
        });
        console.log("✅ Firebase Admin initialized successfully!");
    }

    const db = admin.firestore();
    console.log("🟢 Firestore connected!");

    module.exports = { admin, db };
} catch (error) {
    console.error("❌ Error initializing Firebase:", error.message);
    process.exit(1);
}
