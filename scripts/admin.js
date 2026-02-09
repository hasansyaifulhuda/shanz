// ========== ADMIN ==========
var Admin = {
    editingContentId: null,
    showAddContentModal: function() {
        if(!Auth.isAdmin())return; this.editingContentId=null;
        document.getElementById('adminModalTitle').textContent='➕ Tambah Konten';
        document.getElementById('adminFormContent').innerHTML=
            '<div class="form-group"><label class="form-label">Judul</label><input type="text" class="form-input" id="inputTitle" placeholder="Judul konten..."></div>'+
            '<div class="form-group"><label class="form-label">Kategori</label><select class="form-input form-select" id="inputCategory"><option value="anime">🎌 Anime</option><option value="kartun">🎨 Kartun</option><option value="movie">🎬 Movie</option><option value="film">🎞️ Film</option></select></div>'+
            DriveInput.createPosterInput('');
        document.getElementById('adminFormAction').innerHTML='<button class="btn btn-secondary" onclick="Admin.hideModal()">Batal</button><button class="btn btn-primary" id="adminSaveBtn" onclick="Admin.saveContent()">💾 Simpan</button>';
        this.showModal();
    },
    editContent: function(id) {
        if(!Auth.isAdmin())return; this.editingContentId=id; var c=Data.getContentById(id); if(!c)return;
        document.getElementById('adminModalTitle').textContent='✏️ Edit Konten';
        document.getElementById('adminFormContent').innerHTML=
            '<div class="form-group"><label class="form-label">Judul</label><input type="text" class="form-input" id="inputTitle" value="'+Utils.escapeHtml(c.title)+'"></div>'+
            '<div class="form-group"><label class="form-label">Kategori</label><select class="form-input form-select" id="inputCategory"><option value="anime"'+(c.category==='anime'?' selected':'')+'>🎌 Anime</option><option value="kartun"'+(c.category==='kartun'?' selected':'')+'>🎨 Kartun</option><option value="movie"'+(c.category==='movie'?' selected':'')+'>🎬 Movie</option><option value="film"'+(c.category==='film'?' selected':'')+'>🎞️ Film</option></select></div>'+
            DriveInput.createPosterInput(c.posterFileId||'');
        document.getElementById('adminFormAction').innerHTML='<button class="btn btn-secondary" onclick="Admin.hideModal()">Batal</button><button class="btn btn-primary" id="adminSaveBtn" onclick="Admin.saveContent()">💾 Update</button>';
        this.showModal(); setTimeout(function(){DriveInput.triggerDetect('inputPoster','poster');},100);
    },
    saveContent: async function() {
        var t=document.getElementById('inputTitle').value.trim(),cat=document.getElementById('inputCategory').value,p=DriveInput.getFileId('inputPoster');
        if(!t){UI.showToast('Judul wajib diisi!','error');return;}
        var btn=document.getElementById('adminSaveBtn'); btn.disabled=true; btn.textContent='⏳ Menyimpan...';
        try {
            if(this.editingContentId){await Data.updateContent(this.editingContentId,{title:t,category:cat,posterFileId:p});UI.showToast('Konten diupdate!','success');}
            else{await Data.addContent({title:t,category:cat,posterFileId:p});UI.showToast('Konten ditambahkan!','success');}
            this.hideModal(); if(Router.currentPage==='home')UI.renderHome(); else if(Router.currentPage==='detail')UI.renderDetail(this.editingContentId||Router.currentContentId);
        } catch(e){UI.showToast('Error: '+e.message,'error'); btn.disabled=false; btn.textContent='💾 Simpan';}
    },
    deleteContent: function(id) {
        if(!Auth.isAdmin())return; var c=Data.getContentById(id); if(!c)return;
        this.showConfirmModal('Hapus "'+c.title+'"?','Semua data terhapus permanen.',async function(){
            try{await Data.deleteContent(id);UI.showToast('Konten dihapus!','success');if(Router.currentPage==='detail'||Router.currentPage==='watch')Router.navigate('home');else UI.renderHome();}
            catch(e){UI.showToast('Error: '+e.message,'error');}
        });
    },
    showAddSeasonModal: function(ci) {
        if(!Auth.isAdmin())return;
        document.getElementById('adminModalTitle').textContent='➕ Tambah Season';
        document.getElementById('adminFormContent').innerHTML='<div class="form-group"><label class="form-label">Nama Season</label><input type="text" class="form-input" id="inputSeasonName" placeholder="Season 2"></div>';
        document.getElementById('adminFormAction').innerHTML='<button class="btn btn-secondary" onclick="Admin.hideModal()">Batal</button><button class="btn btn-primary" id="adminSaveBtn" onclick="Admin.saveSeason(\''+ci+'\')">💾 Simpan</button>';
        this.showModal();
    },
    saveSeason: async function(ci) {
        var n=document.getElementById('inputSeasonName').value.trim(); if(!n){UI.showToast('Nama wajib diisi!','error');return;}
        var btn=document.getElementById('adminSaveBtn'); btn.disabled=true;
        try{await Data.addSeason(ci,n);UI.showToast('Season ditambahkan!','success');this.hideModal();UI.renderDetail(ci);}
        catch(e){UI.showToast('Error: '+e.message,'error');btn.disabled=false;}
    },
    editSeasonName: function(ci,si) {
        if(!Auth.isAdmin())return; var c=Data.getContentById(ci); if(!c)return;
        document.getElementById('adminModalTitle').textContent='✏️ Edit Season';
        document.getElementById('adminFormContent').innerHTML='<div class="form-group"><label class="form-label">Nama Season</label><input type="text" class="form-input" id="inputSeasonName" value="'+Utils.escapeHtml(c.seasons[si].name)+'"></div>';
        document.getElementById('adminFormAction').innerHTML='<button class="btn btn-secondary" onclick="Admin.hideModal()">Batal</button><button class="btn btn-primary" id="adminSaveBtn" onclick="Admin.updateSeasonName(\''+ci+'\','+si+')">💾 Update</button>';
        this.showModal();
    },
    updateSeasonName: async function(ci,si) {
    const input = document.getElementById('inputSeasonName');
    const n = input.value.trim(); // BOLEH KOSONG

    const btn = document.getElementById('adminSaveBtn');
    btn.disabled = true;

    try {
        // SIMPAN APA ADANYA (TERMASUK STRING KOSONG)
        await Data.updateSeason(ci, si, n);

        UI.showToast('Season diupdate!','success');
        this.hideModal();
        UI.renderDetail(ci);
    } catch(e) {
        UI.showToast('Error: ' + e.message,'error');
        btn.disabled = false;
    }
},

    deleteSeason: function(ci,si) {
        if(!Auth.isAdmin())return; var c=Data.getContentById(ci); if(!c)return;
        if(c.seasons.length<=1){UI.showToast('Tidak bisa hapus season terakhir!','error');return;}
        this.showConfirmModal('Hapus "'+c.seasons[si].name+'"?','Semua episode ikut terhapus.',async function(){
            try{await Data.deleteSeason(ci,si);UI.showToast('Season dihapus!','success');UI.renderDetail(ci);}
            catch(e){UI.showToast('Error: '+e.message,'error');}
        });
    },
    showAddEpisodeModal: function(ci,si) {
        if(!Auth.isAdmin())return; ci=ci||Player.currentContentId; si=(si!==undefined)?si:Player.currentSeasonIdx;
        document.getElementById('adminModalTitle').textContent='➕ Tambah Episode';
        document.getElementById('adminFormContent').innerHTML='<div class="form-group"><label class="form-label">Judul Episode</label><input type="text" class="form-input" id="inputEpTitle" placeholder="Episode 1 - Judul"></div>'+DriveInput.createVideoInput('');
        document.getElementById('adminFormAction').innerHTML='<button class="btn btn-secondary" onclick="Admin.hideModal()">Batal</button><button class="btn btn-primary" id="adminSaveBtn" onclick="Admin.saveEpisode(\''+ci+'\','+si+')">💾 Simpan</button>';
        this.showModal();
    },
    saveEpisode: async function(ci,si) {
        var t=document.getElementById('inputEpTitle').value.trim(),v=DriveInput.getFileId('inputEpVideoId');
        if(!t){UI.showToast('Judul wajib diisi!','error');return;}
        var btn=document.getElementById('adminSaveBtn'); btn.disabled=true;
        try{
            await Data.addEpisode(ci,parseInt(si),{title:t,videoFileId:v});UI.showToast('Episode ditambahkan!','success');this.hideModal();
            if(Router.currentPage==='watch'){var c=Data.getContentById(ci);UI.renderWatchEpisodes(c,Player.currentSeasonIdx,Player.currentEpIdx);}
            else if(Router.currentPage==='detail')UI.renderDetail(ci);
        }catch(e){UI.showToast('Error: '+e.message,'error');btn.disabled=false;}
    },
    editEpisode: function(ci,si,ei) {
        if(!Auth.isAdmin())return; var c=Data.getContentById(ci); if(!c)return; var ep=c.seasons[si].episodes[ei];
        document.getElementById('adminModalTitle').textContent='✏️ Edit Episode';
        document.getElementById('adminFormContent').innerHTML='<div class="form-group"><label class="form-label">Judul Episode</label><input type="text" class="form-input" id="inputEpTitle" value="'+Utils.escapeHtml(ep.title)+'"></div>'+DriveInput.createVideoInput(ep.videoFileId||'');
        document.getElementById('adminFormAction').innerHTML='<button class="btn btn-secondary" onclick="Admin.hideModal()">Batal</button><button class="btn btn-primary" id="adminSaveBtn" onclick="Admin.updateEp(\''+ci+'\','+si+','+ei+')">💾 Update</button>';
        this.showModal(); setTimeout(function(){DriveInput.triggerDetect('inputEpVideoId','video');},100);
    },
    updateEp: async function(ci,si,ei) {
        var t=document.getElementById('inputEpTitle').value.trim(),v=DriveInput.getFileId('inputEpVideoId');
        if(!t){UI.showToast('Judul wajib diisi!','error');return;}
        var btn=document.getElementById('adminSaveBtn'); btn.disabled=true;
        try{
            await Data.updateEpisode(ci,parseInt(si),parseInt(ei),{title:t,videoFileId:v});UI.showToast('Episode diupdate!','success');this.hideModal();
            if(Router.currentPage==='watch'){var c=Data.getContentById(ci);UI.renderWatchEpisodes(c,Player.currentSeasonIdx,Player.currentEpIdx);if(parseInt(si)===Player.currentSeasonIdx&&parseInt(ei)===Player.currentEpIdx)Player.playEpisode(ci,si,ei);}
            else if(Router.currentPage==='detail')UI.renderDetail(ci);
        }catch(e){UI.showToast('Error: '+e.message,'error');btn.disabled=false;}
    },
    deleteEpisode: function(ci,si,ei) {
        if(!Auth.isAdmin())return;
        this.showConfirmModal('Hapus episode ini?','Episode dihapus permanen.',async function(){
            try{await Data.deleteEpisode(ci,parseInt(si),parseInt(ei));UI.showToast('Episode dihapus!','success');
            if(Router.currentPage==='watch'){var c=Data.getContentById(ci);UI.renderWatchEpisodes(c,Player.currentSeasonIdx,Player.currentEpIdx);}
            else if(Router.currentPage==='detail')UI.renderDetail(ci);}
            catch(e){UI.showToast('Error: '+e.message,'error');}
        });
    },
    showConfirmModal: function(title,msg,fn) {
        document.getElementById('adminModalTitle').textContent='⚠️ Konfirmasi';
        document.getElementById('adminFormContent').innerHTML='<div class="confirm-dialog"><div class="icon">⚠️</div><p><strong>'+title+'</strong></p><p class="warn">'+msg+'</p></div>';
        document.getElementById('adminFormAction').innerHTML='<button class="btn btn-secondary" onclick="Admin.hideModal()">Batal</button><button class="btn btn-danger" id="confirmActionBtn">🗑️ Hapus</button>';
        document.getElementById('confirmActionBtn').onclick=function(){fn();Admin.hideModal();};
        this.showModal();
    },
    showModal: function() { document.getElementById('adminOverlay').classList.add('active'); document.getElementById('adminModal').classList.add('active'); },
    hideModal: function() { document.getElementById('adminOverlay').classList.remove('active'); document.getElementById('adminModal').classList.remove('active'); }
};
