import { getSupabase } from './supabase.js';
import { updateUIForAdmin, updateUIForGuest, showModal, hideModal } from './ui.js';
import { showLoading, hideLoading } from './utils.js';

let currentUser = null;
let isAdminMode = false;

export const initAuth = () => {
    checkSession(); // ⬅️ INI WAJIB
    console.log('Auth module diinisialisasi');
};

export const checkSession = async () => {
    const supabase = getSupabase();
    if (!supabase) {
        // Guest mode jika Supabase tidak siap
        setGuestMode();
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Error checking session:', error);
            setGuestMode();
            return;
        }
        
        if (data.session) {
            setAdminMode(data.session.user);
        } else {
            setGuestMode();
        }
    } catch (error) {
        console.error('Failed to check session:', error);
        setGuestMode();
    }
};

export const login = async (password) => {
    const supabase = getSupabase();
    if (!supabase) {
        showError('Database belum dikonfigurasi');
        return false;
    }
    
    showLoading();
    
    try {
        // Sign in dengan email dan password
        // Email tetap, password yang diverifikasi di server
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'admin@journal.com',
            password: password
        });
        
        if (error) {
            throw error;
        }
        
        if (data.user) {
            setAdminMode(data.user);
            hideModal('loginModal');
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Login error:', error);
        showError('Login gagal. Periksa password Anda.');
        return false;
    } finally {
        hideLoading();
    }
};

export const logout = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    
    try {
        await supabase.auth.signOut();
        setGuestMode();
    } catch (error) {
        console.error('Logout error:', error);
    }
};

export const getCurrentUser = () => {
    return currentUser;
};

export const isAdmin = () => {
    return isAdminMode;
};

const setAdminMode = (user) => {
    currentUser = user;
    isAdminMode = true;
    updateUIForAdmin();
    console.log('Admin mode aktif');
};

const setGuestMode = () => {
    currentUser = null;
    isAdminMode = false;
    updateUIForGuest();
    console.log('Guest mode aktif');
};

const showError = (message) => {
    const errorElement = document.getElementById('loginError');
    if (errorElement) {
        errorElement.textContent = message;
        setTimeout(() => {
            errorElement.textContent = '';
        }, 5000);
    }
};