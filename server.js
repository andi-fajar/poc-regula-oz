const express = require('express');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const app = express();
const path = require('path')
const PORT = 8080;
const fs = require('fs');


// Enable CORS for all routes
app.use(cors());

app.use(express.json({limit: '50mb'}));
app.use(express.static(path.join(__dirname, 'build')));
// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });



app.post('/proxy/*', upload.any(), async (req, res) => {
    try {
        console.log("Hit post to " + req.url)
        const targetUrl = req.url.replace('/proxy/', 'https://api.advance.ai/');
        console.log("Hit redirected post to " + targetUrl)

        let data;
        let headers;

        if (req.is('multipart/form-data')) {
            const formData = new FormData();
            
            if (req.body) {
                Object.keys(req.body).forEach(key => {
                    formData.append(key, req.body[key]);
                });
            }

            if (req.files) {
                req.files.forEach(file => {
                    formData.append(file.fieldname, file.buffer, {
                        filename: file.originalname,
                        contentType: file.mimetype
                    });
                });
            }

            data = formData;
            headers = {
                'x-access-token': req.headers['x-access-token'],
                ...formData.getHeaders()
            };

        } else {
            headers = {
                'x-access-token': req.headers['x-access-token'],
                'content-type': req.headers['content-type']
            };
            data = req.body;
        }

        const response = await axios({
            method: req.method,
            url: targetUrl,
            data: data,
            headers: headers
        });
        console.log(response.data)
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