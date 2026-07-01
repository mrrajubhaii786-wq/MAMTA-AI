// ☁️ MAMTA AI — Firebase Storage Service

class MAMTAStorage {
    constructor() {
        this.storageRef = storage.ref();
    }

    // Upload file with client-side encryption
    async uploadFile(userId, file, encryptKey) {
        try {
            // Create encrypted filename
            const encryptedName = await this.encryptFilename(file.name, encryptKey);
            const fileRef = this.storageRef.child(`users/${userId}/${encryptedName}`);

            // Upload file
            const snapshot = await fileRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();

            return { 
                success: true, 
                url: downloadURL,
                encryptedName: encryptedName 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Encrypt filename (simple XOR for demo, use proper encryption in production)
    async encryptFilename(filename, key) {
        // In production, use Web Crypto API with AES-GCM
        const encoder = new TextEncoder();
        const data = encoder.encode(filename);
        const keyData = encoder.encode(key);

        const encrypted = data.map((byte, i) => byte ^ keyData[i % keyData.length]);
        return btoa(String.fromCharCode(...encrypted));
    }

    // Delete file
    async deleteFile(userId, filename) {
        try {
            const fileRef = this.storageRef.child(`users/${userId}/${filename}`);
            await fileRef.delete();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get file metadata
    async getFileMetadata(userId, filename) {
        try {
            const fileRef = this.storageRef.child(`users/${userId}/${filename}`);
            const metadata = await fileRef.getMetadata();
            return { success: true, metadata };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Global instance
const mamtaStorage = new MAMTAStorage();
