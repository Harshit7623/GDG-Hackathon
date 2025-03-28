import { auth } from './firebase-config.js';
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";

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
                // reCAPTCHA solved
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

window.sendOTP = async function(phoneNumber) {
    if (!phoneNumber) {
        showStatus("Please enter a phone number", false);
        return;
    }

    try {
        setupRecaptcha();
        confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
        showStatus("OTP sent successfully!", true);
        document.getElementById('otp-section').style.display = 'block';
        // Focus first OTP input
        document.querySelector('.otp-input').focus();
    } catch (error) {
        console.error("Error sending OTP:", error);
        showStatus(error.message || "Error sending OTP", false);
        window.recaptchaVerifier.clear();
    }
};

window.verifyOTP = async function() {
    // Get OTP from input fields
    const otpInputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(otpInputs).map(input => input.value).join('');
    
    if (otp.length !== 6) {
        showStatus("Please enter a valid 6-digit OTP", false, 'otp-status');
        return;
    }

    try {
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
};
