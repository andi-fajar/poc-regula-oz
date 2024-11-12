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

// const OZ_BE = "sandbox"
const OZ_BE = "https://prod.singapore.ozforensics.com/";
// set auth date
let ozSessionKey = null;
let ozExpireDate = null;
let ozExpiredKey = null;

const ozAuth = async () => {
    // This is demo account, you want to steal it?
    const p4dwd = "Plutus123!"
    const imel = "andi.fajar@traveloka.com"

    const response = await axios({
        method: "POST",
        url: OZ_BE + "api/authorize/auth",
        data: {
            "credentials": {
                "email": imel,
                "password": p4dwd
            }
        },
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.log("Request new Oz key")
    ozSessionKey = response.data.access_token
    ozExpireDate = response.data.expire_date
    ozExpiredKey = response.data.expire_token
}

const isOzExpire = () => {
    if (ozExpireDate !== null) {
        const expiredMilis = (ozExpireDate * 1000) - (60 * 1000)
        const currentDate = Date.now();
        return currentDate > expiredMilis
    } else {
        return true;
    }
}

const ozRefreshAuth = async () => {
    const isExpire = isOzExpire()
    if (!isExpire) {
        console.log("re-use key")
        return;
    }
    if (isExpire && ozExpiredKey !== null) {
        const response = await axios({
            method: "POST",
            url: OZ_BE + "api/authorize/refresh",
            data: {
                "expire_token": ozExpiredKey
            },
            headers: {
                'Content-Type': 'application/json',
                'X-Forensic-Access-Token': ozSessionKey
            }
        });
        console.log("Refresh OZ key")
        ozSessionKey = response.data.access_token
        ozExpireDate = response.data.expire_date
        ozExpiredKey = response.data.expire_token
    } else {
        await ozAuth()
    }
}

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

  app.post('/oz-be/getLivenessResult', async (req, res) => {
    try {
        const transactionId = req.body.transactionId
        console.log("Try to get OZ liveness result with transaction id " + transactionId)

        await ozRefreshAuth();
        const url = OZ_BE + "api/folders/"
        const now =  Date.now() - (60 * 60 * 1000)
        const config = {
            method: 'get',
            url: url + `?meta_data=transaction_id==${transactionId}&with_analyses=true&time_created.min=${now}`,
            headers: { 
              'X-Forensic-Access-Token': ozSessionKey
            }
          };
        const response = await axios(config);

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error(error)
        console.error('Proxy error:', error.message);
        res.status(error.response?.status || 500).json({
            error: error.message
        });
    }
});


app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});