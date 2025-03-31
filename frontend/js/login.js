// Add immediate console log to verify script loading
console.log("Login script loaded");

// Mock OTP generation and verification
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
}

function sendOTP(email) {
    // In a real application, this would send an email
    const otp = generateOTP();
    sessionStorage.setItem('currentOTP', otp.toString());
    console.log(`OTP for ${email}: ${otp}`); // For demo purposes
    return true;
}

function verifyOTP(enteredOTP) {
    const storedOTP = sessionStorage.getItem('currentOTP');
    return enteredOTP === storedOTP;
}

// Mock authentication function
function authenticateUser(email, password) {
    // For demo purposes, accept any email/password combination
    return {
        success: true,
        user: {
            email: email,
            name: "Demo User"
        }
    };
}

// Function to show status messages
function showStatus(message, isSuccess, elementId = 'status') {
    const statusDiv = document.getElementById(elementId);
    if (!statusDiv) {
        console.error(`Status div with id '${elementId}' not found!`);
        return;
    }
    
    statusDiv.textContent = message;
    statusDiv.style.display = "block";
    statusDiv.className = `status ${isSuccess ? 'success' : 'error'}`;
}

// Handle form submission
function handleSubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = document.getElementById('loginBtn');
    const status = document.getElementById('status');
    const otpSection = document.getElementById('otpSection');
    const otpInput = document.getElementById('otp');
    
    // If OTP section is hidden, this is the first step (email/password)
    if (otpSection.classList.contains('hidden')) {
        // Disable submit button and show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying...
        `;
        
        // Simulate API call delay
        setTimeout(() => {
            const result = authenticateUser(email, password);
            
            if (result.success) {
                // Send OTP
                if (sendOTP(email)) {
                    // Show OTP section
                    otpSection.classList.remove('hidden');
                    submitBtn.textContent = 'Verify OTP';
                    showStatus("OTP sent to your email!", true);
                } else {
                    showStatus("Failed to send OTP. Please try again.", false);
                }
            } else {
                showStatus("Invalid email or password", false);
            }
            
            // Reset button state
            submitBtn.disabled = false;
        }, 1000);
    } else {
        // This is the OTP verification step
        const enteredOTP = otpInput.value;
        
        if (verifyOTP(enteredOTP)) {
            // Store user session
            const user = JSON.parse(sessionStorage.getItem('user') || '{}');
            sessionStorage.setItem('user', JSON.stringify(user));
            showStatus("Login successful!", true);
            
            // Store login state
            sessionStorage.setItem('isLoggedIn', 'true');
            
            // Redirect to verification page after a short delay
            setTimeout(() => {
                window.location.href = "voter-verification.html";
            }, 1000);
        } else {
            showStatus("Invalid OTP. Please try again.", false);
        }
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, setting up event handlers...");
    
    // Form handler
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error("Login form not found!");
        return;
    }
    
    console.log("Login form found, adding submit handler...");
    
    // Add submit event listener to the form
    loginForm.addEventListener('submit', handleSubmit);
    
    console.log("Event listeners attached successfully");
}); 