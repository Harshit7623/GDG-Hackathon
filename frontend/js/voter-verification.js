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
            body: JSON.stringify({ voterId })
        });

        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Raw backend response:", data);

        // Only throw error for server errors (500+), not for 404
        if (response.status >= 500) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error("Backend verification error:", error);
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
        console.log("Verification result:", result);
        
        if (result.success) {
            // Store verification status in session storage
            sessionStorage.setItem('verificationStatus', JSON.stringify({
                voterId: voterId,
                verified: true,
                message: result.message,
                data: result.data
            }));
            showStatus(result.message, true);
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            console.log("Verification failed:", result);
            showStatus(result.message || "Verification failed", false);
        }
    } catch (error) {
        console.error('Error in handleSubmit:', error);
        showStatus('Server error. Please try again later.', false);
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
    statusDiv.className = `status ${isSuccess ? 'success' : 'error'}`;
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