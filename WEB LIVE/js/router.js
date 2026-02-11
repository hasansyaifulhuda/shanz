/* ========================================
   ROUTER.JS - SPA Router Handler
   ======================================== */

const Router = {
    routes: {},
    
    /**
     * Add route
     * @param {string} path - Route path
     * @param {Function} handler - Route handler
     */
    add(path, handler) {
        this.routes[path] = handler;
    },
    
    /**
     * Navigate to path
     * @param {string} path - Path to navigate
     */
    navigate(path) {
        window.location.hash = path;
    },
    
    /**
     * Handle current route
     */
    async handle() {
        const hash = window.location.hash.slice(1) || '/';
        const [path, query] = hash.split('?');
        const params = new URLSearchParams(query || '');
        
        // Parse route
        let handler = this.routes[path];
        let routeParams = {};
        
        if (!handler) {
            // Try dynamic routes
            for (const [route, h] of Object.entries(this.routes)) {
                const routeParts = route.split('/');
                const pathParts = path.split('/');
                
                if (routeParts.length === pathParts.length) {
                    let match = true;
                    routeParams = {};
                    
                    for (let i = 0; i < routeParts.length; i++) {
                        if (routeParts[i].startsWith(':')) {
                            routeParams[routeParts[i].slice(1)] = pathParts[i];
                        } else if (routeParts[i] !== pathParts[i]) {
                            match = false;
                            break;
                        }
                    }
                    
                    if (match) {
                        handler = h;
                        break;
                    }
                }
            }
        }
        
        if (handler) {
            UI.showLoading();
            try {
                await handler(routeParams, params);
            } catch (e) {
                console.error('Route error:', e);
            }
            UI.hideLoading();
        } else {
            Router.navigate('/');
        }
    },
    
    /**
     * Initialize router
     */
    init() {
        window.addEventListener('hashchange', () => this.handle());
        this.handle();
    }
};
