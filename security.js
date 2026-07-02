// MAMTA AI - Security Service
// TASK 3: Database Layer

class SecurityService {
    constructor() {
        this.initialized = false;
    }

    async init() {
        this.initialized = true;
        console.log('✅ MAMTA AI: Security service initialized');
        return true;
    }

    // Generate random encryption key
    async generateKey() {
        try {
            const key = await crypto.subtle.generateKey(
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
            return { success: true, key };
        } catch (error) {
            console.error('❌ MAMTA AI: Key generation failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Encrypt text
    async encryptText(text, key) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(text);

            const iv = crypto.getRandomValues(new Uint8Array(12));

            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                data
            );

            // Combine IV and encrypted data
            const combined = new Uint8Array(iv.length + encrypted.byteLength);
            combined.set(iv);
            combined.set(new Uint8Array(encrypted), iv.length);

            // Convert to base64
            const base64 = btoa(String.fromCharCode(...combined));

            return { success: true, encrypted: base64 };
        } catch (error) {
            console.error('❌ MAMTA AI: Encryption failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Decrypt text
    async decryptText(encryptedBase64, key) {
        try {
            // Convert from base64
            const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

            // Extract IV and encrypted data
            const iv = combined.slice(0, 12);
            const encrypted = combined.slice(12);

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encrypted
            );

            const decoder = new TextDecoder();
            return { success: true, text: decoder.decode(decrypted) };
        } catch (error) {
            console.error('❌ MAMTA AI: Decryption failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Hash password (simple hash for demo)
    async hashPassword(password) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return { success: true, hash: hashHex };
        } catch (error) {
            console.error('❌ MAMTA AI: Hash failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Check password strength
    checkPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/)) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;

        const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        return { score: strength, level: levels[strength] };
    }

    // Generate secure random string
    generateSecureString(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let result = '';
        const randomValues = crypto.getRandomValues(new Uint8Array(length));
        for (let i = 0; i < length; i++) {
            result += chars[randomValues[i] % chars.length];
        }
        return result;
    }
}

// Create global instance
window.securityService = new SecurityService();

console.log('📦 MAMTA AI: security.js loaded');
