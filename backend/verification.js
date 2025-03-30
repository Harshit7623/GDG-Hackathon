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

// Check if voter exists
export async function checkVoter(voterId) {
    if (!voterId) {
        console.error("❌ Error: Missing voterId");
        throw new Error("Voter ID is required");
    }

    console.log(`🔍 Checking voter with ID: ${voterId}`);

    try {
        // Query Firestore for voter where either voterID or voterId matches
        const querySnapshot = await db.collection("Voters")
            .where("voterID", "==", voterId)
            .get();

        if (querySnapshot.empty) {
            // Try with lowercase 'd' if uppercase 'ID' didn't find anything
            const altQuerySnapshot = await db.collection("Voters")
                .where("voterId", "==", voterId)
                .get();

            if (altQuerySnapshot.empty) {
                console.log("❌ No such voter found in Firestore!");
                return null;
            }

            const voterDoc = altQuerySnapshot.docs[0];
            console.log("✅ Voter Found:", voterDoc.data());
            return voterDoc.data();
        }

        const voterDoc = querySnapshot.docs[0];
        console.log("✅ Voter Found:", voterDoc.data());
        return voterDoc.data();
    } catch (error) {
        console.error("🔥 Error fetching voter data:", error);
        throw new Error("Error fetching voter data: " + error.message);
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
                return { success: false, message: "Voter not found in database" };
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
            return { 
                success: true, 
                message: "Voter already verified",
                data: voterData
            };
        }

        // Update the document status to "verified"
        await voterRef.update({ 
            status: "verified",
            verifiedAt: new Date()
        });
        
        console.log("✅ Voter Verified Successfully!");
        return { 
            success: true, 
            message: "Voter verified successfully",
            data: voterData
        };
    } catch (error) {
        console.error("🔥 Error verifying voter:", error);
        return { success: false, message: error.message };
    }
}

// Initialize connection check
checkFirestoreConnection().then(isConnected => {
    if (!isConnected) {
        console.error("❌ Failed to establish Firestore connection");
    }
});
