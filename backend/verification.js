import admin from "firebase-admin";
import { db } from "./firebase-config.js";

// Ensure Firebase Admin is initialized only once
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
}

const dbAdmin = admin.firestore();

// Check Firestore connection
async function checkFirestoreConnection() {
    try {
        // Try a simple query to test the connection
        const testQuery = await dbAdmin.collection("Voters").limit(1).get();
        console.log("✅ Firestore connection test successful");
        return true;
    } catch (error) {
        console.error("❌ Firestore connection test failed:", error.message);
        return false;
    }
}

// Function to check if a voter exists
export async function checkVoter(voterId) {
    try {
        if (!voterId) {
            return {
                success: false,
                message: "Voter ID is required"
            };
        }

        // Try with original voterId
        let voterDoc = await dbAdmin.collection("Voters").doc(voterId).get();
        
        // If not found, try with uppercase voterId
        if (!voterDoc.exists) {
            voterDoc = await dbAdmin.collection("Voters").doc(voterId.toUpperCase()).get();
        }
        
        // If still not found, try with lowercase voterId
        if (!voterDoc.exists) {
            voterDoc = await dbAdmin.collection("Voters").doc(voterId.toLowerCase()).get();
        }

        if (!voterDoc.exists) {
            return {
                success: false,
                message: "Voter not found in database"
            };
        }

        return {
            success: true,
            data: voterDoc.data()
        };
    } catch (error) {
        console.error("Error checking voter:", error);
        return {
            success: false,
            message: "Error checking voter status"
        };
    }
}

// Function to verify a voter
export async function verifyVoter(voterId) {
    try {
        // First check if voter exists
        const checkResult = await checkVoter(voterId);
        
        if (!checkResult.success) {
            return {
                success: false,
                message: checkResult.message
            };
        }

        const voterData = checkResult.data;
        
        // Check if already verified
        if (voterData.verified) {
            return {
                success: false,
                message: "Voter already verified"
            };
        }

        // Update verification status
        await dbAdmin.collection("Voters").doc(voterId).update({
            verified: true,
            verifiedAt: new Date()
        });

        return {
            success: true,
            message: "Voter verified successfully",
            data: voterData
        };
    } catch (error) {
        console.error("Error verifying voter:", error);
        return {
            success: false,
            message: "Error verifying voter"
        };
    }
}

// Initialize connection check
checkFirestoreConnection().then(isConnected => {
    if (!isConnected) {
        console.error("❌ Failed to establish Firestore connection");
    }
});
