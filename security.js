// 🔐 MAMTA AI — Security Utilities

class MAMTASecurity {
    constructor() {
        this.encryptionKey = null;
    }

    // Generate random encryption key
    generateKey() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array));
    }

    // Derive key from password using PBKDF2
    async deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    // Encrypt data (AES-GCM)
    async encrypt(data, key) {
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encoder.encode(data)
        );

        return {
            iv: Array.from(iv),
            data: Array.from(new Uint8Array(encrypted))
        };
    }

    // Decrypt data
    async decrypt(encryptedData, key) {
        const decoder = new TextDecoder();
        const iv = new Uint8Array(encryptedData.iv);
        const data = new Uint8Array(encryptedData.data);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            data
        );

        return decoder.decode(decrypted);
    }

    // Hash password (for local verification)
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Generate secure password
    generatePassword(length = 16) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, x => charset[x % charset.length]).join('');
    }

    // Check password strength
    checkPasswordStrength(password) {
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        return {
            score: score,
            level: levels[score],
            color: score < 2 ? '#FF2D55' : score < 4 ? '#FFB800' : '#00FF88'
        };
    }
}

// Global instance
const mamtaSecurity = new MAMTASecurity();
