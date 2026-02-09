// MAIN.JS - Application entry point
document.addEventListener('DOMContentLoaded', async function() {
    sessionStorage.removeItem('streambox_admin'); // AUTO LOGOUT SAAT REFRESH
    // Initialize data
    await Data.init();
    
    // Check auth status
    Auth.updateUI();
    
    // Initialize router (shows home page)
    Router.init();
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // ESC to close modals
        if (e.key === 'Escape') {
            Auth.hideLoginModal();
            Admin.hideModal();
            UI.closeMobileMenu();
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const mobileMenu = document.getElementById('mobileMenu');
        const hamburger = document.getElementById('hamburgerBtn');
        if (mobileMenu.classList.contains('active') && 
            !mobileMenu.contains(e.target) && 
            !hamburger.contains(e.target)) {
            UI.closeMobileMenu();
        }
    });

    console.log('StreamBox initialized successfully!');
});
