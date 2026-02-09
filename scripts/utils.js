// ========== UTILS ==========
var Utils = {
    generateId: function() { return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2,9); },
    extractDriveFileId: function(input) {
        if (!input || typeof input !== 'string') return '';
        input = input.trim(); if (!input) return '';
        var m;
        if ((m = input.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})/))) return m[1];
        if ((m = input.match(/docs\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})/))) return m[1];
        if ((m = input.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]{10,})/))) return m[1];
        if ((m = input.match(/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]{10,})/))) return m[1];
        if ((m = input.match(/drive\.google\.com\/thumbnail\?.*id=([a-zA-Z0-9_-]{10,})/))) return m[1];
        if ((m = input.match(/drive\.google\.com\/d\/([a-zA-Z0-9_-]{10,})/))) return m[1];
        if ((m = input.match(/[?&]id=([a-zA-Z0-9_-]{10,})/))) return m[1];
        if (/^[a-zA-Z0-9_-]{10,}$/.test(input)) return input;
        return '';
    },
    getDrivePosterUrl: function(fid) { return fid ? 'https://drive.google.com/thumbnail?id=' + fid + '&sz=w1000' : ''; },
    getDriveVideoUrl: function(fid) { return fid ? 'https://drive.google.com/file/d/' + fid + '/preview' : ''; },
    saveLocal: function(k,d) { try { localStorage.setItem(k, JSON.stringify(d)); } catch(e){} },
    loadLocal: function(k) { try { var d = localStorage.getItem(k); return d ? JSON.parse(d) : null; } catch(e) { return null; } },
    removeLocal: function(k) { try { localStorage.removeItem(k); } catch(e){} },
    escapeHtml: function(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; },
    debounce: function(fn,w) { var t; return function() { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function(){ fn.apply(c,a); }, w); }; },
    getCategoryLabel: function(c) { return ({anime:'🎌 Anime',kartun:'🎨 Kartun',movie:'🎬 Movie',film:'🎞️ Film'})[c]||c; },
    getCategoryColor: function(c) { return ({anime:'badge-blue',kartun:'badge-green',movie:'badge-yellow',film:'badge-red'})[c]||'badge-blue'; },
    getCategoryIcon: function(c) { return ({anime:'🎌',kartun:'🎨',movie:'🎬',film:'🎞️'})[c]||'🎬'; }
};

// ========== DRIVE INPUT ==========
var DriveInput = {
    createPosterInput: function(v) {
        v = v || '';
        return '<div class="form-group"><label class="form-label">📎 Poster (Link Google Drive)</label>' +
            '<div class="drive-input-wrap"><input type="text" class="form-input" id="inputPoster" value="' + Utils.escapeHtml(v) + '" placeholder="Tempel link Google Drive poster..." oninput="DriveInput.onPosterInput(this)" onpaste="setTimeout(function(){DriveInput.onPosterInput(document.getElementById(\'inputPoster\'));},50)">' +
            '<span class="drive-status" id="posterStatus"></span></div>' +
            '<div class="drive-detected-box" id="posterDetected"><div class="detected-label">✅ FILE_ID Terdeteksi</div><div class="detected-id" id="posterDetectedId"></div><div class="drive-preview-thumb" id="posterPreview" style="display:none;"></div></div>' +
            '<div class="drive-help-text">💡 Paste link: <code>https://drive.google.com/file/d/xxxxx/view</code></div></div>';
    },
    createVideoInput: function(v) {
        v = v || '';
        return '<div class="form-group"><label class="form-label">🎬 Video (Link Google Drive)</label>' +
            '<div class="drive-input-wrap"><input type="text" class="form-input" id="inputEpVideoId" value="' + Utils.escapeHtml(v) + '" placeholder="Tempel link Google Drive video..." oninput="DriveInput.onVideoInput(this)" onpaste="setTimeout(function(){DriveInput.onVideoInput(document.getElementById(\'inputEpVideoId\'));},50)">' +
            '<span class="drive-status" id="videoStatus"></span></div>' +
            '<div class="drive-detected-box" id="videoDetected"><div class="detected-label">✅ FILE_ID Terdeteksi</div><div class="detected-id" id="videoDetectedId"></div></div>' +
            '<div class="drive-help-text">💡 Paste link: <code>https://drive.google.com/file/d/xxxxx/view</code></div></div>';
    },
    onPosterInput: function(el) {
        var r = el.value.trim(), fid = Utils.extractDriveFileId(r);
        var st = document.getElementById('posterStatus'), db = document.getElementById('posterDetected'), di = document.getElementById('posterDetectedId'), pv = document.getElementById('posterPreview');
        if (!r) { st.textContent=''; el.classList.remove('input-success','input-error'); db.classList.remove('active'); if(pv) pv.style.display='none'; return; }
        if (fid) { st.textContent='✅'; el.classList.remove('input-error'); el.classList.add('input-success'); db.classList.add('active'); di.textContent=fid; if(pv){pv.style.display='block';pv.innerHTML='<img src="'+Utils.getDrivePosterUrl(fid)+'" onerror="this.parentElement.style.display=\'none\'">';} el.setAttribute('data-file-id',fid); }
        else { st.textContent='❌'; el.classList.remove('input-success'); el.classList.add('input-error'); db.classList.remove('active'); if(pv) pv.style.display='none'; el.removeAttribute('data-file-id'); }
    },
    onVideoInput: function(el) {
        var r = el.value.trim(), fid = Utils.extractDriveFileId(r);
        var st = document.getElementById('videoStatus'), db = document.getElementById('videoDetected'), di = document.getElementById('videoDetectedId');
        if (!r) { st.textContent=''; el.classList.remove('input-success','input-error'); db.classList.remove('active'); return; }
        if (fid) { st.textContent='✅'; el.classList.remove('input-error'); el.classList.add('input-success'); db.classList.add('active'); di.textContent=fid; el.setAttribute('data-file-id',fid); }
        else { st.textContent='❌'; el.classList.remove('input-success'); el.classList.add('input-error'); db.classList.remove('active'); el.removeAttribute('data-file-id'); }
    },
    getFileId: function(id) { var el = document.getElementById(id); if (!el) return ''; var d = el.getAttribute('data-file-id'); if (d) return d; return Utils.extractDriveFileId(el.value.trim()); },
    triggerDetect: function(id,t) { var el = document.getElementById(id); if (el && el.value.trim()) { if (t==='poster') this.onPosterInput(el); else this.onVideoInput(el); } }
};
