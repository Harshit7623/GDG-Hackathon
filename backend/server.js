import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { checkVoter, verifyVoter } from "./verification.js"; // Import your verification logic

dotenv.config();
console.log("🟢 Checking Environment Variables...");
console.log("GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS ? "Set ✅" : "Not Set ❌");
console.log("GOOGLE_CREDENTIALS:", process.env.GOOGLE_CREDENTIALS ? "Set ✅" : "Not Set ❌");
console.log("Project ID:", process.env.GOOGLE_CREDENTIALS ? JSON.parse(process.env.GOOGLE_CREDENTIALS).project_id : "Not Found ❌");

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.send("Server is running! Use POST /verification to verify voters.");
});

// Middleware to log all requests
app.use((req, res, next) => {
    console.log(`Received ${req.method} request to ${req.url}`);
    console.log("Request body:", req.body);
    next();
});


app.post("/verification", async (req, res) => {
    const { voterID } = req.body;

    try {
        const voterData = await checkVoter(voterID);
        if (!voterData) {
            return res.status(404).json({ message: "Voter not found" });
        }

        await verifyVoter(voterID);
        res.json({ message: "Voter verified successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
