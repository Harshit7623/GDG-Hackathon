// API endpoint - will be replaced during build
const API_URL = window.API_URL || "http://localhost:5001";

// Add immediate console log to verify script loading only in development mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log("Phone verification script loaded in demo mode");
}

let otpSent = false;

// Function to show status messages
function showStatus(message, isSuccess, elementId = "status") {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = "block";
    element.className = `mt-4 p-3 rounded ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
}

// Show OTP in a modal
function showOTPModal(otp) {
    // Create modal element if it doesn't exist
    let modal = document.getElementById('otpModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'otpModal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
        modal.innerHTML = `
            <div class="bg-white p-8 rounded-lg shadow-xl w-96 text-center">
                <h2 class="text-2xl font-bold mb-4">Your OTP</h2>
                <div id="otpDisplay" class="text-4xl font-bold mb-6 bg-blue-100 p-4 rounded-lg text-blue-800"></div>
                <p class="text-gray-600 mb-6">Please enter this OTP in the verification field.</p>
                <button id="closeModal" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                    Close
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Update OTP display
    document.getElementById('otpDisplay').textContent = otp;

    // Show modal
    modal.style.display = 'flex';

    // Add close button handler
    const closeModalBtn = document.getElementById('closeModal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.style.display = 'none';
        }
    });
}

// Wait for DOM to be fully loaded
window.addEventListener('DOMContentLoaded', () => {
    // Get auth data
    const auth = JSON.parse(sessionStorage.getItem("userAuth") || "{}");
    if (!auth.email || !auth.token) {
        window.location.href = "login.html";
        return;
    }

    // Check if phone is already verified
    if (sessionStorage.getItem("phoneVerified") === "true") {
        window.location.href = "voter-verification.html";
        return;
    }

    // Get form and set up event listener
    const form = document.getElementById("phoneVerificationForm");
    const otpSection = document.getElementById("otpSection");
    
    if (form && otpSection) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            
            const submitBtn = form.querySelector("button[type='submit']");
            const phone = form.phone.value;
            
            // Validate phone number is exactly 12 digits
            if (!/^[0-9]{12}$/.test(phone)) {
                showStatus("Please enter exactly 12 digits for your phone number", false);
                submitBtn.disabled = false;
                return;
            }
            const otp = form.otp?.value;
            
            if (!otpSent) {
                // Disable submit button and show loading state
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                `;

                try {
                    const response = await fetch(`${API_URL}/send-otp`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                            Authorization: `Bearer ${auth.token}`,
                        },
                        body: JSON.stringify({
                            email: auth.email,
                            phone: phone,
                        }),
                        mode: "cors",
                        credentials: "same-origin"
                    });

                    const data = await response.json();

                    if (response.ok) {
                        otpSent = true;
                        otpSection.classList.remove("hidden");
                        submitBtn.textContent = "Verify OTP";
                        
                        // Show the OTP in a modal
                        showOTPModal(data.otp);
                        
                        // Store phone number temporarily
                        sessionStorage.setItem("tempPhone", phone);
                    } else {
                        showStatus(data.error || "Failed to send OTP", false);
                    }
                } catch (error) {
                    // Only log errors in development mode
                    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                        console.error("Error:", error);
                    }
                    showStatus("Error connecting to server", false);
                }

                submitBtn.disabled = false;
            } else {
                // Disable submit button and show loading state
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying OTP...
                `;

                try {
                    const response = await fetch(`${API_URL}/verify-otp`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                            Authorization: `Bearer ${auth.token}`,
                        },
                        body: JSON.stringify({
                            otp: otp,
                        }),
                        mode: "cors",
                        credentials: "same-origin"
                    });

                    const data = await response.json();

                    if (response.ok) {
                        showStatus("Phone verification successful! Redirecting...", true);
                        
                        // Store verification status in both session and localStorage
                        sessionStorage.setItem("phoneVerified", "true");
                        localStorage.setItem("phoneVerified", "true");
                        
                        // Update auth data with phone verification status
                        const updatedAuth = {
                            ...auth,
                            phoneVerified: true,
                            phoneNumber: sessionStorage.getItem("tempPhone")
                        };
                        sessionStorage.setItem("userAuth", JSON.stringify(updatedAuth));
                        
                        // Redirect to voter verification page
                        setTimeout(() => {
                            window.location.href = "voter-verification.html";
                        }, 1500);
                    } else {
                        showStatus(data.error || "Invalid OTP. Please try again.", false);
                        submitBtn.disabled = false;
                        submitBtn.textContent = "Verify OTP";
                    }
                } catch (error) {
                    console.error("Error:", error);
                    showStatus("Error connecting to server", false);
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Verify OTP";
                }
            }
        });
    }
});
