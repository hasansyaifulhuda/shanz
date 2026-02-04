// Event listeners setup

import { toggleSidebar, hideSidebar, showModal, hideModal, hideFABMenu, showConfirmDialog } from './ui.js';
import { login, logout, isAdmin } from './auth.js';
import { loadPages, addPage, editPage, deletePage, getPageById } from './pages.js';
import { loadContents, addContent, editContent, deleteContent, addCodeBlock, editCodeBlock, deleteCodeBlock } from './contents.js';
import { toggleFABMenu } from './ui.js';
import { validatePage, validateContent, validateCodeBlock, validateLogin } from './validation.js';
import { showLoading, hideLoading } from './utils.js';

let editPageId = null;
let editContentId = null;
let editBlockId = null;
let deleteCallback = null;
let deleteItemName = '';

export const initEvents = () => {
    setupHeaderEvents();
    setupSidebarEvents();
    setupFABEvents();
    setupModalEvents();
    setupFormEvents();
    setupContentEvents();
    
    console.log('Events module diinisialisasi');
};

const setupHeaderEvents = () => {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Auth button (login)
    const authButton = document.getElementById('authButton');
    if (authButton) {
        authButton.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-login')) {
                showModal('loginModal');
            }
        });
    }
    
    // Logout button (added dynamically)
    document.addEventListener('click', (e) => {
        if (e.target.id === 'logoutButton' || e.target.closest('#logoutButton')) {
            logout();
        }
    });
};

const setupSidebarEvents = () => {
    // Overlay click to close sidebar
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', hideSidebar);
    }
    
    // Page click to load contents
    document.addEventListener('click', async (e) => {
        const pageItem = e.target.closest('.page-item');
        if (pageItem && !e.target.closest('.page-actions')) {
            const pageId = pageItem.dataset.pageId;
            if (pageId) {
                hideSidebar();
                await loadContents(pageId);
                import('./ui.js').then(module => module.setCurrentPage(pageId));
            }
        }
        
        // Page actions
        if (e.target.closest('.edit-page')) {
            const pageId = e.target.closest('.edit-page').dataset.pageId;
            editPageId = pageId;
            const page = getPageById(pageId);
            if (page) {
                document.getElementById('pageTitle').value = page.title;
                showModal('addPageModal');
                document.querySelector('#addPageModal h2').textContent = 'Edit Halaman';
            }
        }
        
        if (e.target.closest('.delete-page')) {
            const pageId = e.target.closest('.delete-page').dataset.pageId;
            const page = getPageById(pageId);
            if (page) {
                deleteItemName = `halaman "${page.title}"`;
                deleteCallback = () => deletePage(pageId);
                showConfirmDialog(`Apakah Anda yakin ingin menghapus ${deleteItemName}? Semua konten dalam halaman ini juga akan dihapus.`, deleteCallback);
            }
        }
    });
};

const setupFABEvents = () => {
    // FAB main button
    const fabMain = document.getElementById('fabMain');
    if (fabMain) {
        fabMain.addEventListener('click', toggleFABMenu);
    }
    
    // FAB actions
    document.addEventListener('click', (e) => {
        const fabAction = e.target.closest('.fab-action');
        if (fabAction) {
            const action = fabAction.dataset.action;
            hideFABMenu();
            
            switch (action) {
                case 'addPage':
                    editPageId = null;
                    document.getElementById('pageTitle').value = '';
                    document.querySelector('#addPageModal h2').textContent = 'Tambah Halaman';
                    showModal('addPageModal');
                    break;
                case 'addContent':
                    editContentId = null;
                    document.getElementById('contentDescription').value = '';
                    document.querySelector('#addContentModal h2').textContent = 'Tambah Konten';
                    showModal('addContentModal');
                    break;
                case 'addCode':
                    editBlockId = null;
                    document.getElementById('codeLanguage').value = '';
                    document.getElementById('codeValue').value = '';
                    document.querySelector('#addCodeModal h2').textContent = 'Tambah Blok Kode';
                    showModal('addCodeModal');
                    break;
            }
        }
    });
    
    // Close FAB menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.fab-container') && !e.target.closest('.fab-action')) {
            hideFABMenu();
        }
    });
};

const setupModalEvents = () => {
    // Close modals with X button
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                hideModal(modal.id);
            }
        });
    });
    
    // Close modals with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideAllModals();
            hideFABMenu();
        }
    });
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target.id);
        }
    });
    
    // Specific modal close buttons
    const closeLoginModal = document.getElementById('closeLoginModal');
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', () => hideModal('loginModal'));
    }
    
    const confirmCancel = document.getElementById('confirmCancel');
    if (confirmCancel) {
        confirmCancel.addEventListener('click', () => hideModal('confirmModal'));
    }
};

const setupFormEvents = () => {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const validation = validateLogin(password);
            
            if (!validation.isValid) {
                showLoginError(validation.errors[0]);
                return;
            }
            
            const loginSubmit = document.getElementById('loginSubmit');
            loginSubmit.disabled = true;
            loginSubmit.textContent = 'Logging in...';
            
            const success = await login(password);
            
            loginSubmit.disabled = false;
            loginSubmit.textContent = 'Login';
            
            if (!success) {
                showLoginError('Login gagal. Periksa password Anda.');
            }
        });
    }
    
    // Add/Edit Page form
    const addPageForm = document.getElementById('addPageForm');
    if (addPageForm) {
        addPageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('pageTitle').value.trim();
            const validation = validatePage(title);
            
            if (!validation.isValid) {
                alert(validation.errors[0]);
                return;
            }
            
            const submitButton = addPageForm.querySelector('.btn-submit');
            submitButton.disabled = true;
            submitButton.textContent = 'Menyimpan...';
            
            let success;
            if (editPageId) {
                success = await editPage(editPageId, title);
            } else {
                success = await addPage(title);
            }
            
            submitButton.disabled = false;
            submitButton.textContent = 'Simpan';
            
            if (!success) {
                alert('Gagal menyimpan halaman');
            }
        });
    }
    
    // Add/Edit Content form
    const addContentForm = document.getElementById('addContentForm');
    if (addContentForm) {
        addContentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const description = document.getElementById('contentDescription').value.trim();
            const validation = validateContent(description);
            
            if (!validation.isValid) {
                alert(validation.errors[0]);
                return;
            }
            
            const submitButton = addContentForm.querySelector('.btn-submit');
            submitButton.disabled = true;
            submitButton.textContent = 'Menyimpan...';
            
            let success;
            if (editContentId) {
                success = await editContent(editContentId, description);
            } else {
                success = await addContent(description);
            }
            
            submitButton.disabled = false;
            submitButton.textContent = 'Simpan';
            
            if (!success) {
                alert('Gagal menyimpan konten');
            }
        });
    }
    
    // Add/Edit Code form
    const addCodeForm = document.getElementById('addCodeForm');
    if (addCodeForm) {
        addCodeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const language = document.getElementById('codeLanguage').value;
            const value = document.getElementById('codeValue').value.trim();
            const validation = validateCodeBlock(language, value);
            
            if (!validation.isValid) {
                alert(validation.errors[0]);
                return;
            }
            
            const submitButton = addCodeForm.querySelector('.btn-submit');
            submitButton.disabled = true;
            submitButton.textContent = 'Menyimpan...';
            
            let success;
            if (editBlockId) {
                success = await editCodeBlock(editBlockId, language, value);
            } else {
                success = await addCodeBlock(language, value);
            }
            
            submitButton.disabled = false;
            submitButton.textContent = 'Simpan';
            
            if (!success) {
                alert('Gagal menyimpan kode');
            }
        });
    }
};

const setupContentEvents = () => {
    // Content actions (edit/delete)
    document.addEventListener('click', (e) => {
        if (!isAdmin()) return;
        
        // Edit content
        if (e.target.closest('.edit-content')) {
            const contentId = e.target.closest('.edit-content').dataset.contentId;
            editContentId = contentId;
            // In real app, you would fetch the content and populate the form
            document.querySelector('#addContentModal h2').textContent = 'Edit Konten';
            showModal('addContentModal');
        }
        
        // Delete content
        if (e.target.closest('.delete-content')) {
            const contentId = e.target.closest('.delete-content').dataset.contentId;
            deleteItemName = 'konten ini';
            deleteCallback = () => deleteContent(contentId);
            showConfirmDialog(`Apakah Anda yakin ingin menghapus ${deleteItemName}? Semua blok kode dalam konten ini juga akan dihapus.`, deleteCallback);
        }
        
        // Edit code block
        if (e.target.closest('.edit-block')) {
            const blockId = e.target.closest('.edit-block').dataset.blockId;
            editBlockId = blockId;
            // In real app, you would fetch the block and populate the form
            document.getElementById('codeLanguage').value = 'javascript';
            document.querySelector('#addCodeModal h2').textContent = 'Edit Blok Kode';
            showModal('addCodeModal');
        }
        
        // Delete code block
        if (e.target.closest('.delete-block')) {
            const blockId = e.target.closest('.delete-block').dataset.blockId;
            deleteItemName = 'blok kode ini';
            deleteCallback = () => deleteCodeBlock(blockId);
            showConfirmDialog(`Apakah Anda yakin ingin menghapus ${deleteItemName}?`, deleteCallback);
        }
    });
};

const showLoginError = (message) => {
    const errorElement = document.getElementById('loginError');
    if (errorElement) {
        errorElement.textContent = message;
        setTimeout(() => {
            errorElement.textContent = '';
        }, 5000);
    }
};

const hideAllModals = () => {
    document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
};