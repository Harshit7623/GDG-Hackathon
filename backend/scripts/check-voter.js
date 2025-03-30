import { db } from '../firebase-config.js';

async function checkSpecificVoter(voterId) {
    try {
        console.log(`🔍 Checking voter with ID: ${voterId}`);
        
        // Try both voterID and voterId
        const querySnapshot = await db.collection("Voters")
            .where("voterID", "==", voterId)
            .get();

        if (querySnapshot.empty) {
            const altQuerySnapshot = await db.collection("Voters")
                .where("voterId", "==", voterId)
                .get();

            if (altQuerySnapshot.empty) {
                console.log("❌ No such voter found in Firestore!");
                return;
            }

            const voterDoc = altQuerySnapshot.docs[0];
            console.log("✅ Voter Found:");
            console.log("Document ID:", voterDoc.id);
            console.log("Data:", voterDoc.data());
        } else {
            const voterDoc = querySnapshot.docs[0];
            console.log("✅ Voter Found:");
            console.log("Document ID:", voterDoc.id);
            console.log("Data:", voterDoc.data());
        }

    } catch (error) {
        console.error("❌ Error checking voter:", error);
    }
}

// Check DL10002
checkSpecificVoter("DL10002"); 