// ========== app.js (Mode Guest dengan Grid Thumbnail) ==========

const supabase = window.supabaseClient;

const explorer = document.getElementById("explorer");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const searchInput = document.getElementById("searchInput");

let currentFolderId = null;
let folderStack = [];
let forwardStack = [];

// ===== Muat Konten Publik =====
async function loadPublic() {
  explorer.innerHTML = "<p>Memuat konten publik...</p>";

  try {
    let folderQuery = supabase.from("folders").select("*").is("deleted_at", null);
    let fileQuery = supabase.from("files").select("*").eq("status", "published").is("deleted_at", null);

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

    renderTree(folders, files);
  } catch (err) {
    console.error("⚠️ Gagal memuat data publik:", err);
    explorer.innerHTML = "<p style='color:red'>Gagal memuat konten.</p>";
  }
}

// ===== Tampilkan Folder & File =====
function renderTree(folders, files) {
  explorer.innerHTML = "";

  if ((!folders || folders.length === 0) && (!files || files.length === 0)) {
    explorer.innerHTML = "<p>📂 Folder kosong.</p>";
    return;
  }

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

  files.forEach((f) => {
    const el = document.createElement("div");

    if (f.thumbnail_url) {
      el.className = "file-card";
      el.innerHTML = `
        <div class="thumb-wrapper">
          <img src="${f.thumbnail_url}" alt="${f.title}" class="file-thumb" />
        </div>
        <div class="file-title">${f.title}</div>
      `;
    } else {
      el.className = "file";
      el.innerHTML = `📝 ${f.title}`;
    }

    el.onclick = () => openFileGuest(f.id, f.title);
    explorer.appendChild(el);
  });
}

// ===== Auto-Link di Konten File =====
function autoLink(text) {
  if (!text) return "";
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    let href = url.startsWith("http") ? url : "https://" + url;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
}

// ===== Popup Notepad (Guest) =====
async function openFileGuest(fileId, title) {
  const { data, error } = await supabase.from("files").select("content").eq("id", fileId).single();
  if (error) return alert("Gagal membuka file: " + error.message);

  const popup = document.createElement("div");
  popup.className = "notepad-modal";
  popup.innerHTML = `
    <div class="notepad-box">
      <h3>📝 ${title}</h3>
      <div id="noteContent" class="preview">${autoLink(data?.content || "")}</div>
      <div class="note-buttons">
        <button id="closeBtn">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
  popup.querySelector("#closeBtn").addEventListener("click", () => popup.remove());
}

// ===== Navigasi Folder =====
function updateNavButtons() {
  backBtn.disabled = folderStack.length === 0;
  nextBtn.disabled = forwardStack.length === 0;
}

backBtn?.addEventListener("click", () => {
  if (folderStack.length > 0) {
    forwardStack.push(currentFolderId);
    currentFolderId = folderStack.pop() || null;
    loadPublic();
    updateNavButtons();
  }
});

nextBtn?.addEventListener("click", () => {
  if (forwardStack.length > 0) {
    folderStack.push(currentFolderId);
    currentFolderId = forwardStack.pop() || null;
    loadPublic();
    updateNavButtons();
  }
});

// ===== Pencarian =====
searchInput?.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const items = document.querySelectorAll(".folder, .file, .file-card");
  items.forEach((item) => {
    const name = item.textContent.toLowerCase();
    item.style.display = name.includes(query) ? "" : "none";
  });
});

// ===== Inisialisasi =====
loadPublic();
updateNavButtons();
