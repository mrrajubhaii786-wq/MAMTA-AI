// 🔐 MAMTA AI — Supabase Authentication Service
// Using: djupszhqebpuohvzamcx.supabase.co

class MAMTAAuth {
    constructor() {
        this.user = null;
        this.init();
    }

    // Initialize auth state listener
    async init() {
        // Check current session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (session) {
            this.user = session.user;
            console.log('✅ User already logged in:', this.user.email);
            this.updateUI(this.user);
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this.user = session.user;
                this.updateUI(this.user);
                console.log('✅ User signed in:', this.user.email);
            } else if (event === 'SIGNED_OUT') {
                this.user = null;
                this.showLogin();
                console.log('❌ User signed out');
            }
        });
    }

    // Email/Password Sign Up
    async signUp(email, password, name) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name,
                        display_name: name
                    }
                }
            });

            if (error) throw error;

            // Create user profile in database
            if (data.user) {
                await supabase.from('users').insert([{
                    id: data.user.id,
                    email: email,
                    name: name,
                    created_at: new Date().toISOString(),
                    role: 'user',
                    security_score: 0
                }]);
            }

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Email/Password Sign In
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Google Sign In
    async googleSignIn() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });

            if (error) throw error;

            return { success: true, data: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Phone OTP Sign In
    async phoneSignIn(phone) {
        try {
            const { data, error } = await supabase.auth.signInWithOtp({
                phone: phone
            });

            if (error) throw error;

            return { success: true, message: 'OTP sent!' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Verify Phone OTP
    async verifyPhoneOTP(phone, token) {
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone: phone,
                token: token,
                type: 'sms'
            });

            if (error) throw error;

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Sign Out
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Update UI based on auth state
    updateUI(user) {
        const navActions = document.getElementById('navActions');
        if (!navActions) return;

        const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        const userPhoto = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=00F0FF&color=fff`;

        navActions.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; cursor: pointer;" id="userProfile" onclick="toggleUserDropdown()">
                <span style="color: var(--text-secondary); font-size: 14px;">${userName}</span>
                <img src="${userPhoto}" style="width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--accent-cyan); object-fit: cover;">
            </div>
        `;

        // Update dropdown
        const dropdownName = document.getElementById('dropdownName');
        const dropdownEmail = document.getElementById('dropdownEmail');
        if (dropdownName) dropdownName.textContent = userName;
        if (dropdownEmail) dropdownEmail.textContent = user.email;
    }

    showLogin() {
        const navActions = document.getElementById('navActions');
        if (!navActions) return;

        navActions.innerHTML = `
            <button class="btn btn-ghost" id="langBtn"><i class="fas fa-globe"></i> EN</button>
            <button class="btn btn-primary" id="loginBtn" onclick="showAuthModal('login')"><i class="fas fa-user"></i> Sign In</button>
        `;
    }
}

// Global instance
const mamtaAuth = new MAMTAAuth();
