// Function to copy Bitcoin address to clipboard
function copyAddress() {
    const address = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
    
    // Try to use the modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(address).then(() => {
            showCopyFeedback();
        }).catch(() => {
            fallbackCopy(address);
        });
    } else {
        fallbackCopy(address);
    }
}

// Fallback copy method for older browsers
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyFeedback();
    } catch (err) {
        console.log('Copy failed');
    }
    
    document.body.removeChild(textArea);
}

// Show feedback when address is copied
function showCopyFeedback() {
    const copyBtn = document.querySelector('.copy-btn');
    const originalText = copyBtn.textContent;
    
    copyBtn.textContent = 'COPIED!';
    copyBtn.style.background = 'linear-gradient(45deg, #00ff00, #008000)';
    copyBtn.style.borderColor = '#00ff00';
    
    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = 'linear-gradient(45deg, #333, #666)';
        copyBtn.style.borderColor = '#ff0000';
    }, 2000);
}

// Array to store picture filenames from the pc folder
let pictureFiles = [];

// Countdown timer variables
let countdownInterval;
let targetDate = new Date('August 31, 2025 07:56:00').getTime();

// Function to scan the pc folder for images
async function scanPcFolder() {
    try {
        // Try to fetch the directory listing
        const response = await fetch('/pc/');
        if (response.ok) {
            const html = await response.text();
            // Parse the directory listing to extract image files
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = doc.querySelectorAll('a');
            
            pictureFiles = Array.from(links)
                .map(link => link.href.split('/').pop())
                .filter(filename => {
                    const ext = filename.toLowerCase().split('.').pop();
                    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                });
        }
    } catch (error) {
        console.log('Could not scan pc folder');
        pictureFiles = [];
    }
    
    createPictureSquares();
}

// Function to create picture squares
function createPictureSquares() {
    const backgroundContainer = document.querySelector('.background-container');
    
    // Get exact viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const squareSize = 120; // Size of each square
    
    // Calculate exact number of squares needed to cover entire screen
    const columns = Math.ceil(viewportWidth / squareSize) + 1;
    const rows = Math.ceil(viewportHeight / squareSize) + 1;
    const totalSquares = columns * rows;
    
    // Clear existing squares
    backgroundContainer.innerHTML = '';
    
    // Create squares
    for (let i = 0; i < totalSquares; i++) {
        const square = document.createElement('div');
        square.className = 'picture-square';
        
        if (pictureFiles.length > 0) {
            // Randomly select a picture from the array
            const randomPicture = pictureFiles[Math.floor(Math.random() * pictureFiles.length)];
            square.style.backgroundImage = `url('pc/${randomPicture}')`;
        }
        
        backgroundContainer.appendChild(square);
    }
}

// Function to handle window resize
function handleResize() {
    createPictureSquares();
}

// Function to update countdown timer
function updateCountdown() {
    const now = new Date().getTime();
    const timeLeft = targetDate - now;
    
    if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        document.getElementById('countdown').textContent = "00:00:00";
        return;
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        if (days > 0) {
            countdownElement.textContent = `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            countdownElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
}

// Function to start countdown timer
function startCountdown() {
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Start by scanning the pc folder for images
    scanPcFolder();
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Start the countdown timer
    startCountdown();
});
