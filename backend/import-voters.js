const admin = require("firebase-admin");
const fs = require("fs");
const csv = require("csv-parser");

admin.initializeApp({
  credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
});

const db = admin.firestore();

// Function to import CSV data
const importVoters = async () => {
  fs.createReadStream("voter_data.csv")
    .pipe(csv())
    .on("data", async (row) => {
      try {
        await db.collection("voters").doc(row.voterID).set({
          name: row.name,
          age: parseInt(row.age),
          address: row.address,
          voterCardNumber: row.voterCardNumber,
          hasVoted: row.hasVoted === "true",
        });
        console.log(`Added voter: ${row.name}`);
      } catch (error) {
        console.error("Error adding voter:", error);
      }
    })
    .on("end", () => {
      console.log("Voter import complete.");
    });
};

importVoters();
