import { db } from '../firebase-config.js';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

console.log("Voter verification script loaded");

// API endpoint - will be replaced during build
const API_URL = window.API_URL;

// Add immediate console log to verify script loading only in development mode
console.log("Voter verification script loaded");

// Function to verify voter ID directly through Firestore
async function verifyVoterDirect(voterId) {
    try {
        console.log("Verifying voter ID directly:", voterId);
        
        // Query Firestore for voter where either voterID or voterId matches
        const votersRef = collection(db, "Voters");
        const q = query(votersRef, where("voterID", "==", voterId));
        const querySnapshot = await getDocs(q);

        let voterDoc;
        if (querySnapshot.empty) {
            // Try with lowercase 'd' if uppercase 'ID' didn't find anything
            const altQuery = query(votersRef, where("voterId", "==", voterId));
            const altSnapshot = await getDocs(altQuery);
            
            if (altSnapshot.empty) {
                console.log("❌ No such voter found in Firestore!");
                return { success: false, message: "Voter not found in database" };
            }
            voterDoc = altSnapshot.docs[0];
        } else {
            voterDoc = querySnapshot.docs[0];
        }

        const voterData = voterDoc.data();
        console.log("Found voter data:", voterData);

        // Check if voter is already verified
        if (voterData.status === "verified") {
            console.log("ℹ️ Voter already verified");
            return { 
                success: true, 
                message: "Voter already verified",
                data: voterData
            };
        }

        // Update the document status to "verified"
        const voterRef = doc(db, "Voters", voterDoc.id);
        await updateDoc(voterRef, { 
            status: "verified",
            verifiedAt: serverTimestamp()
        });
        
        console.log("✅ Voter Verified Successfully!");
        return { 
            success: true, 
            message: "Voter verified successfully",
            data: voterData
        };
    } catch (error) {
        console.error("Error verifying voter:", error);
        return { success: false, message: error.message };
    }
}

// Function to verify voter ID through backend
async function verifyVoterBackend(voterId) {
    try {
        console.log("Making request to:", `${API_URL}/verify-voter`);
        const response = await fetch(`${API_URL}/verify-voter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ voterId })
        });

        const data = await response.json();
        console.log("Backend response:", data);

        if (!response.ok) {
            throw new Error(data.error || 'Verification failed');
        }

        return data;
    } catch (error) {
        console.error("Error verifying voter:", error);
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
        
        // Verify directly through Firestore
        const result = await verifyVoterDirect(voterId);
        console.log("Verification result:", result);
        
        if (result.success) {
            showStatus(result.message, true);
            // Store verification status in session storage
            sessionStorage.setItem('verificationStatus', JSON.stringify({
                voterId: voterId,
                verified: true,
                message: result.message,
                data: result.data
            }));
            
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
        showStatus('Error verifying voter ID. Please try again.', false);
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