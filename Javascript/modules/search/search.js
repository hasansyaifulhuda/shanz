/* =====================================================
   SEARCH FUNCTIONALITY
   ===================================================== */

const Search = {
    searchInput: null,
    searchResults: null,
    debounceTimer: null,
    isOpen: false,
    
    // Initialize search
    init() {
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        
        if (!this.searchInput || !this.searchResults) return;
        
        this.bindEvents();
    },
    
    // Bind event listeners
    bindEvents() {
        // Input event with debounce
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                this.hideResults();
                return;
            }
            
            this.debounceTimer = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        });
        
        // Focus event
        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value.trim().length >= 2) {
                this.showResults();
            }
        });
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideResults();
            }
        });
        
        // Keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideResults();
                this.searchInput.blur();
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateResults(e.key === 'ArrowDown' ? 1 : -1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.selectCurrentResult();
            }
        });
    },
    
    // Perform search
    async performSearch(query) {
        try {
            // Local search first (faster)
            const localResults = this.localSearch(query);
            this.displayResults(localResults, query);
            
            // Then try Supabase search for more comprehensive results
            const { data, error } = await db.search(query);
            
            if (!error && data) {
                const combinedResults = this.combineResults(localResults, data, query);
                this.displayResults(combinedResults, query);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    },
    
    // Local search (from cached data)
    localSearch(query) {
        const lowerQuery = query.toLowerCase();
        const results = {
            folders: [],
            pages: []
        };
        
        // Search folders
        if (Sidebar.folders) {
            results.folders = Sidebar.folders.filter(folder => 
                folder.name.toLowerCase().includes(lowerQuery)
            );
        }
        
        // Search pages
        if (Sidebar.pages) {
            results.pages = Sidebar.pages.filter(page => 
                page.title.toLowerCase().includes(lowerQuery) ||
                (page.description && page.description.toLowerCase().includes(lowerQuery)) ||
                (page.code && page.code.toLowerCase().includes(lowerQuery))
            );
        }
        
        return results;
    },
    
    // Combine local and remote results
    combineResults(local, remote, query) {
        const folderIds = new Set(local.folders.map(f => f.id));
        const pageIds = new Set(local.pages.map(p => p.id));
        
        const combinedFolders = [...local.folders];
        const combinedPages = [...local.pages];
        
        // Add remote folders not in local
        remote.folders.forEach(folder => {
            if (!folderIds.has(folder.id)) {
                combinedFolders.push(folder);
            }
        });
        
        // Add remote pages not in local
        remote.pages.forEach(page => {
            if (!pageIds.has(page.id)) {
                combinedPages.push(page);
            }
        });
        
        return {
            folders: combinedFolders,
            pages: combinedPages
        };
    },
    
    // Display search results
    displayResults(results, query) {
        const totalResults = results.folders.length + results.pages.length;
        
        if (totalResults === 0) {
            this.searchResults.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${this.escapeHtml(query)}"</p>
                </div>
            `;
            this.showResults();
            return;
        }
        
        let html = '';
        
        // Folder results
        if (results.folders.length > 0) {
            html += results.folders.slice(0, 5).map(folder => `
                <div class="search-result-item" data-type="folder" data-id="${folder.id}">
                    <i class="fas fa-folder"></i>
                    <div class="result-info">
                        <div class="result-title">${this.highlightMatch(folder.name, query)}</div>
                        <div class="result-path">Folder</div>
                    </div>
                </div>
            `).join('');
        }
        
        // Page results
        if (results.pages.length > 0) {
            html += results.pages.slice(0, 10).map(page => {
                const folder = Sidebar.folders.find(f => f.id === page.folder_id);
                const folderPath = folder ? folder.name : 'Unknown';
                
                // Determine where the match was found
                let matchLocation = '';
                const lowerQuery = query.toLowerCase();
                
                if (page.title.toLowerCase().includes(lowerQuery)) {
                    matchLocation = 'in title';
                } else if (page.description && page.description.toLowerCase().includes(lowerQuery)) {
                    matchLocation = 'in description';
                } else if (page.code && page.code.toLowerCase().includes(lowerQuery)) {
                    matchLocation = 'in code';
                }
                
                return `
                    <div class="search-result-item" data-type="page" data-id="${page.id}">
                        <i class="${Sidebar.getLanguageIcon(page.language)}"></i>
                        <div class="result-info">
                            <div class="result-title">${this.highlightMatch(page.title, query)}</div>
                            <div class="result-path">${folderPath} ${matchLocation ? `• ${matchLocation}` : ''}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        this.searchResults.innerHTML = html;
        this.showResults();
        this.bindResultEvents();
    },
    
    // Bind result click events
    bindResultEvents() {
        const items = this.searchResults.querySelectorAll('.search-result-item');
        
        items.forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                const id = item.dataset.id;
                
                if (type === 'folder') {
                    this.navigateToFolder(id);
                } else if (type === 'page') {
                    this.navigateToPage(id);
                }
                
                this.hideResults();
                this.searchInput.value = '';
            });
        });
    },
    
    // Navigate to folder
    navigateToFolder(folderId) {
        Sidebar.expandToFolder(folderId);
        
        // Scroll folder into view
        setTimeout(() => {
            const folderElement = document.querySelector(`[data-folder-id="${folderId}"]`);
            if (folderElement) {
                folderElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                folderElement.querySelector('.folder-header').classList.add('highlight-flash');
                setTimeout(() => {
                    folderElement.querySelector('.folder-header').classList.remove('highlight-flash');
                }, 2000);
            }
        }, 100);
    },
    
    // Navigate to page
    navigateToPage(pageId) {
        Sidebar.expandToPage(pageId);
        Sidebar.selectPage(pageId);
        
        // Scroll page into view in sidebar
        setTimeout(() => {
            const pageElement = document.querySelector(`[data-page-id="${pageId}"]`);
            if (pageElement) {
                pageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    },
    
    // Keyboard navigation
    navigateResults(direction) {
        const items = this.searchResults.querySelectorAll('.search-result-item');
        if (items.length === 0) return;
        
        const currentIndex = Array.from(items).findIndex(item => item.classList.contains('selected'));
        let newIndex = currentIndex + direction;
        
        if (newIndex < 0) newIndex = items.length - 1;
        if (newIndex >= items.length) newIndex = 0;
        
        items.forEach(item => item.classList.remove('selected'));
        items[newIndex].classList.add('selected');
        items[newIndex].scrollIntoView({ block: 'nearest' });
    },
    
    // Select current result (Enter key)
    selectCurrentResult() {
        const selected = this.searchResults.querySelector('.search-result-item.selected');
        if (selected) {
            selected.click();
        } else {
            const first = this.searchResults.querySelector('.search-result-item');
            if (first) first.click();
        }
    },
    
    // Highlight matching text
    highlightMatch(text, query) {
        if (!query) return this.escapeHtml(text);
        
        const escaped = this.escapeHtml(text);
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return escaped.replace(regex, '<span class="result-highlight">$1</span>');
    },
    
    // Show results dropdown
    showResults() {
        this.searchResults.classList.add('active');
        this.isOpen = true;
    },
    
    // Hide results dropdown
    hideResults() {
        this.searchResults.classList.remove('active');
        this.isOpen = false;
    },
    
    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Escape regex special characters
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};

// Add CSS for search result selection
const searchStyles = document.createElement('style');
searchStyles.textContent = `
    .search-result-item.selected {
        background: var(--bg-hover);
    }
    
    .highlight-flash {
        animation: highlightFlash 2s ease;
    }
    
    @keyframes highlightFlash {
        0%, 100% { background: transparent; }
        50% { background: var(--primary-glow); }
    }
`;
document.head.appendChild(searchStyles);

// Export
window.Search = Search;
