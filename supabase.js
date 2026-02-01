let supabase;
let isInitialized = false;

export const initSupabase = async () => {
    if (isInitialized) return;
    
    try {
        // URL dan anon key Supabase akan diisi oleh user
        // Default: placeholder values
        const supabaseUrl = window.SUPABASE_URL || 'https://ojxywqjjufaidtzounha.supabase.co';
        const supabaseKey = window.SUPABASE_KEY || 'sb_publishable_Sw8heBope_nfZu_hIkrksg_RyNfnlMD';
        
        if (!supabaseUrl || !supabaseKey || 
            supabaseUrl.includes('your-project') || 
            supabaseKey.includes('your-anon-key')) {
            console.warn('Supabase belum dikonfigurasi. Guest mode aktif.');
            return;
        }
        
        // Import Supabase client
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        
        supabase = createClient(supabaseUrl, supabaseKey);
        isInitialized = true;
        
        console.log('Supabase berhasil diinisialisasi');
    } catch (error) {
        console.error('Gagal menginisialisasi Supabase:', error);
    }
};

export const getSupabase = () => {
    if (!isInitialized) {
        console.warn('Supabase belum diinisialisasi. Pastikan konfigurasi sudah benar.');
        return null;
    }
    return supabase;
};

export const isSupabaseReady = () => {
    return isInitialized && supabase !== null;
};