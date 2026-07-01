// 🤖 MAMTA AI — AI Service (OpenAI/Gemini API)

class MAMTAAI {
    constructor() {
        // Replace with your actual API key
        this.API_KEY = 'YOUR_OPENAI_OR_GEMINI_API_KEY';
        this.API_URL = 'https://api.openai.com/v1/chat/completions';
        // For Gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
    }

    // Send message to AI
    async sendMessage(message, history = []) {
        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4', // or 'gpt-3.5-turbo'
                    messages: [
                        {
                            role: 'system',
                            content: `You are MAMTA AI, an autonomous AI assistant. You can:
                            1. Answer any questions about the world, history, science, etc.
                            2. Help plan and build web/mobile applications
                            3. Write code in any programming language
                            4. Provide security advice

                            Respond in the same language as the user's query (Hindi or English).
                            Be helpful, friendly, and professional.`
                        },
                        ...history,
                        { role: 'user', content: message }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            const data = await response.json();
            return {
                success: true,
                response: data.choices[0].message.content
            };
        } catch (error) {
            console.error('AI Error:', error);
            return {
                success: false,
                error: 'AI service temporarily unavailable. Please try again.',
                fallback: true
            };
        }
    }

    // Generate project plan
    async generatePlan(projectIdea) {
        const prompt = `Create a detailed project plan for: "${projectIdea}"

        Return JSON format:
        {
            "type": "web|mobile|both",
            "features": ["feature1", "feature2", ...],
            "techStack": {
                "frontend": "...",
                "backend": "...",
                "database": "...",
                "hosting": "..."
            },
            "timeline": "X weeks",
            "estimatedCost": "$X - $Y"
        }`;

        try {
            const result = await this.sendMessage(prompt);
            if (result.success) {
                // Parse JSON from response
                const jsonMatch = result.response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            }
            return this.getDefaultPlan(projectIdea);
        } catch (error) {
            return this.getDefaultPlan(projectIdea);
        }
    }

    // Default plan if AI fails
    getDefaultPlan(idea) {
        return {
            type: 'web',
            features: [
                'User Authentication (Email, Google, Phone)',
                'Responsive Dashboard',
                'Real-time Notifications',
                'Payment Integration',
                'Admin Panel',
                'Multi-language Support'
            ],
            techStack: {
                frontend: 'React + Tailwind CSS',
                backend: 'Node.js + Express',
                database: 'Supabase PostgreSQL',
                hosting: 'Vercel / Supabase'
            },
            timeline: '2-4 weeks',
            estimatedCost: '$0 - $50/month'
        };
    }

    // Generate code
    async generateCode(prompt, language = 'javascript') {
        const codePrompt = `Generate ${language} code for: ${prompt}

        Requirements:
        - Clean, well-commented code
        - Follow best practices
        - Include error handling
        - Make it production-ready

        Return only the code, no explanations.`;

        const result = await this.sendMessage(codePrompt);
        return result.success ? result.response : '// Code generation failed. Please try again.';
    }
}

// Global instance
const mamtaAI = new MAMTAAI();
