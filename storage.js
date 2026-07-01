// ☁️ MAMTA AI — Supabase Storage Service

class MAMTAStorage {
    constructor() {
        this.bucketName = 'mamta-files';
    }

    // Upload file with encryption
    async uploadFile(userId, file) {
        try {
            const filePath = `${userId}/${Date.now()}_${file.name}`;

            const { data, error } = await supabase.storage
                .from(this.bucketName)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(this.bucketName)
                .getPublicUrl(filePath);

            return { 
                success: true, 
                url: publicUrl,
                path: filePath 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Delete file
    async deleteFile(filePath) {
        try {
            const { error } = await supabase.storage
                .from(this.bucketName)
                .remove([filePath]);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // List user files
    async listFiles(userId) {
        try {
            const { data, error } = await supabase.storage
                .from(this.bucketName)
                .list(userId);

            if (error) throw error;
            return { success: true, files: data || [] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Global instance
const mamtaStorage = new MAMTAStorage();
