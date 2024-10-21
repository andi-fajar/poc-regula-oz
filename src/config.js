// export const basePath = "https://faceapi.regulaforensics.com"
export const basePath = "https://mfcrgla.mfc.staging-traveloka.com";
export const demoAaiLivenessSdkK3y = "379f953540f32653"
export const demoAaiS3cr3t = "5f53397a30d4396e"

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
