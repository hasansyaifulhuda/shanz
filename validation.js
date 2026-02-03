// Validation functions

import { CODE_LANGUAGES } from './constants.js';

export const validatePage = (title) => {
    const errors = [];
    
    if (!title || title.trim().length === 0) {
        errors.push('Judul halaman tidak boleh kosong');
    }
    
    if (title && title.trim().length > 100) {
        errors.push('Judul halaman maksimal 100 karakter');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

export const validateContent = (description) => {
    const errors = [];
    
    if (!description || description.trim().length === 0) {
        errors.push('Deskripsi tidak boleh kosong');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

export const validateCodeBlock = (language, value) => {
    const errors = [];
    
    if (!language || !CODE_LANGUAGES.some(lang => lang.value === language)) {
        errors.push('Pilih bahasa yang valid');
    }
    
    if (!value || value.trim().length === 0) {
        errors.push('Kode tidak boleh kosong');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

export const validateLogin = (password) => {
    const errors = [];
    
    if (!password || password.length === 0) {
        errors.push('Password tidak boleh kosong');
    }
    
    if (password && password.length < 4) {
        errors.push('Password minimal 4 karakter');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

export const sanitizeInput = (input) => {
    if (!input) return '';
    
    // Remove potentially dangerous characters
    return input
        .replace(/[<>]/g, '') // Remove < and >
        .trim();
};

export const sanitizeCode = (code) => {
    if (!code) return '';
    
    // Allow code characters but escape HTML
    const div = document.createElement('div');
    div.textContent = code;
    return div.innerHTML;
};