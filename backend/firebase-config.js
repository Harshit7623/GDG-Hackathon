import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

let credentials;
let db;

try {
    console.log("🟢 Checking Environment Variables...");
    console.log("GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS ? "Set ✅" : "Not Set ❌");
    console.log("GOOGLE_CREDENTIALS:", process.env.GOOGLE_CREDENTIALS ? "Set ✅" : "Not Set ❌");

    // For Render deployment: use GOOGLE_CREDENTIALS
    if (process.env.GOOGLE_CREDENTIALS) {
        console.log("🚀 Using GOOGLE_CREDENTIALS environment variable");
        try {
            credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
            console.log("✅ Successfully parsed GOOGLE_CREDENTIALS");
            console.log("Project ID from credentials:", credentials.project_id);
        } catch (parseError) {
            console.error("❌ Error parsing GOOGLE_CREDENTIALS:", parseError);
            throw new Error("Failed to parse GOOGLE_CREDENTIALS JSON");
        }
    } 
    // For local development: use file path
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log("🖥️ Using local credentials file");
        const fs = await import('fs');
        credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8"));
    } 
    else {
        throw new Error("No Firebase credentials found!");
    }

    // Validate credentials
    if (!credentials.project_id) {
        throw new Error("Invalid credentials: project_id is missing");
    }

    // Initialize Firebase with explicit project ID
    if (!admin.apps.length) {
        console.log("Initializing Firebase Admin with project:", credentials.project_id);
        admin.initializeApp({
            credential: admin.credential.cert(credentials),
            projectId: credentials.project_id,
            storageBucket: `${credentials.project_id}.appspot.com`
        });
        console.log("✅ Firebase Admin initialized successfully!");
    }

    db = admin.firestore();
    console.log("🟢 Firestore connected!");
} catch (error) {
    console.error("❌ Firebase initialization error:", error.message);
    if (process.env.GOOGLE_CREDENTIALS) {
        console.error("📝 GOOGLE_CREDENTIALS length:", process.env.GOOGLE_CREDENTIALS.length);
        // Log first and last few characters to check format
        console.error("📝 GOOGLE_CREDENTIALS preview:", 
            process.env.GOOGLE_CREDENTIALS.substring(0, 50) + "..." +
            process.env.GOOGLE_CREDENTIALS.substring(process.env.GOOGLE_CREDENTIALS.length - 50)
        );
    }
    throw error;
}

export { admin, db };
