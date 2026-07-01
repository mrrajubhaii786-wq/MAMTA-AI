// 🗄️ MAMTA AI — Supabase Database Service
// PostgreSQL via Supabase Client

class MAMTADB {
    constructor() {
        this.tablePrefix = '';
    }

    // ========== CHAT FUNCTIONS ==========

    // Save chat message
    async saveMessage(userId, message, type = 'user') {
        try {
            const { data, error } = await supabase
                .from('chats')
                .insert([{
                    user_id: userId,
                    message: message,
                    type: type,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Save message error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get chat history
    async getChatHistory(userId, limit = 50) {
        try {
            const { data, error } = await supabase
                .from('chats')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Get chat error:', error);
            return [];
        }
    }

    // ========== PROJECT FUNCTIONS ==========

    // Create new project from Planning Room
    async createProject(userId, projectData) {
        try {
            const { data, error } = await supabase
                .from('projects')
                .insert([{
                    user_id: userId,
                    name: projectData.name,
                    type: projectData.type,
                    features: projectData.features,
                    tech_stack: projectData.techStack,
                    status: 'planning',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select();

            if (error) throw error;
            return { success: true, projectId: data?.[0]?.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get user's projects
    async getProjects(userId) {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            return [];
        }
    }

    // Update project status
    async updateProjectStatus(projectId, status) {
        try {
            const { error } = await supabase
                .from('projects')
                .update({ status: status, updated_at: new Date().toISOString() })
                .eq('id', projectId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========== SAFE DROP FUNCTIONS ==========

    // Save file metadata
    async saveFile(userId, fileData) {
        try {
            const { data, error } = await supabase
                .from('files')
                .insert([{
                    user_id: userId,
                    name: fileData.name,
                    type: fileData.type,
                    size: fileData.size,
                    storage_path: fileData.storagePath,
                    encrypted: true,
                    uploaded_at: new Date().toISOString()
                }]);

            if (error) throw error;

            // Log audit
            await this.logAudit(userId, 'FILE_UPLOAD', `File uploaded: ${fileData.name}`);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get user's files
    async getFiles(userId) {
        try {
            const { data, error } = await supabase
                .from('files')
                .select('*')
                .eq('user_id', userId)
                .order('uploaded_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            return [];
        }
    }

    // ========== AUDIT LOG FUNCTIONS ==========

    // Log security event
    async logAudit(userId, action, details) {
        try {
            await supabase
                .from('audit_logs')
                .insert([{
                    user_id: userId,
                    action: action,
                    details: details,
                    ip_address: 'client-side',
                    user_agent: navigator.userAgent,
                    created_at: new Date().toISOString()
                }]);
        } catch (error) {
            console.error('Audit log error:', error);
        }
    }

    // Get audit logs
    async getAuditLogs(userId, limit = 100) {
        try {
            const { data, error } = await supabase
                .from('audit_logs')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            return [];
        }
    }

    // ========== USER PROFILE ==========

    // Update user security score
    async updateSecurityScore(userId, score) {
        try {
            await supabase
                .from('users')
                .update({ security_score: score, updated_at: new Date().toISOString() })
                .eq('id', userId);
        } catch (error) {
            console.error('Update score error:', error);
        }
    }

    // Get user stats
    async getUserStats(userId) {
        try {
            const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            const { count: fileCount } = await supabase
                .from('files')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            const { count: projectCount } = await supabase
                .from('projects')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            return {
                user: userData,
                totalFiles: fileCount || 0,
                totalProjects: projectCount || 0
            };
        } catch (error) {
            return null;
        }
    }
}

// Global instance
const mamtaDB = new MAMTADB();
