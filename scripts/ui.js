// ========== UI ==========
var UI = {
    currentCategory:'all', episodesRendered:0, EPISODES_PER_LOAD:15,
    setCategory: function(cat) {
        this.currentCategory=cat;
        var te=document.getElementById('homeTitle'),le=document.getElementById('activeCategoryLabel');
        if(cat==='all'){te.textContent='🎬 Semua Koleksi';le.style.display='none';}
        else{te.textContent=Utils.getCategoryIcon(cat)+' '+cat.charAt(0).toUpperCase()+cat.slice(1);le.style.display='block';le.innerHTML='<span class="active-category-label">'+Utils.getCategoryIcon(cat)+' Filter: '+cat.charAt(0).toUpperCase()+cat.slice(1)+' <span class="clear-filter" onclick="event.stopPropagation();Router.navigateCategory(\'all\')" title="Hapus filter">✕</span></span>';}
        Router.updateNavActive(cat);
    },
    renderHome: function() {
        var q=document.getElementById('searchInput').value.trim(),cs;
        if(q){cs=Data.searchContents(q);if(this.currentCategory!=='all')cs=cs.filter(function(c){return c.category===UI.currentCategory;});}
        else cs=Data.getContentsByCategory(this.currentCategory);
        var g=document.getElementById('contentGrid'),es=document.getElementById('emptyState');
        if(cs.length===0){g.innerHTML='';es.style.display='block';}else{es.style.display='none';g.innerHTML=cs.map(function(c){return UI.createCard(c);}).join('');}
        this.showResumeBanner();
    },
    createCard: function(c) {
        var pu=c.posterFileId?Utils.getDrivePosterUrl(c.posterFileId):'';
        var te=c.seasons.reduce(function(s,se){return s+se.episodes.length;},0),sc=c.seasons.length;
        var ph=pu?'<img src="'+pu+'" alt="'+Utils.escapeHtml(c.title)+'" loading="lazy" class="poster-img" onerror="this.parentElement.innerHTML=\'<div class=\\\'poster-placeholder\\\'>🎬</div>\'">':'<div class="poster-placeholder">🎬</div>';
        return '<div class="content-card" onclick="Router.navigate(\'detail\',\''+c.id+'\')">' +
            '<div class="card-admin-overlay"><button class="card-admin-btn edit-btn" onclick="event.stopPropagation();Admin.editContent(\''+c.id+'\')">✏️</button><button class="card-admin-btn delete-btn" onclick="event.stopPropagation();Admin.deleteContent(\''+c.id+'\')">🗑️</button></div>' +
            '<div class="poster-container">'+ph+'</div>' +
            '<div class="card-body"><h3 class="card-title">'+Utils.escapeHtml(c.title)+'</h3><p class="card-meta">'+(sc>1?sc+' Season • ':'')+te+' Episode</p></div></div>';
    },
    filterContent: Utils.debounce(function(){UI.renderHome();},300),
    showResumeBanner: function() {
        var r=Player.getResumeData(),b=document.getElementById('resumeBanner');
        if(r){var c=Data.getContentById(r.contentId);if(c){var s=c.seasons[r.seasonIdx];var ep=s?s.episodes[r.epIdx]:null;if(ep){b.style.display='block';document.getElementById('resumeInfo').textContent=c.title+' — '+s.name+' — '+ep.title;return;}}}
        b.style.display='none';
    },
    renderDetail: function(cid) {
        var c=Data.getContentById(cid); if(!c){UI.showToast('Konten tidak ditemukan!','error');Router.navigate('home');return;}
        var pu=c.posterFileId?Utils.getDrivePosterUrl(c.posterFileId):'';
        var te=c.seasons.reduce(function(s,se){return s+se.episodes.length;},0);
        var ph=pu?'<img src="'+pu+'" alt="'+Utils.escapeHtml(c.title)+'" style="width:100%;height:auto;border-radius:var(--radius-md);display:block;" onerror="this.parentElement.innerHTML=\'<div style=\\\'width:100%;aspect-ratio:1/1;background:var(--bg-tertiary);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-size:3rem;\\\'>🎬</div>\'">':'<div style="width:100%;aspect-ratio:1/1;background:var(--bg-tertiary);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-size:3rem;">🎬</div>';
        document.getElementById('detailHeader').innerHTML=
            '<div class="detail-header-wrap" style="display:flex;gap:20px;align-items:flex-start;"><div class="detail-poster" style="width:240px;flex-shrink:0;overflow:hidden;border-radius:var(--radius-md);">'+ph+'</div>'+
            '<div style="flex:1;min-width:0;"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;"><span class="badge '+Utils.getCategoryColor(c.category)+'">'+Utils.getCategoryLabel(c.category)+'</span><span style="color:var(--text-muted);font-size:.8rem;">'+c.seasons.length+' Season • '+te+' Episode</span></div>'+
            '<h1 style="font-size:1.6rem;font-weight:800;margin-bottom:16px;line-height:1.3;">'+Utils.escapeHtml(c.title)+'</h1>'+
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">'+(te>0?'<button class="btn btn-primary btn-lg" onclick="Router.navigate(\'watch\',\''+c.id+'\',0)">▶️ Tonton</button>':'')+
            '<button class="btn btn-secondary admin-only" onclick="Admin.editContent(\''+c.id+'\')">✏️ Edit</button>'+
            '<button class="btn btn-danger admin-only" onclick="Admin.deleteContent(\''+c.id+'\')">🗑️ Hapus</button></div></div></div>';
        var sh='';
        c.seasons.forEach(function(sn,si){
            sh+='<div style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:14px;overflow:hidden;">'+
                '<div style="padding:12px 16px;background:var(--bg-tertiary);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">'+
                '<div style="display:flex;align-items:center;gap:8px;"><span style="font-weight:700;font-size:.9rem;">'+Utils.escapeHtml(sn.name)+'</span><span style="font-size:.75rem;color:var(--text-muted);">'+sn.episodes.length+' ep</span></div>'+
                '<div class="admin-only" style="gap:6px;"><button class="btn btn-secondary btn-sm" onclick="Admin.editSeasonName(\''+c.id+'\','+si+')">✏️</button><button class="btn btn-danger btn-sm" onclick="Admin.deleteSeason(\''+c.id+'\','+si+')">🗑️</button><button class="btn btn-primary btn-sm" onclick="Admin.showAddEpisodeModal(\''+c.id+'\','+si+')">➕ Ep</button></div></div><div>';
            if(sn.episodes.length===0) sh+='<p style="padding:16px;text-align:center;color:var(--text-muted);font-size:.85rem;">Belum ada episode.</p>';
            else sn.episodes.forEach(function(ep,ei){
                sh+='<div class="episode-item" onclick="Router.navigate(\'watch\',\''+c.id+'\','+si+');setTimeout(function(){Player.playEpisode(\''+c.id+'\','+si+','+ei+');},100)">'+
                    '<div class="ep-number">'+(ei+1).toString().padStart(2,'0')+'</div><div class="ep-info"><div class="ep-title">'+Utils.escapeHtml(ep.title)+'</div><div style="font-size:.7rem;color:var(--text-muted);margin-top:2px;">'+(ep.videoFileId?'🟢 Video tersedia':'🔴 Belum ada video')+'</div></div>'+
                    '<div class="ep-admin-actions"><button class="card-admin-btn edit-btn" onclick="event.stopPropagation();Admin.editEpisode(\''+c.id+'\','+si+','+ei+')">✏️</button><button class="card-admin-btn delete-btn" onclick="event.stopPropagation();Admin.deleteEpisode(\''+c.id+'\','+si+','+ei+')">🗑️</button></div></div>';
            });
            sh+='</div></div>';
        });
        sh+='<button class="btn btn-primary admin-only" style="margin-top:12px;" onclick="Admin.showAddSeasonModal(\''+c.id+'\')">➕ Tambah Season</button>';
        document.getElementById('detailSeasons').innerHTML=sh;
    },
    renderWatchEpisodes: function(c,si,ai) {
        this.episodesRendered=0; var ct=document.getElementById('episodeListContainer'); ct.innerHTML='';
        if(!c||!c.seasons[si])return;
        document.getElementById('epCount').textContent=c.seasons[si].episodes.length+' ep';
        this.appendEpisodes(c,si,ai,this.EPISODES_PER_LOAD);
        document.getElementById('loadMoreEpBtn').style.display=this.episodesRendered<c.seasons[si].episodes.length?'block':'none';
    },
    appendEpisodes: function(c,si,ai,cnt) {
        var ct=document.getElementById('episodeListContainer'),sn=c.seasons[si];
        var st=this.episodesRendered,en=Math.min(st+cnt,sn.episodes.length);
        for(var i=st;i<en;i++){
            var ep=sn.episodes[i],ia=i===ai;
            var d=document.createElement('div');d.className='episode-item'+(ia?' active':'');
            (function(idx){d.onclick=function(){Player.playEpisode(c.id,si,idx);};})(i);
            d.innerHTML='<div class="ep-number">'+(i+1).toString().padStart(2,'0')+'</div><div class="ep-info"><div class="ep-title">'+Utils.escapeHtml(ep.title)+'</div></div>'+
                '<div class="ep-admin-actions"><button class="card-admin-btn edit-btn" onclick="event.stopPropagation();Admin.editEpisode(\''+c.id+'\','+si+','+i+')">✏️</button><button class="card-admin-btn delete-btn" onclick="event.stopPropagation();Admin.deleteEpisode(\''+c.id+'\','+si+','+i+')">🗑️</button></div>'+
                (ia?'<div class="playing-indicator"><span></span><span></span><span></span></div>':'');
            ct.appendChild(d);
        }
        this.episodesRendered=en;
    },
    loadMoreEpisodes: function() {
        var c=Data.getContentById(Player.currentContentId); if(!c)return;
        this.appendEpisodes(c,Player.currentSeasonIdx,Player.currentEpIdx,this.EPISODES_PER_LOAD);
        document.getElementById('loadMoreEpBtn').style.display=this.episodesRendered<c.seasons[Player.currentSeasonIdx].episodes.length?'block':'none';
    },
    changeWatchSeason: function(si) {
        Player.currentSeasonIdx=parseInt(si); Player.currentEpIdx=0;
        var c=Data.getContentById(Player.currentContentId);
        if(c&&c.seasons[Player.currentSeasonIdx]&&c.seasons[Player.currentSeasonIdx].episodes.length>0) Player.playEpisode(Player.currentContentId,Player.currentSeasonIdx,0);
        else{this.renderWatchEpisodes(c,Player.currentSeasonIdx,-1);UI.showToast('Season ini belum memiliki episode.','warning');}
    },
    toggleEpisodeSidebar: function() { document.getElementById('episodeSidebar').classList.toggle('collapsed'); },
    toggleMobileMenu: function() { document.getElementById('hamburgerBtn').classList.toggle('active'); document.getElementById('mobileMenu').classList.toggle('active'); },
    closeMobileMenu: function() { document.getElementById('hamburgerBtn').classList.remove('active'); document.getElementById('mobileMenu').classList.remove('active'); },
    showToast: function(msg,type) {
        type=type||'info'; var ct=document.getElementById('toastContainer');
        var t=document.createElement('div'); t.className='toast toast-'+type;
        t.innerHTML='<span>'+({error:'❌',success:'✅',info:'ℹ️',warning:'⚠️'}[type]||'ℹ️')+'</span><span>'+msg+'</span>';
        ct.appendChild(t);
        setTimeout(function(){t.style.opacity='0';t.style.transform='translateX(100px)';t.style.transition='all .3s ease';setTimeout(function(){t.remove();},300);},3500);
    }
};
