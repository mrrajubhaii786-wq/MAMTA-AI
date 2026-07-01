// 🗄️ MAMTA AI — Firestore Database Service

class MAMTADB {
    constructor() {
        this.users = db.collection('users');
        this.chats = db.collection('chats');
        this.projects = db.collection('projects');
        this.files = db.collection('files');
        this.auditLogs = db.collection('auditLogs');
    }

    // ========== CHAT FUNCTIONS ==========

    // Save chat message
    async saveMessage(userId, message, type = 'user') {
        try {
            await this.chats.add({
                userId: userId,
                message: message,
                type: type,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get chat history
    async getChatHistory(userId, limit = 50) {
        try {
            const snapshot = await this.chats
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching chat:', error);
            return [];
        }
    }

    // ========== PROJECT FUNCTIONS ==========

    // Create new project from Planning Room
    async createProject(userId, projectData) {
        try {
            const projectRef = await this.projects.add({
                userId: userId,
                name: projectData.name,
                type: projectData.type,
                features: projectData.features,
                techStack: projectData.techStack,
                status: 'planning',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, projectId: projectRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get user's projects
    async getProjects(userId) {
        try {
            const snapshot = await this.projects
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            return [];
        }
    }

    // Update project status
    async updateProjectStatus(projectId, status) {
        try {
            await this.projects.doc(projectId).update({
                status: status,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========== SAFE DROP FUNCTIONS ==========

    // Save file metadata (encrypted)
    async saveFile(userId, fileData) {
        try {
            await this.files.add({
                userId: userId,
                name: fileData.name,
                type: fileData.type,
                size: fileData.size,
                encryptedUrl: fileData.encryptedUrl,
                encryptionKey: fileData.encryptionKey, // Client-side encrypted key
                uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

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
            const snapshot = await this.files
                .where('userId', '==', userId)
                .orderBy('uploadedAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            return [];
        }
    }

    // ========== AUDIT LOG FUNCTIONS ==========

    // Log security event
    async logAudit(userId, action, details) {
        try {
            await this.auditLogs.add({
                userId: userId,
                action: action,
                details: details,
                ip: 'client-side', // Will be populated by Cloud Function
                userAgent: navigator.userAgent,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Audit log error:', error);
        }
    }

    // Get audit logs
    async getAuditLogs(userId, limit = 100) {
        try {
            const snapshot = await this.auditLogs
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            return [];
        }
    }

    // ========== USER PROFILE ==========

    // Update user security score
    async updateSecurityScore(userId, score) {
        try {
            await this.users.doc(userId).update({
                securityScore: score,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating score:', error);
        }
    }

    // Get user stats
    async getUserStats(userId) {
        try {
            const userDoc = await this.users.doc(userId).get();
            const filesSnapshot = await this.files.where('userId', '==', userId).get();
            const projectsSnapshot = await this.projects.where('userId', '==', userId).get();

            return {
                user: userDoc.data(),
                totalFiles: filesSnapshot.size,
                totalProjects: projectsSnapshot.size
            };
        } catch (error) {
            return null;
        }
    }
}

// Global instance
const mamtaDB = new MAMTADB();
