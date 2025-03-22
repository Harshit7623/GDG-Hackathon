const admin = require("firebase-admin");

// Ensure the environment variable is correctly set
console.log("Using key file:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
});

const db = admin.firestore();

// Test Firestore connection
db.collection("test").add({ message: "Firestore is working!" })
  .then((docRef) => {
    console.log("Document written with ID:", docRef.id);
  })
  .catch((error) => {
    console.error("Error adding document:", error);
  });
