/* ========================================
   ADMIN.JS - Admin CRUD Operations
   ======================================== */
let CURRENT_EPISODE_ID = null;

const Admin = {
    // ========== CONTENT ==========
    
    /**
     * Open add content modal
     */
    openAddContent() {
        document.getElementById('contentId').value = '';
        document.getElementById('contentForm').reset();
        document.getElementById('contentModalTitle').textContent = 'Tambah Konten';
        UI.resetFileIdPreview('posterPreview');
        UI.openModal('contentModal');
    },
    
    /**
     * Open edit content modal
     * @param {number|string} id - Content ID
     */
    async openEditContent(id) {
        const content = await Supabase.getContent(id);
        if (!content) return;
        
        document.getElementById('contentId').value = content.id;
        document.getElementById('contentTitle').value = content.title || '';
        document.getElementById('contentType').value = content.type || '';
        document.getElementById('contentYear').value = content.year || '';
        document.getElementById('contentDescription').value = content.description || '';
        document.getElementById('contentPoster').value = content.poster_id || '';
        document.getElementById('contentModalTitle').textContent = 'Edit Konten';
        
        // Show preview for existing poster
        const preview = document.getElementById('posterPreview');
        if (content.poster_id) {
            preview.innerHTML = `
                <span class="file-id-label">✅ File ID Saat Ini:</span>
                <span class="file-id-value">${content.poster_id}</span>
                <img src="${Utils.getDriveThumbnailUrl(content.poster_id)}" class="file-id-thumb" onerror="this.style.display='none'" alt="Preview">
            `;
            preview.className = 'file-id-preview show valid';
        } else {
            UI.resetFileIdPreview('posterPreview');
        }
        
        UI.openModal('contentModal');
    },
    
    /**
     * Save content (create or update)
     * @param {Event} e - Form submit event
     */
    async saveContent(e) {
        e.preventDefault();
        
        // Check if Supabase is configured
        if (!Supabase.isConfigured()) {
            UI.notify('Supabase belum dikonfigurasi! Buka js/supabase.js', 'error');
            return;
        }
        
        const id = document.getElementById('contentId').value;
        const content = {
            title: document.getElementById('contentTitle').value,
            type: document.getElementById('contentType').value,
            year: parseInt(document.getElementById('contentYear').value) || null,
            description: document.getElementById('contentDescription').value,
            poster_id: Utils.extractFileId(document.getElementById('contentPoster').value)
        };
        
        try {
            if (id) {
                await Supabase.updateContent(id, content);
                UI.notify('Konten berhasil diupdate');
            } else {
                await Supabase.createContent(content);
                UI.notify('Konten berhasil ditambahkan');
            }
            UI.closeModal('contentModal');
            Router.handle();
        } catch (err) {
            UI.notify('Gagal menyimpan konten', 'error');
        }
    },
    
    /**
     * Delete content
     * @param {number|string} id - Content ID
     */
    async deleteContent(id) {
        if (!confirm('Hapus konten ini beserta semua season dan episode?')) return;
        
        try {
            await Supabase.deleteContent(id);
            UI.notify('Konten berhasil dihapus');
            Router.navigate('/');
        } catch {
            UI.notify('Gagal menghapus konten', 'error');
        }
    },
    
    // ========== SEASON ==========
    
    /**
     * Open add season modal
     * @param {number|string} contentId - Content ID
     */
   openAddSeason(contentId) {
    document.getElementById('seasonId').value = '';
    document.getElementById('seasonContentId').value = contentId;
    document.getElementById('seasonForm').reset();
    document.getElementById('seasonModalTitle').textContent = 'Tambah Judul';

    // ⬇️ SEMBUNYIKAN INPUT NOMOR
    document.getElementById('seasonNumber').parentElement.style.display = 'none';

    UI.openModal('seasonModal');
},
    /**
     * Open edit season modal
     * @param {number|string} id - Season ID
     * @param {number|string} contentId - Content ID
     */
    async openEditSeason(id, contentId) {
    const seasons = await Supabase.getSeasons(contentId);
    const season = seasons.find(s => s.id == id);
    if (!season) return;

    document.getElementById('seasonId').value = season.id;
    document.getElementById('seasonContentId').value = contentId;

    // ❌ Jangan tampilkan nomor season
    document.getElementById('seasonNumber').parentElement.style.display = 'none';

    // ✅ Hanya tampilkan judul
    document.getElementById('seasonTitle').value = season.title || '';

    document.getElementById('seasonModalTitle').textContent = 'Edit Judul';

    UI.openModal('seasonModal');
},
    /**
     * Save season (create or update)
     * @param {Event} e - Form submit event
     */
async saveSeason(e) {
    e.preventDefault();

    if (!Supabase.isConfigured()) {
        UI.notify('Supabase belum dikonfigurasi!', 'error');
        return;
    }

    const id = document.getElementById('seasonId').value;
    const contentId = document.getElementById('seasonContentId').value;

    let seasons = await Supabase.getSeasons(contentId) || [];
    const nextSeasonNumber = seasons.length + 1;

    const season = {
        content_id: contentId,
        season_number: nextSeasonNumber,
        title: document.getElementById('seasonTitle').value || null
    };

    try {
       let createdSeason;

if (id) {
    await Supabase.updateSeason(id, season);
    UI.notify('Judul berhasil diupdate');
} else {
    createdSeason = await Supabase.createSeason(season);
    UI.notify('Judul berhasil ditambahkan');
}

// AUTO BUAT EPISODE PERTAMA
if (createdSeason && createdSeason.length > 0) {
    const newSeasonId = createdSeason[0].id;

    await Supabase.createEpisode({
        season_id: newSeasonId,
        episode_number: 1,
        title: '',
        video_id: ''
    });
}
        UI.closeModal('seasonModal');
        Router.handle();

    } catch (err) {
        console.error(err);
        UI.notify('Gagal menyimpan Judul', 'error');
    }
},
    /**
     * Delete season
     * @param {number|string} id - Season ID
     */
    async deleteSeason(id) {
        if (!confirm('Hapus Judul ini beserta semua episode?')) return;
        
        try {
            await Supabase.deleteSeason(id);
            UI.notify('Judul berhasil dihapus');
            Router.handle();
        } catch {
            UI.notify('Gagal menghapus Judul', 'error');
        }
    },
    
    // ========== EPISODE ==========
    
    /**
     * Open add episode modal directly from content (auto-create season if needed)
     * @param {number|string} contentId - Content ID
     */
    async openAddEpisodeDirect(contentId) {
        // Check if Supabase is configured
        if (!Supabase.isConfigured()) {
            UI.notify('Supabase belum dikonfigurasi! Buka js/supabase.js', 'error');
            return;
        }
        
        // Get existing seasons
        let seasons = await Supabase.getSeasons(contentId) || [];
        
        // If no season exists, create default Season 1
        if (seasons.length === 0) {
            try {
                const newSeason = await Supabase.createSeason({
                    content_id: contentId,
                    season_number: 1,
                    title: null
                });
                if (newSeason && newSeason.length > 0) {
                    seasons = newSeason;
                }
            } catch {
                UI.notify('Gagal membuat season', 'error');
                return;
            }
        }
        
        // Use the first season (or latest)
        const seasonId = seasons[0].id;
        
        // Store content ID for later use
        this._currentContentId = contentId;
        
        document.getElementById('episodeId').value = '';
        document.getElementById('episodeSeasonId').value = seasonId;
        document.getElementById('episodeForm').reset();
        document.getElementById('episodeModalTitle').textContent = 'Tambah Episode';
        UI.resetFileIdPreview('videoPreview');
        UI.openModal('episodeModal');
    },
    
    /**
     * Open add episode modal
     * @param {number|string} seasonId - Season ID
     */
    openAddEpisode(seasonId) {
        document.getElementById('episodeId').value = '';
        document.getElementById('episodeSeasonId').value = seasonId;
        document.getElementById('episodeForm').reset();
        document.getElementById('episodeModalTitle').textContent = 'Tambah Episode';
        UI.resetFileIdPreview('videoPreview');
        UI.openModal('episodeModal');
    },
    
    /**
     * Open edit episode modal
     * @param {number|string} id - Episode ID
     */
    async openEditEpisode(id) {
        const episode = await Supabase.getEpisode(id);
        if (!episode) return;
        
        document.getElementById('episodeId').value = episode.id;
        document.getElementById('episodeSeasonId').value = episode.season_id;
        document.getElementById('episodeNumber').value = episode.episode_number;
        document.getElementById('episodeTitle').value = episode.title || '';
        document.getElementById('episodeVideo').value = episode.video_id || '';
        document.getElementById('episodeModalTitle').textContent = 'Edit Episode';
        
        // Show preview for existing video
        const preview = document.getElementById('videoPreview');
        if (episode.video_id) {
            preview.innerHTML = `
                <span class="file-id-label">✅ File ID Saat Ini:</span>
                <span class="file-id-value">${episode.video_id}</span>
            `;
            preview.className = 'file-id-preview show valid';
        } else {
            UI.resetFileIdPreview('videoPreview');
        }
        
        UI.openModal('episodeModal');
    },
    
    /**
     * Save episode (create or update)
     * @param {Event} e - Form submit event
     */
    async saveEpisode(e) {
        e.preventDefault();
        
        // Check if Supabase is configured
        if (!Supabase.isConfigured()) {
            UI.notify('Supabase belum dikonfigurasi! Buka js/supabase.js', 'error');
            return;
        }
        
        const id = document.getElementById('episodeId').value;
        const episode = {
            season_id: document.getElementById('episodeSeasonId').value,
            episode_number: parseInt(document.getElementById('episodeNumber').value),
            title: document.getElementById('episodeTitle').value || null,
            video_id: Utils.extractFileId(document.getElementById('episodeVideo').value)
        };
        
        try {
            if (id) {
                await Supabase.updateEpisode(id, episode);
                UI.notify('Episode berhasil diupdate');
            } else {
                await Supabase.createEpisode(episode);
                UI.notify('Episode berhasil ditambahkan');
            }
            UI.closeModal('episodeModal');
            Router.handle();
        } catch {
            UI.notify('Gagal menyimpan episode', 'error');
        }
    },
    
    /**
     * Delete episode
     * @param {number|string} id - Episode ID
     */
    async deleteEpisode(id) {
        if (!confirm('Hapus episode ini?')) return;
        
        try {
            await Supabase.deleteEpisode(id);
            UI.notify('Episode berhasil dihapus');
            Router.handle();
        } catch {
            UI.notify('Gagal menghapus episode', 'error');
        }
    }
};
document.addEventListener('contextmenu', e => {
    const ep = e.target.closest('.admin-episode');
    if (!ep || !Auth.isAdmin()) return;

    e.preventDefault();
    showEpisodeMenu(e.pageX, e.pageY, ep.dataset.episodeId);
});
let pressTimer = null;

document.addEventListener('touchstart', e => {
    const ep = e.target.closest('.admin-episode');
    if (!ep || !Auth.isAdmin()) return;

    e.preventDefault(); // ⬅️ INI PENTING

    pressTimer = setTimeout(() => {
        const touch = e.touches[0];
        showEpisodeMenu(touch.pageX, touch.pageY, ep.dataset.episodeId);
    }, 600);
}, { passive: false });

document.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
});
function showEpisodeMenu(x, y, episodeId) {
    CURRENT_EPISODE_ID = episodeId;

    const menu = document.getElementById('episode-context-menu');
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.remove('hidden');

    // cegah klik episode saat menu aktif
    menu.dataset.active = 'true';
}
Admin.editEpisodeFromMenu = () => {
    if (!CURRENT_EPISODE_ID) return;
    Admin.openEditEpisode(CURRENT_EPISODE_ID);
    hideEpisodeMenu();
};

Admin.deleteEpisodeFromMenu = () => {
    if (!CURRENT_EPISODE_ID) return;
    Admin.deleteEpisode(CURRENT_EPISODE_ID);
    hideEpisodeMenu();
};

function hideEpisodeMenu() {
    const menu = document.getElementById('episode-context-menu');
    menu.classList.add('hidden');
    CURRENT_EPISODE_ID = null;
}

document.addEventListener('click', e => {
    if (!e.target.closest('#episode-context-menu')) {
        hideEpisodeMenu();
    }
});

