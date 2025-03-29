import { db } from '../firebase-config.js';

async function checkVoters() {
    try {
        console.log("🔍 Checking voters in Firestore...");
        
        // Get all voters from the Voters collection
        const votersSnapshot = await db.collection("Voters").get();
        
        if (votersSnapshot.empty) {
            console.log("❌ No voters found in Firestore!");
            return;
        }

        console.log(`✅ Found ${votersSnapshot.size} voters in Firestore`);
        
        // Log the first few voters to check their structure
        votersSnapshot.forEach((doc, index) => {
            if (index < 5) { // Only show first 5 voters
                console.log(`\nVoter ${index + 1}:`);
                console.log("ID:", doc.id);
                console.log("Data:", doc.data());
            }
        });

    } catch (error) {
        console.error("❌ Error checking voters:", error);
    }
}

checkVoters(); 