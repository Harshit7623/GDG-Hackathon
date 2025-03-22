const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.verifyVoter = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }

    const voterID = data.voterId;
    const voterRef = db.collection("Voters").doc(voterID);
    const voterSnap = await voterRef.get();

    if (!voterSnap.exists) {
        throw new functions.https.HttpsError("not-found", "Voter not found.");
    }

    await voterRef.update({ status: "verified" });

    return { message: "Voter verified successfully!" };
});

