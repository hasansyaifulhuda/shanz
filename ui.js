// ui.js — FULL REPLACE (FIXED VERSION)
// ====================================

import { isAdmin } from './auth.js';

let currentPageId = null;
let currentContentId = null;

/* =========================
   INIT
========================= */
export const initUI = () => {
    const lastPageId = localStorage.getItem('lastOpenedPage');
    if (lastPageId) {
        currentPageId = lastPageId;
    }

    // default state = guest
    updateUIForGuest();

    console.log('UI module diinisialisasi');
};

/* =========================
   SIDEBAR
========================= */
export const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    if (sidebar.classList.contains('active')) {
        hideSidebar();
    } else {
        showSidebar();
    }
};

export const showSidebar = () => {
    document.getElementById('sidebar')?.classList.add('active');
    document.getElementById('overlay')?.classList.add('active');
};

export const hideSidebar = () => {
    document.getElementById('sidebar')?.classList.remove('active');
    document.getElementById('overlay')?.classList.remove('active');
};

/* =========================
   MODAL
========================= */
export const showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

export const hideModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';

    const form = modal.querySelector('form');
    if (form) form.reset();
};

export const hideAllModals = () => {
    document.querySelectorAll('.modal.active')
        .forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
};

/* =========================
   AUTH UI STATE
========================= */
export const updateUIForAdmin = () => {
    document.getElementById('authButton')?.style.setProperty('display', 'none');
    document.getElementById('logoutButton')?.style.setProperty('display', 'inline-block');
    document.getElementById('fabContainer')?.style.setProperty('display', 'block');
    document.getElementById('pagesList')?.classList.add('admin-mode');
};

export const updateUIForGuest = () => {
    const authButton = document.getElementById('authButton');
    if (authButton) {
        authButton.style.display = 'inline-block';
        authButton.textContent = 'Login';
        authButton.className = 'btn-login';
    }

    document.getElementById('logoutButton')?.style.setProperty('display', 'none');
    document.getElementById('fabContainer')?.style.setProperty('display', 'none');
    document.getElementById('pagesList')?.classList.remove('admin-mode');
};

/* =========================
   FAB
========================= */
export const toggleFABMenu = () => {
    document.getElementById('fabMenu')?.classList.toggle('active');
};

export const hideFABMenu = () => {
    document.getElementById('fabMenu')?.classList.remove('active');
};

/* =========================
   PAGES
========================= */
export const displayPages = (pages) => {
    const pagesList = document.getElementById('pagesList');
    if (!pagesList) return;

    if (!pages || pages.length === 0) {
        pagesList.innerHTML = '<div class="empty-state">Belum ada halaman</div>';
        return;
    }

    const sorted = [...pages].sort((a, b) => a.order - b.order);
    let html = '';

    sorted.forEach(page => {
        html += `
            <div class="page-item ${page.id === currentPageId ? 'active' : ''}"
                 data-page-id="${page.id}">
                <span class="page-title">${escapeHtml(page.title)}</span>
                <div class="page-actions">
                    <button class="edit-page" data-page-id="${page.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-page" data-page-id="${page.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    pagesList.innerHTML = html;
};

/* =========================
   CONTENTS
========================= */
export const displayContents = (contents) => {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;

    if (!contents || contents.length === 0) {
        contentArea.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-code"></i>
                <p>Belum ada konten di halaman ini</p>
            </div>`;
        return;
    }

    const sorted = [...contents].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    let html = '';

    sorted.forEach(content => {
        currentContentId = content.id;

        /* ===== DESCRIPTION (NO COPY) ===== */
        if (content.description) {
            html += `
                <div class="content-description code-block-container">
                    <div class="code-body">
                        <pre class="code-content">${escapeHtml(content.description)}</pre>
                    </div>
                    ${isAdmin() ? `
                        <div class="code-actions">
                            <button class="edit-content" data-content-id="${content.id}">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="delete-content" data-content-id="${content.id}">
                                <i class="fas fa-trash"></i> Hapus
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        /* ===== CODE BLOCKS ===== */
        if (content.blocks?.length) {
            const blocks = [...content.blocks].sort((a, b) => a.order - b.order);

            blocks.forEach(block => {
                if (block.type !== 'code') return;

                html += `
                    <div class="code-block-container">
                        <div class="code-header">
                            <span class="code-language">${escapeHtml(block.language)}</span>
                            ${isAdmin() ? `
                                <div class="code-actions">
                                    <button class="edit-block" data-block-id="${block.id}">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="delete-block" data-block-id="${block.id}">
                                        <i class="fas fa-trash"></i> Hapus
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                        <div class="code-body">
                            <pre class="language-${block.language}">
<code class="language-${block.language}">
${escapeHtml(block.value)}
</code>
</pre>
                            <button class="copy-btn"
                                    data-code="${escapeHtml(block.value)}">
                                Copy
                            </button>
                        </div>
                    </div>
                `;
            });
        }
    });

    contentArea.innerHTML = html;

    /* ===== IMPORTANT ===== */
    if (window.Prism) {
        Prism.highlightAll();
    }

    setupCopyButtons();
};

/* =========================
   STATE
========================= */
export const setCurrentPage = (pageId) => {
    currentPageId = pageId;
    localStorage.setItem('lastOpenedPage', pageId);

    document.querySelectorAll('.page-item').forEach(item => {
        item.classList.toggle('active', item.dataset.pageId === pageId);
    });
};

export const getCurrentPageId = () => currentPageId;
export const getCurrentContentId = () => currentContentId;

/* =========================
   HELPERS
========================= */
const escapeHtml = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

const setupCopyButtons = () => {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                const codeBlock = btn.closest('.code-body')?.querySelector('code');
                if (!codeBlock) return;

                const text = codeBlock.textContent; // ⬅️ AMBIL SEMUA ISI
                await navigator.clipboard.writeText(text);

                const old = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = old, 1500);
            } catch (e) {
                btn.textContent = 'Failed';
                setTimeout(() => btn.textContent = 'Copy', 1500);
            }
        });
    });
};

/* =========================
   CONFIRM
========================= */
export const showConfirmDialog = (message, onConfirm) => {
    const msg = document.getElementById('confirmMessage');
    const ok = document.getElementById('confirmDelete');
    const cancel = document.getElementById('confirmCancel');

    if (msg) msg.textContent = message;

    ok.replaceWith(ok.cloneNode(true));
    cancel.replaceWith(cancel.cloneNode(true));

    document.getElementById('confirmDelete')
        .addEventListener('click', () => {
            hideModal('confirmModal');
            onConfirm?.();
        });

    document.getElementById('confirmCancel')
        .addEventListener('click', () => hideModal('confirmModal'));

    showModal('confirmModal');
};

