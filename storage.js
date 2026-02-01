// Local storage management

import { STORAGE_KEYS } from './constants.js';

export const getFromStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key "${key}":`, error);
        return defaultValue;
    }
};

export const setToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error writing to localStorage key "${key}":`, error);
        return false;
    }
};

export const removeFromStorage = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing from localStorage key "${key}":`, error);
        return false;
    }
};

export const clearStorage = () => {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
};

// Specific storage functions
export const getLastPage = () => {
    return getFromStorage(STORAGE_KEYS.LAST_PAGE);
};

export const setLastPage = (pageId) => {
    return setToStorage(STORAGE_KEYS.LAST_PAGE, pageId);
};

export const getAdminMode = () => {
    return getFromStorage(STORAGE_KEYS.ADMIN_MODE, false);
};

export const setAdminMode = (isAdmin) => {
    return setToStorage(STORAGE_KEYS.ADMIN_MODE, isAdmin);
};

export const getTheme = () => {
    return getFromStorage(STORAGE_KEYS.THEME, 'dark');
};

export const setTheme = (theme) => {
    return setToStorage(STORAGE_KEYS.THEME, theme);
};