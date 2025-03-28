const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

try {
    // Get credentials from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    
    // Convert to single line and escape quotes
    const formattedCredentials = JSON.stringify(credentials)
        .replace(/"/g, '\\"') // Escape double quotes
        .replace(/\n/g, '\\n'); // Escape newlines
    
    console.log('\n=== Formatted Credentials for Render ===\n');
    console.log(formattedCredentials);
    console.log('\n=== End of Credentials ===\n');
    
    // Save to a file for easy copying
    fs.writeFileSync(
        path.join(__dirname, 'render-credentials.txt'),
        formattedCredentials
    );
    console.log('Credentials have been saved to render-credentials.txt');
} catch (error) {
    console.error('Error processing credentials:', error.message);
    process.exit(1);
} 