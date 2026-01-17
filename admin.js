const explorer = document.getElementById("explorer");
const logoutBtn = document.getElementById("logoutBtn");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");

/* ================= AUTH ================= */
if (sessionStorage.getItem("isAdmin") !== "true") {
  alert("Akses ditolak. Anda belum login sebagai admin.");
  location.href = "index.html";
}

logoutBtn?.addEventListener("click", () => {
  sessionStorage.removeItem("isAdmin");
  location.href = "index.html";
});

/* ================= STATE ================= */
let currentFolderId = null;
let folderStack = [];
let forwardStack = [];

/* ================= LOAD ================= */
async function loadAll() {
  explorer.innerHTML = "<p>Memuat data...</p>";

  let folderQuery = supabaseClient
    .from("folders")
    .select("*")
    .is("deleted_at", null);

  let fileQuery = supabaseClient
    .from("files")
    .select("*")
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

/* ================= LONG PRESS ================= */
function enableLongPress(el, callback) {
  let timer;
  el.addEventListener("touchstart", e => {
    timer = setTimeout(() => callback(e), 500);
  });
  el.addEventListener("touchend", () => clearTimeout(timer));
  el.addEventListener("touchmove", () => clearTimeout(timer));
}

/* ================= RENDER ================= */
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
      loadAll();
      updateNav();
    };

    addContext(el, f, "folder");
    enableLongPress(el, e => showContextMenu(el, f, "folder", e));
    explorer.appendChild(el);
  });

  files.forEach(f => {
    const el = document.createElement("div");
    el.className = f.thumbnail_url ? "file-card" : "file";

    el.innerHTML = f.thumbnail_url
      ? `<div class="thumb-wrapper">
           <img src="${f.thumbnail_url}" class="file-thumb">
         </div>
         <div class="file-title">${f.title}</div>`
      : `📝 ${f.title}`;

    el.onclick = () => openNotepad(f.id, f.title);
    addContext(el, f, "file");
    enableLongPress(el, e => showContextMenu(el, f, "file", e));
    explorer.appendChild(el);
  });
}

/* ================= CONTEXT MENU ================= */
function showContextMenu(el, item, type, e) {
  let menu = document.getElementById("contextMenu");
  if (!menu) {
    menu = document.createElement("div");
    menu.id = "contextMenu";
    menu.className = "context-menu";
    document.body.appendChild(menu);
    document.addEventListener("click", () => (menu.style.display = "none"));
  }

  menu.innerHTML = `
    <button id="rename">✏️ Rename</button>
    <button id="delete">🗑️ Delete</button>
    <button id="icon">🖼️ Create icon</button>
  `;

  const x = e.touches ? e.touches[0].pageX : e.pageX;
  const y = e.touches ? e.touches[0].pageY : e.pageY;
  menu.style.cssText = `display:flex;left:${x}px;top:${y}px`;

  menu.querySelector("#rename").onclick = () => rename(item, type);
  menu.querySelector("#delete").onclick = () => remove(item, type);
  menu.querySelector("#icon").onclick = () => createIcon(item, type);
}

function addContext(el, item, type) {
  el.oncontextmenu = e => {
    e.preventDefault();
    showContextMenu(el, item, type, e);
  };
}

/* ================= CRUD ================= */
async function rename(item, type) {
  const name = prompt("Nama baru:", item.name || item.title);
  if (!name) return;

  await supabaseClient
    .from(type === "folder" ? "folders" : "files")
    .update(type === "folder" ? { name } : { title: name })
    .eq("id", item.id);

  loadAll();
}

async function remove(item, type) {
  if (!confirm("Yakin hapus?")) return;

  await supabaseClient
    .from(type === "folder" ? "folders" : "files")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", item.id);

  loadAll();
}

/* ================= ICON ================= */
async function createIcon(item, type) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    const path = `thumbnails/${type}_${item.id}_${Date.now()}_${file.name}`;

    await supabaseClient.storage
      .from("thumbnails")
      .upload(path, file, { upsert: true });

    const { data } = supabaseClient.storage
      .from("thumbnails")
      .getPublicUrl(path);

    await supabaseClient
      .from(type === "folder" ? "folders" : "files")
      .update({ thumbnail_url: data.publicUrl })
      .eq("id", item.id);

    loadAll();
  };

  input.click();
}
//notepad//
function renderContentToHTML(text) {
  if (!text) return "";

  // escape HTML
  let safe = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // linkify
  safe = safe.replace(
    /(https?:\/\/[^\s<]+)/g,
    `<a href="$1" target="_blank">$1</a>`
  );

  // newline -> <br>
  return safe.replace(/\n/g, "<br>");
}


async function openNotepad(id, title) {
  const { data } = await supabaseClient
    .from("files")
    .select("content")
    .eq("id", id)
    .single();

  const modal = document.createElement("div");
  modal.className = "notepad-modal";

  modal.innerHTML = `
    <div class="notepad-box">
      <h3>📝 ${title}</h3>

      <div class="notepad-view"></div>

      <textarea class="notepad-editor" style="display:none;"></textarea>

      <div class="notepad-actions">
        <button class="btn-edit">Edit</button>
        <button class="btn-save" style="display:none;">Save</button>
        <button class="btn-close">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const view = modal.querySelector(".notepad-view");
  const editor = modal.querySelector(".notepad-editor");
  const btnEdit = modal.querySelector(".btn-edit");
  const btnSave = modal.querySelector(".btn-save");
  const btnClose = modal.querySelector(".btn-close");

  // VIEW MODE — 1:1 dengan textarea
const raw = data?.content || "";

view.innerHTML = raw
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\n/g, "<br>")
  .replace(
    /(https?:\/\/[^\s<]+)/g,
    `<a href="$1" target="_blank">$1</a>`
  );
function renderTextPreserveFormat(text) {
  if (!text) return "";

  // escape HTML dulu (AMAN)
  let escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // ubah URL jadi <a>
  escaped = escaped.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank">$1</a>'
  );

  // preserve newline
  return escaped.replace(/\n/g, "<br>");
}



  editor.value = data?.content || "";

  btnEdit.onclick = () => {
    view.style.display = "none";
    editor.style.display = "block";
    btnEdit.style.display = "none";
    btnSave.style.display = "inline-block";
  };

  btnSave.onclick = async () => {
    const newContent = editor.value;

    await supabaseClient
      .from("files")
      .update({ content: newContent })
      .eq("id", id);

    view.innerHTML = newContent.replace(
      /(https?:\/\/[^\s]+)/g,
      `<a href="$1" target="_blank">$1</a>`
    );

    editor.style.display = "none";
    view.style.display = "block";
    btnSave.style.display = "none";
    btnEdit.style.display = "inline-block";
  };

  btnClose.onclick = () => modal.remove();
}

/* ================= FAB MENU ================= */
const fabMain = document.getElementById("fab-main");
const fabMenu = document.getElementById("fab-menu");

fabMain?.addEventListener("click", () => {
  fabMenu.classList.toggle("show");
});

document.getElementById("fab-folder")?.addEventListener("click", async () => {
  const name = prompt("Nama folder:");
  if (name) {
    await supabaseClient.from("folders").insert({
      name,
      parent_id: currentFolderId
    });
    loadAll();
  }
});

document.getElementById("fab-file")?.addEventListener("click", async () => {
  const title = prompt("Judul file:");
  if (title) {
    await supabaseClient.from("files").insert({
      title,
      content: "",
      folder_id: currentFolderId
    });
    loadAll();
  }
});


/* ================= NAV (SAFE) ================= */
function updateNav() {
  if (backBtn) backBtn.disabled = !folderStack.length;
  if (nextBtn) nextBtn.disabled = !forwardStack.length;
}

backBtn?.addEventListener("click", () => {
  if (!folderStack.length) return;
  forwardStack.push(currentFolderId);
  currentFolderId = folderStack.pop();
  loadAll();
  updateNav();
});

nextBtn?.addEventListener("click", () => {
  if (!forwardStack.length) return;
  folderStack.push(currentFolderId);
  currentFolderId = forwardStack.pop();
  loadAll();
  updateNav();
});

loadAll();
updateNav();
