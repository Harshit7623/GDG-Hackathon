import express from "express";
import cors from "cors";
import { checkVoter, verifyVoter } from "./verification.js";
import admin from "firebase-admin";

const app = express();
const PORT = process.env.PORT || 5001;

// Ensure Firebase Admin is initialized only once
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
}

const dbAdmin = admin.firestore();

// Middleware
app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://your-frontend-domain.com"
    ],
    methods: ['GET', 'POST'],
    credentials: true
}));

// Health check endpoint
app.get("/", async (req, res) => {
    try {
        // Test Firestore connection
        await dbAdmin.collection("Voters").limit(1).get();
        res.json({
            status: "ok",
            message: "Server is running!",
            firestore: "connected",
            projectId: process.env.GOOGLE_CREDENTIALS ? JSON.parse(process.env.GOOGLE_CREDENTIALS).project_id : "not-set"
        });
    } catch (error) {
        console.error("Health check error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error",
            error: error.message
        });
    }
});

// Voter verification endpoint
app.post("/verify-voter", async (req, res) => {
    try {
        console.log("Received POST request to /verify-voter");
        console.log("Request body:", req.body);

        // Handle both voterId and voterID in request body
        const voterId = req.body.voterId || req.body.voterID;
        
        if (!voterId) {
            console.error("❌ Error: Missing voterId in request body");
            return res.status(400).json({ 
                success: false,
                message: "Voter ID is required" 
            });
        }

        const result = await verifyVoter(voterId);
        
        // Set appropriate status code based on result
        if (!result.success) {
            if (result.message === "Voter not found in database") {
                return res.status(404).json(result);
            }
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error("🔥 Error in /verify-voter endpoint:", error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log("🌐 Allowed origins: http://localhost:5500, http://127.0.0.1:5500, https://your-frontend-domain.com");
    console.log("==> Your service is live 🎉");
});
