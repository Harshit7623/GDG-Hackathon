const config = {
    apiUrl: process.env.NODE_ENV === 'production' 
        ? 'https://gdg-hackathon-9574-qe03q33rv-harshits-projects-a26674e1.vercel.app'
        : 'http://localhost:5001/api'
};

export default config; 