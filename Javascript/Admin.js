/* =====================================================
   ADMIN FUNCTIONALITY
   ===================================================== */

const Admin = {
    editingFolderId: null,
    editingPageId: null,
    deleteTarget: null,
    
    // Initialize admin features
    init() {
        if (document.body.dataset.mode !== 'admin') return;
        
        this.bindEvents();
    },
    
    // Bind event listeners
    bindEvents() {
        // Folder Modal
        this.bindFolderModal();
        
        // Title Modal
        this.bindTitleModal();
        
        // Description Modal
        this.bindDescModal();
        
        // Code Modal
        this.bindCodeModal();
        
        // Delete Modal
        this.bindDeleteModal();
        
        // Edit Folder Modal
        this.bindEditFolderModal();
        
        // Edit/Delete Page Buttons
        this.bindPageActions();
        
        // Page Modal
        this.bindPageModal();
        
        // Sidebar Add Buttons
        this.bindSidebarAddButtons();
    },
    
    // =====================================================
    // SIDEBAR ADD BUTTONS
    // =====================================================
    
    bindSidebarAddButtons() {
        const addFolderBtn = document.getElementById('addFolderBtn');
        const addPageBtn = document.getElementById('addPageBtn');
        
        if (addFolderBtn) {
            addFolderBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent sidebar from closing
                this.openFolderModal();
            });
        }
        
        if (addPageBtn) {
            addPageBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent sidebar from closing
                this.openPageModal();
            });
        }
    },
    
    // =====================================================
    // FOLDER MODAL
    // =====================================================
    
    bindFolderModal() {
        const modal = document.getElementById('folderModal');
        const closeBtn = document.getElementById('closeFolderModal');
        const cancelBtn = document.getElementById('cancelFolder');
        const saveBtn = document.getElementById('saveFolder');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeFolderModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeFolderModal());
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveFolder());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeFolderModal();
            });
        }
    },
    
    openFolderModal() {
        const modal = document.getElementById('folderModal');
        const title = document.getElementById('folderModalTitle');
        const nameInput = document.getElementById('folderName');
        const parentSelect = document.getElementById('parentFolder');
        
        // Reset form
        this.editingFolderId = null;
        if (title) title.textContent = 'Add Folder';
        if (nameInput) nameInput.value = '';
        
        // Populate parent folder options
        if (parentSelect) {
            const options = Sidebar.getFolderOptions();
            parentSelect.innerHTML = '<option value="">Root Level</option>' +
                options.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
        }
        
        // Show modal
        if (modal) {
            modal.classList.add('active');
            nameInput?.focus();
        }
    },
    
    closeFolderModal() {
        const modal = document.getElementById('folderModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.editingFolderId = null;
    },
    
    async saveFolder() {
        const nameInput = document.getElementById('folderName');
        const parentSelect = document.getElementById('parentFolder');
        
        const name = nameInput?.value.trim();
        const parentId = parentSelect?.value || null;
        
        if (!name) {
            Layout.showToast('Please enter a folder name', 'error');
            nameInput?.focus();
            return;
        }
        
        try {
            const { data, error } = await db.createFolder(name, parentId);
            
            if (error) {
                throw error;
            }
            
            Layout.showToast('Folder created successfully!', 'success');
            this.closeFolderModal();
            await Sidebar.refresh();
            
        } catch (error) {
            console.error('Error creating folder:', error);
            Layout.showToast('Failed to create folder', 'error');
        }
    },
    
    // =====================================================
    // EDIT FOLDER MODAL
    // =====================================================
    
    bindEditFolderModal() {
        const modal = document.getElementById('editFolderModal');
        const closeBtn = document.getElementById('closeEditFolderModal');
        const cancelBtn = document.getElementById('cancelEditFolder');
        const saveBtn = document.getElementById('saveEditFolder');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeEditFolderModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeEditFolderModal());
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.updateFolder());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeEditFolderModal();
            });
        }
    },
    
    openEditFolderModal(folder) {
        const modal = document.getElementById('editFolderModal');
        const nameInput = document.getElementById('editFolderName');
        
        this.editingFolderId = folder.id;
        
        if (nameInput) {
            nameInput.value = folder.name;
        }
        
        if (modal) {
            modal.classList.add('active');
            nameInput?.focus();
            nameInput?.select();
        }
    },
    
    closeEditFolderModal() {
        const modal = document.getElementById('editFolderModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.editingFolderId = null;
    },
    
    async updateFolder() {
        const nameInput = document.getElementById('editFolderName');
        const name = nameInput?.value.trim();
        
        if (!name) {
            Layout.showToast('Please enter a folder name', 'error');
            nameInput?.focus();
            return;
        }
        
        if (!this.editingFolderId) return;
        
        try {
            const { error } = await db.updateFolder(this.editingFolderId, name);
            
            if (error) {
                throw error;
            }
            
            Layout.showToast('Folder updated successfully!', 'success');
            this.closeEditFolderModal();
            await Sidebar.refresh();
            
        } catch (error) {
            console.error('Error updating folder:', error);
            Layout.showToast('Failed to update folder', 'error');
        }
    },
    
    // =====================================================
    // TITLE MODAL (Simple - untuk halaman yang sedang aktif)
    // =====================================================
    
    bindTitleModal() {
        const modal = document.getElementById('titleModal');
        const closeBtn = document.getElementById('closeTitleModal');
        const cancelBtn = document.getElementById('cancelTitle');
        const saveBtn = document.getElementById('saveTitle');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeTitleModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeTitleModal());
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveTitle());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeTitleModal();
            });
        }
    },
    
    openTitleModal() {
        const modal = document.getElementById('titleModal');
        const titleInput = document.getElementById('titleInput');
        const pageNameSpan = document.getElementById('titlePageName');
        
        // Must have active page
        if (!Content.currentPage) {
            Layout.showToast('Pilih halaman terlebih dahulu', 'error');
            return;
        }
        
        // Show current page name
        if (pageNameSpan) {
            pageNameSpan.textContent = Content.currentPage.title;
        }
        
        // Pre-fill with current title
        if (titleInput) {
            titleInput.value = Content.currentPage.title || '';
        }
        
        // Show modal
        if (modal) {
            modal.classList.add('active');
            titleInput?.focus();
            titleInput?.select();
        }
    },
    
    closeTitleModal() {
        const modal = document.getElementById('titleModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    async saveTitle() {
        const titleInput = document.getElementById('titleInput');
        const title = titleInput?.value.trim();
        
        if (!title) {
            Layout.showToast('Masukkan judul', 'error');
            titleInput?.focus();
            return;
        }
        
        if (!Content.currentPage) {
            Layout.showToast('Tidak ada halaman yang dipilih', 'error');
            return;
        }
        
        try {
            const { error } = await db.updatePage(Content.currentPage.id, { title });
            
            if (error) throw error;
            
            Layout.showToast('Judul berhasil disimpan!', 'success');
            this.closeTitleModal();
            await Sidebar.refresh();
            await Content.refresh();
            
        } catch (error) {
            console.error('Error saving title:', error);
            Layout.showToast('Gagal menyimpan judul', 'error');
        }
    },
    
    // =====================================================
    // DESCRIPTION MODAL (Simple - untuk halaman yang sedang aktif)
    // =====================================================
    
    bindDescModal() {
        const modal = document.getElementById('descModal');
        const closeBtn = document.getElementById('closeDescModal');
        const cancelBtn = document.getElementById('cancelDesc');
        const saveBtn = document.getElementById('saveDesc');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeDescModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeDescModal());
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveDesc());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeDescModal();
            });
        }
    },
    
    openDescModal() {
        const modal = document.getElementById('descModal');
        const descInput = document.getElementById('descInput');
        const pageNameSpan = document.getElementById('descPageName');
        
        // Must have active page
        if (!Content.currentPage) {
            Layout.showToast('Pilih halaman terlebih dahulu', 'error');
            return;
        }
        
        // Show current page name
        if (pageNameSpan) {
            pageNameSpan.textContent = Content.currentPage.title;
        }
        
        // Pre-fill with current description
        if (descInput) {
            descInput.value = Content.currentPage.description || '';
        }
        
        // Show modal
        if (modal) {
            modal.classList.add('active');
            descInput?.focus();
        }
    },
    
    closeDescModal() {
        const modal = document.getElementById('descModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    async saveDesc() {
        const descInput = document.getElementById('descInput');
        const description = descInput?.value.trim();
        
        if (!description) {
            Layout.showToast('Masukkan deskripsi', 'error');
            descInput?.focus();
            return;
        }
        
        if (!Content.currentPage) {
            Layout.showToast('Tidak ada halaman yang dipilih', 'error');
            return;
        }
        
        try {
            const { error } = await db.updatePage(Content.currentPage.id, { description });
            
            if (error) throw error;
            
            Layout.showToast('Deskripsi berhasil disimpan!', 'success');
            this.closeDescModal();
            await Content.refresh();
            
        } catch (error) {
            console.error('Error saving description:', error);
            Layout.showToast('Gagal menyimpan deskripsi', 'error');
        }
    },
    
    // =====================================================
    // CODE MODAL (Language + Code - untuk halaman yang sedang aktif)
    // =====================================================
    
    bindCodeModal() {
        const modal = document.getElementById('codeModal');
        const closeBtn = document.getElementById('closeCodeModal');
        const cancelBtn = document.getElementById('cancelCode');
        const saveBtn = document.getElementById('saveCode');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeCodeModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeCodeModal());
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCode());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeCodeModal();
            });
        }
    },
    
    openCodeModal() {
        const modal = document.getElementById('codeModal');
        const langSelect = document.getElementById('codeLanguageSelect');
        const codeInput = document.getElementById('codeInput');
        const pageNameSpan = document.getElementById('codePageName');
        
        // Must have active page
        if (!Content.currentPage) {
            Layout.showToast('Pilih halaman terlebih dahulu', 'error');
            return;
        }
        
        // Show current page name
        if (pageNameSpan) {
            pageNameSpan.textContent = Content.currentPage.title;
        }
        
        // Pre-fill with current values
        if (langSelect) {
            langSelect.value = Content.currentPage.language || 'html';
        }
        
        if (codeInput) {
            codeInput.value = Content.currentPage.code || '';
        }
        
        // Show modal
        if (modal) {
            modal.classList.add('active');
            codeInput?.focus();
        }
    },
    
    closeCodeModal() {
        const modal = document.getElementById('codeModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    async saveCode() {
        const langSelect = document.getElementById('codeLanguageSelect');
        const codeInput = document.getElementById('codeInput');
        
        let language = langSelect?.value || 'html';
        const code = codeInput?.value;
        
        if (!code.trim()) {
            Layout.showToast('Masukkan code', 'error');
            codeInput?.focus();
            return;
        }
        
        if (!Content.currentPage) {
            Layout.showToast('Tidak ada halaman yang dipilih', 'error');
            return;
        }
        
        // Auto detect language if selected
        if (language === 'auto') {
            language = Block.detectLanguage(code);
        }
        
        try {
            const { error } = await db.updatePage(Content.currentPage.id, { code, language });
            
            if (error) throw error;
            
            Layout.showToast('Code berhasil disimpan!', 'success');
            this.closeCodeModal();
            await Content.refresh();
            
        } catch (error) {
            console.error('Error saving code:', error);
            Layout.showToast('Gagal menyimpan code', 'error');
        }
    },
    
    // =====================================================
    // DELETE MODAL
    // =====================================================
    
    bindDeleteModal() {
        const modal = document.getElementById('deleteModal');
        const closeBtn = document.getElementById('closeDeleteModal');
        const cancelBtn = document.getElementById('cancelDelete');
        const confirmBtn = document.getElementById('confirmDelete');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeDeleteModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeDeleteModal());
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirmDelete());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeDeleteModal();
            });
        }
    },
    
    openDeleteModal(type, item) {
        const modal = document.getElementById('deleteModal');
        const message = document.getElementById('deleteMessage');
        
        this.deleteTarget = { type, item };
        
        if (message) {
            if (type === 'folder') {
                message.textContent = `Are you sure you want to delete the folder "${item.name}"? This will also delete all pages inside it.`;
            } else {
                message.textContent = `Are you sure you want to delete the page "${item.title}"?`;
            }
        }
        
        if (modal) {
            modal.classList.add('active');
        }
    },
    
    closeDeleteModal() {
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.deleteTarget = null;
    },
    
    async confirmDelete() {
        if (!this.deleteTarget) return;
        
        const { type, item } = this.deleteTarget;
        
        try {
            if (type === 'folder') {
                const { error } = await db.deleteFolder(item.id);
                if (error) throw error;
                
                Layout.showToast('Folder deleted successfully!', 'success');
                
                // Clear content if deleted folder contained current page
                if (Content.currentPage && Content.currentPage.folder_id === item.id) {
                    Content.showWelcome();
                }
            } else {
                const { error } = await db.deletePage(item.id);
                if (error) throw error;
                
                Layout.showToast('Page deleted successfully!', 'success');
                
                // Clear content if deleted current page
                if (Content.currentPage && Content.currentPage.id === item.id) {
                    Content.showWelcome();
                }
            }
            
            this.closeDeleteModal();
            await Sidebar.refresh();
            
        } catch (error) {
            console.error('Error deleting:', error);
            Layout.showToast(`Failed to delete ${type}`, 'error');
        }
    },
    
    // =====================================================
    // PAGE ACTIONS (Edit/Delete buttons)
    // =====================================================
    
    bindPageActions() {
        const editBtn = document.getElementById('editPageBtn');
        const deleteBtn = document.getElementById('deletePageBtn');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                if (Content.currentPage) {
                    // Open title modal for editing (since we use FAB for detailed edit)
                    this.openTitleModal();
                }
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (Content.currentPage) {
                    this.openDeleteModal('page', Content.currentPage);
                }
            });
        }
    },
    
    // =====================================================
    // PAGE MODAL (Add Page from Sidebar)
    // =====================================================
    
    bindPageModal() {
        const modal = document.getElementById('pageModal');
        const closeBtn = document.getElementById('closePageModal');
        const cancelBtn = document.getElementById('cancelPage');
        const saveBtn = document.getElementById('savePage');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closePageModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closePageModal());
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.savePage());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closePageModal();
            });
        }
    },
    
    openPageModal() {
        const modal = document.getElementById('pageModal');
        const titleInput = document.getElementById('pageTitleInput');
        const folderSelect = document.getElementById('pageFolderSelect');
        const descInput = document.getElementById('pageDescInput');
        
        // Reset form
        if (titleInput) titleInput.value = '';
        if (descInput) descInput.value = '';
        
        // Populate folder options
        if (folderSelect) {
            const options = Sidebar.getFolderOptions();
            folderSelect.innerHTML = '<option value="">Pilih folder...</option>' +
                options.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
            
            // Pre-select active folder if any
            if (Sidebar.activeFolderId) {
                folderSelect.value = Sidebar.activeFolderId;
            }
        }
        
        // Show modal
        if (modal) {
            modal.classList.add('active');
            titleInput?.focus();
        }
    },
    
    closePageModal() {
        const modal = document.getElementById('pageModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    async savePage() {
        const titleInput = document.getElementById('pageTitleInput');
        const folderSelect = document.getElementById('pageFolderSelect');
        const descInput = document.getElementById('pageDescInput');
        
        const title = titleInput?.value?.trim() || '';
        const folderId = folderSelect?.value || '';
        const description = descInput?.value?.trim() || '';
        
        console.log('Save Page Debug:', { title, folderId, description });
        
        if (!title) {
            Layout.showToast('Masukkan judul page', 'error');
            titleInput?.focus();
            return;
        }
        
        if (!folderId) {
            Layout.showToast('Pilih folder', 'error');
            folderSelect?.focus();
            return;
        }
        
        try {
            const { data, error } = await db.createPage(folderId, title, description, '', 'javascript');
            
            if (error) throw error;
            
            Layout.showToast('Page berhasil ditambahkan!', 'success');
            this.closePageModal();
            await Sidebar.refresh();
            
            // Expand the folder and select the new page
            if (data) {
                Sidebar.expandToPage(data.id);
                Sidebar.selectPage(data.id);
            }
            
        } catch (error) {
            console.error('Error saving page:', error);
            Layout.showToast('Gagal menyimpan page', 'error');
        }
    }
};

// Export
window.Admin = Admin;
