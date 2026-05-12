// Function to send text to your local Flask server
async function checkText(element) {
    const text = element.innerText.trim();
    if (text.length < 5 || text.length > 100) return;

    console.log("Sending to background:", text); // You should see this in the web console

    chrome.runtime.sendMessage({ action: "predict", text: text }, (data) => {
        // Check for errors in the connection
        if (chrome.runtime.lastError) {
            console.warn("Communication error:", chrome.runtime.lastError.message);
            return;
        }

        if (data && data.confidence > 0.6) { 
            console.log("Success! Model thinks this is:", data.label);
            highlightPattern(element, data.label);
        }
    });
}

function highlightPattern(element, label) {
    element.style.border = "3px solid red";
    element.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
    element.title = `AI Alert: This text matches a "${label}" dark pattern.`;
}

// Scan the page when it loads
const observer = new MutationObserver(() => {
    const tags = document.querySelectorAll('span, p, b, strong');
    tags.forEach(el => {
        if (!el.dataset.scanned) {
            el.dataset.scanned = "true";
            checkText(el);
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });