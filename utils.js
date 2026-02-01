// Utility functions

export const showLoading = () => {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('active');
    }
};

export const hideLoading = () => {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('active');
    }
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const validateInput = (input, type = 'text') => {
    if (!input || input.trim() === '') {
        return false;
    }
    
    switch (type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(input);
        case 'password':
            return input.length >= 6;
        default:
            return input.length > 0;
    }
};

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

export const escapeHtml = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

export const generateId = () => {
    return 'id-' + Math.random().toString(36).substr(2, 9);
};

export const disableButtons = (buttons) => {
    buttons.forEach(button => {
        button.disabled = true;
    });
};

export const enableButtons = (buttons) => {
    buttons.forEach(button => {
        button.disabled = false;
    });
};