// ========== PLAYER ==========
var Player = {
    currentContentId:null, currentSeasonIdx:0, currentEpIdx:0,

    initWatch: function(cid,si,ei) {
        this.currentContentId=cid; this.currentSeasonIdx=parseInt(si)||0; this.currentEpIdx=parseInt(ei)||0;
        var c = Data.getContentById(cid); if(!c){UI.showToast('Konten tidak ditemukan!','error');Router.navigate('home');return;}
        var sel=document.getElementById('seasonSelector'),selEl=document.getElementById('watchSeasonSelect'),self=this;
        if (c.seasons.length>1){sel.style.display='block';selEl.innerHTML=c.seasons.map(function(s,i){return '<option value="'+i+'"'+(i===self.currentSeasonIdx?' selected':'')+'>'+Utils.escapeHtml(s.name)+'</option>';}).join('');}
        else sel.style.display='none';
        this.playEpisode(cid,this.currentSeasonIdx,this.currentEpIdx);
    },

    ensureBlockers: function(wr) {
        if (!wr.querySelector('.player-blocker-top')) {
            var b1 = document.createElement('div'); b1.className='player-blocker-top'; wr.appendChild(b1);
        }
        if (!wr.querySelector('.player-blocker-topbar')) {
            var b2 = document.createElement('div'); b2.className='player-blocker-topbar'; wr.appendChild(b2);
        }
        if (!wr.querySelector('.player-blocker-bottom')) {
            var b3 = document.createElement('div'); b3.className='player-blocker-bottom'; wr.appendChild(b3);
        }
    },

    playEpisode: function(cid,si,ei) {
        var c = Data.getContentById(cid); if(!c)return;
        this.currentContentId=cid; this.currentSeasonIdx=parseInt(si); this.currentEpIdx=parseInt(ei);
        var sn=c.seasons[this.currentSeasonIdx]; if(!sn||!sn.episodes[this.currentEpIdx]){UI.showToast('Episode tidak ditemukan!','error');return;}
        var ep=sn.episodes[this.currentEpIdx],wr=document.getElementById('playerWrapper');

        // Hapus hanya iframe & error, BUKAN blocker
        var err=wr.querySelector('.player-error'); if(err)err.remove();
        var old=document.getElementById('videoPlayer'); if(old)old.remove();

        // Pastikan blocker selalu ada
        this.ensureBlockers(wr);

        if (ep.videoFileId&&ep.videoFileId.trim()){
            var ifr=document.createElement('iframe');ifr.id='videoPlayer';ifr.src=Utils.getDriveVideoUrl(ep.videoFileId);
            ifr.setAttribute('allow','autoplay; fullscreen; encrypted-media; picture-in-picture');ifr.setAttribute('allowfullscreen','');
            ifr.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;border:none;z-index:1;';
            wr.insertBefore(ifr,wr.firstChild);
        } else {
            var ph=document.createElement('iframe');ph.id='videoPlayer';ph.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;border:none;display:none;';
            wr.insertBefore(ph,wr.firstChild);
            var e=document.createElement('div');e.className='player-error';
            e.innerHTML='<div class="error-icon">⚠️</div><p>Video gagal diputar.<br>Periksa FILE_ID Google Drive.</p>';
            wr.appendChild(e); UI.showToast('Video gagal. FILE_ID belum diisi.','error');
        }

        document.getElementById('watchTitle').textContent=c.title+' — '+ep.title;
        document.getElementById('watchMeta').innerHTML='<span class="badge '+Utils.getCategoryColor(c.category)+'">'+Utils.getCategoryLabel(c.category)+'</span><span>'+Utils.escapeHtml(sn.name)+'</span><span>Ep '+(this.currentEpIdx+1)+'/'+sn.episodes.length+'</span><span class="quality-badge">🎥 Resolusi Asli</span>';
        UI.renderWatchEpisodes(c,this.currentSeasonIdx,this.currentEpIdx);
        Utils.saveLocal('streambox_resume',{contentId:cid,seasonIdx:this.currentSeasonIdx,epIdx:this.currentEpIdx,timestamp:Date.now()});
        AutoNext.check(c,this.currentSeasonIdx,this.currentEpIdx);
    },

    getResumeData: function() { return Utils.loadLocal('streambox_resume'); },
    resumeLastWatched: function() {
        var r=this.getResumeData(); if(!r)return;
        var c=Data.getContentById(r.contentId),self=this;
        if(c){Router.navigate('watch',r.contentId,r.seasonIdx);setTimeout(function(){self.playEpisode(r.contentId,r.seasonIdx,r.epIdx);},100);}
        else{UI.showToast('Konten sudah dihapus.','warning');Utils.removeLocal('streambox_resume');}
    },
    playNextEpisode: function() {
        var c=Data.getContentById(this.currentContentId); if(!c)return;
        var s=c.seasons[this.currentSeasonIdx]; if(!s)return;
        if(this.currentEpIdx+1<s.episodes.length) this.playEpisode(this.currentContentId,this.currentSeasonIdx,this.currentEpIdx+1);
        else if(this.currentSeasonIdx+1<c.seasons.length){var ns=c.seasons[this.currentSeasonIdx+1];if(ns.episodes.length>0){this.currentSeasonIdx++;document.getElementById('watchSeasonSelect').value=this.currentSeasonIdx;this.playEpisode(this.currentContentId,this.currentSeasonIdx,0);UI.showToast('Lanjut ke '+ns.name,'info');}}
        else UI.showToast('🎉 Semua episode selesai!','info');
    }
};
