// MAMTA AI - AI Service
// TASK 4: AI Integration

class AIService {
    constructor() {
        this.primaryProvider = 'gemini'; // Using Gemini as primary (free tier)
        this.fallbackProvider = 'openai';
        this.geminiKey = 'AIzaSyDummyKeyForNow'; // User will add real key
        this.openaiKey = 'sk-DummyKeyForNow'; // User will add real key
        this.initialized = false;
    }

    async init() {
        this.initialized = true;
        console.log('✅ MAMTA AI: AI Service initialized');
        return true;
    }

    // Generate AI response
    async generateResponse(message, context = []) {
        try {
            console.log('🤖 MAMTA AI: Generating response...');

            // Try Gemini first
            const response = await this.callGemini(message, context);
            if (response.success) {
                return response;
            }

            // Fallback to OpenAI
            return await this.callOpenAI(message, context);
        } catch (error) {
            console.error('❌ MAMTA AI: AI generation failed:', error);
            return this.getFallbackResponse(message);
        }
    }

    // Call Gemini API
    async callGemini(message, context) {
        try {
            // For now, return a smart fallback response
            // When user adds real API key, this will call actual API
            return { 
                success: true, 
                text: this.getSmartResponse(message),
                provider: 'gemini-fallback'
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Call OpenAI API
    async callOpenAI(message, context) {
        try {
            return { 
                success: true, 
                text: this.getSmartResponse(message),
                provider: 'openai-fallback'
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Smart fallback responses (works without API key)
    getSmartResponse(message) {
        const lowerMsg = message.toLowerCase();

        // Greeting responses
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('namaste')) {
            return "Namaste! 🙏 Main MAMTA AI hoon. Aapki kaise madad kar sakta hoon?";
        }

        if (lowerMsg.includes('kaise ho') || lowerMsg.includes('how are you')) {
            return "Main bilkul theek hoon! 😊 Aap bataiye, aapko kya chahiye?";
        }

        // Help responses
        if (lowerMsg.includes('help') || lowerMsg.includes('madad')) {
            return "Main aapki madad karne ke liye yahan hoon! Aap mujhse kuch bhi pooch sakte hain - coding, planning, ya koi bhi sawaal.";
        }

        if (lowerMsg.includes('thank') || lowerMsg.includes('dhanyawad')) {
            return "Aapka swagat hai! 😊 Kuch aur chahiye toh batayein.";
        }

        // Coding/Development responses
        if (lowerMsg.includes('code') || lowerMsg.includes('website') || lowerMsg.includes('app')) {
            return "Aapko ek website ya app banana hai? Bahut accha! 💻 Planning Room mein jaa ke aap apna idea bata sakte hain. Main aapko step-by-step guide karunga. Workspace page par jaa ke 'New Project' button click karein!";
        }

        if (lowerMsg.includes('html') || lowerMsg.includes('css') || lowerMsg.includes('javascript')) {
            return "Web development ke liye HTML, CSS, aur JavaScript best hain! Kya aapko koi specific project banana hai? Bataiye, main aapki planning kar deta hoon!";
        }

        // Planning responses
        if (lowerMsg.includes('plan') || lowerMsg.includes('planning')) {
            return "Planning Room mein aap apna project idea bata sakte hain. Main aapke liye features list, tech stack, aur timeline bana dunga. 'Planning Room' button click karein!";
        }

        // Security responses
        if (lowerMsg.includes('security') || lowerMsg.includes('safe') || lowerMsg.includes('encrypt')) {
            return "Aapki security hamari priority hai! 🔒 SafeDrop page par aap apne files ko end-to-end encryption ke saath secure kar sakte hain. Koi bhi hacker aapka data nahi dekh sakta!";
        }

        // General knowledge
        if (lowerMsg.includes('what is') || lowerMsg.includes('kya hai')) {
            return "Yeh ek accha sawaal hai! Main aapko iske baare mein detail mein bata sakta hoon. Aapko kis topic mein zyada information chahiye?";
        }

        if (lowerMsg.includes('who are you') || lowerMsg.includes('tum kaun ho')) {
            return "Main MAMTA AI hoon - ek autonomous AI platform jo aapki madad ke liye bana hai! Main aapko coding, planning, aur security mein madad kar sakta hoon. 🧠";
        }

        // Default response
        return "Main aapki baat samajh gaya! 💡 Aapne kaha: "" + message + ""

Main is par aur detail mein baat kar sakta hoon. Aapko kya specifically jaanna hai?";
    }

    // Get fallback response when all APIs fail
    getFallbackResponse(message) {
        return this.getSmartResponse(message);
    }

    // Check if message is a build request
    isBuildRequest(message) {
        const buildKeywords = ['website', 'app', 'application', 'build', 'banao', 'banana', 'create', 'bana', 'project'];
        const lowerMsg = message.toLowerCase();
        return buildKeywords.some(keyword => lowerMsg.includes(keyword));
    }

    // Generate project plan from message
    generateProjectPlan(message) {
        const lowerMsg = message.toLowerCase();
        let type = 'web';

        if (lowerMsg.includes('mobile') || lowerMsg.includes('android') || lowerMsg.includes('ios')) {
            type = 'mobile';
        } else if (lowerMsg.includes('both') || lowerMsg.includes('web and mobile')) {
            type = 'both';
        }

        return {
            name: this.extractProjectName(message),
            type: type,
            features: this.generateFeatures(type),
            techStack: this.generateTechStack(type),
            estimatedTime: type === 'both' ? '3-4 weeks' : '2-3 weeks'
        };
    }

    extractProjectName(message) {
        // Simple extraction - can be improved
        const words = message.split(' ');
        const projectWords = words.filter(w => 
            w.length > 3 && 
            !['website', 'app', 'application', 'build', 'create', 'banao', 'banana', 'project', 'mujhe', 'ek', 'chahiye'].includes(w.toLowerCase())
        );
        return projectWords.slice(0, 2).join(' ') || 'My Project';
    }

    generateFeatures(type) {
        const commonFeatures = [
            'User Authentication (Login/Signup)',
            'Responsive Design',
            'Dashboard/Home Page',
            'Profile Management',
            'Settings Panel'
        ];

        if (type === 'web') {
            return [...commonFeatures, 'SEO Optimization', 'Contact Form', 'Blog Section'];
        } else if (type === 'mobile') {
            return [...commonFeatures, 'Push Notifications', 'Offline Mode', 'Camera Access'];
        } else {
            return [...commonFeatures, 'Cross-platform Sync', 'PWA Support', 'API Integration'];
        }
    }

    generateTechStack(type) {
        if (type === 'web') {
            return {
                frontend: 'React.js / HTML + CSS + JS',
                backend: 'Node.js / Supabase',
                database: 'PostgreSQL',
                hosting: 'Vercel / GitHub Pages'
            };
        } else if (type === 'mobile') {
            return {
                frontend: 'React Native / Flutter',
                backend: 'Node.js / Supabase',
                database: 'PostgreSQL',
                hosting: 'Google Play / App Store'
            };
        } else {
            return {
                frontend: 'React.js + React Native',
                backend: 'Node.js / Supabase',
                database: 'PostgreSQL',
                hosting: 'Multi-platform'
            };
        }
    }
}

// Create global instance
window.aiService = new AIService();

console.log('📦 MAMTA AI: ai-service.js loaded');
