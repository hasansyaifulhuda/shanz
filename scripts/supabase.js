// ================================================================
// SUPABASE.JS — Konfigurasi & Koneksi Supabase
// ================================================================
//
// CARA SETUP:
// 1. Buka https://supabase.com → Login/Daftar
// 2. Buat project baru
// 3. Jalankan SUPABASE_SETUP.sql di SQL Editor
// 4. Buka Settings → API
// 5. Copy "Project URL" → paste di SUPABASE_URL
// 6. Copy "anon public key" → paste di SUPABASE_KEY
//
// ================================================================

// GANTI DENGAN DATA PROJECT SUPABASE ANDA
var SUPABASE_URL = 'https://eokwcnwnqdonskbotrnk.supabase.co';
var SUPABASE_KEY = 'sb_publishable_3bVGE0H0ejgLZengQH8RwQ_OFiuaXUs';

// ================================================================
// JANGAN UBAH KODE DI BAWAH INI
// ================================================================

var sb = null;
var DB_READY = false;

try {
    if (!window.supabase) {
        throw new Error('Supabase CDN belum dimuat');
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error('SUPABASE_URL atau SUPABASE_KEY belum di-set');
    }

    sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    DB_READY = true;

    console.log('[Supabase] Ready');
} catch (e) {
    console.error('[Supabase] Init failed:', e.message);
    DB_READY = false;
}
