// MAMTA AI - AI Service V4
// Version: 4.0.0 - TASK 3: Real AI Activation
// Supports: OpenAI (Primary), Gemini (Fallback), Smart Fallback

class AIService {
    constructor() {
        this.primaryProvider = 'openai';
        this.fallbackProvider = 'gemini';
        this.openaiKey = localStorage.getItem('mamta_openai_key') || '';
        this.geminiKey = localStorage.getItem('mamta_gemini_key') || '';
        this.initialized = true;
        this.usageLog = [];
        this.timeout = 30000; // 30 seconds

        console.log('🤖 MAMTA AI: AI Service V4 initialized');
        console.log('   OpenAI Key:', this.openaiKey ? '✅ Configured' : '❌ Not set');
        console.log('   Gemini Key:', this.geminiKey ? '✅ Configured' : '❌ Not set');
    }

    // Main response method with retry and fallback
    async generateResponse(message, context = []) {
        const startTime = Date.now();

        try {
            // Try OpenAI first if key available
            if (this.openaiKey) {
                try {
                    const response = await this.callWithTimeout(
                        this.callOpenAI(message, context),
                        this.timeout
                    );
                    this.logUsage('openai', message, response.text, Date.now() - startTime);
                    return response;
                } catch (error) {
                    console.warn('⚠️ OpenAI failed:', error.message);
                    this.showToast('OpenAI unavailable, trying Gemini...', 'warning');
                }
            }

            // Try Gemini if key available
            if (this.geminiKey) {
                try {
                    const response = await this.callWithTimeout(
                        this.callGemini(message, context),
                        this.timeout
                    );
                    this.logUsage('gemini', message, response.text, Date.now() - startTime);
                    return response;
                } catch (error) {
                    console.warn('⚠️ Gemini failed:', error.message);
                }
            }

            // Final fallback: Smart responses
            console.log('ℹ️ Using smart fallback');
            const fallback = this.getSmartResponse(message);
            this.logUsage('fallback', message, fallback, Date.now() - startTime);
            return { success: true, text: fallback, provider: 'fallback' };

        } catch (error) {
            console.error('❌ AI generation failed:', error);
            return { 
                success: false, 
                error: error.message,
                text: this.getSmartResponse(message)
            };
        }
    }

    // Call OpenAI API with streaming support
    async callOpenAI(message, context) {
        const messages = [
            { 
                role: 'system', 
                content: 'You are MAMTA AI, a helpful assistant. Respond in Hindi if user writes in Hindi, otherwise in English. Be concise and helpful.' 
            },
            ...context.map(c => ({ role: c.role, content: c.content })),
            { role: 'user', content: message }
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.openaiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7,
                stream: false
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API error');
        }

        const data = await response.json();
        return {
            success: true,
            text: data.choices[0].message.content,
            provider: 'openai',
            tokens: data.usage?.total_tokens
        };
    }

    // Call Gemini API
    async callGemini(message, context) {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ 
                            text: `You are MAMTA AI. Respond in Hindi if user writes in Hindi, otherwise in English. User: ${message}` 
                        }]
                    }]
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Gemini API error');
        }

        const data = await response.json();
        return {
            success: true,
            text: data.candidates[0].content.parts[0].text,
            provider: 'gemini'
        };
    }

    // Timeout wrapper
    async callWithTimeout(promise, ms) {
        return Promise.race([
            promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), ms)
            )
        ]);
    }

    // Smart fallback responses (works without API key)
    getSmartResponse(message) {
        const lower = message.toLowerCase().trim();

        // Greetings
        if (/^(hello|hi|hey|namaste|नमस्ते|हाय|हेलो)/.test(lower)) {
            return 'नमस्ते! 🙏 MAMTA AI में आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूँ? कोडिंग, प्लानिंग, या कुछ और?';
        }

        if (/(kaise ho|how are you|कैसे हो|क्या हाल है)/.test(lower)) {
            return 'मैं बिल्कुल ठीक हूँ! 😊 आप कैसे हैं? मैं आपके लिए क्या कर सकता हूँ?';
        }

        // Code related
        if (/(code|program|coding|developer|html|css|js|python|app|website|software|कोड|प्रोग्राम)/.test(lower)) {
            return 'बढ़िया! 🚀 आप कोडिंग के बारे में पूछ रहे हैं। मैं आपको ये सिखा सकता हूँ:

• HTML/CSS/JavaScript
• Python
• React/Vue
• Database design
• API development

किस topic पर शुरू करें?';
        }

        // Planning / Project
        if (/(plan|project|idea|startup|business|app idea|प्लान|प्रोजेक्ट|आइडिया)/.test(lower)) {
            return 'शानदार! 💡 चलिए आपके idea को reality बनाते हैं। Planning Room में हम:

1. आपके idea को समझेंगे
2. Step-by-step plan बनाएंगे
3. Tech stack चुनेंगे
4. Timeline तय करेंगे

Workspace पर क्लिक करें!';
        }

        // Help
        if (/(help|madad|support|assist|मदद|सहायता)/.test(lower)) {
            return 'बिल्कुल! 🤝 मैं आपकी मदद के लिए यहाँ हूँ। मैं ये कर सकता हूँ:

• Code लिखना और समझाना
• Project plan करना
• Errors fix करना
• Ideas discuss करना

आप क्या करना चाहते हैं?';
        }

        // Thanks
        if (/(thank|thanks|dhanyavad|shukriya|धन्यवाद|शुक्रिया)/.test(lower)) {
            return 'आपका स्वागत है! 🙏 और कुछ मदद चाहिए तो बेझिझक पूछिए।';
        }

        // Bye
        if (/(bye|goodbye|alvida|see you|अलविदा|बाय)/.test(lower)) {
            return 'अलविदा! 👋 फिर मिलेंगे। अगर कुछ भी चाहिए तो वापस आइए। MAMTA AI हमेशा यहाँ है! 🧠';
        }

        // Name
        if (/(your name|who are you|tum kaun ho|आप कौन हो|तुम कौन हो)/.test(lower)) {
            return 'मैं MAMTA AI हूँ! 🧠 मैं एक smart assistant हूँ जो आपको coding, planning, और problem solving में मदद करता हूँ।';
        }

        // Time
        if (/(time|samay|time kya hua|क्या समय हुआ)/.test(lower)) {
            const now = new Date();
            return `अभी समय है: ${now.toLocaleTimeString('hi-IN')} 📅`;
        }

        // Default contextual response
        return `बहुत दिलचस्प! 🤔 "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"

मैं इस पर और जानकारी दे सकता हूँ। क्या आप:

• Detail में समझाना चाहेंगे?
• Code example चाहते हैं?
• Planning Room में इस पर काम करना चाहेंगे?`;
    }

    // Log usage for monitoring
    logUsage(provider, prompt, response, duration) {
        this.usageLog.push({
            provider,
            prompt: prompt.substring(0, 100),
            response: response.substring(0, 100),
            duration,
            timestamp: new Date().toISOString()
        });

        // Keep only last 100 entries
        if (this.usageLog.length > 100) {
            this.usageLog = this.usageLog.slice(-100);
        }

        // Save to localStorage
        localStorage.setItem('mamta_ai_usage', JSON.stringify(this.usageLog));
    }

    // Set API keys
    setOpenAIKey(key) {
        this.openaiKey = key;
        localStorage.setItem('mamta_openai_key', key);
        console.log('✅ OpenAI key configured');
    }

    setGeminiKey(key) {
        this.geminiKey = key;
        localStorage.setItem('mamta_gemini_key', key);
        console.log('✅ Gemini key configured');
    }

    // Check if real AI is available
    hasRealAI() {
        return !!(this.openaiKey || this.geminiKey);
    }

    // Show toast helper
    showToast(message, type) {
        if (window.errorHandler) {
            window.errorHandler.showToast(message, type);
        }
    }
}

// Create global instance
window.aiService = new AIService();

console.log('📦 MAMTA AI: ai-service-v4.js loaded');
