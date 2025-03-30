import { db } from '../firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

console.log("Voter verification script loaded");

// API endpoint configuration
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001'
    : 'https://your-backend-url.onrender.com';

console.log("Using API URL:", API_URL);

// Function to verify voter ID through backend API
async function verifyVoterBackend(voterId) {
    try {
        console.log("Verifying voter ID with backend:", voterId);
        const response = await fetch(`${API_URL}/verify-voter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                voterId: voterId,
                voterID: voterId  // Adding both formats to ensure compatibility
            })
        });

        const data = await response.json();
        console.log("Backend verification response:", data);

        // Return the data regardless of HTTP status code
        return data;
    } catch (error) {
        console.error("Backend verification error:", error);
        throw error;
    }
}

// Function to verify voter ID through Firestore
async function verifyVoterFrontend(voterData) {
    try {
        console.log("Verifying voter ID:", voterData);
        
        // Query the voters collection
        const votersRef = collection(db, "voters");
        const q = query(
            votersRef,
            where("voterId", "==", voterData.voterId),
            where("name", "==", voterData.name),
            where("dob", "==", voterData.dob),
            where("constituency", "==", voterData.constituency)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            // Voter found
            const voterDoc = querySnapshot.docs[0];
            console.log("Voter verified successfully:", voterDoc.data());
            return {
                success: true,
                message: "Voter ID verified successfully",
                data: voterDoc.data()
            };
        } else {
            // Voter not found
            console.log("Voter not found");
            return {
                success: false,
                message: "Invalid voter details. Please check and try again."
            };
        }
    } catch (error) {
        console.error("Error verifying voter ID:", error);
        throw error;
    }
}

// Function to handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    console.log("Form submitted");
    
    const submitBtn = document.getElementById('verifyBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';
    
    try {
        // Get form data
        const voterId = document.getElementById('voterId').value;
        
        if (!voterId) {
            throw new Error('Please enter a Voter ID');
        }
        
        console.log("Verifying voter ID:", voterId);
        
        // Verify through backend
        const result = await verifyVoterBackend(voterId);
        
        if (result.success) {
            // Store verification status in session storage
            sessionStorage.setItem('verificationStatus', JSON.stringify({
                voterId: voterId,
                verified: true,
                message: result.message
            }));
            showStatus(result.message, true);
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            // Show the message from the backend
            showStatus(result.message, false);
        }
    } catch (error) {
        console.error('Error in handleSubmit:', error);
        showStatus('Error connecting to server. Please try again.', false);
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Verify Voter ID';
    }
}

// Function to show status messages
function showStatus(message, isSuccess) {
    const statusDiv = document.getElementById('status');
    if (!statusDiv) {
        console.error("Status div not found!");
        return;
    }
    
    statusDiv.textContent = message;
    statusDiv.style.display = "block";
    
    // Use info style for not found cases, success for verified, error for other cases
    if (message.includes("not registered")) {
        statusDiv.className = 'status info';
    } else {
        statusDiv.className = `status ${isSuccess ? 'success' : 'error'}`;
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, setting up event handlers...");
    
    // Form handler
    const voterForm = document.getElementById('voterVerificationForm');
    if (!voterForm) {
        console.error("Voter verification form not found!");
        return;
    }
    
    console.log("Voter verification form found, adding submit handler...");
    
    // Add submit event listener to the form
    voterForm.addEventListener('submit', handleSubmit);
    
    console.log("Event listeners attached successfully");
}); 