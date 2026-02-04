import { initSupabase } from './supabase.js';
import { initAuth, checkSession } from './auth.js';
import { initUI } from './ui.js';
import { initPages } from './pages.js';
import { initContents } from './contents.js';
import { initEvents } from './events.js';

// Inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', async () => {
    // Inisialisasi semua modul
    await initSupabase();
    await initUI();
    await initAuth();
    await initPages();
    await initContents();
    initEvents();
    
    // Cek session saat pertama kali load
    await checkSession();
    
    console.log('Aplikasi Jurnal Coding telah diinisialisasi');
});
