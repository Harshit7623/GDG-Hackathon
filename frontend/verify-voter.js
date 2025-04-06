// API endpoint - will be replaced during build
const API_URL = window.API_URL || "http://localhost:5000";

let otpSent = false;

async function verifyVoter() {
  const voterID = document.getElementById("voter-id").value;
  const phone = document.getElementById("voter-phone").value;
  const otp = document.getElementById("voter-otp").value;

  if (!voterID) {
    showStatus("Please enter a Voter ID", false);
    return;
  }

  if (!otpSent) {
    if (!phone) {
      showStatus("Please enter your phone number", false);
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      showStatus(
        "Please enter a valid phone number with country code (e.g., +1234567890)",
        false
      );
      return;
    }

    try {
      const response = await fetch(`${API_URL}/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voterId: voterID, phone: phone }),
      });

      const data = await response.json();

      if (response.ok) {
        showStatus(
          "OTP sent to your phone number. Please check and enter the OTP.",
          true
        );
        otpSent = true;
        document.getElementById("otp-section").style.display = "block";
        document.getElementById("verify-btn").textContent = "Verify OTP";
      } else {
        showStatus(data.error || "Failed to send OTP", false);
      }
    } catch (error) {
      showStatus("Error connecting to server", false);
      console.error("Error:", error);
    }
  } else {
    if (!otp) {
      showStatus("Please enter the OTP", false);
      return;
    }

    // Validate OTP format
    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(otp)) {
      showStatus("Please enter a valid 6-digit OTP", false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/verify-voter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voterId: voterID,
          phone: phone,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showStatus(data.message, true);
        // Reset the form state
        otpSent = false;
        document.getElementById("otp-section").style.display = "none";
        document.getElementById("verify-btn").textContent = "Verify Voter";
      } else {
        showStatus(data.error || "Verification failed", false);
      }
    } catch (error) {
      showStatus("Error connecting to server", false);
      console.error("Error:", error);
    }
  }
}

function showStatus(message, isSuccess) {
  const statusDiv = document.getElementById("status");
  statusDiv.textContent = message;
  statusDiv.style.display = "block";
  statusDiv.className = `status ${isSuccess ? "success" : "error"}`;
}

document.getElementById("verify-btn").addEventListener("click", verifyVoter);
