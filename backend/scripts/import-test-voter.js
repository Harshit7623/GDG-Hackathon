import { db } from '../firebase-config.js';

async function importTestVoter() {
    try {
        const testVoter = {
            voterId: "DL10001",
            name: "Anil Mehta",
            age: 73,
            gender: "Male",
            constituency: "Dwarka",
            photoURL: "https://randomuser.me/api/portraits/men/24.jpg",
            status: "unverified",
            createdAt: new Date()
        };

        // Add to Firestore
        await db.collection("Voters").doc(testVoter.voterId).set(testVoter);
        console.log("✅ Test voter imported successfully:", testVoter);

        // Verify the import
        const voterDoc = await db.collection("Voters").doc(testVoter.voterId).get();
        if (voterDoc.exists) {
            console.log("✅ Voter document exists in Firestore");
            console.log("Voter data:", voterDoc.data());
        } else {
            console.log("❌ Voter document not found in Firestore");
        }
    } catch (error) {
        console.error("❌ Error importing test voter:", error);
    }
}

importTestVoter(); 