// ====== supabase.js (versi fix 2025) ======
(() => {
  if (!window.__supabaseInstance) {
    const SUPABASE_URL = "https://vfexcewwkuzgbktyxpfn.supabase.co"; // tetap sama
    const SUPABASE_KEY = "sb_publishable_seouq6KCaWpm4CN6CBZVSA_Yvz0a77Z"; // ganti ini!

    window.__supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } else {
    console.log("ℹ️ Supabase instance sudah ada, pakai yang lama");
  }

  window.supabaseClient = window.__supabaseInstance;
})();
