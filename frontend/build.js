const fs = require('fs');
const path = require('path');

// Read the API URL from environment variable or use default
const API_URL = process.env.API_URL || 'http://localhost:5000';

// Create the config file content
const configContent = `// This file is auto-generated during build
window.API_URL = '${API_URL}';
`;

// Write the config file
fs.writeFileSync(path.join(__dirname, 'config.js'), configContent);

console.log('✅ Config file generated with API_URL:', API_URL); 