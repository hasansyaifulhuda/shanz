const supabase = window.supabaseClient;

const explorer = document.getElementById("explorer");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const searchInput = document.getElementById("searchInput");

// ===== STATE =====
let currentFolderId = null;
let folderStack = [];
let forwardStack = [];
let globalFolders = [];
let globalFiles = [];

/* ===== LOAD PUBLIC ===== */
async function loadPublic() {
  explorer.innerHTML = "";

  let folderQuery = supabase.from("folders").select("*").is("deleted_at", null);
  let fileQuery = supabase
    .from("files")
    .select("*")
    .eq("status", "published")
    .is("deleted_at", null);

  if (currentFolderId) {
    folderQuery = folderQuery.eq("parent_id", currentFolderId);
    fileQuery = fileQuery.eq("folder_id", currentFolderId);
  } else {
    folderQuery = folderQuery.is("parent_id", null);
    fileQuery = fileQuery.is("folder_id", null);
  }

  const { data: folders } = await folderQuery;
  const { data: files } = await fileQuery;

  renderTree(folders || [], files || []);
}

/* ===== LOAD GLOBAL SEARCH ===== */
async function loadGlobalData() {
  const { data: folders } = await supabase.from("folders").select("*");
  const { data: files } = await supabase
    .from("files")
    .select("*")
    .eq("status", "published");

  globalFolders = folders || [];
  globalFiles = files || [];
}

/* ===== RENDER TREE ===== */
function renderTree(folders, files) {
  explorer.innerHTML = "";

  folders.forEach(f => {
    const el = document.createElement("div");
    el.className = "folder";
    el.innerHTML = `
      <span class="folder-icon">
        ${
          f.thumbnail_url
            ? `<img src="${f.thumbnail_url}" class="folder-thumb">`
            : "📁"
        }
      </span>
      <span class="folder-name">${f.name}</span>
    `;

    el.onclick = () => {
      folderStack.push(currentFolderId);
      currentFolderId = f.id;
      forwardStack = [];
      loadPublic();
      updateNav();
    };

    explorer.appendChild(el);
  });

  files.forEach(f => {
    const el = document.createElement("div");
    el.className = "file-card";
    el.innerHTML = `
      <div class="thumb-wrapper">
        <img src="${f.thumbnail_url || ""}" class="file-thumb">
      </div>
    `;
    el.onclick = () => openFileGuest(f.id, f.title);
    explorer.appendChild(el);
  });
}

/* ===== MODAL VIEWER (GUEST) ===== */
async function openFileGuest(id, title) {
  const { data } = await supabase
    .from("files")
    .select("content")
    .eq("id", id)
    .single();

  const rawText = data?.content || "";

  // ===== OVERLAY =====
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,0.6);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:9999;
  `;

  // ===== MODAL =====
  const modal = document.createElement("div");
  modal.style.cssText = `
    background:#fff;
    width:90%;
    max-width:600px;
    max-height:85vh;
    border-radius:14px;
    padding:20px;
    display:flex;
    flex-direction:column;
    box-shadow:0 20px 40px rgba(0,0,0,.4);
  `;

  // ===== TITLE =====
  const titleEl = document.createElement("div");
  titleEl.textContent = title;
  titleEl.style.cssText = `
    text-align:center;
    font-size:20px;
    font-weight:700;
    margin-bottom:14px;
    flex-shrink:0;
  `;

  // ===== CONTENT (PERSIS ADMIN) =====
  const contentEl = document.createElement("div");
  contentEl.style.cssText = `
    flex:1;
    overflow:auto;
    border:1px solid #ddd;
    border-radius:10px;
    padding:14px;
    white-space:pre-wrap;
    font-family:inherit;
    line-height:1.6;
  `;

  // Render TEXT AS-IS, tapi auto-link AMAN
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  rawText.split(urlRegex).forEach(part => {
    if (urlRegex.test(part)) {
      const a = document.createElement("a");
      a.href = part;
      a.textContent = part;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.style.color = "#0b74de";
      contentEl.appendChild(a);
    } else {
      contentEl.appendChild(document.createTextNode(part));
    }
  });

  // ===== CLOSE BUTTON =====
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.style.cssText = `
    width:100%;
    padding:14px;
    border:none;
    border-radius:10px;
    background:#0b74de;
    color:#fff;
    font-size:16px;
    font-weight:600;
    cursor:pointer;
    margin-top:16px;
    flex-shrink:0;
  `;

  closeBtn.onclick = () => overlay.remove();
  overlay.onclick = e => {
    if (e.target === overlay) overlay.remove();
  };

  modal.appendChild(titleEl);
  modal.appendChild(contentEl);
  modal.appendChild(closeBtn);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

/* ===== NAV ===== */
function updateNav() {
  if (backBtn) backBtn.disabled = !folderStack.length;
  if (nextBtn) nextBtn.disabled = !forwardStack.length;
}

backBtn?.addEventListener("click", () => {
  forwardStack.push(currentFolderId);
  currentFolderId = folderStack.pop();
  loadPublic();
  updateNav();
});

nextBtn?.addEventListener("click", () => {
  folderStack.push(currentFolderId);
  currentFolderId = forwardStack.pop();
  loadPublic();
  updateNav();
});

/* ===== SEARCH ===== */
searchInput?.addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  if (!q) return loadPublic();

  explorer.innerHTML = "";

  globalFolders
    .filter(f => f.name.toLowerCase().includes(q))
    .forEach(f => {
      const el = document.createElement("div");
      el.className = "folder";
      el.textContent = "📁 " + f.name;
      el.onclick = () => {
        currentFolderId = f.id;
        loadPublic();
      };
      explorer.appendChild(el);
    });

  globalFiles
    .filter(f => f.title.toLowerCase().includes(q))
    .forEach(f => {
      const el = document.createElement("div");
      el.className = "file-card";
      el.innerHTML = `
        <div class="thumb-wrapper">
          <img src="${f.thumbnail_url || ""}" class="file-thumb">
        </div>
      `;
      el.onclick = () => openFileGuest(f.id, f.title);
      explorer.appendChild(el);
    });
});

/* ===== INIT ===== */
loadPublic();
loadGlobalData();
updateNav();
