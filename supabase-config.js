// MAMTA AI - Supabase Configuration
// TASK 1: Authentication Foundation

const SUPABASE_URL = 'https://djupszhqebpuohvzamcx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqdXBzemhxZWJwdW9odnphbWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjY4NjgsImV4cCI6MjA5ODUwMjg2OH0.L4Sp91FlP9z-lhJgLKTrjbLUPMs_E9JYJBvqIzOjEns';

// Initialize Supabase client
let supabaseClient = null;

function initSupabase() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });
        console.log('✅ MAMTA AI: Supabase initialized');
        return supabaseClient;
    } else {
        console.error('❌ MAMTA AI: Supabase library not loaded');
        return null;
    }
}

// Get Supabase client (singleton)
function getSupabase() {
    if (!supabaseClient) {
        return initSupabase();
    }
    return supabaseClient;
}

// Export for global use
window.getSupabase = getSupabase;
window.initSupabase = initSupabase;

console.log('📦 MAMTA AI: supabase-config.js loaded');
