import { getSupabase, isSupabaseReady } from './supabase.js';
import { isAdmin } from './auth.js';
import { displayContents, getCurrentPageId, showConfirmDialog, hideModal } from './ui.js';
import { showLoading, hideLoading } from './utils.js';

export const initContents = () => {
    console.log('Contents module diinisialisasi');
};

export const loadContents = async (pageId) => {
    if (!pageId) return;
    
    const supabase = getSupabase();
    if (!isSupabaseReady()) {
        // Use mock data for demo
        const mockContents = getMockContents(pageId);
        displayContents(mockContents);
        return;
    }
    
    showLoading();
    
    try {
        // Get contents with their blocks
        const { data: contents, error: contentsError } = await supabase
            .from('contents')
            .select('*')
            .eq('page_id', pageId)
            .order('created_at', { ascending: true });
        
        if (contentsError) throw contentsError;
        
        if (!contents || contents.length === 0) {
            displayContents([]);
            return;
        }
        
        // Get blocks for each content
        const contentIds = contents.map(c => c.id);
        const { data: blocks, error: blocksError } = await supabase
            .from('blocks')
            .select('*')
            .in('content_id', contentIds)
            .order('order', { ascending: true });
        
        if (blocksError) throw blocksError;
        
        // Attach blocks to their contents
        const contentsWithBlocks = contents.map(content => ({
            ...content,
            blocks: blocks?.filter(block => block.content_id === content.id) || []
        }));
        
        displayContents(contentsWithBlocks);
    } catch (error) {
        console.error('Error loading contents:', error);
        displayContents([]);
    } finally {
        hideLoading();
    }
};

export const addContent = async (description) => {
    if (!isAdmin()) return false;
    
    const pageId = getCurrentPageId();
    if (!pageId) return false;
    
    const supabase = getSupabase();
    if (!supabase) return false;
    
    showLoading();
    
    try {
        const { data, error } = await supabase
            .from('contents')
            .insert([
                {
                    page_id: pageId,
                    description: description
                }
            ])
            .select();
        
        if (error) throw error;
        
        await loadContents(pageId);
        hideModal('addContentModal');
        return true;
    } catch (error) {
        console.error('Error adding content:', error);
        return false;
    } finally {
        hideLoading();
    }
};

export const editContent = async (contentId, description) => {
    if (!isAdmin()) return false;
    
    const supabase = getSupabase();
    if (!supabase) return false;
    
    showLoading();
    
    try {
        const { error } = await supabase
            .from('contents')
            .update({ description: description })
            .eq('id', contentId);
        
        if (error) throw error;
        
        await loadContents(getCurrentPageId());
        return true;
    } catch (error) {
        console.error('Error editing content:', error);
        return false;
    } finally {
        hideLoading();
    }
};

export const deleteContent = async (contentId) => {
    if (!isAdmin()) return false;
    
    const supabase = getSupabase();
    if (!supabase) return false;
    
    showLoading();
    
    try {
        // First delete blocks
        await supabase
            .from('blocks')
            .delete()
            .eq('content_id', contentId);
        
        // Then delete content
        const { error } = await supabase
            .from('contents')
            .delete()
            .eq('id', contentId);
        
        if (error) throw error;
        
        await loadContents(getCurrentPageId());
        return true;
    } catch (error) {
        console.error('Error deleting content:', error);
        return false;
    } finally {
        hideLoading();
    }
};

export const addCodeBlock = async (language, value) => {
    if (!isAdmin()) return false;
    
    const pageId = getCurrentPageId();
    if (!pageId) return false;
    
    const supabase = getSupabase();
    if (!supabase) return false;
    
    showLoading();
    
    try {
        // First, get or create a content for this page
        const { data: contents, error: contentsError } = await supabase
            .from('contents')
            .select('id')
            .eq('page_id', pageId)
            .order('created_at', { ascending: false })
            .limit(1);
        
        if (contentsError) throw contentsError;
        
        let contentId;
        
        if (contents && contents.length > 0) {
            contentId = contents[0].id;
        } else {
            // Create new content
            const { data: newContent, error: newContentError } = await supabase
                .from('contents')
                .insert([{ page_id: pageId, description: '// Kode' }])
                .select();
            
            if (newContentError) throw newContentError;
            contentId = newContent[0].id;
        }
        
        // Get max order for blocks
        const { data: maxOrderData } = await supabase
            .from('blocks')
            .select('order')
            .eq('content_id', contentId)
            .order('order', { ascending: false })
            .limit(1);
        
        const maxOrder = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].order : 0;
        
        // Add code block
        const { error: blockError } = await supabase
            .from('blocks')
            .insert([
                {
                    content_id: contentId,
                    type: 'code',
                    language: language,
                    value: value,
                    order: maxOrder + 1
                }
            ]);
        
        if (blockError) throw blockError;
        
        await loadContents(pageId);
        hideModal('addCodeModal');
        return true;
    } catch (error) {
        console.error('Error adding code block:', error);
        return false;
    } finally {
        hideLoading();
    }
};

export const editCodeBlock = async (blockId, language, value) => {
    if (!isAdmin()) return false;
    
    const supabase = getSupabase();
    if (!supabase) return false;
    
    showLoading();
    
    try {
        const { error } = await supabase
            .from('blocks')
            .update({
                language: language,
                value: value
            })
            .eq('id', blockId);
        
        if (error) throw error;
        
        await loadContents(getCurrentPageId());
        return true;
    } catch (error) {
        console.error('Error editing code block:', error);
        return false;
    } finally {
        hideLoading();
    }
};

export const deleteCodeBlock = async (blockId) => {
    if (!isAdmin()) return false;
    
    const supabase = getSupabase();
    if (!supabase) return false;
    
    showLoading();
    
    try {
        const { error } = await supabase
            .from('blocks')
            .delete()
            .eq('id', blockId);
        
        if (error) throw error;
        
        await loadContents(getCurrentPageId());
        return true;
    } catch (error) {
        console.error('Error deleting code block:', error);
        return false;
    } finally {
        hideLoading();
    }
};

// Mock data for demo
const getMockContents = (pageId) => {
    const mockData = {
        'mock-page-1': [
            {
                id: 'mock-content-1',
                page_id: 'mock-page-1',
                description: '// HTML adalah bahasa markup untuk membuat halaman web\n// Berikut contoh struktur HTML dasar:',
                created_at: new Date().toISOString(),
                blocks: [
                    {
                        id: 'mock-block-1',
                        content_id: 'mock-content-1',
                        type: 'code',
                        language: 'html',
                        value: '<!DOCTYPE html>\n<html lang="id">\n<head>\n    <meta charset="UTF-8">\n    <title>Contoh Halaman</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n    <p>Ini paragraf pertama.</p>\n</body>\n</html>',
                        order: 1
                    }
                ]
            }
        ],
        'mock-page-2': [
            {
                id: 'mock-content-2',
                page_id: 'mock-page-2',
                description: '// CSS digunakan untuk styling halaman web\n// Contoh selector dan properti:',
                created_at: new Date().toISOString(),
                blocks: [
                    {
                        id: 'mock-block-2',
                        content_id: 'mock-content-2',
                        type: 'code',
                        language: 'css',
                        value: 'body {\n    font-family: Arial, sans-serif;\n    background-color: #f0f0f0;\n    margin: 0;\n    padding: 20px;\n}\n\nh1 {\n    color: #333;\n    text-align: center;\n}\n\n.button {\n    background-color: #007acc;\n    color: white;\n    padding: 10px 20px;\n    border-radius: 4px;\n}',
                        order: 1
                    }
                ]
            }
        ],
        'mock-page-3': [
            {
                id: 'mock-content-3',
                page_id: 'mock-page-3',
                description: '// JavaScript untuk logika dan interaksi\n// Contoh fungsi dasar:',
                created_at: new Date().toISOString(),
                blocks: [
                    {
                        id: 'mock-block-3',
                        content_id: 'mock-content-3',
                        type: 'code',
                        language: 'javascript',
                        value: '// Fungsi untuk menyapa pengguna\nfunction greetUser(name) {\n    return `Hello, ${name}!`;\n}\n\n// Contoh penggunaan\nconst userName = "John";\nconst greeting = greetUser(userName);\nconsole.log(greeting); // Output: Hello, John!\n\n// Event listener sederhana\ndocument.getElementById("myButton").addEventListener("click", function() {\n    alert("Tombol diklik!");\n});',
                        order: 1
                    }
                ]
            }
        ]
    };
    
    return mockData[pageId] || [];
};