// API endpoint - will be replaced during build
const API_URL = window.API_URL || "https://gdg-hackathon-9574-git-main-harshits-projects-a26674e1.vercel.app";

// Add immediate console log to verify script loading
console.log("Login script loaded");

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

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const submitBtn = document.getElementById("loginBtn");

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showStatus("Please enter a valid email address", false);
    return;
  }

  // Disable submit button and show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Verifying...
  `;

  try {
    console.log(`Attempting to connect to ${API_URL}/login`);
    
    // Send login request to server
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
      mode: "cors",
      credentials: "same-origin"
    });

    const data = await response.json();

    if (response.ok) {
      // Store email in session for phone verification
      sessionStorage.setItem(
        "userAuth",
        JSON.stringify({
          email: email,
          token: data.token,
        })
      );

      showStatus("Login successful! Redirecting...", true);

      // Redirect to phone verification page
      setTimeout(() => {
        window.location.href = "phone-verification.html";
      }, 1000);
    } else {
      showStatus(data.error || "Invalid email or password", false);
    }
  } catch (error) {
    console.error("Error:", error);
    showStatus("Error connecting to server", false);
  }

  // Reset button state
  submitBtn.disabled = false;
  submitBtn.textContent = "Login";
}

// Check if user is already authenticated
function checkAuth() {
  const auth = sessionStorage.getItem("userAuth");
  if (auth) {
    window.location.href = "phone-verification.html";
  }
}

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, setting up event handlers...");

  // Check authentication status
  checkAuth();

  // Form handler
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) {
    console.error("Login form not found!");
    return;
  }

  console.log("Login form found, adding submit handler...");

  // Add submit event listener to the form
  loginForm.addEventListener("submit", handleSubmit);

  console.log("Event listeners attached successfully");
});
