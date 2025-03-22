const admin = require("firebase-admin");
const fs = require("fs");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
});

const db = admin.firestore();
const collectionID = "Voters"; // ✅ Collection name

// Read JSON file
const voters = JSON.parse(fs.readFileSync("voters.json", "utf8"));

async function uploadVoters() {
  for (let voterID in voters) {
    try {
      await db.collection(collectionID).doc(voterID).set(voters[voterID]); // ✅ Using voterID as Document ID
      console.log(`✅ Added voter: ${voters[voterID].name} (ID: ${voterID})`);
    } catch (error) {
      console.error("❌ Error adding voter:", error);
    }
  }
}

uploadVoters();
