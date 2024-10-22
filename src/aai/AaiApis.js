
// JUST for demo purpose, this should be on BE!!!
export const demoAaiLivenessSdkK3y = "379f953540f32653"
export const demoAaiS3cr3t = "5f53397a30d4396e"
var host = "https://mfcrgla.mfc.staging-traveloka.com";

// JUST for demo purpose, this should be on BE
export const generateEncryptedAaiSignature = async () => {
    const timestamp = Date.now().toString();
    console.log(`timestamp ${timestamp}`)

    const combined = demoAaiLivenessSdkK3y + demoAaiS3cr3t + timestamp;

    const encoder = new TextEncoder();
    const data = encoder.encode(combined);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return {
        signature: hashHex,
        timestamp: timestamp
    };
}

// JUST for demo purpose, this should be on BE!!!
export const generateToken = async () => {
    const url = 'https://api.advance.ai/openapi/auth/ticket/v1/generate-token';
    const { signature, timestamp} = await generateEncryptedAaiSignature()
    const payload = {
        accessKey: demoAaiLivenessSdkK3y,
        signature,
        timestamp
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("generate token result : ")
    console.log(data)
    return data
}

// JUST for demo purpose, this should be on BE!!!
export const generateLivenessH5 = async (accessToken) => {
    const url = 'https://api.advance.ai/openapi/liveness/v2/h5/token';
    
    const payload = {
        returnUrl: host + "/aai-liveness",
        failedReturnUrl: host + "/aai-liveness",
        // tryCount: 3,
        region: 'IDN'
    };
    console.log(payload)

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-ACCESS-TOKEN': accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("generate liveness result : ")
        console.log(data)
        return data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error;
    }
}

// JUST for demo purpose, this should be on BE!!!
export const getLivenessResult = async (accessToken, signatureId) => {
    const url = 'https://api.advance.ai/openapi/liveness/v4/h5/get-result';
    
    const payload = {
        signatureId
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-ACCESS-TOKEN': accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("get liveness raw result : ")
        console.log(data)
        return data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error;
    }
}