// 🔐 MAMTA AI — Authentication Service

class MAMTAAuth {
    constructor() {
        this.user = null;
        this.init();
    }

    // Initialize auth state listener
    init() {
        auth.onAuthStateChanged(user => {
            this.user = user;
            if (user) {
                console.log('✅ User logged in:', user.email);
                this.updateUI(user);
            } else {
                console.log('❌ User logged out');
                this.showLogin();
            }
        });
    }

    // Email/Password Sign Up
    async signUp(email, password, name) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({ displayName: name });

            // Create user document in Firestore
            await db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                role: 'user',
                securityScore: 0
            });

            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Email/Password Sign In
    async signIn(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Google Sign In
    async googleSignIn() {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            const result = await auth.signInWithPopup(provider);

            // Check if new user, create Firestore doc
            const userDoc = await db.collection('users').doc(result.user.uid).get();
            if (!userDoc.exists) {
                await db.collection('users').doc(result.user.uid).set({
                    name: result.user.displayName,
                    email: result.user.email,
                    photoURL: result.user.photoURL,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    role: 'user',
                    securityScore: 0
                });
            }

            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Phone OTP Sign In
    async phoneSignIn(phoneNumber, recaptchaContainer) {
        try {
            const appVerifier = new firebase.auth.RecaptchaVerifier(recaptchaContainer, {
                size: 'invisible'
            });

            const confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, appVerifier);
            window.confirmationResult = confirmationResult;

            return { success: true, message: 'OTP sent!' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Verify OTP
    async verifyOTP(otpCode) {
        try {
            const result = await window.confirmationResult.confirm(otpCode);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Sign Out
    async signOut() {
        try {
            await auth.signOut();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Update UI based on auth state
    updateUI(user) {
        // Update navbar
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            navActions.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="color: var(--text-secondary); font-size: 14px;">${user.displayName || user.email}</span>
                    <img src="${user.photoURL || 'https://via.placeholder.com/32'}" 
                         style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--accent-cyan);">
                    <button class="btn btn-ghost btn-sm" onclick="mamtaAuth.signOut()">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            `;
        }
    }

    showLogin() {
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            navActions.innerHTML = `
                <button class="btn btn-ghost btn-sm" onclick="showAuthModal('login')"><i class="fas fa-user"></i> Sign In</button>
                <button class="btn btn-primary btn-sm" onclick="showAuthModal('signup')"><i class="fas fa-user-plus"></i> Sign Up</button>
            `;
        }
    }
}

// Global instance
const mamtaAuth = new MAMTAAuth();
