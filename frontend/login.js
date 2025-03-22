import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";

const auth = getAuth();
window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);

function sendOTP(phoneNumber) {
    signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
        .then((confirmationResult) => {
            window.confirmationResult = confirmationResult;
            console.log("OTP Sent!");
        })
        .catch((error) => {
            console.error("Error sending OTP:", error);
        });
}

function verifyOTP(code) {
    window.confirmationResult.confirm(code)
        .then((result) => {
            console.log("User Verified:", result.user);
            // Redirect to verification page
            window.location.href = "verification.html";
        })
        .catch((error) => {
            console.error("OTP Verification Failed:", error);
        });
}

export { sendOTP, verifyOTP };
