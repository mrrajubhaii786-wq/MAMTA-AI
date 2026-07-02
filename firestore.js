// MAMTA AI - Database Service
// TASK 3: Database Layer

class DatabaseService {
    constructor() {
        this.supabase = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return true;
        this.supabase = window.getSupabase ? window.getSupabase() : null;
        if (!this.supabase) {
            console.error('❌ MAMTA AI: Supabase not available for DB');
            return false;
        }
        this.initialized = true;
        console.log('✅ MAMTA AI: Database service initialized');
        return true;
    }

    // ===== CHAT OPERATIONS =====

    async saveChat(message, type = 'user') {
        try {
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
        } catch (error) {
            console.error('❌ MAMTA AI: Save chat failed:', error.message);
            // Fallback to localStorage
            this.saveToLocal('chats', { message, type, created_at: new Date().toISOString() });
            return { success: true, local: true, error: error.message };
        }
    }

    async getChatHistory(limit = 50) {
        try {
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
        } catch (error) {
            console.error('❌ MAMTA AI: Get chat failed:', error.message);
            return { success: true, data: this.getFromLocal('chats'), local: true };
        }
    }

    // ===== USER OPERATIONS =====

    async saveUserProfile(userData) {
        try {
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
        } catch (error) {
            console.error('❌ MAMTA AI: Save user failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // ===== PROJECT OPERATIONS =====

    async saveProject(projectData) {
        try {
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
        } catch (error) {
            console.error('❌ MAMTA AI: Save project failed:', error.message);
            this.saveToLocal('projects', projectData);
            return { success: true, local: true };
        }
    }

    // ===== LOCAL STORAGE FALLBACK =====

    saveToLocal(key, data) {
        try {
            const existing = JSON.parse(localStorage.getItem(`mamta_${key}`) || '[]');
            existing.push(data);
            localStorage.setItem(`mamta_${key}`, JSON.stringify(existing));
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
}

// Create global instance
window.dbService = new DatabaseService();

console.log('📦 MAMTA AI: firestore.js loaded');
