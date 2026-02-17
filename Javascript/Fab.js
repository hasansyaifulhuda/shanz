/* =====================================================
   FAB (Floating Action Button) FUNCTIONALITY
   ===================================================== */

const Fab = {
    container: null,
    mainBtn: null,
    menu: null,
    isOpen: false,
    
    // Initialize FAB
    init() {
        this.container = document.getElementById('fabContainer');
        this.mainBtn = document.getElementById('fabMain');
        this.menu = document.getElementById('fabMenu');
        
        if (!this.container) return;
        
        this.bindEvents();
    },
    
    // Bind event listeners
    bindEvents() {
        // Main FAB button
        if (this.mainBtn) {
            this.mainBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
                this.addRipple(e);
            });
        }
        
        // Add Title button
        const addTitleBtn = document.getElementById('addTitleBtn');
        if (addTitleBtn) {
            addTitleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close();
                
                // Check if a page is selected
                if (!Content.currentPage) {
                    Layout.showToast('Pilih halaman terlebih dahulu di sidebar', 'error');
                    return;
                }
                
                Admin.openTitleModal();
            });
        }
        
        // Add Description button
        const addDescBtn = document.getElementById('addDescBtn');
        if (addDescBtn) {
            addDescBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close();
                
                // Check if a page is selected
                if (!Content.currentPage) {
                    Layout.showToast('Pilih halaman terlebih dahulu di sidebar', 'error');
                    return;
                }
                
                Admin.openDescModal();
            });
        }
        
        // Add Code Block button
        const addCodeBtn = document.getElementById('addCodeBtn');
        if (addCodeBtn) {
            addCodeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close();
                
                // Check if a page is selected
                if (!Content.currentPage) {
                    Layout.showToast('Pilih halaman terlebih dahulu di sidebar', 'error');
                    return;
                }
                
                Admin.openCodeModal();
            });
        }
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && !e.target.closest('.fab-container')) {
                this.close();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // Close on scroll
        window.addEventListener('scroll', () => {
            if (this.isOpen) {
                this.close();
            }
        }, { passive: true });
    },
    
    // Toggle FAB menu
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },
    
    // Open FAB menu
    open() {
        this.isOpen = true;
        if (this.container) {
            this.container.classList.add('active');
        }
    },
    
    // Close FAB menu
    close() {
        this.isOpen = false;
        if (this.container) {
            this.container.classList.remove('active');
        }
    },
    
    // Add ripple effect
    addRipple(e) {
        if (!this.mainBtn) return;
        
        this.mainBtn.classList.add('ripple');
        setTimeout(() => {
            this.mainBtn.classList.remove('ripple');
        }, 600);
    },
    
    // Show FAB
    show() {
        if (this.container) {
            this.container.style.display = 'flex';
        }
    },
    
    // Hide FAB
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }
};

// Export
window.Fab = Fab;
