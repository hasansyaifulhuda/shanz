// Application constants

export const APP_NAME = 'Jurnal Coding';
export const VERSION = '1.0.0';
export const DEFAULT_PAGE_TITLE = 'Halaman Tanpa Judul';

// Supabase table names
export const TABLES = {
    PAGES: 'pages',
    CONTENTS: 'contents',
    BLOCKS: 'blocks'
};

// Supported code languages
export const CODE_LANGUAGES = [
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'javascript', label: 'JavaScript' }
];

// Local storage keys
export const STORAGE_KEYS = {
    LAST_PAGE: 'lastOpenedPage',
    ADMIN_MODE: 'adminMode',
    THEME: 'theme'
};

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Koneksi jaringan bermasalah. Periksa koneksi internet Anda.',
    LOGIN_FAILED: 'Login gagal. Periksa password Anda.',
    SAVE_FAILED: 'Gagal menyimpan data.',
    DELETE_FAILED: 'Gagal menghapus data.',
    LOAD_FAILED: 'Gagal memuat data.'
};

// Success messages
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Login berhasil!',
    SAVE_SUCCESS: 'Data berhasil disimpan.',
    DELETE_SUCCESS: 'Data berhasil dihapus.',
    COPY_SUCCESS: 'Kode berhasil disalin!'
};

// UI constants
export const UI = {
    SIDEBAR_WIDTH: 280,
    FAB_SIZE: 56,
    MODAL_MAX_WIDTH: 500
};