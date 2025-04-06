// Configuration for the frontend application
window.config = {
    API_URL: process.env.API_URL || 'http://localhost:5001',
    ENV: process.env.NODE_ENV || 'development'
};

// Ensure API URL is using HTTPS in production
if (window.config.ENV === 'production' && !window.config.API_URL.startsWith('https://')) {
    window.config.API_URL = window.config.API_URL.replace('http://', 'https://');
}