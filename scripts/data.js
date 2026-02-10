// ========== DATA (SUPABASE + LOCALSTORAGE FALLBACK) ==========
var Data = {
    _cache: { contents: [] },

    init: async function() {
        if (!sb) { this._cache = Utils.loadLocal('streambox_data') || { contents: [] }; return; }
        try {
            await this.loadAll();
            DB_READY = true;
            console.log('Supabase connected successfully.');
        } catch(e) {
            console.warn('Supabase load failed, using localStorage:', e);
            this._cache = Utils.loadLocal('streambox_data') || { contents: [] };
        }
    },

    loadAll: async function() {
        var { data: contents, error: ce } = await sb.from('contents').select('*').order('created_at', { ascending: false });
        if (ce) throw ce;
        var { data: seasons, error: se } = await sb.from('seasons').select('*').order('sort_order');
        if (se) throw se;
        var { data: episodes, error: ee } = await sb.from('episodes').select('*').order('sort_order');
        if (ee) throw ee;

        this._cache.contents = (contents || []).map(function(c) {
            var cSeasons = (seasons || []).filter(function(s) { return s.content_id === c.id; });
            return {
                id: c.id,
                title: c.title,
                category: c.category,
                posterFileId: c.poster_file_id || '',
                seasons: cSeasons.map(function(s) {
                    var sEps = (episodes || []).filter(function(ep) { return ep.season_id === s.id; });
                    return {
                        dbId: s.id,
                        name: s.name,
                        episodes: sEps.map(function(ep) {
                            return { dbId: ep.id, title: ep.title, videoFileId: ep.video_file_id || '' };
                        })
                    };
                })
            };
        });
        Utils.saveLocal('streambox_data', this._cache);
    },

    getContents: function() { return this._cache.contents || []; },
    getContentById: function(id) { return this.getContents().find(function(c){return c.id===id;}) || null; },
  getContentsByCategory: function(cat) {
    if (cat === 'all') {
        return this.getContents();
    }

    return this.getContents().filter(function(c) {
        return c.category === cat;
    });
},
    searchContents: function(q) { q=q.toLowerCase().trim(); if(!q) return this.getContents(); return this.getContents().filter(function(c){return c.title.toLowerCase().indexOf(q)!==-1;}); },

    addContent: async function(c) {
        c.id = Utils.generateId();
        if (sb && DB_READY) {
            var { error } = await sb.from('contents').insert({ id: c.id, title: c.title, category: c.category, poster_file_id: c.posterFileId || '' });
            if (error) throw error;
            var sName = (c.category==='movie'||c.category==='film') ? 'Full Movie' : 'Season 1';
            var { error: se } = await sb.from('seasons').insert({ content_id: c.id, name: sName, sort_order: 0 });
            if (se) throw se;
            await this.loadAll();
        } else {
            c.seasons = [{ name: (c.category==='movie'||c.category==='film') ? 'Full Movie' : 'Season 1', episodes: [] }];
            this._cache.contents.unshift(c); Utils.saveLocal('streambox_data', this._cache);
        }
        return c;
    },

    updateContent: async function(id, u) {
        if (sb && DB_READY) {
            var upd = {};
            if (u.title !== undefined) upd.title = u.title;
            if (u.category !== undefined) upd.category = u.category;
            if (u.posterFileId !== undefined) upd.poster_file_id = u.posterFileId;
            var { error } = await sb.from('contents').update(upd).eq('id', id);
            if (error) throw error;
            await this.loadAll();
        } else {
            var c = this.getContentById(id); if(c) Object.assign(c, u);
            Utils.saveLocal('streambox_data', this._cache);
        }
    },

    deleteContent: async function(id) {
        if (sb && DB_READY) {
            var { error } = await sb.from('contents').delete().eq('id', id);
            if (error) throw error;
            await this.loadAll();
        } else {
            this._cache.contents = this._cache.contents.filter(function(c){return c.id!==id;});
            Utils.saveLocal('streambox_data', this._cache);
        }
    },

    addSeason: async function(contentId, name) {
        if (sb && DB_READY) {
            var c = this.getContentById(contentId);
            var order = c ? c.seasons.length : 0;
            var { error } = await sb.from('seasons').insert({ content_id: contentId, name: name, sort_order: order });
            if (error) throw error;
            await this.loadAll();
        } else {
            var c = this.getContentById(contentId); if(c) c.seasons.push({name:name,episodes:[]});
            Utils.saveLocal('streambox_data', this._cache);
        }
    },

    updateSeason: async function(contentId, si, name) {
        var c = this.getContentById(contentId);
        if (sb && DB_READY && c && c.seasons[si] && c.seasons[si].dbId) {
            var { error } = await sb.from('seasons').update({ name: name }).eq('id', c.seasons[si].dbId);
            if (error) throw error;
            await this.loadAll();
        } else {
            if(c && c.seasons[si]) c.seasons[si].name = name;
            Utils.saveLocal('streambox_data', this._cache);
        }
    },

    deleteSeason: async function(contentId, si) {
        var c = this.getContentById(contentId);
        if (sb && DB_READY && c && c.seasons[si] && c.seasons[si].dbId) {
            var { error } = await sb.from('seasons').delete().eq('id', c.seasons[si].dbId);
            if (error) throw error;
            await this.loadAll();
        } else {
            if(c && c.seasons.length > 1) c.seasons.splice(si,1);
            Utils.saveLocal('streambox_data', this._cache);
        }
    },

    addEpisode: async function(contentId, si, ep) {
        var c = this.getContentById(contentId);
        if (sb && DB_READY && c && c.seasons[si] && c.seasons[si].dbId) {
            var order = c.seasons[si].episodes.length;
            var { error } = await sb.from('episodes').insert({ season_id: c.seasons[si].dbId, title: ep.title, video_file_id: ep.videoFileId || '', sort_order: order });
            if (error) throw error;
            await this.loadAll();
        } else {
            if(c && c.seasons[si]) c.seasons[si].episodes.push(ep);
            Utils.saveLocal('streambox_data', this._cache);
        }
    },

    updateEpisode: async function(contentId, si, ei, u) {
        var c = this.getContentById(contentId);
        if (sb && DB_READY && c && c.seasons[si] && c.seasons[si].episodes[ei] && c.seasons[si].episodes[ei].dbId) {
            var upd = {};
            if (u.title !== undefined) upd.title = u.title;
            if (u.videoFileId !== undefined) upd.video_file_id = u.videoFileId;
            var { error } = await sb.from('episodes').update(upd).eq('id', c.seasons[si].episodes[ei].dbId);
            if (error) throw error;
            await this.loadAll();
        } else {
            if(c && c.seasons[si] && c.seasons[si].episodes[ei]) Object.assign(c.seasons[si].episodes[ei], u);
            Utils.saveLocal('streambox_data', this._cache);
        }
    },

    deleteEpisode: async function(contentId, si, ei) {
        var c = this.getContentById(contentId);
        if (sb && DB_READY && c && c.seasons[si] && c.seasons[si].episodes[ei] && c.seasons[si].episodes[ei].dbId) {
            var { error } = await sb.from('episodes').delete().eq('id', c.seasons[si].episodes[ei].dbId);
            if (error) throw error;
            await this.loadAll();
        } else {
            if(c && c.seasons[si]) c.seasons[si].episodes.splice(ei,1);
            Utils.saveLocal('streambox_data', this._cache);
        }
    }
};
