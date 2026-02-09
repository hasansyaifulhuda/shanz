// ========== ROUTER ==========
var Router = {
    currentPage:'home', currentContentId:null,
    navigate: function(page,param,param2) {
        document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
        this.currentPage = page;
        switch(page) {
            case 'home': document.getElementById('homePage').classList.add('active'); UI.setCategory(param||UI.currentCategory||'all'); UI.renderHome(); break;
            case 'detail': this.currentContentId=param; document.getElementById('detailPage').classList.add('active'); UI.renderDetail(param); this.updateNavActive(null); break;
            case 'watch': this.currentContentId=param; document.getElementById('watchPage').classList.add('active'); Player.initWatch(param,param2||0,0); this.updateNavActive(null); break;
        }
        window.scrollTo({top:0,behavior:'smooth'});
    },
    navigateCategory: function(cat) {
        document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
        this.currentPage='home'; document.getElementById('homePage').classList.add('active');
        UI.setCategory(cat); UI.renderHome(); this.updateNavActive(cat);
        window.scrollTo({top:0,behavior:'smooth'});
    },
    goBackFromWatch: function() { this.currentContentId ? this.navigate('detail',this.currentContentId) : this.navigate('home'); },
    updateNavActive: function(cat) {
        document.querySelectorAll('.nav-link').forEach(function(l){l.classList.remove('active');});
        if (cat!==null&&cat!==undefined) document.querySelectorAll('.nav-link[data-cat="'+cat+'"]').forEach(function(l){l.classList.add('active');});
    },
    init: function() { this.navigateCategory('all'); }
};
