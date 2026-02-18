/* =====================================================
   APP - Application State & Initialization
   ===================================================== */

const App = {
    isInitialized: false,
    mode: 'guest',
    
    // Initialize application
    async init() {
        if (this.isInitialized) return;
        
      
        
        // Determine mode
        this.mode = document.body.dataset.mode || 'guest';
        console.log(`Mode: ${this.mode}`);
        
        // Validate admin access
        if (this.mode === 'admin') {
            if (!Header.validateAdminAccess()) {
                return; // Will redirect to guest
            }
        }
        
        try {
            // Initialize modules in order
            await this.initModules();
            
            this.isInitialized = true;
           
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    },
    
    // Initialize all modules
    async initModules() {
        // Layout first
        Layout.init();
        
        // Header (includes login handling)
        Header.init();
        
        // Load data and render sidebar
        await Sidebar.init();
        
        // Search functionality
        Search.init();
        
        // Content display
        Content.init();
        
        // Code block handling
        Block.init();
        
        // Admin-only features
        if (this.mode === 'admin') {
            Fab.init();
            Admin.init();
        }
    },
    
    // Show error message
    showError(message) {
        const container = document.getElementById('mainContent');
        if (container) {
            container.innerHTML = `
                <div class="content-wrapper">
                    <div class="welcome-screen">
                        <div class="welcome-icon" style="background: linear-gradient(135deg, var(--error), #dc2626);">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h1>Oops! Something went wrong</h1>
                        <p>${message}</p>
                        <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 1rem;">
                            <i class="fas fa-refresh"></i> Refresh Page
                        </button>
                    </div>
                </div>
            `;
        }
    },
    
    // Get current mode
    getMode() {
        return this.mode;
    },
    
    // Check if admin mode
    isAdmin() {
        return this.mode === 'admin';
    },
    
    // Refresh all data
    async refresh() {
        await Sidebar.refresh();
        if (Content.currentPage) {
            await Content.refresh();
        }
    }
};

// Export
window.App = App;
