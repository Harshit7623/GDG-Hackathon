import { db } from '../firebase-config.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function importAllVoters() {
    try {
        // Read the voters.json file
        const votersData = JSON.parse(fs.readFileSync(join(__dirname, '../voters.json'), 'utf8'));
        console.log(`Found ${votersData.length} voters to import`);

        // Import each voter
        for (const voter of votersData) {
            try {
                // Add status and createdAt fields
                const voterData = {
                    ...voter,
                    status: "unverified",
                    createdAt: new Date()
                };

                // Add to Firestore
                await db.collection("Voters").doc(voterData.voterId).set(voterData);
                console.log(`✅ Imported voter: ${voterData.name} (ID: ${voterData.voterId})`);
            } catch (error) {
                console.error(`❌ Error importing voter ${voter.voterId}:`, error);
            }
        }

        console.log("✅ Voter import complete!");
    } catch (error) {
        console.error("❌ Error reading voters.json:", error);
    }
}

importAllVoters(); 