import { db } from "./firebase-config.js";

// Function to check if a voter exists
export async function checkVoter(voterId) {
    try {
        if (!voterId) {
            return {
                success: false,
                message: "Voter ID is required"
            };
        }

        // Query for voter with matching voterID field
        const querySnapshot = await db.collection("Voters")
            .where("voterID", "==", voterId)
            .get();

        if (querySnapshot.empty) {
            return {
                success: false,
                message: "Voter not found in database"
            };
        }

        return {
            success: true,
            data: querySnapshot.docs[0].data()
        };
    } catch (error) {
        console.error("Error checking voter:", error);
        return {
            success: false,
            message: "Error checking voter status"
        };
    }
}

// Function to verify a voter
export async function verifyVoter(voterId) {
    try {
        // First check if voter exists
        const checkResult = await checkVoter(voterId);
        
        if (!checkResult.success) {
            return {
                success: false,
                message: checkResult.message
            };
        }

        const voterData = checkResult.data;
        
        // Check if already verified
        if (voterData.verified) {
            return {
                success: false,
                message: "Voter already verified"
            };
        }

        // Update verification status
        const querySnapshot = await db.collection("Voters")
            .where("voterID", "==", voterId)
            .get();

        if (!querySnapshot.empty) {
            await querySnapshot.docs[0].ref.update({
                verified: true,
                verifiedAt: new Date()
            });
        }

        return {
            success: true,
            message: "Voter verified successfully",
            data: voterData
        };
    } catch (error) {
        console.error("Error verifying voter:", error);
        return {
            success: false,
            message: "Error verifying voter"
        };
    }
}
