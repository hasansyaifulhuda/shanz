/* ========================================
   SUPABASE.JS - Database API Client
   ======================================== */

// ╔════════════════════════════════════════════════════════════════╗
// ║                  SUPABASE CONFIGURATION                        ║
// ║                                                                ║
// ║  GANTI 2 NILAI DI BAWAH INI DENGAN KREDENSIAL SUPABASE ANDA:  ║
// ║                                                                ║
// ║  1. Buka https://supabase.com → Login → Pilih Project          ║
// ║  2. Klik Settings (ikon gear) → API                            ║
// ║  3. Copy "Project URL" → paste ke SUPABASE_URL                 ║
// ║  4. Copy "anon public" key → paste ke SUPABASE_KEY             ║
// ║                                                                ║
// ╚════════════════════════════════════════════════════════════════╝

const SUPABASE_URL = 'https://tgpgojqlesuajnbaxtme.supabase.co';  // ← GANTI INI
const SUPABASE_KEY = 'sb_publishable_swA7U9U405c-ohy1D_82Ig_GZLc4_5w';                        // ← GANTI INI

// ========================================

const Supabase = {
    url: SUPABASE_URL,
    key: SUPABASE_KEY,
    
    /**
     * Check if Supabase is configured
     * @returns {boolean} - True if configured
     */
    isConfigured() {
        return !this.url.includes('YOUR_PROJECT_ID') && !this.key.includes('YOUR_ANON_KEY');
    },
    
    /**
     * Make request to Supabase REST API
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<any>} - Response data
     */
    async request(endpoint, options = {}) {
        // Check if Supabase is configured
        if (!this.isConfigured()) {
            console.warn('⚠️ Supabase belum dikonfigurasi. Buka js/supabase.js dan masukkan SUPABASE_URL dan SUPABASE_KEY');
            return null;
        }
        
        const headers = {
            'apikey': this.key,
            'Authorization': `Bearer ${this.key}`,
            'Content-Type': 'application/json',
            'Prefer': options.prefer || 'return=representation'
        };
        
        try {
            const response = await fetch(`${this.url}/rest/v1/${endpoint}`, {
                ...options,
                headers: { ...headers, ...options.headers }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const text = await response.text();
            return text ? JSON.parse(text) : null;
        } catch (error) {
            console.error('Supabase error:', error);
            return null;
        }
    },
    
    // ========== CONTENTS ==========
    
    /**
     * Get all contents with optional filter
     * @param {string|null} filter - Content type filter
     * @returns {Promise<Array>} - Contents array
     */
    async getContents(filter = null) {
        let endpoint = 'contents?select=*&order=created_at.desc';
        if (filter) {
            endpoint += `&type=eq.${filter}`;
        }
        return this.request(endpoint);
    },
    
    /**
     * Get single content by ID
     * @param {number|string} id - Content ID
     * @returns {Promise<Object|null>} - Content object
     */
    async getContent(id) {
        const data = await this.request(`contents?id=eq.${id}&select=*`);
        return data?.[0] || null;
    },
    
    /**
     * Create new content
     * @param {Object} content - Content data
     * @returns {Promise<Object>} - Created content
     */
    async createContent(content) {
        return this.request('contents', {
            method: 'POST',
            body: JSON.stringify(content)
        });
    },
    
    /**
     * Update content by ID
     * @param {number|string} id - Content ID
     * @param {Object} content - Content data
     * @returns {Promise<Object>} - Updated content
     */
    async updateContent(id, content) {
        return this.request(`contents?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(content)
        });
    },
    
    /**
     * Delete content and all related data
     * @param {number|string} id - Content ID
     * @returns {Promise<void>}
     */
    async deleteContent(id) {
        // Delete episodes first
        await this.request(`episodes?season_id=in.(select id from seasons where content_id=${id})`, {
            method: 'DELETE'
        });
        // Delete seasons
        await this.request(`seasons?content_id=eq.${id}`, { method: 'DELETE' });
        // Delete content
        return this.request(`contents?id=eq.${id}`, { method: 'DELETE' });
    },
    
    // ========== SEASONS ==========
    
    /**
     * Get seasons for a content
     * @param {number|string} contentId - Content ID
     * @returns {Promise<Array>} - Seasons array
     */
    async getSeasons(contentId) {
        return this.request(`seasons?content_id=eq.${contentId}&select=*&order=season_number.asc`);
    },
    
    /**
     * Create new season
     * @param {Object} season - Season data
     * @returns {Promise<Object>} - Created season
     */
    async createSeason(season) {
        return this.request('seasons', {
            method: 'POST',
            body: JSON.stringify(season)
        });
    },
    
    /**
     * Update season by ID
     * @param {number|string} id - Season ID
     * @param {Object} season - Season data
     * @returns {Promise<Object>} - Updated season
     */
    async updateSeason(id, season) {
        return this.request(`seasons?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(season)
        });
    },
    
    /**
     * Delete season and all episodes
     * @param {number|string} id - Season ID
     * @returns {Promise<void>}
     */
    async deleteSeason(id) {
        await this.request(`episodes?season_id=eq.${id}`, { method: 'DELETE' });
        return this.request(`seasons?id=eq.${id}`, { method: 'DELETE' });
    },
    
    // ========== EPISODES ==========
    
    /**
     * Get episodes for a season
     * @param {number|string} seasonId - Season ID
     * @param {number} limit - Max episodes
     * @param {number} offset - Offset for pagination
     * @returns {Promise<Array>} - Episodes array
     */
    async getEpisodes(seasonId, limit = 20, offset = 0) {
        return this.request(`episodes?season_id=eq.${seasonId}&select=*&order=episode_number.asc&limit=${limit}&offset=${offset}`);
    },
    
    /**
     * Get single episode by ID
     * @param {number|string} id - Episode ID
     * @returns {Promise<Object|null>} - Episode object
     */
    async getEpisode(id) {
        const data = await this.request(`episodes?id=eq.${id}&select=*`);
        return data?.[0] || null;
    },
    
    /**
     * Create new episode
     * @param {Object} episode - Episode data
     * @returns {Promise<Object>} - Created episode
     */
    async createEpisode(episode) {
        return this.request('episodes', {
            method: 'POST',
            body: JSON.stringify(episode)
        });
    },
    
    /**
     * Update episode by ID
     * @param {number|string} id - Episode ID
     * @param {Object} episode - Episode data
     * @returns {Promise<Object>} - Updated episode
     */
    async updateEpisode(id, episode) {
        return this.request(`episodes?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(episode)
        });
    },
    
    /**
     * Delete episode by ID
     * @param {number|string} id - Episode ID
     * @returns {Promise<void>}
     */
    async deleteEpisode(id) {
        return this.request(`episodes?id=eq.${id}`, { method: 'DELETE' });
    },
    
    /**
     * Get next episode
     * @param {number|string} seasonId - Season ID
     * @param {number} currentNumber - Current episode number
     * @returns {Promise<Object|null>} - Next episode
     */
    async getNextEpisode(seasonId, currentNumber) {
        const data = await this.request(`episodes?season_id=eq.${seasonId}&episode_number=gt.${currentNumber}&select=*&order=episode_number.asc&limit=1`);
        return data?.[0] || null;
    },
    
    // ========== SEARCH ==========
async searchContents(keyword) {
    return this.request(
        `contents?title=ilike.*${encodeURIComponent(keyword)}*&select=*&order=created_at.desc`
    );
},

    // ========== AUTH ==========
    
    /**
     * Verify admin password
     * @param {string} password - Password to verify
     * @returns {Promise<boolean>} - True if valid
     */
    async verifyPassword(password) {
        const data = await this.request(`admin_password?password=eq.${password}&select=id`);
        return data && data.length > 0;
    }
};
