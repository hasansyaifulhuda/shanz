/* ========================================
   AUTO-NEXT.JS - Auto Next Episode Handler
   ======================================== */

const AutoNext = {
    enabled: true,
    
    /**
     * Get next episode
     * @param {number|string} seasonId - Season ID
     * @param {number} currentNumber - Current episode number
     * @returns {Promise<Object|null>} - Next episode or null
     */
    async getNext(seasonId, currentNumber) {
        if (!this.enabled) return null;
        return await Supabase.getNextEpisode(seasonId, currentNumber);
    },
    
    /**
     * Toggle auto next feature
     * @returns {boolean} - New state
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    },
    
    /**
     * Enable auto next
     */
    enable() {
        this.enabled = true;
    },
    
    /**
     * Disable auto next
     */
    disable() {
        this.enabled = false;
    },
    
    /**
     * Check if auto next is enabled
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }
};
