/* =====================================================
   MAIN - Entry Point
   ===================================================== */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize the application
    await App.init();
});

// Handle visibility change (refresh data when tab becomes visible)
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && App.isInitialized) {
        // Refresh sidebar data when user returns to tab
        await Sidebar.refresh();
    }
});

// Handle online/offline events
window.addEventListener('online', () => {
    Layout.showToast('Connection restored', 'success');
    Sidebar.refresh();
});

window.addEventListener('offline', () => {
    Layout.showToast('You are offline. Some features may not work.', 'error');
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K = Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    // Ctrl/Cmd + B = Toggle sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        Layout.toggleSidebar();
    }
    
    // Admin-only shortcuts
    if (App.isAdmin()) {
        // Ctrl/Cmd + N = New page
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            Admin.openPageModal();
        }
        
        // Ctrl/Cmd + Shift + N = New folder
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
            e.preventDefault();
            Admin.openFolderModal();
        }
    }
});

// Log startup info
