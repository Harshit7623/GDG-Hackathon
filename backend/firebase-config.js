const admin = require("firebase-admin");
require("dotenv").config(); // Load environment variables

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_CREDENTIALS)),
    databaseURL: "https://your-project-id.firebaseio.com"
});

const db = admin.firestore();

module.exports = { admin, db };
