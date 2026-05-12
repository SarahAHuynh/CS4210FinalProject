chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "predict") {
        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: request.text })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Result from Flask:", data);
            sendResponse(data); // Send the answer back to content.js
        })
        .catch(error => {
            console.error("Flask Fetch Error:", error);
            sendResponse(null);
        });
        
        return true; // CRITICAL: This keeps the connection open!
    }
});