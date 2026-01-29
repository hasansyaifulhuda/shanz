/* ================== PROTEKSI ADMIN ================== */
if (!sessionStorage.getItem("admin")) {
  location.href = "index.html";
}

/* ================== STATE (ADMIN) ================== */
let treeData = JSON.parse(localStorage.getItem("treeData")) || [];
let pageData = JSON.parse(localStorage.getItem("pageData")) || {};
let selectedNode = null;
let activeMenuId = null;
let contextTarget = null;
let contextBlock = null;

/* ================== DOM ================== */
const tree = document.getElementById("tree");
const content = document.getElementById("content");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const fab = document.getElementById("fab");
const fabMenu = document.getElementById("fabMenu");
const sidebarActions = document.querySelector(".sidebar-actions");

/* ================== SIDEBAR ================== */
function toggleSidebar() {
  sidebar.classList.add("open");
  overlay.style.display = "block";
}
function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.style.display = "none";
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

  /* CONTEXT MENU (ADMIN) */
  let pressTimer;
  const openContext = e => {
    e.preventDefault();
    contextTarget = node;
    showSidebarMenu(e.pageX, e.pageY);
  };

  li.oncontextmenu = openContext;
  li.ontouchstart = e => {
    pressTimer = setTimeout(() => openContext(e.touches[0]), 500);
  };
  li.ontouchend = () => clearTimeout(pressTimer);

  if (node.type === "folder") {
    const ul = document.createElement("ul");
    ul.style.display = node.open ? "block" : "none";
    parent.appendChild(ul);

    li.onclick = () => {
      node.open = !node.open;
      ul.style.display = node.open ? "block" : "none";
      selectedNode = node;
    };

    node.children.forEach(c => renderNode(c, ul));
  }

  if (node.type === "menu") {
    li.onclick = () => {
      selectedNode = node;
      activeMenuId = node.id;
      ensurePage(node.id);
      renderPage(node.id);
      closeSidebar();
    };
  }
}

/* ================== SIDEBAR CONTEXT ================== */
function showSidebarMenu(x, y) {
  let menu = document.getElementById("sidebarMenu");
  if (!menu) {
    menu = document.createElement("div");
    menu.id = "sidebarMenu";
    menu.className = "context-menu";
    menu.innerHTML = `
      <button onclick="renameNode()">Rename</button>
      <button class="delete" onclick="deleteNode()">Delete</button>
    `;
    document.body.appendChild(menu);
  }
  menu.style.left = x + "px";
  menu.style.top = y + "px";
  menu.style.display = "block";
}

function renameNode() {
  const name = prompt("Nama baru", contextTarget.name);
  if (name) {
    contextTarget.name = name;
    renderTree();
  }
}

function deleteNode() {
  if (!confirm("Hapus item ini?")) return;

  function remove(arr) {
    return arr.filter(n => {
      if (n === contextTarget) return false;
      if (n.children) n.children = remove(n.children);
      return true;
    });
  }

  treeData = remove(treeData);
  if (contextTarget.id) delete pageData[contextTarget.id];
  renderTree();
  content.innerHTML = `<div class="empty">(Halaman kosong)</div>`;
}

/* ================== TREE ACTION ================== */
function addFolder() {
  const name = prompt("Nama folder");
  if (!name) return;
  treeData.push({ type: "folder", name, open: true, children: [] });
  renderTree();
}

function addMenu() {
  if (!selectedNode || selectedNode.type !== "folder")
    return alert("Pilih folder dulu");
  const name = prompt("Nama menu");
  if (!name) return;
  selectedNode.children.push({
    type: "menu",
    name,
    id: Date.now().toString()
  });
  renderTree();
}

/* ================== PAGE ================== */
function ensurePage(id) {
  if (!pageData[id]) pageData[id] = { blocks: [] };
}

/* ================== FAB ================== */
function toggleFabMenu() {
  fabMenu.style.display =
    fabMenu.style.display === "flex" ? "none" : "flex";
}

function getTargetMenuId() {
  if (selectedNode?.type === "menu") return selectedNode.id;
  return activeMenuId;
}

function addTitleBlock() {
  const id = getTargetMenuId();
  if (!id) return alert("Pilih menu dulu");
  ensurePage(id);
  pageData[id].blocks.push({ type: "title", value: "" });
  fabMenu.style.display = "none";
  renderPage(id);
}

function addDescBlock() {
  const id = getTargetMenuId();
  if (!id) return alert("Pilih menu dulu");
  ensurePage(id);
  pageData[id].blocks.push({ type: "desc", value: "" });
  fabMenu.style.display = "none";
  renderPage(id);
}

function addCodeBlock() {
  const id = getTargetMenuId();
  if (!id) return alert("Pilih menu dulu");
  ensurePage(id);
  pageData[id].blocks.push({ type: "code", value: "" });
  fabMenu.style.display = "none";
  renderPage(id);
}

/* ================== BLOCK CONTEXT ================== */
function showBlockMenu(x, y, menuId, index) {
  let menu = document.getElementById("blockMenu");
  contextBlock = { menuId, index };

  if (!menu) {
    menu = document.createElement("div");
    menu.id = "blockMenu";
    menu.className = "context-menu";
    menu.innerHTML = `
      <button class="delete" onclick="deleteBlock()">Delete</button>
    `;
    document.body.appendChild(menu);
  }
  menu.style.left = x + "px";
  menu.style.top = y + "px";
  menu.style.display = "block";
}

function deleteBlock() {
  const { menuId, index } = contextBlock;
  if (!confirm("Hapus block ini?")) return;
  pageData[menuId].blocks.splice(index, 1);
  renderPage(menuId);
}

document.addEventListener("click", () => {
  ["sidebarMenu", "blockMenu"].forEach(id => {
    const m = document.getElementById(id);
    if (m) m.style.display = "none";
  });
});

/* ================== RENDER PAGE (ADMIN) ================== */
function renderPage(id) {
  if (!id || !pageData[id]) {
    content.innerHTML = `<div class="empty">(Halaman kosong)</div>`;
    return;
  }

  let html = "";
  const blocks = pageData[id].blocks;

  blocks.forEach((b, i) => {
    const ctx = `
      oncontextmenu="event.preventDefault();showBlockMenu(event.pageX,event.pageY,'${id}',${i})"
      ontouchstart="this._t=setTimeout(()=>showBlockMenu(event.touches[0].pageX,event.touches[0].pageY,'${id}',${i}),500)"
      ontouchend="clearTimeout(this._t)"
    `;

    if (b.type === "title") {
      html += `<input ${ctx} class="title-input"
        value="${escapeHtml(b.value)}"
        oninput="pageData['${id}'].blocks[${i}].value=this.value">`;
    }

    if (b.type === "desc") {
      html += `<textarea ${ctx} class="desc-input"
        oninput="pageData['${id}'].blocks[${i}].value=this.value">${escapeHtml(b.value)}</textarea>`;
    }

    if (b.type === "code") {
      html += `<textarea ${ctx} class="code-input"
        oninput="pageData['${id}'].blocks[${i}].value=this.value">${escapeHtml(b.value)}</textarea>`;
    }
  });

  content.innerHTML = html;
}

/* ================== UTIL ================== */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ================== SAVE ================== */
function saveData() {
  localStorage.setItem("treeData", JSON.stringify(treeData));
  localStorage.setItem("pageData", JSON.stringify(pageData));
  alert("Tersimpan");
}

/* ================== LOGOUT ================== */
function logout() {
  sessionStorage.removeItem("admin");
  location.href = "index.html";
}
/* ================== START ================== */
renderTree();
