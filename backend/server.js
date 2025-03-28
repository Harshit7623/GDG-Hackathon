import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { checkVoter, verifyVoter } from "./verification.js"; // Import verification logic
import fs from "fs"; // ✅ Import fs to read Firebase secret file

dotenv.config();
console.log("🟢 Checking Environment Variables...");
console.log("GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS ? "Set ✅" : "Not Set ❌");
console.log("GOOGLE_CREDENTIALS:", process.env.GOOGLE_CREDENTIALS ? "Set ✅" : "Not Set ❌");

// 🔥 Read the Project ID from credentials
let projectId = "Not Found ❌";
if (process.env.GOOGLE_CREDENTIALS) {
    try {
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        projectId = credentials.project_id || "Not Found ❌";
    } catch (error) {
        console.error("❌ Error parsing Firebase credentials:", error);
    }
}
console.log("Project ID:", projectId);

const app = express();

// CORS configuration
const allowedOrigins = [
    'http://localhost:5500',  // Local development
    'http://127.0.0.1:5500', // Alternative local development
    'https://your-frontend-domain.com' // Replace with your actual frontend domain
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        status: "ok",
        message: "Server is running!",
        projectId: projectId
    });
});

// Middleware to log all requests
app.use((req, res, next) => {
    console.log(`Received ${req.method} request to ${req.url}`);
    console.log("Request body:", req.body);
    next();
});

// Voter verification endpoint
app.post("/verify-voter", async (req, res) => {
    const { voterId } = req.body;

    if (!voterId) {
        return res.status(400).json({ error: "Voter ID is required" });
    }

    try {
        const voterData = await checkVoter(voterId);
        if (!voterData) {
            return res.status(404).json({ error: "Voter not found" });
        }

        await verifyVoter(voterId);
        res.json({ message: "Voter verified successfully" });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
});
