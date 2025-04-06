// API endpoint - will be replaced during build
const API_URL = window.API_URL || "https://gdg-hackathon-9574-qe03q33rv-harshits-projects-a26674e1.vercel.app";

// Add immediate console log to verify script loading
console.log("Phone verification script loaded");

let otpSent = false;

// Function to show status messages
function showStatus(message, isSuccess, elementId = "status") {
  const statusDiv = document.getElementById(elementId);
  if (!statusDiv) {
    console.error(`Status div with id '${elementId}' not found!`);
    return;
  }

  statusDiv.textContent = message;
  statusDiv.style.display = "block";
  statusDiv.className = `status ${isSuccess ? "success" : "error"}`;
}

// Handle form submission
async function handleSubmit(event) {
  event.preventDefault();

  const phone = document.getElementById("phone").value;
  const submitBtn = document.getElementById("verifyBtn");
  const otpSection = document.getElementById("otpSection");
  const otpInput = document.getElementById("otp");

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
