const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// API proxy endpoint
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
    
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        message: 'Failed to connect to the URL shortening service' 
      });
    }
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'public')));
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export the Express app for Vercel
module.exports = app;