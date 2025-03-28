import admin from "firebase-admin";

// Ensure Firebase Admin is initialized only once
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
}

const db = admin.firestore();

async function checkFirestoreConnection() {
    try {
        console.log("🟢 Checking Firestore connection...");
        const testDoc = await db.collection("voters").limit(1).get();
        console.log("✅ Firestore Connection Successful!");
    } catch (error) {
        console.error("🔥 Firestore Connection Failed:", error);
    }
}

checkFirestoreConnection();

export async function checkVoter(voterID) {
    if (!voterID) {
        console.error("❌ Error: Missing voterID");
        throw new Error("Voter ID is required");
    }

    console.log(`🔍 Checking voter with ID: ${voterID}`);

    try {
        // Query Firestore for voter where voterID matches
        const querySnapshot = await db.collection("voters").where("voterId", "==", voterID).get();

        if (querySnapshot.empty) {
            console.log("❌ No such voter found in Firestore!");
            return null;
        }

        // Since voterID is unique, we take the first result
        const voterDoc = querySnapshot.docs[0];
        console.log("✅ Voter Found:", voterDoc.data());

        return voterDoc.data();
    } catch (error) {
        console.error("🔥 Error fetching voter data:", error);
        throw new Error("Error fetching voter data: " + error.message);
    }
}

export async function verifyVoter(voterID) {
    try {
        console.log(`✅ Verifying voter with ID: ${voterID}`);

        // Find voter document where voterID matches
        const querySnapshot = await db.collection("voters").where("voterId", "==", voterID).get();

        if (querySnapshot.empty) {
            console.log("❌ No such voter found!");
            throw new Error("Voter not found");
        }

        // Since voterID is unique, we get the first document found
        const voterDoc = querySnapshot.docs[0];
        const voterRef = voterDoc.ref; // Reference to the voter document

        // Check if voter is already verified
        const voterData = voterDoc.data();
        if (voterData.status === "verified") {
            console.log("ℹ️ Voter already verified");
            return { message: "Voter already verified" };
        }

        // Update the document status to "verified"
        await voterRef.update({ 
            status: "verified",
            verifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log("✅ Voter Verified Successfully!");
        return { message: "Voter verified successfully" };
    } catch (error) {
        console.error("🔥 Error verifying voter:", error);
        throw new Error("Error verifying voter: " + error.message);
    }
}
