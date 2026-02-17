/* =====================================================
   CONTENT FUNCTIONALITY
   ===================================================== */

const Content = {
    currentPage: null,
    timeUpdateInterval: null,
    
    // Initialize content
    init() {
        this.bindEvents();
    },
    
    // Bind event listeners
    bindEvents() {
        // Copy button
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyCode());
        }
    },
    
    // Load page by ID
    async loadPage(pageId) {
        try {
            Layout.showLoading();
            
            const { data: page, error } = await db.getPage(pageId);
            
            if (error) {
                console.error('Error loading page:', error);
                Layout.showToast('Failed to load page', 'error');
                return;
            }
            
            if (!page) {
                console.error('Page not found');
                Layout.showToast('Page not found', 'error');
                return;
            }
            
            this.currentPage = page;
            this.renderPage(page);
            
        } catch (error) {
            console.error('Error loading page:', error);
            Layout.showToast('Failed to load page', 'error');
        } finally {
            Layout.hideLoading();
        }
    },
    
    // Render page content
    renderPage(page) {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const pageContent = document.getElementById('pageContent');
        const pageTitle = document.getElementById('pageTitle');
        const pageMeta = document.getElementById('pageMeta');
        const pageDescription = document.getElementById('pageDescription');
        const codeContainer = document.getElementById('codeContainer');
        const codeLanguage = document.getElementById('codeLanguage');
        const codeBlock = document.getElementById('codeBlock');
        
        // Hide welcome screen, show page content
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (pageContent) pageContent.style.display = 'block';
        
        // Set title
        if (pageTitle) {
            pageTitle.textContent = page.title;
        }
        
        // Set meta info dengan realtime update
        if (pageMeta) {
            this.updateTimestamp(page);
            
            // Clear interval sebelumnya
            if (this.timeUpdateInterval) {
                clearInterval(this.timeUpdateInterval);
            }
            
            // Update setiap 1 menit untuk "x menit yang lalu"
            this.timeUpdateInterval = setInterval(() => {
                this.updateTimestamp(page);
            }, 60000); // Update setiap 1 menit
        }
        
        // Set description
        if (pageDescription) {
            if (page.description) {
                pageDescription.innerHTML = this.formatDescription(page.description);
                pageDescription.style.display = 'block';
            } else {
                pageDescription.style.display = 'none';
            }
        }
        
        // Set code
        if (codeContainer && codeBlock) {
            if (page.code) {
                codeContainer.style.display = 'block';
                
                // Set language badge
                if (codeLanguage) {
                    codeLanguage.textContent = this.getLanguageLabel(page.language);
                }
                
                // Set code content with proper escaping
                codeBlock.textContent = page.code;
                codeBlock.className = `language-${page.language || 'javascript'}`;
                
                // Re-highlight code
                Prism.highlightElement(codeBlock);
            } else {
                codeContainer.style.display = 'none';
            }
        }
        
        // Trigger animation
        if (pageContent) {
            pageContent.style.animation = 'none';
            pageContent.offsetHeight; // Trigger reflow
            pageContent.style.animation = 'slideIn 0.3s ease';
        }
    },
    
    // Get language label
    getLanguageLabel(language) {
        const labels = {
            'html': 'HTML',
            'css': 'CSS',
            'javascript': 'JavaScript',
            'python': 'Python',
            'php': 'PHP',
            'sql': 'SQL',
            'json': 'JSON',
            'markdown': 'Markdown'
        };
        return labels[language] || language?.toUpperCase() || 'CODE';
    },
    
    // Copy code to clipboard
    async copyCode() {
        if (!this.currentPage || !this.currentPage.code) return;
        
        const copyBtn = document.getElementById('copyBtn');
        
        try {
            await navigator.clipboard.writeText(this.currentPage.code);
            
            // Update button state
            if (copyBtn) {
                copyBtn.classList.add('copied');
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            }
            
            Layout.showToast('Code copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy:', error);
            
            // Fallback for older browsers
            this.fallbackCopy(this.currentPage.code);
        }
    },
    
    // Fallback copy method
    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            Layout.showToast('Code copied to clipboard!', 'success');
        } catch (error) {
            Layout.showToast('Failed to copy code', 'error');
        }
        
        document.body.removeChild(textarea);
    },
    
    // Show welcome screen
    showWelcome() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const pageContent = document.getElementById('pageContent');
        
        if (welcomeScreen) welcomeScreen.style.display = 'flex';
        if (pageContent) pageContent.style.display = 'none';
        
        this.currentPage = null;
    },
    
    // Refresh current page
    async refresh() {
        if (this.currentPage) {
            await this.loadPage(this.currentPage.id);
        }
    },
    
    // Update timestamp display
    updateTimestamp(page) {
        const pageMeta = document.getElementById('pageMeta');
        if (!pageMeta) return;
        
        const createdDate = this.formatDate(page.created_at);
        const updatedDate = this.formatDate(page.updated_at);
        const relativeTime = this.getRelativeTime(page.updated_at);
        
        // Check if updated is different from created (more than 1 minute)
        const created = new Date(page.created_at).getTime();
        const updated = new Date(page.updated_at).getTime();
        const isDifferent = (updated - created) > 60000; // 1 minute
        
        pageMeta.innerHTML = `
            <span class="timestamp">
                <i class="fas fa-calendar-plus"></i> Dibuat: ${createdDate}
            </span>
            ${isDifferent ? `
                <span class="timestamp updated-time">
                    <i class="fas fa-sync-alt"></i> Diupdate: ${relativeTime}
                    <span class="full-date">(${updatedDate})</span>
                </span>
            ` : ''}
        `;
    },
    
    // Format tanggal lengkap
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Get relative time (berapa lama yang lalu)
    getRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        const diffWeek = Math.floor(diffDay / 7);
        const diffMonth = Math.floor(diffDay / 30);
        const diffYear = Math.floor(diffDay / 365);
        
        if (diffSec < 10) {
            return 'Baru saja';
        } else if (diffSec < 60) {
            return `${diffSec} detik yang lalu`;
        } else if (diffMin < 60) {
            return `${diffMin} menit yang lalu`;
        } else if (diffHour < 24) {
            return `${diffHour} jam yang lalu`;
        } else if (diffDay < 7) {
            return `${diffDay} hari yang lalu`;
        } else if (diffWeek < 4) {
            return `${diffWeek} minggu yang lalu`;
        } else if (diffMonth < 12) {
            return `${diffMonth} bulan yang lalu`;
        } else {
            return `${diffYear} tahun yang lalu`;
        }
    },
        // Format description (bold text inside <>)
    formatDescription(text) {
        if (!text) return '';

        // Escape HTML (anti XSS)
        const escaped = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Bold teks yang dibungkus <>
        return escaped.replace(/&lt;(.*?)&gt;/g, '<strong>&lt;$1&gt;</strong>');
    },

};

// Export
window.Content = Content;
