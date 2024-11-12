

const beHost = "https://mfcrgla.mfc.staging-traveloka.com";
// const beHost = "http://localhost:8080"

export const getLivenessResult = async (transactionId) => {
    const url = beHost + '/oz-be/getLivenessResult';
    
    const payload = {
        transactionId
    };

    try {
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
        console.log("get liveness raw result : ")
        console.log(data)
        return data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error;
    }
}
