// ========== app.js (Guest Mode + Global Search) ==========

const supabase = window.supabaseClient;

const explorer = document.getElementById("explorer");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const searchInput = document.getElementById("searchInput");

// cache folder aktif
let allFolders = [];
let allFiles = [];

// cache GLOBAL untuk search
let globalFolders = [];
let globalFiles = [];

let currentFolderId = null;
let folderStack = [];
let forwardStack = [];

// ===== Muat Konten Publik (berdasarkan folder aktif) =====
async function loadPublic() {
  explorer.innerHTML = "<p>Memuat konten...</p>";

  try {
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

    const { data: folders, error: folderError } = await folderQuery;
    const { data: files, error: fileError } = await fileQuery;

    if (folderError || fileError) throw folderError || fileError;

    folders.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.title.localeCompare(b.title));

    allFolders = folders || [];
    allFiles = files || [];

    renderTree(allFolders, allFiles);
  } catch (err) {
    console.error("Gagal load data:", err);
    explorer.innerHTML = "<p style='color:red'>Gagal memuat data</p>";
  }
}

// ===== Load SEMUA data (khusus untuk search global) =====
async function loadGlobalData() {
  const { data: folders } = await supabase
    .from("folders")
    .select("*")
    .is("deleted_at", null);

  const { data: files } = await supabase
    .from("files")
    .select("*")
    .eq("status", "published")
    .is("deleted_at", null);

  globalFolders = folders || [];
  globalFiles = files || [];
}

// ===== Render Folder & File =====
function renderTree(folders, files) {
  explorer.innerHTML = "";

  if (folders.length === 0 && files.length === 0) {
    explorer.innerHTML = "<p>📂 Folder kosong</p>";
    return;
  }

  // render folder
  folders.forEach((f) => {
    const el = document.createElement("div");
    el.className = "folder";
    el.textContent = "📁 " + f.name;
    el.onclick = () => {
      folderStack.push(currentFolderId);
      currentFolderId = f.id;
      forwardStack = [];
      loadPublic();
      updateNavButtons();
    };
    explorer.appendChild(el);
  });

  // render file (GRID GAMBAR SAJA)
  files.forEach((f) => {
    const el = document.createElement("div");
    el.className = "file-card";
    el.innerHTML = `
      <div class="thumb-wrapper">
        <img src="${f.thumbnail_url || ""}" class="file-thumb" />
      </div>
    `;
    el.onclick = () => openFileGuest(f.id, f.title);
    explorer.appendChild(el);
  });
}

// ===== Auto Link =====
function autoLink(text) {
  if (!text) return "";
  return text.replace(
    /(https?:\/\/[^\s]+|www\.[^\s]+)/g,
    (url) => {
      const href = url.startsWith("http") ? url : "https://" + url;
      return `<a href="${href}" target="_blank">${url}</a>`;
    }
  );
}
// ===== FORMAT TEXT (*bold*) =====
function formatText(text) {
  if (!text) return "";
  return text.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
}

// ===== Popup File =====
async function openFileGuest(fileId, title) {
  const { data, error } = await supabase
    .from("files")
    .select("content")
    .eq("id", fileId)
    .single();

  if (error) return alert("Gagal membuka file");

  const popup = document.createElement("div");
  popup.className = "notepad-modal";
  popup.innerHTML = `
    <div class="notepad-box">
      <h3>${title}</h3>
     <div id="noteContent" class="preview">
  ${formatText(autoLink(data?.content || ""))}
</div>
      <div class="note-buttons">
        <button id="closeBtn">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  popup.querySelector("#closeBtn").onclick = () => popup.remove();
}

// ===== Navigasi =====
function updateNavButtons() {
  backBtn.disabled = folderStack.length === 0;
  nextBtn.disabled = forwardStack.length === 0;
}

backBtn?.addEventListener("click", () => {
  if (folderStack.length) {
    forwardStack.push(currentFolderId);
    currentFolderId = folderStack.pop();
    loadPublic();
    updateNavButtons();
  }
});

nextBtn?.addEventListener("click", () => {
  if (forwardStack.length) {
    folderStack.push(currentFolderId);
    currentFolderId = forwardStack.pop();
    loadPublic();
    updateNavButtons();
  }
});

// ===== SEARCH GLOBAL =====
searchInput?.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase().trim();

  // kosong → balik normal
  if (!query) {
    loadPublic();
    return;
  }

  const folders = globalFolders.filter((f) =>
    f.name.toLowerCase().includes(query)
  );

  const files = globalFiles.filter((f) =>
    f.title.toLowerCase().includes(query)
  );

  explorer.innerHTML = "";

  folders.forEach((f) => {
    const el = document.createElement("div");
    el.className = "folder";
    el.textContent = "📁 " + f.name;
    el.onclick = () => {
      currentFolderId = f.id;
      loadPublic();
    };
    explorer.appendChild(el);
  });

  files.forEach((f) => {
    const el = document.createElement("div");
    el.className = "file-card";
    el.innerHTML = `
      <div class="thumb-wrapper">
        <img src="${f.thumbnail_url || ""}" class="file-thumb" />
      </div>
    `;
    el.onclick = () => {
      currentFolderId = f.folder_id;
      loadPublic().then(() => openFileGuest(f.id, f.title));
    };
    explorer.appendChild(el);
  });
});

// ===== INIT =====
loadPublic();
loadGlobalData();
updateNavButtons();
