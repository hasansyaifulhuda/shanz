// ====== supabase.js (versi fix 2025) ======
(() => {
  if (!window.__supabaseInstance) {
    const SUPABASE_URL = "https://qtlaegfanuecmszjnzdt.supabase.co";
    const SUPABASE_KEY = "sb_publishable_SwiKnwp6tVFXuSohSznDyA_mnJPJseh";

    window.__supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } else {
    console.log("ℹ️ Supabase instance sudah ada, pakai yang lama");
  }

  window.supabaseClient = window.__supabaseInstance;
})();
