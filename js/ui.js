/* ========================================
   UI.JS - User Interface Handler
   ======================================== */

const UI = {
    /**
     * Open modal by ID
     * @param {string} modalId - Modal element ID
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    /**
     * Close modal by ID
     * @param {string} modalId - Modal element ID
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },
    
    /**
     * Close all open modals
     */
    closeAllModals() {
        document.querySelectorAll('.modal-backdrop').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    },
    
    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning)
     */
    notify(message, type = 'success') {
        const notif = document.getElementById('notification');
        if (notif) {
            notif.textContent = message;
            notif.className = `notification ${type} show`;
            setTimeout(() => {
                notif.classList.remove('show');
            }, 3000);
        }
    },
    
    /**
     * Update admin UI elements visibility
     */
    updateAdminUI() {
        const isAdmin = Auth.isAdmin();
        
        // Toggle login/logout buttons
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const adminBar = document.getElementById('adminBar');
        
        if (loginBtn) loginBtn.classList.toggle('hidden', isAdmin);
        if (logoutBtn) logoutBtn.classList.toggle('hidden', !isAdmin);
        if (adminBar) adminBar.classList.toggle('hidden', !isAdmin);
        
        // Toggle admin-only elements
        document.querySelectorAll('.admin-only').forEach(el => {
            el.classList.toggle('hidden', !isAdmin);
        });
    },
    
    /**
     * Show page loading spinner
     */
    showLoading() {
        const loader = document.getElementById('pageLoading');
        if (loader) {
            loader.classList.remove('hidden');
        }
    },
    
    /**
     * Hide page loading spinner
     */
    hideLoading() {
        const loader = document.getElementById('pageLoading');
        if (loader) {
            loader.classList.add('hidden');
        }
    },
    
    /**
     * Show file ID preview
     * @param {string} inputValue - Input value
     * @param {string} previewId - Preview element ID
     * @param {boolean} showThumb - Show thumbnail preview
     */
    showFileIdPreview(inputValue, previewId, showThumb = false) {
        const preview = document.getElementById(previewId);
        if (!preview) return;
        
        if (!inputValue.trim()) {
            preview.classList.remove('show');
            return;
        }
        
        const fileId = Utils.extractFileId(inputValue);
        
        if (fileId && Utils.isValidFileId(fileId)) {
            let html = `
                <span class="file-id-label">✅ File ID Terdeteksi:</span>
                <span class="file-id-value">${fileId}</span>
            `;
            
            if (showThumb) {
                html += `<img src="${Utils.getDriveThumbnailUrl(fileId)}" class="file-id-thumb" onerror="this.style.display='none'" alt="Preview">`;
            }
            
            preview.innerHTML = html;
            preview.className = 'file-id-preview show valid';
        } else {
            preview.innerHTML = `
                <span class="file-id-label">⚠️ Tidak Terdeteksi:</span>
                <span class="file-id-value">Pastikan link Google Drive valid</span>
            `;
            preview.className = 'file-id-preview show invalid';
        }
    },
    
    /**
     * Reset file ID preview
     * @param {string} previewId - Preview element ID
     */
    resetFileIdPreview(previewId) {
        const preview = document.getElementById(previewId);
        if (preview) {
            preview.classList.remove('show');
            preview.innerHTML = '';
        }
    }
};
