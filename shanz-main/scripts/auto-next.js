// ========== AUTO NEXT ==========
var AutoNext = {
    check: function(c,si,ei) {
        var b=document.getElementById('autoNextBanner'),n=document.getElementById('nextEpName');
        if(!c||!c.seasons[si]){b.style.display='none';return;}
        var s=c.seasons[si],has=false,nm='';
        if(ei+1<s.episodes.length){has=true;nm=s.episodes[ei+1].title;}
        else if(si+1<c.seasons.length){var ns=c.seasons[si+1];if(ns.episodes.length>0){has=true;nm=ns.name+' — '+ns.episodes[0].title;}}
        if(has){b.style.display='flex';n.textContent=nm;}else b.style.display='none';
    }
};
