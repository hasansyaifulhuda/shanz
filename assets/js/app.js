/* ================== STATE (GUEST) ================== */
let treeData = JSON.parse(localStorage.getItem("treeData")) || [];
let pageData = JSON.parse(localStorage.getItem("pageData")) || {};
let activeMenuId = null;

/* ================== DOM ================== */
const tree = document.getElementById("tree");
const content = document.getElementById("content");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("overlay");

/* ================== SIDEBAR ================== */
function toggleSidebar() {
  sidebar.classList.add("open");
  sidebarOverlay.style.display = "block";
}

function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarOverlay.style.display = "none";
}

/* ================== TREE ================== */
function renderTree() {
  tree.innerHTML = "";
  treeData.forEach(n => renderNode(n, tree));
}

function renderNode(node, parent) {
  const li = document.createElement("li");
  li.textContent = node.name;
  li.className = node.type;
  parent.appendChild(li);

  if (node.type === "folder") {
    const ul = document.createElement("ul");
    ul.style.display = node.open ? "block" : "none";
    parent.appendChild(ul);

    li.onclick = () => {
      node.open = !node.open;
      ul.style.display = node.open ? "block" : "none";
    };

    node.children.forEach(c => renderNode(c, ul));
  }

  if (node.type === "menu") {
    li.onclick = () => {
  // hapus active lama
  document
    .querySelectorAll("#tree li")
    .forEach(el => el.classList.remove("active"));

  // set active baru
  li.classList.add("active");

  activeMenuId = node.id;
  renderPage(node.id);
  closeSidebar();
};
  }
}

/* ================== LANGUAGE ================== */
function detectLanguage(code) {
  const c = code.trim();
  if (/<!DOCTYPE|<\/?[a-z]/i.test(c)) return "html";
  if (/{[^}]*:[^;]+;/.test(c)) return "css";
  if (/\b(const|let|var|function|if|for|while|class|=>)\b/.test(c)) return "javascript";
  return "plaintext";
}

/* ================== RENDER PAGE ================== */
function renderPage(id) {
  if (!id || !pageData[id]) {
    content.innerHTML = `<div class="empty">(Halaman kosong)</div>`;
    return;
  }

  let html = "";
  const blocks = pageData[id].blocks;

  blocks.forEach(b => {
    if (b.type === "title") {
      html += `<h1>${escapeHtml(b.value)}</h1>`;
    }

    if (b.type === "desc") {
      html += `<p>${highlightAngle(escapeHtml(b.value))}</p>`;
    }

    if (b.type === "code") {
      const lang = detectLanguage(b.value);
      const codeId = "code_" + Math.random().toString(36).slice(2);

      html += `
<div class="code-wrapper">
  <button class="copy-btn" onclick="copyCode('${codeId}')">Salin kode</button>
  <pre class="code-block"><code id="${codeId}" class="hljs language-${lang}">
${escapeHtml(b.value)}
  </code></pre>
</div>`;
    }
  });

  content.innerHTML = html;

  requestAnimationFrame(() => {
    content.querySelectorAll("pre code").forEach(el =>
      hljs.highlightElement(el)
    );
  });
}

/* ================== LOGIN (FIX FINAL) ================== */
async function login() {
  const pwInput = document.getElementById("pw");
  const pw = pwInput.value.trim();

  if (!pw) {
    alert("Password kosong");
    return;
  }

  // HASH INPUT
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(pw)
  );
  const inputHash = [...new Uint8Array(buf)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  // AMBIL ADMIN (SATU BARIS)
  const { data, error } = await supabaseClient
    .from("admin_auth")
    .select("password_hash")
    .limit(1);

  if (error || !data || data.length === 0) {
    alert("Data admin tidak ditemukan");
    return;
  }

  const dbHash = data[0].password_hash;

  // BANDINKAN
  if (inputHash !== dbHash) {
    alert("Password salah");
    return;
  }

  // LOGIN SUKSES
  sessionStorage.setItem("admin", "1");
  window.location.href = "admin.html";
}

/* ================== MODAL ================== */
function openLoginModal() {
  document.getElementById("loginOverlay").style.display = "flex";
  setTimeout(() => document.getElementById("pw").focus(), 50);
}

function closeLoginModal() {
  document.getElementById("loginOverlay").style.display = "none";
  document.getElementById("pw").value = "";
}

/* ================== ENTER TO LOGIN ================== */
document.addEventListener("DOMContentLoaded", () => {
  const pw = document.getElementById("pw");
  if (pw) {
    pw.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        login();
      }
    });
  }
});

/* ================== UTIL ================== */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightAngle(text) {
  return text.replace(/(&lt;[^&]+&gt;)/g, '<span class="angle">$1</span>');
}

function copyCode(id) {
  const el = document.getElementById(id);
  navigator.clipboard.writeText(el.innerText).then(() => {
    const btn = el.closest(".code-wrapper").querySelector(".copy-btn");
    btn.textContent = "Tersalin";
    setTimeout(() => (btn.textContent = "Salin kode"), 1500);
  });
}
// ===== MENU ACTIVE STATE =====
document.querySelectorAll(".menu-item").forEach(item => {
  item.addEventListener("click", () => {
    document
      .querySelectorAll(".menu-item")
      .forEach(i => i.classList.remove("active"));

    item.classList.add("active");
  });
});
/* ===== LOGIN MODAL CONTROL (FINAL FIX) ===== */
const btnLoginAdmin = document.getElementById("btnLoginAdmin");
const loginOverlay = document.getElementById("loginOverlay");
const btnCancel = document.getElementById("btnCancelLogin");
const btnLogin = document.getElementById("btnSubmitLogin");
const inputPw = document.getElementById("pw");

// buka modal
btnLoginAdmin?.addEventListener("click", () => {
  loginOverlay.classList.remove("hidden");
  loginOverlay.style.display = "flex";
  inputPw.focus();
});

// batal
btnCancel?.addEventListener("click", () => {
  loginOverlay.classList.add("hidden");
  loginOverlay.style.display = "none";
  inputPw.value = "";
});

// klik login
btnLogin?.addEventListener("click", () => {
  login();
});

// enter = login
inputPw?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    login();
  }
});

/* ================== START ================== */
renderTree();
