// DOM Element references
const urlInput = document.getElementById('url-input');
// const customAlias = document.getElementById('custom-alias');
const shortenBtn = document.getElementById('shorten-btn');
const resultContainer = document.getElementById('result-container');
const originalUrlElement = document.getElementById('original-url');
const shortenedUrlElement = document.getElementById('shortened-url');
const copyBtn = document.getElementById('copy-btn');
const toast = document.getElementById('toast');

// Function to validate URL format
function isValidUrl(url) {
    try {
        const parsedUrl = new URL(url);
        return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch (e) {
        return false;
    }
}

// Function to show error messages
function showError(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden', 'success');
    toast.classList.add('error');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Function to show success messages
function showSuccess(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden', 'error');
    toast.classList.add('success');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Function to shorten URLs
async function shortenUrl() {
    const longUrl = urlInput.value.trim();
    // const alias = customAlias.value.trim();
    
    if (!longUrl) {
        showError('Please enter a URL');
        return;
    }
    
    if (!isValidUrl(longUrl)) {
        showError('Please enter a valid URL (include http:// or https://)');
        return;
    }
    
    try {
        shortenBtn.disabled = true;
        shortenBtn.textContent = 'Shortening...';
        
        const payload = { url: longUrl };
        // if (alias) {
        //     payload.customAlias = alias;
        // }
        
        // We'll use the proxy endpoint on our own server to avoid CORS issues
        const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        // Check if response is OK (2xx status)
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data); // Debug the response
        
        // Get the shortened URL from the correct response property
        // Adjust this based on the actual API response structure
        let shortUrl;
        if (data.shortUrl) {
            shortUrl = data.shortUrl;
        } else if (data.data && data.data.shortUrl) {
            shortUrl = data.data.shortUrl;
        } else if (data.shortened_url) {
            shortUrl = data.shortened_url;
        } else if (data.data && data.data.shortened_url) {
            shortUrl = data.data.shortened_url;
        } else if (data.url) {
            shortUrl = data.url;
        } else {
            console.error('Unexpected API response structure:', data);
            throw new Error('API returned an unexpected response format');
        }
        
        // Display the result
        originalUrlElement.textContent = longUrl;
        originalUrlElement.href = longUrl;
        shortenedUrlElement.textContent = shortUrl;
        shortenedUrlElement.href = shortUrl;
        
        console.log('Shortened URL:', shortUrl);
        console.log('Original URL:', longUrl);
        
        resultContainer.classList.remove('hidden');
        
        // Reset the form
        urlInput.value = '';
        // customAlias.value = '';
        
        showSuccess('URL shortened successfully!');
        
    } catch (error) {
        console.error('Error shortening URL:', error);
        showError(error.message || 'Failed to shorten URL. Please try again.');
    } finally {
        shortenBtn.disabled = false;
        shortenBtn.textContent = 'Shorten';
    }
}

// Copy shortened URL to clipboard
async function copyToClipboard() {
    const textToCopy = shortenedUrlElement.textContent;
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        showSuccess('Link copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy: ', err);
        showError('Failed to copy to clipboard');
    }
}

// Event listeners
shortenBtn.addEventListener('click', shortenUrl);
copyBtn.addEventListener('click', copyToClipboard);

// Allow Enter key to trigger shortening
urlInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        shortenUrl();
    }
});