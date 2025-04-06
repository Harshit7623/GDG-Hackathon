import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import axios from "axios";
import { checkVoter, verifyVoter } from "./verification.js";
import { db } from "./firebase-config.js";

const app = express();
const PORT = process.env.PORT || 5001;

// Simple in-memory OTP storage
const otpStore = new Map();

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).json({});
  }
  
  // Set headers for actual requests
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  next();
});

// Token verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Fast2SMS API configuration
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const FAST2SMS_SENDER_ID = process.env.FAST2SMS_SENDER_ID;
const FAST2SMS_API_URL = 'https://www.fast2sms.com/dev/bulkV2';

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Health check endpoint
app.get("/", async (req, res) => {
  try {
    // Test Firestore connection
    await db.collection("Voters").limit(1).get();
    res.json({
      status: "ok",
      message: "Server is running!",
      firestore: "connected",
      projectId: process.env.FIREBASE_CONFIG
        ? JSON.parse(process.env.FIREBASE_CONFIG).project_id
        : "not-set",
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Demo credentials for testing
    const DEMO_EMAIL = "demo@example.com";
    const DEMO_PASSWORD = "demo123";

    // For demo credentials, bypass email verification and create temporary user
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      // Generate JWT token with demo user info
      const token = jwt.sign({ 
        email: DEMO_EMAIL, 
        userId: "demo-user", 
        isDemo: true 
      }, JWT_SECRET, {
        expiresIn: "1h"
      });

      return res.json({
        success: true,
        token: token,
        message: "Demo login successful"
      });
    }

    // For regular login, check if user exists in Firestore
    const usersRef = db.collection("Users");
    const userQuery = await usersRef.where("email", "==", email).get();

    if (userQuery.empty) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // In production, use proper password hashing
    if (userData.password !== password) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ email: email, userId: userDoc.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      success: true,
      token: token,
    });
  } catch (error) {
    // Log error only in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.error("Error in /login endpoint:", error);
    }
    res.status(500).json({
      success: false,
      error: "Authentication failed. Please try again.",
    });
  }
});

// Send OTP endpoint
app.post("/send-otp", verifyToken, async (req, res) => {
  try {
    const { email, phone } = req.body;
    
    if (!email || !phone) {
      return res.status(400).json({
        success: false,
        error: "Email and phone number are required"
      });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // Store OTP in memory
    otpStore.set(email, {
      value: otp,
      email: email,
      phone: phone,
      timestamp: Date.now(),
      attempts: 0
    });
    
    console.log(`🔐 Demo OTP for ${email}: ${otp}`);

    // For demo purposes, return the OTP in the response
    res.json({
      success: true,
      message: "OTP sent successfully",
      otp: otp // Return the OTP in the response
    });
  } catch (error) {
    // Log error only in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.error("Error in /send-otp endpoint:", error);
    }
    res.status(500).json({
      success: false,
      error: "Failed to send OTP. Please try again."
    });
  }
});

// Verify OTP endpoint
app.post("/verify-otp", verifyToken, async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.user.email;
    const storedOtp = otpStore.get(email);

    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        error: "No OTP request found. Please request a new OTP."
      });
    }

    if (storedOtp.attempts >= 3) {
      // Clear OTP after max attempts
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        error: "Maximum verification attempts exceeded. Please request a new OTP."
      });
    }

    // Check if OTP has expired (5 minutes)
    if (Date.now() - storedOtp.timestamp > 300000) {
      // Clear expired OTP
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        error: "OTP has expired. Please request a new OTP."
      });
    }

    // Verify OTP
    if (parseInt(otp) === storedOtp.value) {
      // Clear the OTP from storage
      otpStore.delete(email);
      
      try {
        // Update phone verification status in Firestore
        // Only attempt this for non-demo users
        if (!req.user.isDemo) {
          const userRef = db.collection('Users').doc(req.user.userId);
          await userRef.update({
            phoneVerified: true,
            phoneNumber: storedOtp.phone,
            lastVerified: Date.now()
          });
        }
      } catch (dbError) {
        console.log("Skipping database update for demo user:", dbError.message);
      }

      res.json({
        success: true,
        message: "Phone verification successful"
      });
    } else {
      storedOtp.attempts++;
      res.status(400).json({
        success: false,
        error: "Invalid OTP. Please try again."
      });
    }
  } catch (error) {
    // Log error only in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.error("Error in /verify-otp endpoint:", error);
    }
    res.status(500).json({
      success: false,
      error: "Failed to verify OTP. Please try again."
    });
  }
});

// Test endpoint to check voter verification
app.get("/test-voter/:voterId", async (req, res) => {
  try {
    const voterId = req.params.voterId;
    console.log(`🔍 Testing voter verification for ID: ${voterId}`);
    
    // Check if voter exists
    const voter = await checkVoter(voterId);
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: "Voter not found"
      });
    }

    // Try to verify the voter
    const verificationResult = await verifyVoter(voterId);
    
    res.json({
      success: true,
      message: "Voter verification test completed",
      voterData: voter,
      verificationResult: verificationResult
    });
  } catch (error) {
    console.error("Error testing voter verification:", error);
    res.status(500).json({
      success: false,
      message: "Error testing voter verification",
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(
    "🌐 Allowed origins: http://localhost:5500, http://127.0.0.1:5500, http://localhost:64807, https://voter-verification-frontend.onrender.com, https://voter-verification-backend.onrender.com"
  );
  console.log("==> Your service is live 🎉");
});
