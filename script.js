// الحصول على العناصر بالـ ID
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const outputContainer = document.getElementById('outputContainer');
const asciiOutput = document.getElementById('asciiOutput');
const copyBtn = document.getElementById('copyBtn');
const errorContainer = document.getElementById('errorContainer');

// رابط الـ Cloudflare Worker بتاعك
const WORKER_URL = 'https://ai-symbol-generator.shiref-abouzaid.workers.dev/';

// دالة توليد الـ Symbol
async function generateSymbol() {
    const userPrompt = promptInput.value.trim();
    
    // التحقق من وجود نص
    if (!userPrompt) {
        showError('⚠️ Please enter a prompt for the symbol generation!');
        return;
    }
    
    // إخفاء الأخطاء السابقة
    errorContainer.innerHTML = '';
    
    // إخفاء النتيجة السابقة
    outputContainer.classList.remove('show');
    
    // تعطيل الزرار وتغيير النص
    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ Generating Symbol...';

    
    try {
        // إرسال الطلب للـ Worker
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: userPrompt })
        });
        
        const data = await response.json();
        
        // التحقق من وجود خطأ
        if (data.error) {
            throw new Error(data.error);
        }
        
        // عرض النتيجة
        asciiOutput.textContent = data.symbol;
        outputContainer.classList.add('show');
        
        // Scroll للنتيجة
        outputContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (error) {
        showError('❌ error: ' + error.message);
    } finally {
        // إعادة الزرار لحالته الطبيعية
        generateBtn.disabled = false;
        generateBtn.textContent = '✨ Generate Symbol';
    }
}

// دالة عرض الأخطاء
function showError(message) {
    errorContainer.innerHTML = `<div class="error">${message}</div>`;
}

// Detect if device is mobile (use global from index.html)
const isMobile2 = window.isMobile2 !== undefined ? window.isMobile2 : /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Fallback copy method (works better on mobile) - Same as index.html
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

// دالة نسخ النتيجة - Mobile Optimized (Same logic as index.html)
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

// ربط الأحداث
generateBtn.addEventListener('click', generateSymbol);
copyBtn.addEventListener('click', copyToClipboard);

// السماح بالضغط على Enter لتوليد الرسمة
promptInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateSymbol();
    }
});