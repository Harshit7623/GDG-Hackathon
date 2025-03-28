import { auth } from './firebase-config.js';
import { signInWithPhoneNumber, RecaptchaVerifier } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let confirmationResult;

function showStatus(message, isSuccess, elementId = 'status') {
    const statusDiv = document.getElementById(elementId);
    statusDiv.textContent = message;
    statusDiv.style.display = "block";
    statusDiv.className = `status ${isSuccess ? 'success' : 'error'}`;
}

function setupRecaptcha() {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
            size: 'normal',
            callback: () => {
                console.log('reCAPTCHA solved');
            }
        }, auth);
    }
}

// Handle OTP input fields
document.querySelectorAll('.otp-input').forEach(input => {
    input.addEventListener('input', function(e) {
        // Allow only numbers
        this.value = this.value.replace(/[^0-9]/g, '');
        
        // Move to next input if value is entered
        if (this.value.length === 1) {
            const nextInput = this.nextElementSibling;
            if (nextInput) {
                nextInput.focus();
            }
        }
    });

    input.addEventListener('keydown', function(e) {
        // Handle backspace
        if (e.key === 'Backspace' && !this.value) {
            const prevInput = this.previousElementSibling;
            if (prevInput) {
                prevInput.focus();
            }
        }
    });
});

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Send OTP button
    document.getElementById('send-otp-btn').addEventListener('click', async () => {
        const phoneNumber = document.getElementById('phone').value;
        console.log('Attempting to send OTP to:', phoneNumber);
        
        if (!phoneNumber) {
            showStatus("Please enter a phone number", false);
            return;
        }

        try {
            // Clear any existing reCAPTCHA
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
            }
            
            setupRecaptcha();
            console.log('reCAPTCHA setup complete');
            
            confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
            console.log('OTP sent successfully');
            
            showStatus("OTP sent successfully!", true);
            document.getElementById('otp-section').style.display = 'block';
            // Focus first OTP input
            document.querySelector('.otp-input').focus();
        } catch (error) {
            console.error("Error sending OTP:", error);
            showStatus(error.message || "Error sending OTP", false);
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
            }
        }
    });

    // Verify OTP button
    document.getElementById('verify-otp-btn').addEventListener('click', async () => {
        // Get OTP from input fields
        const otpInputs = document.querySelectorAll('.otp-input');
        const otp = Array.from(otpInputs).map(input => input.value).join('');
        
        if (otp.length !== 6) {
            showStatus("Please enter a valid 6-digit OTP", false, 'otp-status');
            return;
        }

        try {
            console.log('Attempting to verify OTP');
            const result = await confirmationResult.confirm(otp);
            console.log("User verified:", result.user);
            showStatus("OTP verified successfully!", true, 'otp-status');
            // Redirect to verification page after a short delay
            setTimeout(() => {
                window.location.href = "verification.html";
            }, 1000);
        } catch (error) {
            console.error("OTP verification failed:", error);
            showStatus(error.message || "Invalid OTP", false, 'otp-status');
        }
    });
});
