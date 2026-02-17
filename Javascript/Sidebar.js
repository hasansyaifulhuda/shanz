/* =====================================================
   SIDEBAR FUNCTIONALITY
   ===================================================== */

const Sidebar = {
    folders: [],
    pages: [],
    expandedFolders: new Set(),
    activeFolderId: null,
    activePageId: null,
    isEventsBound: false,
    
    // Initialize sidebar
    async init() {
        await this.loadData();
        this.render();
        this.bindEvents();
    },
    
    // Load folders and pages from Supabase
    async loadData() {
        try {
            const [foldersResult, pagesResult] = await Promise.all([
                db.getFolders(),
                db.getPages()
            ]);
            
            if (foldersResult.error) {
                console.error('Error loading folders:', foldersResult.error);
                this.folders = [];
            } else {
                this.folders = foldersResult.data || [];
            }
            
            if (pagesResult.error) {
                console.error('Error loading pages:', pagesResult.error);
                this.pages = [];
            } else {
                this.pages = pagesResult.data || [];
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.folders = [];
            this.pages = [];
        }
    },
    
    // Build folder tree structure
    buildTree() {
        const folderMap = new Map();
        const rootFolders = [];
        
        // Create map of all folders
        this.folders.forEach(folder => {
            folderMap.set(folder.id, {
                ...folder,
                children: [],
                pages: this.pages.filter(p => p.folder_id === folder.id)
            });
        });
        
        // Build hierarchy
        this.folders.forEach(folder => {
            const folderNode = folderMap.get(folder.id);
            if (folder.parent_id && folderMap.has(folder.parent_id)) {
                folderMap.get(folder.parent_id).children.push(folderNode);
            } else {
                rootFolders.push(folderNode);
            }
        });
        
        return rootFolders;
    },
    
    // Render folder tree
    render() {
        const container = document.getElementById('folderTree');
        if (!container) return;
        
        const tree = this.buildTree();
        
        if (tree.length === 0 && this.pages.length === 0) {
            container.innerHTML = `
                <div class="empty-folder">
                    <i class="fas fa-folder-open"></i>
                    <p>NO FOLDER</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.renderFolders(tree, 0);
        
        // Initialize drag & drop after render
        this.initDragAndDrop();
    },
    
    // Render folders recursively
    renderFolders(folders, level) {
        const isAdmin = document.body.dataset.mode === 'admin';
        
        return folders.map(folder => {
            const isExpanded = this.expandedFolders.has(folder.id);
            const hasChildren = folder.children.length > 0 || folder.pages.length > 0;
            const isActive = this.activeFolderId === folder.id;
            
            const pagesHtml = folder.pages.map(page => this.renderPage(page)).join('');
            const childrenHtml = this.renderFolders(folder.children, level + 1);
            
            return `
                <div class="folder-item" data-folder-id="${folder.id}">
                    <div class="folder-header ${isActive ? 'active' : ''}" 
                         style="padding-left: ${1 + level * 1}rem">
                        <span class="folder-toggle ${isExpanded ? 'expanded' : ''} ${hasChildren ? '' : 'hidden'}">
                            <i class="fas fa-chevron-right"></i>
                        </span>
                        <span class="folder-icon">
                            <i class="fas ${isExpanded ? 'fa-folder-open' : 'fa-folder'}"></i>
                        </span>
                        <span class="folder-name">${this.escapeHtml(folder.name)}</span>
                        ${isAdmin ? `
                            <div class="folder-actions">
                                <button class="folder-action-btn edit" data-action="edit" title="Edit">
                                    <i class="fas fa-pen"></i>
                                </button>
                                <button class="folder-action-btn delete" data-action="delete" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    <div class="folder-children ${isExpanded ? 'expanded' : ''}">
                        ${pagesHtml}
                        ${childrenHtml}
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Render page item
    renderPage(page) {
        const isActive = this.activePageId === page.id;
        const languageIcon = this.getLanguageIcon(page.language);
        
        return `
            <div class="page-item ${isActive ? 'active' : ''}" data-page-id="${page.id}">
                <span class="page-icon">
                    <i class="${languageIcon}"></i>
                </span>
                <span class="page-name">${this.escapeHtml(page.title)}</span>
            </div>
        `;
    },
    
    // Get icon based on language
    getLanguageIcon(language) {
        const icons = {
            'html': 'fab fa-html5',
            'css': 'fab fa-css3-alt',
            'javascript': 'fab fa-js-square',
            'python': 'fab fa-python',
            'php': 'fab fa-php',
            'sql': 'fas fa-database',
            'json': 'fas fa-brackets-curly',
            'markdown': 'fab fa-markdown'
        };
        return icons[language] || 'fas fa-file-code';
    },
    
    // Bind event listeners - using event delegation (no re-binding needed)
    bindEvents() {
        const container = document.getElementById('folderTree');
        if (!container || this.isEventsBound) return;
        
        this.isEventsBound = true;
        
        // Use event delegation - bind once to container
        container.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleClick(e);
        });
    },
    
    // Handle all clicks via delegation
    handleClick(e) {
        const actionBtn = e.target.closest('.folder-action-btn');
        const folderHeader = e.target.closest('.folder-header');
        const pageItem = e.target.closest('.page-item');
        
        // Handle action buttons (edit/delete)
        if (actionBtn) {
            e.preventDefault();
            e.stopPropagation();
            const folderId = actionBtn.closest('.folder-item').dataset.folderId;
            const action = actionBtn.dataset.action;
            
            if (action === 'edit') {
                this.handleEditFolder(folderId);
            } else if (action === 'delete') {
                this.handleDeleteFolder(folderId);
            }
            return;
        }
        
        // Handle folder click
        if (folderHeader) {
            e.preventDefault();
            e.stopPropagation();
            const folderItem = folderHeader.closest('.folder-item');
            const folderId = folderItem.dataset.folderId;
            this.toggleFolder(folderId);
            return;
        }
        
        // Handle page click
        if (pageItem) {
            e.preventDefault();
            e.stopPropagation();
            const pageId = pageItem.dataset.pageId;
            this.selectPage(pageId);
            return;
        }
    },
    
    // Toggle folder expand/collapse - OPTIMIZED
    toggleFolder(folderId) {
        // Toggle state
        if (this.expandedFolders.has(folderId)) {
            this.expandedFolders.delete(folderId);
        } else {
            this.expandedFolders.add(folderId);
        }
        
        // Update only the affected folder (not full re-render)
        const folderItem = document.querySelector(`[data-folder-id="${folderId}"]`);
        if (folderItem) {
            const toggle = folderItem.querySelector('.folder-toggle');
            const icon = folderItem.querySelector('.folder-icon i');
            const children = folderItem.querySelector('.folder-children');
            const isExpanded = this.expandedFolders.has(folderId);
            
            if (toggle) {
                toggle.classList.toggle('expanded', isExpanded);
            }
            if (icon) {
                icon.className = `fas ${isExpanded ? 'fa-folder-open' : 'fa-folder'}`;
            }
            if (children) {
                children.classList.toggle('expanded', isExpanded);
            }
        }
    },
    
    // Select page
    selectPage(pageId) {
        this.activePageId = pageId;
        this.render();
        this.bindEvents();
        
        // Load page content
        Content.loadPage(pageId);
        
        // Close sidebar on mobile
        if (window.innerWidth <= 900) {
            Layout.closeSidebar();
        }
    },
    
    // Handle edit folder (Admin only)
    handleEditFolder(folderId) {
        const folder = this.folders.find(f => f.id === folderId);
        if (!folder) return;
        
        Admin.openEditFolderModal(folder);
    },
    
    // Handle delete folder (Admin only)
    handleDeleteFolder(folderId) {
        const folder = this.folders.find(f => f.id === folderId);
        if (!folder) return;
        
        Admin.openDeleteModal('folder', folder);
    },
    
    // Expand folder by ID (for search navigation)
    expandToFolder(folderId) {
        const folder = this.folders.find(f => f.id === folderId);
        if (!folder) return;
        
        // Expand all parent folders
        let currentId = folder.parent_id;
        while (currentId) {
            this.expandedFolders.add(currentId);
            const parent = this.folders.find(f => f.id === currentId);
            currentId = parent ? parent.parent_id : null;
        }
        
        this.expandedFolders.add(folderId);
        this.activeFolderId = folderId;
        this.render();
        this.bindEvents();
    },
    
    // Expand to page (for search navigation)
    expandToPage(pageId) {
        const page = this.pages.find(p => p.id === pageId);
        if (!page || !page.folder_id) return;
        
        this.expandToFolder(page.folder_id);
        this.activePageId = pageId;
        this.render();
        this.bindEvents();
    },
    
    // Refresh sidebar data
    async refresh() {
        await this.loadData();
        this.render();
        // No need to rebind events - using event delegation
    },
    
    // Get all folders for select dropdown
    getFolderOptions(excludeId = null) {
        return this.folders
            .filter(f => f.id !== excludeId)
            .map(f => ({
                id: f.id,
                name: this.getFolderPath(f.id)
            }));
    },
    
    // Get folder path (for nested display)
    getFolderPath(folderId) {
        const folder = this.folders.find(f => f.id === folderId);
        if (!folder) return '';
        
        const path = [folder.name];
        let currentId = folder.parent_id;
        
        while (currentId) {
            const parent = this.folders.find(f => f.id === currentId);
            if (parent) {
                path.unshift(parent.name);
                currentId = parent.parent_id;
            } else {
                break;
            }
        }
        
        return path.join(' / ');
    },
    
    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // =====================================================
    // DRAG & DROP - REORDER ONLY (Admin)
    // =====================================================
    
    draggedFolder: null,
    
    initDragAndDrop() {
        if (document.body.dataset.mode !== 'admin') return;
        
        const container = document.getElementById('folderTree');
        if (!container) return;
        
        const folderItems = container.querySelectorAll('.folder-item');
        
        folderItems.forEach(folderItem => {
            const header = folderItem.querySelector('.folder-header');
            if (!header) return;
            
            header.setAttribute('draggable', 'true');
            
            header.addEventListener('dragstart', (e) => {
                e.stopPropagation();
                this.draggedFolder = folderItem;
                folderItem.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            
            header.addEventListener('dragend', (e) => {
                e.stopPropagation();
                folderItem.classList.remove('dragging');
                this.draggedFolder = null;
                document.querySelectorAll('.drag-above, .drag-below').forEach(el => {
                    el.classList.remove('drag-above', 'drag-below');
                });
            });
            
            header.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.draggedFolder || this.draggedFolder === folderItem) return;
                
                // Only allow same level reorder
                if (this.draggedFolder.parentElement !== folderItem.parentElement) return;
                
                const rect = header.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                
                folderItem.classList.remove('drag-above', 'drag-below');
                if (e.clientY < midY) {
                    folderItem.classList.add('drag-above');
                } else {
                    folderItem.classList.add('drag-below');
                }
            });
            
            header.addEventListener('dragleave', (e) => {
                e.stopPropagation();
                folderItem.classList.remove('drag-above', 'drag-below');
            });
            
            header.addEventListener('drop', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.draggedFolder || this.draggedFolder === folderItem) return;
                if (this.draggedFolder.parentElement !== folderItem.parentElement) return;
                
                const isAbove = folderItem.classList.contains('drag-above');
                const parent = folderItem.parentElement;
                
                folderItem.classList.remove('drag-above', 'drag-below');
                
                if (isAbove) {
                    parent.insertBefore(this.draggedFolder, folderItem);
                } else {
                    parent.insertBefore(this.draggedFolder, folderItem.nextSibling);
                }
                
                await this.saveNewOrder(parent);
            });
        });
    },
    
    async saveNewOrder(container) {
        const folderItems = container.querySelectorAll(':scope > .folder-item');
        const updates = [];
        
        folderItems.forEach((item, index) => {
            const folderId = item.dataset.folderId;
            if (folderId) {
                updates.push({ id: folderId, sort_order: index });
            }
        });
        
        console.log('Saving new order:', updates);
        
        // Update database
        let hasError = false;
        for (const update of updates) {
            const result = await db.updateFolderOrder(update.id, update.sort_order);
            if (result.error) {
                console.error('Error saving order:', result.error);
                hasError = true;
            }
        }
        
        if (hasError) {
            Layout.showToast('Gagal menyimpan urutan folder!', 'error');
        } else {
            // Refresh data dari database untuk memastikan sinkron
            await this.loadData();
            Layout.showToast('Urutan folder disimpan!', 'success');
        }
    }
};

// Export
window.Sidebar = Sidebar;
