import { auth } from '../firebase-config.js';
import { RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Initialize reCAPTCHA verifier
let recaptchaVerifier = null;

async function setupRecaptcha() {
    try {
        if (!recaptchaVerifier) {
            console.log("Setting up reCAPTCHA...");
            console.log("Auth instance in setupRecaptcha:", auth);
            
            // Ensure auth is initialized
            if (!auth || !auth.settings) {
                console.log("Waiting for auth to be fully initialized...");
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // Create a new reCAPTCHA verifier
            recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
                size: 'invisible',
                callback: (response) => {
                    console.log("reCAPTCHA verified");
                }
            }, auth);
            
            console.log("reCAPTCHA setup complete");
            console.log("reCAPTCHA verifier:", recaptchaVerifier);
        }
    } catch (error) {
        console.error("Error setting up reCAPTCHA:", error);
        throw error;
    }
}

// Handle form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phoneNumber = document.getElementById('phoneNumber').value;
    const submitBtn = document.getElementById('submitBtn');
    
    try {
        // Setup reCAPTCHA
        await setupRecaptcha();
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending OTP...';
        
        console.log("Sending OTP to:", phoneNumber);
        console.log("Using reCAPTCHA verifier:", recaptchaVerifier);
        
        // Send OTP
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
        
        // Store the confirmation result
        window.confirmationResult = confirmationResult;
        
        // Redirect to OTP verification page
        window.location.href = 'otp.html';
    } catch (error) {
        console.error('Error sending OTP:', error);
        alert('Error sending OTP. Please try again.');
        
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send OTP';
        
        // Reset reCAPTCHA
        if (recaptchaVerifier) {
            recaptchaVerifier.clear();
            recaptchaVerifier = null;
        }
    }
}); 