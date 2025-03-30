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

        // Query for voter with matching voterId field
        const querySnapshot = await dbAdmin.collection("Voters")
            .where("voterId", "==", voterId)
            .get();

        if (querySnapshot.empty) {
            // Try with uppercase voterId
            const upperQuerySnapshot = await dbAdmin.collection("Voters")
                .where("voterId", "==", voterId.toUpperCase())
                .get();

            if (upperQuerySnapshot.empty) {
                // Try with lowercase voterId
                const lowerQuerySnapshot = await dbAdmin.collection("Voters")
                    .where("voterId", "==", voterId.toLowerCase())
                    .get();

                if (lowerQuerySnapshot.empty) {
                    return {
                        success: false,
                        message: "Voter not found in database"
                    };
                }
                return {
                    success: true,
                    data: lowerQuerySnapshot.docs[0].data()
                };
            }
            return {
                success: true,
                data: upperQuerySnapshot.docs[0].data()
            };
        }

        return {
            success: true,
            data: querySnapshot.docs[0].data()
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
        const querySnapshot = await dbAdmin.collection("Voters")
            .where("voterId", "==", voterId)
            .get();

        if (!querySnapshot.empty) {
            await querySnapshot.docs[0].ref.update({
                verified: true,
                verifiedAt: new Date()
            });
        }

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
