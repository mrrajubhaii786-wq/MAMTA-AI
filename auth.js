// MAMTA AI - Authentication Service
// TASK 1: Authentication Foundation

class AuthService {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.session = null;
        this.initialized = false;
    }

    // Initialize auth service
    async init() {
        if (this.initialized) return true;

        this.supabase = window.getSupabase ? window.getSupabase() : null;
        if (!this.supabase) {
            console.error('❌ MAMTA AI: Supabase not available');
            return false;
        }

        // Check existing session
        const { data: { session }, error } = await this.supabase.auth.getSession();
        if (error) {
            console.error('❌ MAMTA AI: Session error:', error.message);
        }

        if (session) {
            this.session = session;
            this.currentUser = session.user;
            console.log('✅ MAMTA AI: Session restored for', this.currentUser.email);
            this.updateUI(true);
        } else {
            console.log('ℹ️ MAMTA AI: No active session');
            this.updateUI(false);
        }

        // Listen for auth changes
        this.supabase.auth.onAuthStateChange((event, session) => {
            console.log('🔄 MAMTA AI: Auth event:', event);
            if (event === 'SIGNED_IN' && session) {
                this.currentUser = session.user;
                this.session = session;
                this.updateUI(true);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.session = null;
                this.updateUI(false);
            }
        });

        this.initialized = true;
        return true;
    }

    // Sign Up
    async signUp(email, password, name = '') {
        try {
            console.log('📝 MAMTA AI: Signing up...', email);
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name }
                }
            });

            if (error) throw error;

            console.log('✅ MAMTA AI: Sign up successful');
            return { success: true, user: data.user };
        } catch (error) {
            console.error('❌ MAMTA AI: Sign up failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Sign In
    async signIn(email, password) {
        try {
            console.log('🔐 MAMTA AI: Signing in...', email);
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.currentUser = data.user;
            this.session = data.session;
            console.log('✅ MAMTA AI: Sign in successful');
            this.updateUI(true);
            return { success: true, user: data.user };
        } catch (error) {
            console.error('❌ MAMTA AI: Sign in failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Sign In with Google
    async signInWithGoogle() {
        try {
            console.log('🔐 MAMTA AI: Google sign in...');
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('❌ MAMTA AI: Google sign in failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Sign Out
    async signOut() {
        try {
            console.log('🚪 MAMTA AI: Signing out...');
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;

            this.currentUser = null;
            this.session = null;
            console.log('✅ MAMTA AI: Signed out');
            this.updateUI(false);
            return { success: true };
        } catch (error) {
            console.error('❌ MAMTA AI: Sign out failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Get current user
    getUser() {
        return this.currentUser;
    }

    // Check if logged in
    isLoggedIn() {
        return !!this.currentUser;
    }

    // Update UI based on auth state
    updateUI(isLoggedIn) {
        const loginBtn = document.getElementById('auth-btn');
        const userMenu = document.getElementById('user-menu');
        const userName = document.getElementById('user-name');

        if (loginBtn) {
            if (isLoggedIn && this.currentUser) {
                loginBtn.innerHTML = `<span>👤 ${this.currentUser.user_metadata?.name || this.currentUser.email}</span>`;
                loginBtn.onclick = () => this.toggleUserMenu();
                if (userName) userName.textContent = this.currentUser.user_metadata?.name || this.currentUser.email;
            } else {
                loginBtn.innerHTML = '<span>🔐 Sign In</span>';
                loginBtn.onclick = () => window.showAuthModal && window.showAuthModal();
            }
        }

        if (userMenu) {
            userMenu.style.display = isLoggedIn ? 'block' : 'none';
        }
    }

    // Toggle user menu
    toggleUserMenu() {
        const menu = document.getElementById('user-dropdown');
        if (menu) {
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        }
    }
}

// Create global instance
window.authService = new AuthService();

console.log('📦 MAMTA AI: auth.js loaded');
