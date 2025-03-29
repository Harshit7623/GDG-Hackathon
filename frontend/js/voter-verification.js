import { db } from '../firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

console.log("Voter verification script loaded");

// API endpoint - will be replaced during build
const API_URL = window.API_URL || 'http://localhost:5001';

// Function to verify voter ID through backend API
async function verifyVoterBackend(voterId) {
    try {
        const response = await fetch(`${API_URL}/verify-voter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ voterId })
        });

        const data = await response.json();
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
        const voterData = {
            voterId: document.getElementById('voterId').value,
            name: document.getElementById('name').value,
            dob: document.getElementById('dob').value,
            constituency: document.getElementById('constituency').value
        };
        
        console.log("Form data:", voterData);
        
        // Verify through both frontend and backend
        const [frontendResult, backendResult] = await Promise.all([
            verifyVoterFrontend(voterData),
            verifyVoterBackend(voterData.voterId)
        ]);
        
        if (frontendResult.success && backendResult.message) {
            // Store verified voter data in session storage
            sessionStorage.setItem('verifiedVoter', JSON.stringify(frontendResult.data));
            alert("Voter ID verified successfully through both systems!");
            // Redirect to voting page or dashboard
            window.location.href = 'dashboard.html';
        } else {
            let errorMessage = "Verification failed: ";
            if (!frontendResult.success) {
                errorMessage += "Invalid voter details. ";
            }
            if (!backendResult.message) {
                errorMessage += "Backend verification failed.";
            }
            alert(errorMessage);
        }
    } catch (error) {
        console.error('Error in handleSubmit:', error);
        alert('Error verifying voter ID. Please try again.');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Verify Voter ID';
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