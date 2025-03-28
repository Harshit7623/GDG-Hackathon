console.log("Firebase config script started loading...");

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDaQJIjo8i2fPVN7Zg_abxklra3_qqvCEg",
  authDomain: "modern-voting-verification.firebaseapp.com",
  projectId: "modern-voting-verification",
  storageBucket: "modern-voting-verification.firebasestorage.app",
  messagingSenderId: "143426270111",
  appId: "1:143426270111:web:e20a1c5380a0d8437e83aa",
  measurementId: "G-ZG0KW81C4M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);

console.log("Firebase initialized successfully");
console.log("Auth instance:", auth);
console.log("Firestore instance:", db);

export { app, auth, analytics, db };