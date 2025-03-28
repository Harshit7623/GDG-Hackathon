// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
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

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Analytics and get a reference to the service
const analytics = getAnalytics(app);

export { auth, analytics };