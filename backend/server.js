import express from "express";
import cors from "cors";
import { checkVoter, verifyVoter } from "./verification.js";
import { db } from "./firebase-config.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://voter-verification.vercel.app",
        "https://gdg-hackathon.vercel.app"
    ],
    methods: ['GET', 'POST'],
    credentials: true
}));

// Health check endpoint
app.get("/api/health", async (req, res) => {
    try {
        // Test Firestore connection
        await db.collection("Voters").limit(1).get();
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
app.post("/api/verify-voter", async (req, res) => {
    try {
        console.log("Received POST request to /api/verify-voter");
        console.log("Request body:", req.body);

        // Handle both voterId and voterID in request body
        const voterId = req.body.voterId || req.body.voterID;
        
        if (!voterId) {
            console.error("❌ Error: Missing voterId in request body");
            return res.status(400).json({ 
                success: false,
                error: "Voter ID is required" 
            });
        }

        const result = await verifyVoter(voterId);
        if (!result.success) {
            return res.status(404).json(result);
        }
        res.json(result);
    } catch (error) {
        console.error("🔥 Error in /api/verify-voter endpoint:", error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log("🌐 Allowed origins:", app.get('cors').origin);
    });
}

// Export for Vercel
export default app;
