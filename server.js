const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios'); // You'll need to install this: npm install axios

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Proxy for shortening API to avoid CORS issues
app.post('/api/shorten', async (req, res) => {
    try {
        console.log('Received request to shorten URL:', req.body);
        
        const response = await axios.post(
            'https://rcefn1q34m.execute-api.eu-central-1.amazonaws.com/prod/shorten',
            req.body,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );
        
        console.log('API Response Status:', response.status);
        console.log('API Response Data:', response.data);
        
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error proxying to shortener API:', error.message);
        
        // Log detailed error information
        if (error.response) {
            console.error('API error response:', {
                status: error.response.status,
                headers: error.response.headers,
                data: error.response.data
            });
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            console.error('No response received from API');
            res.status(500).json({ 
                message: 'No response received from the URL shortening service' 
            });
        } else {
            console.error('Error setting up the request:', error.message);
            res.status(500).json({ 
                message: 'Failed to connect to the URL shortening service' 
            });
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});