console.log("Script started loading...");

// Initialize reCAPTCHA verifier
let recaptchaVerifier = null;

async function setupRecaptcha() {
    try {
        if (!recaptchaVerifier) {
            console.log("Setting up reCAPTCHA...");
            console.log("Auth instance in setupRecaptcha:", firebase.auth());
            
            // Create a new reCAPTCHA verifier
            recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                size: 'invisible',
                callback: (response) => {
                    console.log("reCAPTCHA verified");
                }
            });
            
            console.log("reCAPTCHA setup complete");
            console.log("reCAPTCHA verifier:", recaptchaVerifier);
        }
    } catch (error) {
        console.error("Error setting up reCAPTCHA:", error);
        throw error;
    }
}

// Function to send OTP
async function sendOTP(phoneNumber) {
    console.log("Starting OTP sending process...");
    try {
        // Setup reCAPTCHA
        await setupRecaptcha();
        
        console.log("Sending OTP to:", phoneNumber);
        console.log("Using reCAPTCHA verifier:", recaptchaVerifier);
        
        // Send OTP
        const confirmationResult = await firebase.auth().signInWithPhoneNumber(phoneNumber, recaptchaVerifier);
        
        // Store the confirmation result
        window.confirmationResult = confirmationResult;
        
        console.log("OTP sent successfully!");
        return confirmationResult;
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw error;
    }
}

// Function to handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    console.log("Form submitted");
    
    const phoneNumber = document.getElementById('phoneNumber').value;
    const submitBtn = document.getElementById('submitBtn');
    
    if (!phoneNumber) {
        console.error("Phone number is required");
        alert("Please enter your phone number");
        return;
    }
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending OTP...';
        
        // Send OTP
        await sendOTP(phoneNumber);
        
        // Redirect to OTP verification page
        window.location.href = 'otp.html';
    } catch (error) {
        console.error('Error in handleSubmit:', error);
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
}

// Function to test if the script is working
function testScript() {
    console.log("Test button clicked!");
    alert("Script is working!");
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, setting up event handlers...");
    
    // Test button handler
    const testBtn = document.getElementById('testBtn');
    if (testBtn) {
        console.log("Test button found");
        testBtn.addEventListener('click', testScript);
    } else {
        console.error("Test button not found!");
    }
    
    // Form handler
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error("Login form not found!");
        return;
    }
    
    console.log("Login form found, adding submit handler...");
    
    // Add submit event listener to the form
    loginForm.addEventListener('submit', (e) => {
        console.log("Form submit event triggered");
        handleSubmit(e);
    });
    
    // Add click event listener to the button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        console.log("Submit button found");
        submitBtn.addEventListener('click', (e) => {
            console.log("Submit button clicked");
            handleSubmit(e);
        });
    } else {
        console.error("Submit button not found!");
    }
    
    console.log("All event listeners attached successfully");
}); 