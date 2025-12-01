// Mobile Navigation Toggle (Runs on all pages)
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');

        // Update ARIA attribute for accessibility
        const isExpanded = hamburger.classList.contains('active');
        hamburger.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu.contains(event.target);
        const isClickOnHamburger = hamburger.contains(event.target);

        if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
}

// AI Symbol Generator Code (Only runs on index.html)
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const outputContainer = document.getElementById('outputContainer');
const asciiOutput = document.getElementById('asciiOutput');
const copyBtn = document.getElementById('copyBtn');
const errorContainer = document.getElementById('errorContainer');
const retryMessage = document.getElementById('retryMessage');

// Cloudflare Worker URL
const WORKER_URL = 'https://ai-symbol-generator.shiref-abouzaid.workers.dev/';

// reCAPTCHA Site Key
const RECAPTCHA_SITE_KEY = '6Lc5ZR0sAAAAAMnsgEItgFq1GrQNfR2dYbC0V5uP';

// Only run generator code if elements exist (index.html)
if (promptInput && generateBtn && outputContainer) {

// Request state management
let isRequestPending = false;

// Function to generate symbol
async function generateSymbol() {
    const userPrompt = promptInput.value.trim();

    // Check if prompt is not empty
    if (!userPrompt) {
        showError('⚠️ Please enter a prompt for the symbol generation!');
        return;
    }

    // Prevent multiple simultaneous requests
    if (isRequestPending) {
        showError('⏳ Please wait... A request is already in progress!');
        return;
    }

    // Hide previous errors
    errorContainer.innerHTML = '';

    // Hide previous result
    outputContainer.classList.remove('show');
    if (retryMessage) retryMessage.classList.remove('show');

    // Disable button and change text
    generateBtn.disabled = true;
    generateBtn.textContent = '🔐 Verifying...';

    // Set request as pending
    isRequestPending = true;

    try {
        // Get reCAPTCHA token
        const recaptchaToken = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { 
            action: 'generate_symbol' 
        });

        // Update button text
        generateBtn.textContent = '⏳ Generating Symbol...';

        // Send request to Worker
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: userPrompt,
                recaptchaToken: recaptchaToken
            })
        });

        const data = await response.json();

        // Check for errors
        if (data.error) {
            throw new Error(data.error);
        }

        // Clear any previous errors (including "Please wait" message)
        errorContainer.innerHTML = '';

        // Display result
        asciiOutput.textContent = data.symbol;
        outputContainer.classList.add('show');
        if (retryMessage) retryMessage.classList.add('show');

        // Scroll to result
        outputContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (error) {
        showError('❌ Error: ' + error.message);
    } finally {
        // Reset request state
        isRequestPending = false;

        // Reset button to normal state
        generateBtn.disabled = false;
        generateBtn.textContent = '✨ Generate Symbol';
    }
}

// Function to show errors
function showError(message) {
    errorContainer.innerHTML = `<div class="error">${message}</div>`;
}

// Detect if device is mobile (use global from index.html)
const isMobile2 = window.isMobile2 !== undefined ? window.isMobile2 : /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Fallback copy method (works better on mobile)
function fallbackCopy(text) {
    return new Promise((resolve, reject) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        textArea.style.opacity = '0';
        textArea.style.zIndex = '9999';
        textArea.setAttribute('readonly', '');
        textArea.setAttribute('contenteditable', 'true');
        
        document.body.appendChild(textArea);
        
        // Focus and select for mobile devices
        textArea.focus();
        textArea.select();
        
        // For iOS devices
        if (navigator.userAgent.match(/ipad|iphone/i)) {
            const range = document.createRange();
            range.selectNodeContents(textArea);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            textArea.setSelectionRange(0, 999999);
        } else {
            // For Android and other devices
            textArea.setSelectionRange(0, 999999);
        }
        
        // Small delay to ensure selection is set
        setTimeout(() => {
            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    resolve(true);
                } else {
                    // Try clipboard API as last resort
                    if (navigator.clipboard && window.isSecureContext) {
                        navigator.clipboard.writeText(text).then(() => {
                            resolve(true);
                        }).catch(err => {
                            reject(new Error('All copy methods failed'));
                        });
                    } else {
                        reject(new Error('Copy command failed'));
                    }
                }
            } catch (err) {
                document.body.removeChild(textArea);
                // Try clipboard API as last resort
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(text).then(() => {
                        resolve(true);
                    }).catch(clipErr => {
                        console.error('All copy methods failed: ', err, clipErr);
                        reject(err);
                    });
                } else {
                    console.error('Fallback copy failed: ', err);
                    reject(err);
                }
            }
        }, 10);
    });
}

// Update copy button text while preserving icon structure
function updateCopyButtonText() {
    const copyText = copyBtn.querySelector('.copy-text');
    if (copyText) {
        const originalText = copyText.textContent;
        copyText.textContent = 'Copied!';
        copyText.style.color = '#4ade80';
        
        setTimeout(() => {
            copyText.textContent = originalText;
            copyText.style.color = '';
        }, 2000);
    } else {
        // Fallback if structure is different
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }
}

// Copy function - Mobile Optimized
function copyToClipboard() {
    const textToCopy = asciiOutput.textContent;
    
    if (!textToCopy || textToCopy.trim() === '') {
        showError('⚠️ No content to copy!');
        return;
    }
    
    // On mobile, prefer the textArea method as it's more reliable
    if (isMobile2) {
        fallbackCopy(textToCopy).then(() => {
            updateCopyButtonText();
        }).catch(err => {
            showError('❌ Failed to copy: ' + err.message);
        });
        return;
    }
    
    // On desktop, try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            updateCopyButtonText();
        }).catch(err => {
            console.error('Clipboard API failed: ', err);
            fallbackCopy(textToCopy).then(() => {
                updateCopyButtonText();
            }).catch(fallbackErr => {
                showError('❌ Failed to copy: ' + fallbackErr.message);
            });
        });
    } else {
        // Use fallback for non-secure contexts or older browsers
        fallbackCopy(textToCopy).then(() => {
            updateCopyButtonText();
        }).catch(err => {
            showError('❌ Failed to copy: ' + err.message);
        });
    }
}

// Event listeners
generateBtn.addEventListener('click', generateSymbol);
copyBtn.addEventListener('click', copyToClipboard);

// Allow Enter key to generate symbol
promptInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateSymbol();
    }
});

} // End of generator code conditional block