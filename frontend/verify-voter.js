// API endpoint - will be replaced during build
const API_URL = window.API_URL || 'http://localhost:5000';

async function verifyVoter() {
    const voterID = document.getElementById("voter-id").value;
    const statusDiv = document.getElementById("status");

    if (!voterID) {
        showStatus("Please enter a Voter ID", false);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/verify-voter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ voterId: voterID })
        });

        const data = await response.json();

        if (response.ok) {
            showStatus(data.message, true);
        } else {
            showStatus(data.error || "Verification failed", false);
        }
    } catch (error) {
        showStatus("Error connecting to server", false);
        console.error("Error:", error);
    }
}

function showStatus(message, isSuccess) {
    const statusDiv = document.getElementById("status");
    statusDiv.textContent = message;
    statusDiv.style.display = "block";
    statusDiv.className = `status ${isSuccess ? 'success' : 'error'}`;
}

document.getElementById("verify-btn").addEventListener("click", verifyVoter);
