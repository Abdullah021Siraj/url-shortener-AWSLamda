const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Your Vercel URL - used for shortening
const BASE_URL = 'https://url-shortener-nu-lilac.vercel.app';

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Proxy for shortening API to avoid CORS issues
app.post('/api/shorten', async (req, res) => {
    try {
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
        
        // Transform the API response to use your domain
        const data = response.data;
        
        // Extract the short code from the returned URL
        let shortCode = '';
        if (data.shortUrl) {
            // Try to extract the code from the returned URL
            try {
                const url = new URL(data.shortUrl);
                shortCode = url.pathname.split('/').pop(); // Get the last part of the path
            } catch (error) {
                console.error('Error parsing short URL:', error);
                // If URL parsing fails, take the last part after the last slash
                shortCode = data.shortUrl.split('/').pop();
            }
            
            // Construct the new short URL with your domain
            data.shortUrl = `${BASE_URL}/${shortCode}`;
        }
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Error proxying to shortener API:', error.message);
        
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ 
                message: 'Failed to connect to the URL shortening service' 
            });
        }
    }
});

// Handle redirect requests for shortened URLs
app.get('/:shortCode', async (req, res) => {
    try {
        const shortCode = req.params.shortCode;
        
        // Skip processing for specific paths
        if (['api', 'favicon.ico', 'index.html', 'styles.css', 'script.js'].includes(shortCode)) {
            return next();
        }
        
        // Call the API Gateway to resolve the short code
        const response = await axios.get(
            `https://rcefn1q34m.execute-api.eu-central-1.amazonaws.com/prod/${shortCode}`
        );
        
        // Redirect to the original URL
        if (response.data && response.data.originalUrl) {
            return res.redirect(response.data.originalUrl);
        } else {
            return res.status(404).send('Short URL not found');
        }
    } catch (error) {
        console.error('Error resolving short URL:', error.message);
        return res.status(404).send('Short URL not found or invalid');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Export the app for Vercel
module.exports = app;