/* =====================================================
   HEADER FUNCTIONALITY
   ===================================================== */

const Header = {
    hamburgerBtn: null,
    loginBtn: null,
    logoutBtn: null,
    
    // Initialize header
    init() {
        this.hamburgerBtn = document.getElementById('hamburgerBtn');
        this.loginBtn = document.getElementById('loginBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        this.bindEvents();
    },
    
    // Bind event listeners
    bindEvents() {
        // Hamburger menu toggle
        if (this.hamburgerBtn) {
            this.hamburgerBtn.addEventListener('click', () => {
                Layout.toggleSidebar();
                this.hamburgerBtn.classList.toggle('active');
            });
        }
        
        // Login button
        if (this.loginBtn) {
            this.loginBtn.addEventListener('click', () => {
                this.openLoginModal();
            });
        }
        
        // Logout button
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
        
        // Login modal events
        this.bindLoginModalEvents();
    },
    
    // Open login modal
    openLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('passwordInput').focus();
        }
    },
    
    // Close login modal
    closeLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('active');
            document.getElementById('passwordInput').value = '';
            document.getElementById('loginError').classList.remove('show');
        }
    },
    
    // Bind login modal events
    bindLoginModalEvents() {
        const modal = document.getElementById('loginModal');
        const closeBtn = document.getElementById('closeLoginModal');
        const cancelBtn = document.getElementById('cancelLogin');
        const submitBtn = document.getElementById('submitLogin');
        const passwordInput = document.getElementById('passwordInput');
        const togglePassword = document.getElementById('togglePassword');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeLoginModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeLoginModal());
        }
        
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleLogin());
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin();
                }
            });
        }
        
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                togglePassword.innerHTML = type === 'password' 
                    ? '<i class="fas fa-eye"></i>' 
                    : '<i class="fas fa-eye-slash"></i>';
            });
        }
        
        // Close on overlay click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeLoginModal();
                }
            });
        }
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
                this.closeLoginModal();
            }
        });
    },

  // Handle login
async handleLogin() {
    const passwordInput = document.getElementById('passwordInput');
    const errorDiv = document.getElementById('loginError');
    const password = passwordInput.value;

    const email = "admin@email.com"; // Ganti dengan email admin Supabase Anda

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        const category = document.body.dataset.category;
        window.location.href = `admin-${category}.html`;

    } catch (error) {
        errorDiv.textContent = "Login gagal.";
        errorDiv.classList.add('show');
        passwordInput.value = '';
    }
},

    
    // Handle logout
   async handleLogout() {
    await supabaseClient.auth.signOut();

    const category = document.body.dataset.category;
    window.location.href = `guest-${category}.html`;
},

    // Validate admin access
   async validateAdminAccess() {
    const isAdminPage = document.body.dataset.mode === 'admin';

    if (!isAdminPage) return true;

    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
        const category = document.body.dataset.category;
        window.location.href = `guest-${category}.html`;
        return false;
    }

    return true;
}
};

document.addEventListener("DOMContentLoaded", async () => {
    Header.init();
    await Header.validateAdminAccess();
});

// Export
window.Header = Header;
