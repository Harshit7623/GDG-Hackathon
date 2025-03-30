// Add immediate console log to verify script loading
console.log("Login script loaded");

// Mock authentication function
function authenticateUser(email, password) {
    // For demo purposes, accept any email/password combination
    // In a real application, this would validate against a backend
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

// Function to handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    console.log("Form submitted");
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = document.getElementById('submitBtn');
    
    if (!email || !password) {
        showStatus("Please enter both email and password", false);
        return;
    }
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        
        // Authenticate user
        const result = authenticateUser(email, password);
        
        if (result.success) {
            // Store user session
            sessionStorage.setItem('user', JSON.stringify(result.user));
            showStatus("Login successful!", true);
            
            // Redirect to verification page after a short delay
            setTimeout(() => {
                window.location.href = "voter-verification.html";
            }, 1000);
        } else {
            showStatus("Invalid email or password", false);
        }
    } catch (error) {
        console.error('Error in handleSubmit:', error);
        showStatus('Error logging in. Please try again.', false);
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
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