import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
const verifyVoterFunction = httpsCallable(functions, "verifyVoter");

async function verifyVoter() {
    const voterID = document.getElementById("voter-id").value;

    try {
        const response = await verifyVoterFunction({ voterId: voterID });
        alert(response.data.message);
    } catch (error) {
        alert("Error: " + error.message);
    }
}

document.getElementById("verify-btn").addEventListener("click", verifyVoter);
