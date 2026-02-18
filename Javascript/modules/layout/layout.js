/* =====================================================
   LAYOUT FUNCTIONALITY
   ===================================================== */

const Layout = {
    sidebar: null,
    sidebarOverlay: null,
    mainContent: null,
    isSidebarOpen: false,
    isMobile: false,
    
    // Initialize layout
    init() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.mainContent = document.getElementById('mainContent');
        
        this.checkMobile();
        this.bindEvents();
        this.initSidebarState();
    },
    
    // Check if mobile viewport
    checkMobile() {
        this.isMobile = window.innerWidth <= 900;
    },
    
    // Initialize sidebar state
    initSidebarState() {
        if (this.isMobile) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    },
    
    // Bind event listeners
    bindEvents() {
        // Window resize
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.checkMobile();
            
            // Handle viewport change
            if (wasMobile !== this.isMobile) {
                if (this.isMobile) {
                    this.closeSidebar();
                } else {
                    this.openSidebar();
                }
            }
        });
        
        // Sidebar overlay click
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }
        
        // Click outside sidebar to close (untuk mobile)
        document.addEventListener('click', (e) => {
            if (!this.isSidebarOpen) return;
            if (!this.isMobile) return; // Hanya untuk mobile
            
            const clickedSidebar = e.target.closest('#sidebar');
            const clickedHamburger = e.target.closest('#hamburgerBtn');
            const clickedModal = e.target.closest('.modal-overlay');
            const clickedFab = e.target.closest('.fab-container');
            
            // Jika klik di luar sidebar, hamburger, modal, dan fab → tutup sidebar
            if (!clickedSidebar && !clickedHamburger && !clickedModal && !clickedFab) {
                this.closeSidebar();
            }
        });
        
        // Escape key to close sidebar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isSidebarOpen) {
                this.closeSidebar();
            }
        });
    },
    
    // Toggle sidebar
    toggleSidebar() {
        if (this.isSidebarOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    },
    
    // Open sidebar
    openSidebar() {
        this.isSidebarOpen = true;
        
        if (this.sidebar) {
            this.sidebar.classList.remove('collapsed');
            this.sidebar.classList.add('active');
        }
        
        // Show overlay on mobile
        if (this.isMobile && this.sidebarOverlay) {
            this.sidebarOverlay.classList.add('active');
        }
        
        document.body.classList.remove('sidebar-collapsed');
    },
    
    // Close sidebar
    closeSidebar() {
        this.isSidebarOpen = false;
        
        if (this.sidebar) {
            this.sidebar.classList.add('collapsed');
            this.sidebar.classList.remove('active');
        }
        
        if (this.sidebarOverlay) {
            this.sidebarOverlay.classList.remove('active');
        }
        
        document.body.classList.add('sidebar-collapsed');
    },
    
    // Show loading state
    showLoading() {
        const content = document.getElementById('mainContent');
        if (content) {
            content.classList.add('loading-state');
        }
    },
    
    // Hide loading state
    hideLoading() {
        const content = document.getElementById('mainContent');
        if (content) {
            content.classList.remove('loading-state');
        }
    },
    
    // Show toast notification
    showToast(message, type = 'info') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Hide toast after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    // Scroll to element smoothly
    scrollTo(element, container = window) {
        if (!element) return;
        
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
};

// Add loading state styles
const layoutStyles = document.createElement('style');
layoutStyles.textContent = `
    .loading-state {
        position: relative;
    }
    
    .loading-state::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 15, 26, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
    }
    
    .loading-state::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 40px;
        height: 40px;
        margin: -20px 0 0 -20px;
        border: 3px solid var(--text-muted);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        z-index: 101;
    }
    
    .toast {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .toast i {
        font-size: 1.25rem;
    }
    
    .toast.success i {
        color: var(--success);
    }
    
    .toast.error i {
        color: var(--error);
    }
    
    .toast.info i {
        color: var(--primary);
    }
`;
document.head.appendChild(layoutStyles);

// Export
window.Layout = Layout;
