// ========== AUTH (SUPABASE + FALLBACK) ==========
var Auth = {
    STORAGE_KEY: 'streambox_admin',

    isAdmin: function() {
        return sessionStorage.getItem(this.STORAGE_KEY) === 'true';
    },

    login: async function() {
        var el = document.getElementById('adminPasswordInput');
        var pw = el.value.trim();
        var btn = document.getElementById('loginSubmitBtn');

        if (!pw) {
            UI.showToast('Masukkan password!','error');
            return;
        }

        btn.disabled = true;
        btn.textContent = '⏳ Memverifikasi...';

        try {
            if (!sb || !DB_READY) {
                UI.showToast('Database belum siap','error');
                return;
            }

            const { data, error } = await sb
                .from('admin_settings')
                .select('admin_password')
                .eq('id', 1)
                .single();

            if (error || !data) {
                UI.showToast('Gagal membaca password admin','error');
                console.error(error);
                return;
            }

            if (pw === data.admin_password) {
                sessionStorage.setItem(this.STORAGE_KEY, 'true');
                this.hideLoginModal();
                this.updateUI();
                UI.showToast('Login berhasil! Mode Admin aktif.','success');
                UI.renderHome();
            } else {
                UI.showToast('Password salah!','error');
                el.value = '';
                el.focus();
            }

        } catch (e) {
            UI.showToast('Error: ' + e.message,'error');
            console.error(e);
        } finally {
            btn.disabled = false;
            btn.textContent = '🔓 Masuk';
        }
    },

    logout: function() {
        sessionStorage.removeItem(this.STORAGE_KEY);
        this.updateUI();
        UI.showToast('Logout berhasil.','info');
        UI.renderHome();
    },

    showLoginModal: function() {
        document.getElementById('loginOverlay').classList.add('active');
        document.getElementById('loginModal').classList.add('active');
        document.getElementById('adminPasswordInput').value='';
        setTimeout(function(){
            document.getElementById('adminPasswordInput').focus();
        },150);
    },

    hideLoginModal: function() {
        document.getElementById('loginOverlay').classList.remove('active');
        document.getElementById('loginModal').classList.remove('active');
    },

    updateUI: function() {
        var a = this.isAdmin();
        document.body.classList.toggle('admin-mode', a);
        document.getElementById('loginBtn').style.display = a ? 'none' : 'inline-flex';
        document.getElementById('logoutBtn').style.display = a ? 'inline-flex' : 'none';
        document.getElementById('adminBadgeHeader').style.display = a ? 'inline-block' : 'none';
    }
};
