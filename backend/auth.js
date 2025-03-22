const { admin } = require("./firebase-config");
const functions = require("firebase-functions");

exports.verifyPhoneNumber = functions.https.onCall(async (data, context) => {
    // Ensure user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User is not authenticated.");
    }

    const phoneNumber = context.auth.token.phone_number;

    // Ensure phone number is available
    if (!phoneNumber) {
        throw new functions.https.HttpsError("invalid-argument", "Phone number is missing in authentication token.");
    }

    // List of allowed phone numbers
    const allowedNumbers = ["+911234567890", "+919876543210"];
    
    // Check if the user's phone number is allowed
    if (!allowedNumbers.includes(phoneNumber)) {
        throw new functions.https.HttpsError("permission-denied", "This phone number is not authorized.");
    }

    return { message: "Phone number verified successfully", phoneNumber };
});

