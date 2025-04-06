const config = {
    apiUrl: process.env.NODE_ENV === 'production' 
        ? 'https://gdg-hackathon.vercel.app/api'
        : 'http://localhost:5001/api'
};

export default config; 