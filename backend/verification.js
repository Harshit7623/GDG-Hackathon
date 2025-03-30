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
        const testQuery = await db.collection("Voters").limit(1).get();
        console.log("✅ Firestore connection test successful");
        return true;
    } catch (error) {
        console.error("❌ Firestore connection test failed:", error.message);
        return false;
    }
}

// Function to check if a voter exists
async function checkVoter(voterId) {
    try {
        if (!voterId) {
            return {
                success: false,
                message: "Voter ID is required"
            };
        }

        // Try with original case first
        let voterDoc = await db.collection("Voters").doc(voterId).get();
        
        // If not found, try with different case
        if (!voterDoc.exists) {
            // Try with voterID (capital ID)
            voterDoc = await db.collection("Voters").doc(voterId.replace('Id', 'ID')).get();
            
            // If still not found, try with voterId (lowercase id)
            if (!voterDoc.exists) {
                voterDoc = await db.collection("Voters").doc(voterId.replace('ID', 'Id')).get();
            }
        }

        if (!voterDoc.exists) {
            console.log("Voter not found in database");
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

// Verify voter
export async function verifyVoter(voterId) {
    try {
        console.log(`✅ Verifying voter with ID: ${voterId}`);

        // Find voter document where either voterID or voterId matches
        const querySnapshot = await db.collection("Voters")
            .where("voterID", "==", voterId)
            .get();

        let voterDoc;
        if (querySnapshot.empty) {
            // Try with lowercase 'd' if uppercase 'ID' didn't find anything
            const altQuerySnapshot = await db.collection("Voters")
                .where("voterId", "==", voterId)
                .get();

            if (altQuerySnapshot.empty) {
                console.log("❌ No such voter found!");
                return { success: false, error: "Voter not found" };
            }

            voterDoc = altQuerySnapshot.docs[0];
        } else {
            voterDoc = querySnapshot.docs[0];
        }

        const voterRef = voterDoc.ref;
        const voterData = voterDoc.data();

        // Check if voter is already verified
        if (voterData.status === "verified") {
            console.log("ℹ️ Voter already verified");
            return { success: true, message: "Voter already verified" };
        }

        // Update the document status to "verified"
        await voterRef.update({ 
            status: "verified",
            verifiedAt: new Date()
        });
        
        console.log("✅ Voter Verified Successfully!");
        return { success: true, message: "Voter verified successfully" };
    } catch (error) {
        console.error("🔥 Error verifying voter:", error);
        return { success: false, error: error.message };
    }
}

// Initialize connection check
checkFirestoreConnection().then(isConnected => {
    if (!isConnected) {
        console.error("❌ Failed to establish Firestore connection");
    }
});
