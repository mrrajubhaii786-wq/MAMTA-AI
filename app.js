// MAMTA AI - Main Application V4
// Version: 4.0.0 - TASK 5: Production Readiness Certification
// Features: Loading states, session recovery, button states, validation

class MAMTAApp {
    constructor() {
        this.initialized = false;
        this.chatHistory = [];
        this.isProcessing = false;
    }

    async init() {
        console.log('🚀 MAMTA AI V4 initializing...');

        // Initialize services in order
        await this.initServices();

        // Setup UI
        this.setupEventListeners();
        this.setupChatInput();

        // Check session
        await this.checkSession();

        // Load chat history if logged in
        await this.loadChatHistory();

        this.initialized = true;
        console.log('✅ MAMTA AI V4 ready!');

        if (window.errorHandler) {
            window.errorHandler.showToast('MAMTA AI ready!', 'success');
        }
    }

    async initServices() {
        // Initialize Supabase
        if (window.initSupabase) {
            window.initSupabase();
        }

        // Initialize auth
        if (window.authService && window.authService.init) {
            await window.authService.init();
        }

        // Initialize database
        if (window.dbService && window.dbService.init) {
            await window.dbService.init();
        }

        // Initialize AI
        if (window.aiService && window.aiService.init) {
            await window.aiService.init();
        }
    }

    setupEventListeners() {
        // Send button
        const sendBtn = document.getElementById('send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.handleSend());
        }

        // Chat input
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSend();
                }
            });
        }

        // Auth button
        const authBtn = document.getElementById('auth-btn');
        if (authBtn) {
            authBtn.addEventListener('click', () => this.handleAuthClick());
        }

        // Quick action buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = e.target.textContent.trim();
                this.setChatInput(text);
            });
        });
    }

    setupChatInput() {
        const input = document.getElementById('chat-input');
        if (!input) return;

        // Auto-resize
        input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }

    async checkSession() {
        if (window.authService && window.authService.isLoggedIn) {
            const isLoggedIn = window.authService.isLoggedIn();
            this.updateAuthUI(isLoggedIn);

            if (isLoggedIn) {
                console.log('✅ Session restored');
                if (window.errorHandler) {
                    window.errorHandler.showToast('Welcome back!', 'success');
                }
            }
        }
    }

    async loadChatHistory() {
        if (!window.dbService) return;

        try {
            const result = await window.dbService.getChatHistory(50);
            if (result.success && result.data) {
                this.chatHistory = result.data;
                this.renderChatHistory();
            }
        } catch (error) {
            console.warn('⚠️ Could not load chat history:', error.message);
        }
    }

    renderChatHistory() {
        const container = document.getElementById('chat-container');
        if (!container) return;

        container.innerHTML = '';

        this.chatHistory.forEach(msg => {
            const sender = msg.type === 'user' ? 'user' : 'ai';
            this.addMessageToUI(msg.message, sender, false);
        });

        this.scrollToBottom();
    }

    async handleSend() {
        if (this.isProcessing) return;

        const input = document.getElementById('chat-input');
        if (!input) return;

        const text = input.value.trim();
        if (!text) return;

        // Validate
        if (window.dbService && window.dbService.validateChatMessage) {
            const validation = window.dbService.validateChatMessage(text);
            if (!validation.valid) {
                if (window.errorHandler) {
                    window.errorHandler.showToast(validation.error, 'warning');
                }
                return;
            }
        }

        this.isProcessing = true;
        this.setLoadingState(true);

        // Add user message
        this.addMessageToUI(text, 'user', true);
        input.value = '';
        input.style.height = 'auto';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get AI response
            let response;

            if (window.aiService) {
                const context = this.getChatContext();
                response = await window.aiService.generateResponse(text, context);
            } else {
                response = { success: true, text: 'AI service not available.', provider: 'fallback' };
            }

            this.removeTypingIndicator();

            if (response.success) {
                this.addMessageToUI(response.text, 'ai', true);

                // Save to database
                await this.saveChat(text, response.text);
            } else {
                this.addMessageToUI(response.text || 'Sorry, I could not process that.', 'ai', true);
            }

        } catch (error) {
            console.error('❌ Chat error:', error);
            this.removeTypingIndicator();
            this.addMessageToUI('माफ़ करना, कुछ गलती हुई। फिर से कोशिश करें।', 'ai', true);

            if (window.errorHandler) {
                window.errorHandler.showToast('Message failed to send. Please try again.', 'error');
            }
        } finally {
            this.isProcessing = false;
            this.setLoadingState(false);
        }
    }

    async saveChat(userMessage, aiMessage) {
        if (!window.dbService) return;

        try {
            await window.dbService.saveChat(userMessage, 'user');
            await window.dbService.saveChat(aiMessage, 'ai');
        } catch (error) {
            console.warn('⚠️ Could not save chat:', error.message);
        }
    }

    getChatContext() {
        const messages = document.querySelectorAll('.message');
        const context = [];

        messages.forEach(msg => {
            const isUser = msg.classList.contains('user-message');
            const content = msg.querySelector('.message-content');
            if (content) {
                context.push({
                    role: isUser ? 'user' : 'assistant',
                    content: content.textContent
                });
            }
        });

        return context.slice(-10); // Last 10 messages
    }

    addMessageToUI(text, sender, animate = true) {
        const container = document.getElementById('chat-container');
        if (!container) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message`;

        if (animate) {
            msgDiv.style.animation = 'fadeIn 0.3s ease';
        }

        const time = new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        msgDiv.innerHTML = `
            <div class="message-content">${this.escapeHtml(text)}</div>
            <div class="message-time">${time}</div>
        `;

        container.appendChild(msgDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const container = document.getElementById('chat-container');
        if (!container) return;

        const indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.className = 'message ai-message';
        indicator.innerHTML = `
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        `;
        container.appendChild(indicator);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    scrollToBottom() {
        const container = document.getElementById('chat-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setLoadingState(loading) {
        const sendBtn = document.getElementById('send-btn');
        const chatInput = document.getElementById('chat-input');

        if (sendBtn) {
            sendBtn.disabled = loading;
            sendBtn.style.opacity = loading ? '0.5' : '1';
            sendBtn.innerHTML = loading ? '⏳' : '➤';
        }

        if (chatInput) {
            chatInput.disabled = loading;
        }
    }

    setChatInput(text) {
        const input = document.getElementById('chat-input');
        if (input) {
            input.value = text;
            input.focus();
        }
    }

    handleAuthClick() {
        if (window.authService && window.authService.isLoggedIn && window.authService.isLoggedIn()) {
            // Logout
            window.authService.signOut().then(() => {
                this.updateAuthUI(false);
                if (window.errorHandler) {
                    window.errorHandler.showToast('Logged out successfully', 'info');
                }
            });
        } else {
            // Show login modal
            if (window.showAuthModal) {
                window.showAuthModal('login');
            }
        }
    }

    updateAuthUI(isLoggedIn) {
        const authBtn = document.getElementById('auth-btn');
        const userInfo = document.getElementById('user-info');

        if (authBtn) {
            if (isLoggedIn && window.authService) {
                const user = window.authService.getUser();
                authBtn.textContent = user?.email || 'Logout';
            } else {
                authBtn.textContent = 'Sign In';
            }
        }

        if (userInfo) {
            userInfo.style.display = isLoggedIn ? 'block' : 'none';
        }
    }
}

// Initialize when DOM is ready
let mamtaApp = null;

document.addEventListener('DOMContentLoaded', () => {
    mamtaApp = new MAMTAApp();
    mamtaApp.init();
});

if (typeof window !== 'undefined') {
    window.mamtaApp = mamtaApp;
}
