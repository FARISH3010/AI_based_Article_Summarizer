// Debug: Check storage API availability
console.log('Chrome storage available:', !!chrome.storage);
console.log('Chrome storage.local available:', !!chrome.storage?.local);
// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
    initAnimations();
});

// Add length selection to the summarize function
document.getElementById('summarize-btn').addEventListener('click', async () => {
    const summarizeBtn = document.getElementById('summarize-btn');
    const statusDiv = document.getElementById('status');
    const resultDiv = document.getElementById('summary-result');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const loadingText = document.querySelector('.loading-text');
    const lengthSelect = document.getElementById('length-select');
    
    const summaryLength = lengthSelect.value;

    // Reset previous results
    resultDiv.textContent = '';
    resultDiv.className = '';
    statusDiv.textContent = '';
    statusDiv.className = '';

    // Show loading state
    summarizeBtn.disabled = true;
    summarizeBtn.textContent = 'SUMMARIZING...';
    loadingSpinner.style.display = 'block';
    loadingText.textContent = 'Analyzing article content...';

    try {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        let url = tab.url;
        let title = tab.title;

        // Show URL preview
        statusDiv.textContent = 'Current Page:';
        const urlPreview = document.createElement('div');
        urlPreview.className = 'url-preview';
        urlPreview.textContent = url;
        statusDiv.appendChild(urlPreview);

        const backendUrl = 'http://localhost:5000/summarize';

        loadingText.textContent = 'Connecting to AI engine...';

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                url: url,
                length: summaryLength
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        loadingSpinner.style.display = 'none';
        loadingText.textContent = '';
        
        statusDiv.textContent = 'AI Summary:';
        resultDiv.textContent = data.summary;
        resultDiv.classList.add('summary-success');

        loadingText.textContent = 'Summary complete!';
        loadingText.style.color = '#4aff4a';

        // Save to history
        saveToHistory({
            url: url,
            title: title,
            summary: data.summary,
            length: summaryLength,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error:', error);
        loadingSpinner.style.display = 'none';
        loadingText.textContent = 'Failed to generate summary';
        loadingText.style.color = '#ff6b6b';
        statusDiv.textContent = 'Error:';
        statusDiv.style.color = '#ff6b6b';
        resultDiv.textContent = error.message;
        resultDiv.classList.add('error');
    } finally {
        setTimeout(() => {
            summarizeBtn.disabled = false;
            summarizeBtn.textContent = 'SUMMARIZE ARTICLE';
            loadingText.textContent = 'Ready to summarize';
            loadingText.style.color = '#8a8aff';
        }, 2000);
    }
});

// History Functions
function saveToHistory(item) {
    // Check if chrome.storage API is available
    if (!chrome.storage || !chrome.storage.local) {
        console.warn('Chrome storage API not available. History feature disabled.');
        return;
    }
    
    chrome.storage.local.get({history: []}, function(data) {
        const history = data.history;
        history.unshift(item);
        const limitedHistory = history.slice(0, 10);
        chrome.storage.local.set({history: limitedHistory}, function() {
            loadHistory();
        });
    });
}

function loadHistory() {
    // Check if chrome.storage API is available
    if (!chrome.storage || !chrome.storage.local) {
        console.warn('Chrome storage API not available. History feature disabled.');
        return;
    }
    
    chrome.storage.local.get({history: []}, function(data) {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        // Show message if no history
        if (data.history.length === 0) {
            historyList.innerHTML = '<div class="history-item">No history yet</div>';
            return;
        }
        
        data.history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-title">${item.title || 'Untitled'}</div>
                <div class="history-snippet">${item.summary.substring(0, 80)}...</div>
            `;
            
            historyItem.addEventListener('click', () => {
                document.getElementById('summary-result').textContent = item.summary;
                document.getElementById('status').textContent = 'Previous Summary:';
            });
            
            historyList.appendChild(historyItem);
        });
    });
}

// Clear history button
document.getElementById('clear-history').addEventListener('click', function() {
    if (!chrome.storage || !chrome.storage.local) {
        console.warn('Chrome storage API not available.');
        return;
    }
    
    chrome.storage.local.set({history: []}, function() {
        loadHistory();
    });
});

function loadHistory() {
    chrome.storage.local.get({history: []}, function(data) {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        data.history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-title">${item.title || 'Untitled'}</div>
                <div class="history-snippet">${item.summary.substring(0, 80)}...</div>
            `;
            
            historyItem.addEventListener('click', () => {
                document.getElementById('summary-result').textContent = item.summary;
                document.getElementById('status').textContent = 'Previous Summary:';
            });
            
            historyList.appendChild(historyItem);
        });
    });
}

// Clear history button
document.getElementById('clear-history').addEventListener('click', function() {
    chrome.storage.local.set({history: []}, function() {
        loadHistory();
    });
});

function initAnimations() {
    const container = document.querySelector('.container');
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        container.style.transition = 'all 0.5s ease-out';
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 100);
}