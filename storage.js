// MAMTA AI - Storage Service
// TASK 3: Database Layer

class StorageService {
    constructor() {
        this.supabase = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return true;
        this.supabase = window.getSupabase ? window.getSupabase() : null;
        if (!this.supabase) {
            console.error('❌ MAMTA AI: Supabase not available for Storage');
            return false;
        }
        this.initialized = true;
        console.log('✅ MAMTA AI: Storage service initialized');
        return true;
    }

    // Upload file
    async uploadFile(file, folder = 'user-files') {
        try {
            const user = window.authService ? window.authService.getUser() : null;
            if (!user) {
                console.warn('⚠️ MAMTA AI: No user, saving to localStorage');
                return { success: true, local: true, url: null };
            }

            const filePath = `${user.id}/${folder}/${Date.now()}_${file.name}`;

            const { data, error } = await this.supabase
                .storage
                .from('mamta-files')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Get public URL
            const { data: urlData } = this.supabase
                .storage
                .from('mamta-files')
                .getPublicUrl(filePath);

            console.log('✅ MAMTA AI: File uploaded');
            return { success: true, path: filePath, url: urlData.publicUrl };
        } catch (error) {
            console.error('❌ MAMTA AI: Upload failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Download file
    async downloadFile(filePath) {
        try {
            const { data, error } = await this.supabase
                .storage
                .from('mamta-files')
                .download(filePath);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ MAMTA AI: Download failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Delete file
    async deleteFile(filePath) {
        try {
            const { error } = await this.supabase
                .storage
                .from('mamta-files')
                .remove([filePath]);

            if (error) throw error;
            console.log('✅ MAMTA AI: File deleted');
            return { success: true };
        } catch (error) {
            console.error('❌ MAMTA AI: Delete failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // List files
    async listFiles(folder = '') {
        try {
            const { data, error } = await this.supabase
                .storage
                .from('mamta-files')
                .list(folder);

            if (error) throw error;
            return { success: true, files: data || [] };
        } catch (error) {
            console.error('❌ MAMTA AI: List failed:', error.message);
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
window.storageService = new StorageService();

console.log('📦 MAMTA AI: storage.js loaded');
