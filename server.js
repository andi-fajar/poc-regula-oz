const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const path = require('path')
const PORT = 8080;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

app.use(express.static(path.join(__dirname, 'build')));

// Generic proxy endpoint that forwards all methods (GET, POST, PUT, DELETE, etc.)
app.post('/proxy/*', async (req, res) => {
    try {
        console.log("Hit post to " + req.url)
        // Get the target URL from the path (everything after /proxy/)
        const targetUrl = req.url.replace('/proxy/', 'https://api.advance.ai');
        console.log("Hit redirected post to " + targetUrl)
        
        // Forward the request to the target URL
        const response = await axios({
            method: req.method,
            url: targetUrl,
            data: req.body,
            headers: {
                // Forward original headers except host
                ...req.headers,
                host: new URL(targetUrl).host
            }
        });

        // Send the response back to the client
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(error.response?.status || 500).json({
            error: error.message
        });
    }
});

app.get('/*', function (req, res) {
    console.log("Hit get (static) to " + req.url)
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});