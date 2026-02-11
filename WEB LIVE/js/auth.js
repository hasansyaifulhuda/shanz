/* ========================================
   AUTH.JS - Authentication Handler
   ======================================== */

const Auth = {
    /**
     * Check if user is admin
     * @returns {boolean} - True if admin
     */
    isAdmin() {
    return sessionStorage.getItem('isAdmin') === 'true';
},
    
    /**
     * Login as admin
     * @param {string} password - Admin password
     * @returns {Promise<boolean>} - True if login successful
     */
    async login(password) {
        // Check hardcoded password first (works even without Supabase)
        if (password === 'shanz') {
            sessionStorage.setItem('isAdmin', 'true');
            return true;
        }
        
        // Check database password only if Supabase is configured
        if (Supabase.isConfigured()) {
            try {
                const valid = await Supabase.verifyPassword(password);
                if (valid) {
                    sessionStorage.setItem('isAdmin', 'true');
                    return true;
                }
            } catch (error) {
                console.error('Login error:', error);
            }
        }
        
        return false;
    },
    
    /**
     * Logout admin
     */
    logout() {
        sessionStorage.removeItem('isAdmin');
        UI.updateAdminUI();
        UI.notify('Berhasil logout', 'success');
    }
};
