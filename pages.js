import { getSupabase, isSupabaseReady } from './supabase.js';
import { isAdmin } from './auth.js';
import { displayPages, setCurrentPage, getCurrentPageId, showConfirmDialog, hideModal } from './ui.js';
import { loadContents } from './contents.js';
import { showLoading, hideLoading } from './utils.js';

let pages = [];

export const initPages = async () => {
    await loadPages();
    console.log('Pages module diinisialisasi');
};

export const loadPages = async () => {
    const supabase = getSupabase();
    if (!isSupabaseReady()) {
        // Use mock data for demo
        pages = getMockPages();
        displayPages(pages);
        
        // Load first page if no current page
        if (!getCurrentPageId() && pages.length > 0) {
            setCurrentPage(pages[0].id);
            await loadContents(pages[0].id);
        }
        return;
    }
    
    showLoading();
    
    try {
        const { data, error } = await supabase
            .from('pages')
            .select('*')
            .order('order', { ascending: true });
        
        if (error) throw error;
        
        pages = data || [];
        displayPages(pages);
        
        // Load contents for current page
        const currentPageId = getCurrentPageId();
        if (currentPageId && pages.some(p => p.id === currentPageId)) {
            await loadContents(currentPageId);
        } else if (pages.length > 0) {
            setCurrentPage(pages[0].id);
            await loadContents(pages[0].id);
        }
    } catch (error) {
        console.error('Error loading pages:', error);
        pages = [];
        displayPages(pages);
    } finally {
        hideLoading();
    }
};

export const addPage = async (title) => {
    if (!isAdmin()) return false;
    
    const supabase = getSupabase();
    if (!supabase) return false;
    
    showLoading();
    
    try {
        // Get max order
        const { data: maxOrderData } = await supabase
            .from('pages')
            .select('order')
            .order('order', { ascending: false })
            .limit(1);
        
        const maxOrder = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].order : 0;
        
        const { data, error } = await supabase
            .from('pages')
            .insert([
                {
                    title: title,
                    order: maxOrder + 1
                }
            ])
            .select();
        
        if (error) throw error;
        
        await loadPages();
        hideModal('addPageModal');
        return true;
    } catch (error) {
        console.error('Error adding page:', error);
        return false;
    } finally {
        hideLoading();
    }
};

export const editPage = async (pageId, title) => {
    if (!isAdmin()) return false;
    
    const supabase = getSupabase();
    if (!supabase) return false;
    
    showLoading();
    
    try {
        const { error } = await supabase
            .from('pages')
            .update({ title: title })
            .eq('id', pageId);
        
        if (error) throw error;
        
        await loadPages();
        return true;
    } catch (error) {
        console.error('Error editing page:', error);
        return false;
    } finally {
        hideLoading();
    }
};

export const deletePage = async (pageId) => {
    if (!isAdmin()) return false;
    
    const supabase = getSupabase();
    if (!supabase) return false;
    
    showLoading();
    
    try {
        // First, delete all contents and blocks for this page
        const { data: contents } = await supabase
            .from('contents')
            .select('id')
            .eq('page_id', pageId);
        
        if (contents && contents.length > 0) {
            const contentIds = contents.map(c => c.id);
            
            // Delete blocks
            await supabase
                .from('blocks')
                .delete()
                .in('content_id', contentIds);
            
            // Delete contents
            await supabase
                .from('contents')
                .delete()
                .eq('page_id', pageId);
        }
        
        // Then delete the page
        const { error } = await supabase
            .from('pages')
            .delete()
            .eq('id', pageId);
        
        if (error) throw error;
        
        await loadPages();
        return true;
    } catch (error) {
        console.error('Error deleting page:', error);
        return false;
    } finally {
        hideLoading();
    }
};

export const getPageById = (pageId) => {
    return pages.find(page => page.id === pageId);
};

export const getAllPages = () => {
    return pages;
};

// Mock data for demo
const getMockPages = () => {
    return [
        {
            id: 'mock-page-1',
            title: 'HTML Dasar',
            order: 1,
            created_at: new Date().toISOString()
        },
        {
            id: 'mock-page-2',
            title: 'CSS Styling',
            order: 2,
            created_at: new Date().toISOString()
        },
        {
            id: 'mock-page-3',
            title: 'JavaScript Logic',
            order: 3,
            created_at: new Date().toISOString()
        }
    ];
};