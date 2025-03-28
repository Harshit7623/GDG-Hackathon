import { auth } from '../firebase-config.js';
import { RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Initialize reCAPTCHA verifier
let recaptchaVerifier;
window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    'size': 'invisible',
    'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
    }
});

// Handle form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phoneNumber = document.getElementById('phoneNumber').value;
    const recaptchaContainer = document.getElementById('recaptcha-container');
    
    try {
        // Show loading state
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('submitBtn').textContent = 'Sending OTP...';
        
        // Send OTP
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
        
        // Store the confirmation result
        window.confirmationResult = confirmationResult;
        
        // Redirect to OTP verification page
        window.location.href = 'otp.html';
    } catch (error) {
        console.error('Error sending OTP:', error);
        alert('Error sending OTP. Please try again.');
        
        // Reset button state
        document.getElementById('submitBtn').disabled = false;
        document.getElementById('submitBtn').textContent = 'Send OTP';
        
        // Reset reCAPTCHA
        window.recaptchaVerifier.clear();
    }
}); 