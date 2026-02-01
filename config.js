// Configuration file - to be filled by user

// Supabase Configuration
// ==============================================
// DAPATKAN DARI DASHBOARD SUPABASE:
// 1. Project URL (Settings > API > Project URL)
// 2. anon key (Settings > API > Project API keys > anon public)

window.SUPABASE_URL = 'https://ojxywqjjufaidtzounha.supabase.co'; // GANTI dengan URL project Anda
window.SUPABASE_KEY = 'sb_publishable_Sw8heBope_nfZu_hIkrksg_RyNfnlMD'; // GANTI dengan anon key Anda

// Application Configuration
// ==============================================
window.APP_CONFIG = {
    appName: 'Jurnal Coding',
    version: '1.0.0',
    defaultLanguage: 'javascript',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    itemsPerPage: 10,
    enableAnalytics: false,
    
    // Feature flags
    features: {
        enableExport: true,
        enableImport: true,
        enableSharing: false,
        enableComments: false
    },
    
    // UI settings
    ui: {
        theme: 'vs-dark',
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        showLineNumbers: true,
        wordWrap: false,
        minimap: false
    },
    
    // Code editor settings
    editor: {
        tabSize: 2,
        insertSpaces: true,
        detectIndentation: true,
        autoClosingBrackets: true,
        autoClosingQuotes: true,
        formatOnSave: false,
        formatOnPaste: false
    }
};

// Admin Configuration
// ==============================================
// CATATAN: Password TIDAK disimpan di sini
// Password harus dibuat di Supabase Authentication
// Gunakan SQL yang disediakan untuk membuat user admin

window.ADMIN_CONFIG = {
    adminEmail: 'admin@journal.com',
    minPasswordLength: 6,
    sessionTimeout: 60 * 60 * 1000, // 1 hour in milliseconds
    maxLoginAttempts: 5,
    lockoutTime: 15 * 60 * 1000 // 15 minutes
};

// Database Schema (for reference)
// ==============================================
window.DB_SCHEMA = {
    tables: {
        pages: {
            id: 'uuid primary key',
            title: 'text not null',
            order: 'integer not null default 0',
            created_at: 'timestamp with time zone default now()'
        },
        contents: {
            id: 'uuid primary key',
            page_id: 'uuid references pages(id) on delete cascade',
            description: 'text',
            created_at: 'timestamp with time zone default now()'
        },
        blocks: {
            id: 'uuid primary key',
            content_id: 'uuid references contents(id) on delete cascade',
            type: 'text not null check (type in (\'code\'))',
            language: 'text check (language in (\'html\', \'css\', \'javascript\'))',
            value: 'text not null',
            order: 'integer not null default 0',
            created_at: 'timestamp with time zone default now()'
        }
    },
    rlsPolicies: {
        pages: {
            select: 'true', // Everyone can read
            insert: 'auth.uid() is not null', // Only authenticated users can insert
            update: 'auth.uid() is not null', // Only authenticated users can update
            delete: 'auth.uid() is not null' // Only authenticated users can delete
        },
        contents: {
            select: 'true',
            insert: 'auth.uid() is not null',
            update: 'auth.uid() is not null',
            delete: 'auth.uid() is not null'
        },
        blocks: {
            select: 'true',
            insert: 'auth.uid() is not null',
            update: 'auth.uid() is not null',
            delete: 'auth.uid() is not null'
        }
    }
};

// How to configure:
// 1. Replace SUPABASE_URL and SUPABASE_KEY with your actual values
// 2. Run the SQL queries in Supabase SQL Editor
// 3. Create admin user using the provided SQL
// 4. Test login with password "shanz" (or your chosen password)