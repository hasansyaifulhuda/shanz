/* ========================================
   PAGES.JS - Page Renderers
   ======================================== */

const Pages = {
    /**
     * Home page - Content catalog
     */
    async home(params, query) {
   const search = query.get('search');
let filter = query.get('filter');
let contents = [];
let isConfigured = Supabase.isConfigured();

// ⬇️ WAJIB: samakan huruf kecil supaya cocok dengan database
if (filter) {
    filter = filter.toLowerCase();
}

if (search) {
    contents = await Supabase.searchContents(search) || [];
} else {
    contents = await Supabase.getContents(filter) || [];
}

// ===== ACAK URUTAN SETIAP LOAD =====
for (let i = contents.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [contents[i], contents[j]] = [contents[j], contents[i]];
}

// ⬇️ SIMPAN UNTUK LIVE SEARCH
window.__ALL_CONTENTS__ = contents;
  
        const isAdmin = Auth.isAdmin();
        
        let html = `
            <div class="page-content">
                <div class="container">
                    <h1 class="section-title" style="margin-bottom: 24px;">
                        ${filter ? filter.charAt(0).toUpperCase() + filter.slice(1) : 'Semua Konten'}
                    </h1>
        `;
        
        if (contents.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-icon">${isConfigured ? '📺' : '⚙️'}</div>
                    <h2 class="empty-title">${isConfigured ? 'Belum ada konten' : 'Supabase Belum Dikonfigurasi'}</h2>
                    <p class="empty-text">${isConfigured 
                        ? 'Belum ada konten. Tambahkan melalui mode admin.' 
                        : 'Buka file <strong>js/supabase.js</strong> dan masukkan <strong>SUPABASE_URL</strong> serta <strong>SUPABASE_KEY</strong> Anda.<br><br>Lihat panduan lengkap di <strong>SUPABASE_SETUP.txt</strong>'
                    }</p>
                </div>
            `;
        } else {
            html += `<div class="grid-catalog">`;
            
            for (const content of contents) {
                const posterUrl = content.poster_id 
                    ? Utils.getDriveThumbnailUrl(content.poster_id)
                    : '';
                
                html += `
                    <a href="#/detail/${content.id}" class="content-card">
                        <div class="card-poster">
                            ${posterUrl 
                                ? `<img src="${posterUrl}" alt="${Utils.escapeHtml(content.title)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'card-poster-placeholder\\'>🎬</div>'+this.parentElement.innerHTML.replace(this.outerHTML,'')">`
                                : '<div class="card-poster-placeholder">🎬</div>'
                            }
                            <span class="card-type">${content.type}</span>
                            ${isAdmin ? `
                                <div class="card-actions admin-only">
                                    <button class="card-action-btn" onclick="event.preventDefault();Admin.openEditContent(${content.id})" title="Edit">✎</button>
                                    <button class="card-action-btn" onclick="event.preventDefault();Admin.deleteContent(${content.id})" title="Hapus">✕</button>
                                </div>
                            ` : ''}
                        </div>
                        <div class="card-overlay">
                            <div class="card-title">${Utils.escapeHtml(content.title)}</div>
                            <div class="card-meta">${content.year || ''}</div>
                        </div>
                    </a>
                `;
            }
            
            html += `</div>`;
        }
        
        html += `</div></div>`;
        
        document.getElementById('app').innerHTML = html;
    },
    
    /**
     * Detail page - Content detail with seasons/episodes
     */
    async detail({ id }) {
        let content = null;
        let seasons = [];
        
        try {
            content = await Supabase.getContent(id);
            if (content) {
                seasons = await Supabase.getSeasons(id) || [];
            }
        } catch {}
        
        if (!content) {
            Router.navigate('/');
            return;
        }
        
        const isAdmin = Auth.isAdmin();
        const posterUrl = content.poster_id ? Utils.getDriveThumbnailUrl(content.poster_id) : '';
        const lastWatched = Utils.getLastWatched(id);
        
        let html = `
            <div class="detail-hero">
                <div class="detail-backdrop" style="background-image: url('${posterUrl}')"></div>
                <div class="detail-content">
                    <div class="detail-poster">
                        ${posterUrl 
                            ? `<img src="${posterUrl}" alt="${Utils.escapeHtml(content.title)}">`
                            : '<div style="aspect-ratio:2/3;background:var(--bg-tertiary)"></div>'
                        }
                    </div>
                    <div class="detail-info">
                        <span class="detail-type">${content.type}</span>
                        <h1 class="detail-title">${Utils.escapeHtml(content.title)}</h1>
                        <div class="detail-meta">
                            ${content.year ? `<span class="detail-meta-item"> ${content.year}</span>` : ''}
                            <span class="detail-meta-item"> ${seasons.length} Season</span>
                        </div>
                        ${content.description ? `<p class="detail-description">${Utils.escapeHtml(content.description)}</p>` : ''}
                       <div class="detail-actions">
    ${lastWatched ? `
        <a href="#/watch/${lastWatched.episodeId}" class="btn btn-primary">
            ▶ Lanjutkan
        </a>
    ` : ''}
    ${isAdmin ? `
    <button class="btn btn-secondary admin-only"
        onclick="Admin.openEditContent(${content.id})">✎ Edit</button>
    <button class="btn btn-secondary admin-only"
        onclick="Admin.deleteContent(${content.id})">✕ Hapus</button>
` : ''}
</div>
                    </div>
                </div>
            </div>
            
            <div class="page-content" style="padding-top: 40px;">
                <div class="container">
                    <div class="episode-section">
                        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
                            <h2 class="section-title" style="margin:0;">Season & Episode</h2>
                            ${isAdmin ? `
                                <div class="admin-only" style="display:flex;gap:8px;flex-wrap:wrap;">
                                    <button class="btn btn-primary btn-sm" onclick="Admin.openAddSeason(${content.id})">
    Tambah Judul
</button>
                                   
                                </div>
                            ` : ''}
                        </div>
        `;
        
        if (seasons.length === 0) {
            html += `
                <div class="empty-state">
                    <p class="empty-text">Belum ada episode. ${isAdmin ? 'Tambahkan episode baru.' : ''}</p>
                </div>
            `;
        } else {
            for (const season of seasons) {
                let episodes = [];
                try {
                    episodes = await Supabase.getEpisodes(season.id, 50) || [];
                } catch {}
                
                const watchedEps = Utils.getWatchedEpisodes();
                
                html += `
                    <div class="season-box">
                        <div class="season-header">
   <h3 class="season-title season-title-edit"
       data-season-id="${season.id}">
       ${season.title ? Utils.escapeHtml(season.title) : 'Tanpa Judul'}
   </h3>

   ${isAdmin ? `
       <div class="season-actions admin-only">
           <button class="btn btn-secondary btn-sm"
               onclick="Admin.openAddEpisode(${season.id}, ${content.id})">
               + Episode
           </button>

           <button class="btn btn-danger btn-sm"
               onclick="Admin.deleteSeason(${season.id})">
               Hapus
           </button>
       </div>
   ` : ''}
</div>                  
                        ${episodes.length === 0 
                            ? `<p style="color:var(--text-muted)">Belum ada episode</p>`
                            : `
                                <div class="episode-grid">
                                    ${episodes.map(ep => `
                                       <a href="#/watch/${ep.id}"
   class="episode-btn ${watchedEps[ep.id] ? 'watched' : ''} admin-episode"
   data-episode-id="${ep.id}"
   data-season-id="${season.id}">
    Ep ${ep.episode_number}
</a>
                                    `).join('')}
                                </div>
                            `
                        }
                    </div>
                `;
            }
        }
        
        html += `</div></div></div>`;
        
        document.getElementById('app').innerHTML = html;

       // === Right click & long press edit judul (ADMIN ONLY) ===
if (isAdmin) {

    document.querySelectorAll('.season-title-edit').forEach(el => {

        const seasonId = el.dataset.seasonId;

        // Desktop right click
        el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            Admin.openEditSeason(seasonId, id);
        });

        // Mobile long press
        let pressTimer;

        el.addEventListener('touchstart', () => {
            pressTimer = setTimeout(() => {
                Admin.openEditSeason(seasonId, id);
            }, 600);
        });

        el.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });

    });

}
    },

    /**
     * Watch page - Video player
     */
    async watch({ id }) {
        let episode = null;
        let season = null;
        let content = null;
        let episodes = [];
        
        try {
            episode = await Supabase.getEpisode(id);
            if (episode) {
                const seasons = await Supabase.request(`seasons?id=eq.${episode.season_id}&select=*`);
                season = seasons?.[0];
                if (season) {
                    content = await Supabase.getContent(season.content_id);
                    episodes = await Supabase.getEpisodes(season.id, 100) || [];
                }
            }
        } catch {}
        
        if (!episode || !content) {
            Router.navigate('/');
            return;
        }
        
        // Mark as watched and save progress
        Utils.markEpisodeWatched(episode.id);
        Utils.setLastWatched(content.id, episode.id, season.id);
        
        // Get next episode
        const nextEp = await AutoNext.getNext(season.id, episode.episode_number);
        const watchedEps = Utils.getWatchedEpisodes();
        
        let html = `
            <div class="page-content">
                <div class="container watch-container">
                    <div class="player-wrapper" id="playerWrapper"></div>
                    
                    <div class="player-controls">
                        <div class="episode-nav">
                            <button class="btn btn-secondary" id="prevEpBtn" disabled>◀ Sebelumnya</button>
                            <button class="btn btn-primary" id="nextEpBtn" ${!nextEp ? 'disabled' : ''}>Selanjutnya ▶</button>
                        </div>
                        <label style="display:none;">
    <input type="checkbox" id="autoNextToggle">
</label>
                    </div>
                    
                    <div class="watch-info">
    <button onclick="history.back()"
        style="
            background:none;
            border:none;
            color:var(--accent);
            font-size:32px;
            font-weight:700;
            cursor:pointer;
            padding:0;
            margin-bottom:12px;
            color:#ff2e2e;
        ">
        ←
    </button>

    <h1 class="watch-title">${Utils.escapeHtml(content.title)}</h1>
    <p class="watch-meta">
        Season ${season.season_number} • Episode ${episode.episode_number}
        ${episode.title ? ' - ' + Utils.escapeHtml(episode.title) : ''}
    </p>
</div>
                    
                    <div class="episode-section">
                        <h2 class="section-title">Daftar Episode</h2>
                        <div class="episode-grid">
                            ${episodes.map(ep => `
                                <a href="#/watch/${ep.id}" class="episode-btn ${ep.id == id ? 'active' : ''} ${watchedEps[ep.id] ? 'watched' : ''}">
                                    Ep ${ep.episode_number}
                                </a>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        // ===== FUNCTION FILTER GRID TANPA RELOAD =====
window.filterGrid = function(keyword) {

    const grid = document.querySelector('.grid-catalog');
    if (!grid) return;

    const lowerKeyword = keyword.toLowerCase();

    const filtered = window.__ALL_CONTENTS__.filter(item =>
        item.title.toLowerCase().includes(lowerKeyword)
    );

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="color:var(--text-muted)">Tidak ditemukan</p>`;
        return;
    }

    grid.innerHTML = filtered.map(content => {
        const posterUrl = content.poster_id 
            ? Utils.getDriveThumbnailUrl(content.poster_id)
            : '';

        return `
            <a href="#/detail/${content.id}" class="content-card">
                <div class="card-poster">
                    ${posterUrl 
                        ? `<img src="${posterUrl}" alt="${Utils.escapeHtml(content.title)}">`
                        : '<div class="card-poster-placeholder">🎬</div>'
                    }
                </div>
                <div class="card-overlay">
                    <div class="card-title">${Utils.escapeHtml(content.title)}</div>
                </div>
            </a>
        `;
    }).join('');

};

        document.getElementById('app').innerHTML = html;
        
        // Load player
        if (episode.video_id) {
            Player.load(episode.video_id, '#playerWrapper');
        } else {
            Player.showError('#playerWrapper', 'Video tidak tersedia');
        }
        
        // Previous episode
        const currentIdx = episodes.findIndex(e => e.id == id);
        if (currentIdx > 0) {
            document.getElementById('prevEpBtn').disabled = false;
            document.getElementById('prevEpBtn').onclick = () => {
                Router.navigate(`/watch/${episodes[currentIdx - 1].id}`);
            };
        }
        
        // Next episode
        if (nextEp) {
            document.getElementById('nextEpBtn').onclick = () => {
                Router.navigate(`/watch/${nextEp.id}`);
            };
        }
        
        // Auto next toggle
        document.getElementById('autoNextToggle').onchange = (e) => {
            AutoNext.enabled = e.target.checked;
        };
    }
};
