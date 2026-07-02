// MAMTA AI - Database Service V4
// Version: 4.0.0 - TASK 4: Production Database Validation
// Features: Retry logic, better error handling, validation

class DatabaseService {
    constructor() {
        this.supabase = null;
        this.initialized = false;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    async init() {
        if (this.initialized) return true;

        this.supabase = window.getSupabase ? window.getSupabase() : null;
        if (!this.supabase) {
            console.error('❌ MAMTA AI: Supabase not available for DB');
            if (window.errorHandler) {
                window.errorHandler.showToast('Database unavailable. Using local storage.', 'warning');
            }
            return false;
        }

        // Test connection
        try {
            const { data, error } = await this.supabase.from('chats').select('count').limit(1);
            if (error) throw error;

            this.initialized = true;
            console.log('✅ MAMTA AI: Database connected and validated');
            if (window.errorHandler) {
                window.errorHandler.showToast('Database connected!', 'success');
            }
            return true;
        } catch (error) {
            console.warn('⚠️ MAMTA AI: Database connection test failed:', error.message);
            if (window.errorHandler) {
                window.errorHandler.showToast('Database connection failed. Using local storage.', 'warning');
            }
            return false;
        }
    }

    // Retry wrapper for database operations
    async withRetry(operation, context = 'database operation') {
        for (let i = 0; i < this.retryAttempts; i++) {
            try {
                if (!this.isOnline()) {
                    throw new Error('Offline');
                }
                return await operation();
            } catch (error) {
                console.warn(`⚠️ ${context} attempt ${i + 1}/${this.retryAttempts} failed:`, error.message);

                if (i === this.retryAttempts - 1) {
                    console.error(`❌ ${context} failed after ${this.retryAttempts} attempts`);
                    throw error;
                }

                await this.sleep(this.retryDelay * (i + 1));
            }
        }
    }

    // Check online status
    isOnline() {
        return navigator.onLine;
    }

    // Sleep helper
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ========== CHAT OPERATIONS ==========

    async saveChat(message, type = 'user') {
        return this.withRetry(async () => {
            const user = window.authService ? window.authService.getUser() : null;

            if (!user) {
                console.warn('⚠️ MAMTA AI: No user, saving to localStorage');
                this.saveToLocal('chats', { message, type, created_at: new Date().toISOString() });
                return { success: true, local: true };
            }

            const { data, error } = await this.supabase
                .from('chats')
                .insert([{
                    user_id: user.id,
                    message: message,
                    type: type,
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) throw error;
            console.log('✅ MAMTA AI: Chat saved to DB');
            return { success: true, data };
        }, 'save chat');
    }

    async getChatHistory(limit = 50) {
        return this.withRetry(async () => {
            const user = window.authService ? window.authService.getUser() : null;

            if (!user) {
                return { success: true, data: this.getFromLocal('chats'), local: true };
            }

            const { data, error } = await this.supabase
                .from('chats')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true })
                .limit(limit);

            if (error) throw error;
            return { success: true, data: data || [] };
        }, 'get chat history');
    }

    // ========== USER OPERATIONS ==========

    async saveUserProfile(userData) {
        return this.withRetry(async () => {
            const user = window.authService ? window.authService.getUser() : null;
            if (!user) return { success: false, error: 'Not logged in' };

            const { data, error } = await this.supabase
                .from('users')
                .upsert([{
                    id: user.id,
                    email: user.email,
                    name: userData.name || user.user_metadata?.name || '',
                    updated_at: new Date().toISOString()
                }])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'save user profile');
    }

    async getUserProfile() {
        return this.withRetry(async () => {
            const user = window.authService ? window.authService.getUser() : null;
            if (!user) return { success: false, error: 'Not logged in' };

            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            return { success: true, data };
        }, 'get user profile');
    }

    // ========== PROJECT OPERATIONS ==========

    async saveProject(projectData) {
        return this.withRetry(async () => {
            const user = window.authService ? window.authService.getUser() : null;
            if (!user) {
                this.saveToLocal('projects', projectData);
                return { success: true, local: true };
            }

            const { data, error } = await this.supabase
                .from('projects')
                .insert([{
                    user_id: user.id,
                    name: projectData.name,
                    type: projectData.type,
                    features: projectData.features,
                    tech_stack: projectData.tech_stack,
                    status: 'planning',
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'save project');
    }

    async getProjects() {
        return this.withRetry(async () => {
            const user = window.authService ? window.authService.getUser() : null;
            if (!user) {
                return { success: true, data: this.getFromLocal('projects'), local: true };
            }

            const { data, error } = await this.supabase
                .from('projects')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data: data || [] };
        }, 'get projects');
    }

    async updateProjectStatus(projectId, status) {
        return this.withRetry(async () => {
            const { data, error } = await this.supabase
                .from('projects')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', projectId)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'update project status');
    }

    // ========== AUDIT LOG OPERATIONS ==========

    async logAudit(action, details = {}) {
        return this.withRetry(async () => {
            const user = window.authService ? window.authService.getUser() : null;

            const { data, error } = await this.supabase
                .from('audit_logs')
                .insert([{
                    user_id: user ? user.id : null,
                    action: action,
                    details: JSON.stringify(details),
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'log audit').catch(() => ({ success: false })); // Silent fail for audit
    }

    // ========== LOCAL STORAGE FALLBACK ==========

    saveToLocal(key, data) {
        try {
            const existing = JSON.parse(localStorage.getItem(`mamta_${key}`) || '[]');
            existing.push(data);
            localStorage.setItem(`mamta_${key}`, JSON.stringify(existing));
            console.log('✅ MAMTA AI: Saved to localStorage');
        } catch (e) {
            console.error('❌ MAMTA AI: Local save failed');
        }
    }

    getFromLocal(key) {
        try {
            return JSON.parse(localStorage.getItem(`mamta_${key}`) || '[]');
        } catch (e) {
            return [];
        }
    }

    clearLocal(key) {
        localStorage.removeItem(`mamta_${key}`);
    }

    // ========== VALIDATION ==========

    validateChatMessage(message) {
        if (!message || typeof message !== 'string') {
            return { valid: false, error: 'Message is required' };
        }
        if (message.length > 5000) {
            return { valid: false, error: 'Message too long (max 5000 chars)' };
        }
        return { valid: true };
    }

    validateProjectData(data) {
        if (!data.name || typeof data.name !== 'string') {
            return { valid: false, error: 'Project name is required' };
        }
        if (data.name.length > 100) {
            return { valid: false, error: 'Project name too long' };
        }
        return { valid: true };
    }
}

// Create global instance
window.dbService = new DatabaseService();

console.log('📦 MAMTA AI: firestore-v4.js loaded');
