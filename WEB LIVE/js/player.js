/* ========================================
   PLAYER.JS - Video Player Handler
   ======================================== */

const Player = {
    currentEpisode: null,
    
    /**
     * Load video into player
     * @param {string} fileId - Google Drive File ID
     * @param {string} container - Container selector
     */
    load(fileId, container) {
        const wrapper = document.querySelector(container);
        if (!wrapper) return;
        
        const url = Utils.getDrivePreviewUrl(fileId);
        wrapper.innerHTML = `
            <iframe 
                src="${url}" 
                allowfullscreen 
                allow="autoplay; encrypted-media"
                loading="lazy"
            ></iframe>
        `;
    },
    
    /**
     * Show error message in player
     * @param {string} container - Container selector
     * @param {string} message - Error message
     */
    showError(container, message = 'Video tidak dapat dimuat') {
        const wrapper = document.querySelector(container);
        if (!wrapper) return;
        
        wrapper.innerHTML = `
            <div class="player-error">
                <div class="player-error-icon">⚠</div>
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    },
    
    /**
     * Clear player content
     * @param {string} container - Container selector
     */
    clear(container) {
        const wrapper = document.querySelector(container);
        if (wrapper) {
            wrapper.innerHTML = '';
        }
    }
};
