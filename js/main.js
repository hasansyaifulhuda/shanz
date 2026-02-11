/* ========================================
   MAIN.JS - Application Entry Point
   ======================================== */
// FORCE AUTO LOGOUT SETIAP LOAD
sessionStorage.removeItem('isAdmin');
(function() {
    // ========== SETUP ROUTES ==========
    Router.add('/', Pages.home);
    Router.add('/detail/:id', Pages.detail);
    Router.add('/watch/:id', Pages.watch);
    
    // ========== DOM READY ==========
    document.addEventListener('DOMContentLoaded', () => {
        
        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.getElementById('header');
            if (header) {
                header.classList.toggle('scrolled', window.scrollY > 50);
            }
        });
        
        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                menuToggle.classList.toggle('active');
            });
        }
        
        // Nav filter links
        document.querySelectorAll('[data-filter]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = link.dataset.filter;
                Router.navigate(`/?filter=${filter}`);
                if (navMenu) navMenu.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('active');
            });
        });
        
        // Home link
        const homeLink = document.querySelector('[data-page="home"]');
        if (homeLink) {
            homeLink.addEventListener('click', (e) => {
                e.preventDefault();
                Router.navigate('/');
                if (navMenu) navMenu.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('active');
            });
        }
        
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                UI.openModal('loginModal');
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                Auth.logout();
            });
        }
        
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const passwordInput = document.getElementById('loginPassword');
                const password = passwordInput.value;
                const success = await Auth.login(password);
                
                if (success) {
                    UI.closeModal('loginModal');
                    UI.notify('Login berhasil!', 'success');
                    UI.updateAdminUI();
                    Router.handle();
                } else {
                    UI.notify('Password salah!', 'error');
                }
                
                passwordInput.value = '';
            });
        }
        
        // Add content button
        const addContentBtn = document.getElementById('addContentBtn');
        if (addContentBtn) {
            addContentBtn.addEventListener('click', () => {
                Admin.openAddContent();
            });
        }
        
        // Content form
        const contentForm = document.getElementById('contentForm');
        if (contentForm) {
            contentForm.addEventListener('submit', (e) => Admin.saveContent(e));
        }
        
        // Season form
        const seasonForm = document.getElementById('seasonForm');
        if (seasonForm) {
            seasonForm.addEventListener('submit', (e) => Admin.saveSeason(e));
        }
        
        // Episode form
        const episodeForm = document.getElementById('episodeForm');
        if (episodeForm) {
            episodeForm.addEventListener('submit', (e) => Admin.saveEpisode(e));
        }
        
        // Real-time File ID detection untuk Poster
        const contentPoster = document.getElementById('contentPoster');
        if (contentPoster) {
            contentPoster.addEventListener('input', (e) => {
                UI.showFileIdPreview(e.target.value, 'posterPreview', true);
            });
        }
        
        // Real-time File ID detection untuk Video
        const episodeVideo = document.getElementById('episodeVideo');
        if (episodeVideo) {
            episodeVideo.addEventListener('input', (e) => {
                UI.showFileIdPreview(e.target.value, 'videoPreview', false);
            });
        }
        
        // Close modals on backdrop click
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    UI.closeAllModals();
                }
            });
        });
        
        // Close modals on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                UI.closeAllModals();
            }
        });
        
        // Update admin UI
        UI.updateAdminUI();
  // ===== LIVE SEARCH =====
const searchInput = document.getElementById('searchInput');
let searchTimeout;

if (searchInput) {

    searchInput.addEventListener('input', () => {

        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {

            const value = searchInput.value.trim();

            if (value.length > 0) {
                Router.navigate(`/?search=${encodeURIComponent(value)}`);
            } else {
                Router.navigate('/');
            }

        }, 300); // debounce 300ms

    });

}
        // Initialize router
        Router.init();
    });
})();
