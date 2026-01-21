// ===== ADMIN MODE =====
const explorer = document.getElementById("explorer");
const logoutBtn = document.getElementById("logoutBtn");
const fabBtn = document.getElementById("fab");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");

if (sessionStorage.getItem("isAdmin") !== "true") {
  alert("Akses ditolak. Anda belum login sebagai admin.");
  window.location = "index.html";
}

logoutBtn?.addEventListener("click", () => {
  sessionStorage.removeItem("isAdmin");
  window.location = "index.html";
});

let currentFolderId = null;
let folderStack = [];
let forwardStack = [];

// ====== NORMALIZE TEXT (FIX BUG SPASI AWAL) ======
function normalizeText(text) {
  return (text || "")
    .replace(/\u00A0/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/^\n+/, "");
}

// ====== LOAD DATA ======
async function loadAll() {
  explorer.innerHTML = "<p>Memuat data...</p>";

  try {
    let folderQuery = supabaseClient.from("folders").select("*").is("deleted_at", null);
    let fileQuery = supabaseClient.from("files").select("*").is("deleted_at", null);

    if (currentFolderId) {
      folderQuery = folderQuery.eq("parent_id", currentFolderId);
      fileQuery = fileQuery.eq("folder_id", currentFolderId);
    } else {
      folderQuery = folderQuery.is("parent_id", null);
      fileQuery = fileQuery.is("folder_id", null);
    }

    const { data: folders } = await folderQuery;
    const { data: files } = await fileQuery;

    folders.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.title.localeCompare(b.title));

    renderTree(folders, files);
  } catch (err) {
    explorer.innerHTML = "<p style='color:red'>Gagal memuat data.</p>";
  }
}

// ====== RENDER TREE ======
function renderTree(folders, files) {
  explorer.innerHTML = "";

  folders.forEach((f) => {
    f.type = "folder";
    const el = document.createElement("div");
    el.className = "folder";
    el.textContent = "📁 " + f.name;
    el.dataset.id = f.id;
    el.dataset.type = "folder";
    el.onclick = () => {
      folderStack.push(currentFolderId);
      currentFolderId = f.id;
      forwardStack = [];
      loadAll();
      updateNavButtons();
    };
    addContextInteraction(el, f);
    explorer.appendChild(el);
  });

  files.forEach((f) => {
    f.type = "file";
    const el = document.createElement("div");
    el.dataset.id = f.id;
    el.dataset.type = "file";

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
      el.textContent = "📝 " + f.title;
    }

    el.onclick = () => openNotepad(f.id, f.title);
    addContextInteraction(el, f);
    explorer.appendChild(el);
  });
}

// ====== AUTO LINK ======
function autoLink(text) {
  if (!text) return "";
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    let href = url.startsWith("http") ? url : "https://" + url;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
}
// ===== FORMAT TEXT (*bold*) =====
function formatText(text) {
  if (!text) return "";
  return text.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
}

// ====== NOTEPAD POPUP ======
async function openNotepad(fileId, title) {
  const { data, error } = await supabaseClient
    .from("files")
    .select("content")
    .eq("id", fileId)
    .single();

  if (error) return alert("Gagal membuka file: " + error.message);

  const popup = document.createElement("div");
  popup.className = "notepad-modal";

  const cleanContent = normalizeText(data?.content || "");

  popup.innerHTML = `
    <div class="notepad-box">
      <h3>📝 ${title}</h3>

      <div id="noteContent" class="preview" spellcheck="false">
  ${formatText(autoLink(data?.content || ""))}
</div>


      <div class="note-buttons">
        <button id="editBtn">Edit</button>
        <button id="saveBtn">Save</button>
        <button id="previewBtn">Preview</button>
        <button id="closeBtn">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  const contentDiv = popup.querySelector("#noteContent");
  const editBtn = popup.querySelector("#editBtn");
  const saveBtn = popup.querySelector("#saveBtn");
  const previewBtn = popup.querySelector("#previewBtn");
  const closeBtn = popup.querySelector("#closeBtn");

  let editing = false;

  editBtn.onclick = () => {
    editing = true;
    contentDiv.contentEditable = "true";
    contentDiv.classList.remove("preview");
    contentDiv.innerText = normalizeText(contentDiv.innerText);
    contentDiv.focus();
  };

  saveBtn.onclick = async () => {
    if (!editing) return alert("Aktifkan mode edit dulu.");

    let newContent = normalizeText(contentDiv.innerText);

    const { error: updateError } = await supabaseClient
      .from("files")
      .update({ content: newContent })
      .eq("id", fileId);

    if (updateError) return alert("❌ Gagal menyimpan: " + updateError.message);

    alert("✅ Konten berhasil disimpan!");

    contentDiv.contentEditable = "false";
    contentDiv.classList.add("preview");
    contentDiv.innerHTML = formatText(autoLink(newContent));
    editing = false;
  };

  previewBtn.onclick = () => {
    contentDiv.contentEditable = "false";
    contentDiv.classList.add("preview");
    contentDiv.innerHTML = formatText(autoLink(contentDiv.innerText));
    editing = false;
  };

  closeBtn.onclick = () => popup.remove();
}

// ====== CONTEXT MENU ======
function addContextInteraction(el, item) {
  if (sessionStorage.getItem("isAdmin") !== "true") return;

  if (!document.getElementById("contextMenu")) {
    const menu = document.createElement("div");
    menu.id = "contextMenu";
    menu.className = "context-menu";
    document.body.appendChild(menu);
    document.addEventListener("click", () => (menu.style.display = "none"));
  }

  const menu = document.getElementById("contextMenu");

  el.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.pageX, e.pageY, item);
  });

  function showContextMenu(x, y, item) {
    menu.innerHTML = `
      <button id="renameBtn">✏️ Rename</button>
      <button id="deleteBtn">🗑️ Delete</button>
      ${item.type === "file" ? `<button id="iconBtn">🖼️ Create Icon</button>` : ""}
    `;
    menu.style.display = "flex";
    menu.style.flexDirection = "column";
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    menu.querySelector("#renameBtn").onclick = () => renameItem(item);
    menu.querySelector("#deleteBtn").onclick = () => deleteItem(item);
    if (item.type === "file") {
      menu.querySelector("#iconBtn").onclick = () => createIcon(item);
    }
  }
}

// ====== CREATE ICON ======
async function createIcon(item) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.style.display = "none";
  document.body.appendChild(input);

  input.click();

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `${item.id}_${Date.now()}_${file.name}`;
    const filePath = `thumbnails/${fileName}`;

    try {
      await supabaseClient.storage
        .from("thumbnails")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      const { data } = supabaseClient.storage
        .from("thumbnails")
        .getPublicUrl(filePath);

      await supabaseClient
        .from("files")
        .update({ thumbnail_url: data.publicUrl })
        .eq("id", item.id);

      alert("✅ Icon berhasil ditambahkan!");
      loadAll();
    } catch (err) {
      alert("❌ Gagal upload gambar: " + err.message);
    }

    input.remove();
  };
}

// ====== RENAME ======
async function renameItem(item) {
  const newName = prompt(`Nama baru untuk ${item.name || item.title}:`, item.name || item.title);
  if (!newName) return;

  const table = item.type === "folder" ? "folders" : "files";
  const field = item.type === "folder" ? "name" : "title";

  await supabaseClient.from(table).update({ [field]: newName }).eq("id", item.id);
  loadAll();
}

// ====== DELETE ======
async function deleteItem(item) {
  if (!confirm(`Yakin ingin menghapus ${item.name || item.title}?`)) return;

  const table = item.type === "folder" ? "folders" : "files";
  await supabaseClient
    .from(table)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", item.id);

  loadAll();
}

// ====== FAB ======
fabBtn?.addEventListener("click", () => {
  const menu = document.createElement("div");
  menu.className = "fab-menu";
  menu.innerHTML = `
    <button id="addFolderBtn">📁</button>
    <button id="addFileBtn">📝</button>
  `;
  document.body.appendChild(menu);

  setTimeout(() => {
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && e.target !== fabBtn) menu.remove();
    }, { once: true });
  });

  document.getElementById("addFolderBtn").onclick = async () => {
    const nama = prompt("Nama folder baru:");
    if (!nama) return;
    await supabaseClient.from("folders").insert([{ name: nama, parent_id: currentFolderId }]);
    loadAll();
  };

  document.getElementById("addFileBtn").onclick = async () => {
    const judul = prompt("Judul file baru:");
    if (!judul) return;
    await supabaseClient.from("files").insert([{ title: judul, content: "", folder_id: currentFolderId }]);
    loadAll();
  };
});

// ====== NAVIGATION ======
function updateNavButtons() {
  backBtn.disabled = folderStack.length === 0;
  nextBtn.disabled = forwardStack.length === 0;
}

backBtn?.addEventListener("click", () => {
  if (!folderStack.length) return;
  forwardStack.push(currentFolderId);
  currentFolderId = folderStack.pop() || null;
  loadAll();
  updateNavButtons();
});

nextBtn?.addEventListener("click", () => {
  if (!forwardStack.length) return;
  folderStack.push(currentFolderId);
  currentFolderId = forwardStack.pop() || null;
  loadAll();
  updateNavButtons();
});
loadAll();
updateNavButtons();
