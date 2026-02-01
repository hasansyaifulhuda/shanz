// Initialization utilities

import { getSupabase } from './supabase.js';

export const initializeApp = async () => {
    console.log('Menginisialisasi aplikasi...');
    
    // Check for Supabase configuration
    const supabaseConfig = checkSupabaseConfig();
    
    if (!supabaseConfig.isConfigured) {
        console.warn('Supabase belum dikonfigurasi. Aplikasi akan berjalan dalam mode demo.');
        showConfigurationWarning();
    }
    
    // Initialize error handling
    setupErrorHandling();
    
    // Check for updates
    checkForUpdates();
    
    console.log('Aplikasi siap digunakan');
};

export const checkSupabaseConfig = () => {
    const supabaseUrl = window.SUPABASE_URL;
    const supabaseKey = window.SUPABASE_KEY;
    
    const isConfigured = !!(supabaseUrl && 
                           supabaseKey && 
                           !supabaseUrl.includes('your-project') && 
                           !supabaseKey.includes('your-anon-key'));
    
    return {
        isConfigured,
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        url: supabaseUrl,
        key: supabaseKey ? `${supabaseKey.substring(0, 10)}...` : null
    };
};

export const showConfigurationWarning = () => {
    // Only show warning in console for now
    console.warn(`
    ⚠️  PERINGATAN: Supabase belum dikonfigurasi!
    
    Untuk menggunakan fitur lengkap (login, CRUD):
    1. Buat akun di https://supabase.com
    2. Buat project baru
    3. Ambil Project URL dan anon key
    4. Tambahkan di file supabase.js:
    
    const supabaseUrl = 'URL_PROJECT_ANDA';
    const supabaseKey = 'ANON_KEY_ANDA';
    
    Tanpa konfigurasi ini, aplikasi hanya berjalan dalam mode baca-saja (guest mode).
    `);
};

export const setupErrorHandling = () => {
    // Global error handler
    window.addEventListener('error', (event) => {
        console.error('Error global:', event.error);
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Promise rejection tidak tertangani:', event.reason);
    });
};

export const checkForUpdates = () => {
    // Check for new version
    const currentVersion = localStorage.getItem('app_version');
    const appVersion = '1.0.0';
    
    if (currentVersion !== appVersion) {
        console.log(`Aplikasi diperbarui ke versi ${appVersion}`);
        localStorage.setItem('app_version', appVersion);
        
        // Clear cache if version changed
        if (currentVersion) {
            console.log('Versi berubah, cache dibersihkan');
            // You could clear specific cache items here
        }
    }
};

export const setupServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('ServiceWorker registered:', registration);
        } catch (error) {
            console.log('ServiceWorker registration failed:', error);
        }
    }
};