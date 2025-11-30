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

// دالة نسخ النتيجة
function copyToClipboard() {
    const textToCopy = asciiOutput.textContent;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        // تغيير نص الزرار مؤقتاً
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        showError('Copy failed: ' + err.message);
    });
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