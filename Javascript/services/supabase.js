/* =====================================================
   SUPABASE CONNECTION & CONFIGURATION
   ===================================================== */

// ⚠️ PENTING: Ganti dengan kredensial Supabase Anda!
const SUPABASE_URL = 'https://qjjktaxrnzpdmvwugrlz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_cEgC5WI-AXGbI21ni-QKtg_uL5sN5QB';

// Initialize Supabase Client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database Operations
const db = {
    // =====================================================
    // FOLDER OPERATIONS
    // =====================================================
    
    // Get all folders
async getFolders(category) {
    try {
        const { data, error } = await supabaseClient
            .from('folders')
            .select('*')
            .eq('category', category)
            .order('sort_order', { ascending: true })
            .order('name', { ascending: true });

        if (error) throw error;

        return { data, error: null };

    } catch (error) {
        console.error('Error fetching folders:', error);
        return { data: null, error };
    }
},

    // Get folder by ID
    async getFolder(id) {
        try {
            const { data, error } = await supabaseClient
                .from('folders')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching folder:', error);
            return { data: null, error };
        }
    },
    
    // Create folder
    async createFolder(name, parentId = null, category) {

        try {
            const { data, error } = await supabaseClient
                .from('folders')
                .insert([{ 
    name, 
    parent_id: parentId,
    category
}])
                .select()
                .single();
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error creating folder:', error);
            return { data: null, error };
        }
    },
    
    // Update folder
    async updateFolder(id, name) {
        try {
            const { data, error } = await supabaseClient
                .from('folders')
                .update({ name })
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error updating folder:', error);
            return { data: null, error };
        }
    },
    
    // Delete folder
    async deleteFolder(id) {
        try {
            const { error } = await supabaseClient
                .from('folders')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Error deleting folder:', error);
            return { error };
        }
    },
    
    // Update folder order (for drag & drop)
    async updateFolderOrder(id, sortOrder) {
        try {
            console.log(`Updating folder ${id} to sort_order ${sortOrder}`);
            
            const { data, error } = await supabaseClient
                .from('folders')
                .update({ sort_order: sortOrder })
                .eq('id', id)
                .select();
            
            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            
            console.log('Update result:', data);
            return { data, error: null };
        } catch (error) {
            console.error('Error updating folder order:', error);
            return { data: null, error };
        }
    },
    
    // =====================================================
    // PAGE OPERATIONS
    // =====================================================
    
    // Get all pages by category
async getPages(category) {
    try {
        const { data, error } = await supabaseClient
            .from('pages')
            .select('*')
            .eq('category', category)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };

    } catch (error) {
        console.error('Error fetching pages:', error);
        return { data: null, error };
    }
},
    
    // Get pages by folder ID
    async getPagesByFolder(folderId, category) {
        try {
             const { data, error } = await supabaseClient
        .from('pages')
        .select('*')
        .eq('folder_id', folderId)
        .eq('category', category)
        .order('title', { ascending: true });
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching pages:', error);
            return { data: null, error };
        }
    },
    
    // Get page by ID
    async getPage(id) {
        try {
            const { data, error } = await supabaseClient
                .from('pages')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching page:', error);
            return { data: null, error };
        }
    },
    
    // Create page
    async createPage(folderId, title, description = '', code = '', language = 'javascript', category) {

        try {
            const { data, error } = await supabaseClient
                .from('pages')
                .insert([{
    folder_id: folderId,
    title,
    description,
    code,
    language,
    category
}])
                .select()
                .single();
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error creating page:', error);
            return { data: null, error };
        }
    },
    
    // Update page
    async updatePage(id, updates) {
        try {
            const { data, error } = await supabaseClient
                .from('pages')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error updating page:', error);
            return { data: null, error };
        }
    },
    
    // Delete page
    async deletePage(id) {
        try {
            const { error } = await supabaseClient
                .from('pages')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Error deleting page:', error);
            return { error };
        }
    },
    
    // =====================================================
    // SEARCH OPERATIONS
    // =====================================================
    
    // Search across folders and pages
    async search(query) {
        try {
            const searchTerm = `%${query.toLowerCase()}%`;
            
            // Search folders
            const { data: folders, error: folderError } = await supabaseClient
                .from('folders')
                .select('*')
                .ilike('name', searchTerm);
            
            if (folderError) throw folderError;
            
            // Search pages (title, description, code)
            const { data: pages, error: pageError } = await supabaseClient
                .from('pages')
                .select('*')
                .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},code.ilike.${searchTerm}`);
            
            if (pageError) throw pageError;
            
            return {
                data: {
                    folders: folders || [],
                    pages: pages || []
                },
                error: null
            };
        } catch (error) {
            console.error('Error searching:', error);
            return { data: null, error };
        }
    }
};

// Export for use in other modules
window.db = db;
window.supabaseClient = supabaseClient;

