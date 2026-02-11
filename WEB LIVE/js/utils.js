/* ========================================
   UTILS.JS - Utility Functions
   ======================================== */

const Utils = {
    /**
     * Extract Google Drive File ID from various URL formats
     * @param {string} input - Google Drive URL or File ID
     * @returns {string|null} - Extracted File ID or null
     */
    extractFileId(input) {
        if (!input) return null;
        input = input.trim();
        
        // Jika sudah berupa File ID murni (tanpa URL)
        if (/^[a-zA-Z0-9_-]{20,}$/.test(input) && !input.includes('/') && !input.includes('.')) {
            return input;
        }
        
        // Pattern untuk SEMUA format link Google Drive
        const patterns = [
            // Format: https://drive.google.com/file/d/FILE_ID/view
            // Format: https://drive.google.com/file/d/FILE_ID/preview
            // Format: https://drive.google.com/file/d/FILE_ID/edit
            // Format: https://drive.google.com/file/d/FILE_ID
            /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i,
            
            // Format: https://drive.google.com/open?id=FILE_ID
            // Format: https://drive.google.com/uc?id=FILE_ID
            // Format: https://drive.google.com/uc?export=download&id=FILE_ID
            /drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/i,
            
            // Format: https://docs.google.com/file/d/FILE_ID
            /docs\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i,
            
            // Format: https://drive.google.com/d/FILE_ID
            /drive\.google\.com\/d\/([a-zA-Z0-9_-]+)/i,
            
            // Format: https://drive.google.com/thumbnail?id=FILE_ID
            /drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9_-]+)/i,
            
            // Format: https://lh3.googleusercontent.com/d/FILE_ID
            /googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/i,
            
            // Format share link pendek
            /drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)/i,
            
            // Format generic: ambil setelah /d/ 
            /\/d\/([a-zA-Z0-9_-]+)/i,
            
            // Format generic: ambil dari id=
            /[?&]id=([a-zA-Z0-9_-]+)/i,
            
            // Fallback: cari pattern File ID di manapun
            /([a-zA-Z0-9_-]{20,})/
        ];
        
        for (const pattern of patterns) {
            const match = input.match(pattern);
            if (match && match[1]) {
                const fileId = match[1];
                if (fileId.length >= 20 && fileId.length <= 100) {
                    return fileId;
                }
            }
        }
        
        return input.length >= 20 ? input : null;
    },
    
    /**
     * Validate if input is a valid Google Drive File ID
     * @param {string} input - File ID to validate
     * @returns {boolean} - True if valid
     */
    isValidFileId(input) {
        if (!input) return false;
        return /^[a-zA-Z0-9_-]{20,100}$/.test(input.trim());
    },
    
    /**
     * Get Google Drive preview URL for video player
     * @param {string} fileId - Google Drive File ID
     * @returns {string} - Preview URL
     */
    getDrivePreviewUrl(fileId) {
        if (!fileId) return '';
        return `https://drive.google.com/file/d/${fileId}/preview`;
    },
    
    /**
     * Get Google Drive thumbnail URL for images
     * @param {string} fileId - Google Drive File ID
     * @returns {string} - Thumbnail URL
     */
    getDriveThumbnailUrl(fileId) {
        if (!fileId) return '';
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`;
    },
    
    /**
     * Get watched episodes from localStorage
     * @returns {Object} - Watched episodes object
     */
    getWatchedEpisodes() {
        try {
            return JSON.parse(localStorage.getItem('watchedEpisodes') || '{}');
        } catch {
            return {};
        }
    },
    
    /**
     * Mark episode as watched
     * @param {number|string} episodeId - Episode ID
     */
    markEpisodeWatched(episodeId) {
        const watched = this.getWatchedEpisodes();
        watched[episodeId] = Date.now();
        localStorage.setItem('watchedEpisodes', JSON.stringify(watched));
    },
    
    /**
     * Get last watched episode for a content
     * @param {number|string} contentId - Content ID
     * @returns {Object|null} - Last watched data
     */
    getLastWatched(contentId) {
        try {
            const data = JSON.parse(localStorage.getItem('lastWatched') || '{}');
            return data[contentId] || null;
        } catch {
            return null;
        }
    },
    
    /**
     * Set last watched episode for a content
     * @param {number|string} contentId - Content ID
     * @param {number|string} episodeId - Episode ID
     * @param {number|string} seasonId - Season ID
     */
    setLastWatched(contentId, episodeId, seasonId) {
        try {
            const data = JSON.parse(localStorage.getItem('lastWatched') || '{}');
            data[contentId] = { episodeId, seasonId, timestamp: Date.now() };
            localStorage.setItem('lastWatched', JSON.stringify(data));
        } catch {}
    },
    
    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} - Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Escape HTML to prevent XSS
     * @param {string} str - String to escape
     * @returns {string} - Escaped string
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
