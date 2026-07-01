// 🟢 MAMTA AI — Supabase Configuration
// Connected to: djupszhqebpuohvzamcx.supabase.co

const SUPABASE_URL = 'https://djupszhqebpuohvzamcx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqdXBzemhxZWJwdW9odnphbWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjY4NjgsImV4cCI6MjA5ODUwMjg2OH0.L4Sp91FlP9z-lhJgLKTrjbLUPMs_E9JYJBvqIzOjEns';

// Initialize Supabase Client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🟢 MAMTA AI connected to Supabase!');
console.log('📊 Project: djupszhqebpuohvzamcx');
