import { supabase } from "./supabase.js";

const $ = (s) => document.querySelector(s);

let accounts = [];
let isAdmin = false;

const DOM = {
  list: $('#list-container'),
  loading: $('#loading'),
  fab: $('#fab'),
  modal: $('#modal'),
  email: $('#email-input'),
  password: $('#password-input'),
  id: $('#item-id'),
  save: $('#btn-save'),
  cancel: $('#btn-cancel'),
  del: $('#btn-delete'),
  title: $('#modal-title'),
  search: $('#search-input')
};

const modalContent = document.querySelector(".modal-content");
const adminToggle = document.getElementById("admin-toggle");

/* =======================
   🔐 ADMIN MODE
======================= */
let clickCount = 0;
let timer = null;

adminToggle.addEventListener("click", () => {
  clickCount++;

  if (clickCount === 1) {
    timer = setTimeout(() => clickCount = 0, 700);
  }

  if (clickCount === 5) {
    clearTimeout(timer);
    clickCount = 0;
    toggleAdmin();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === "q") {
    e.preventDefault();
    toggleAdmin();
  }
});

function toggleAdmin() {
  isAdmin = !isAdmin;
  document.body.classList.toggle("admin-mode", isAdmin);
  adminToggle.classList.toggle("active");
}

/* =======================
   SORT
======================= */
function sortData(data) {
  return data.sort((a, b) => {
    if (a.checked === b.checked) {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    return a.checked ? 1 : -1;
  });
}

/* =======================
   LOAD
======================= */
async function loadData() {
  const { data } = await supabase.from("accounts").select("*");
  accounts = sortData(data || []);
  DOM.loading.style.display = "none";
  render();
}

/* =======================
   🔍 DUPLICATE CHECK
======================= */
function isDuplicate(email, currentId = null) {
  return accounts.some(a => 
    a.email.toLowerCase() === email.toLowerCase() &&
    a.id !== currentId
  );
}

/* =======================
   ⚠️ WARNING UI
======================= */
function showWarning(msg) {
  let warn = document.getElementById("warning");

  if (!warn) {
    warn = document.createElement("div");
    warn.id = "warning";
    warn.style.color = "#ef4444";
    warn.style.fontSize = "13px";
    warn.style.marginTop = "6px";
    DOM.email.after(warn);
  }

  warn.innerText = msg;
}

function clearWarning() {
  const warn = document.getElementById("warning");
  if (warn) warn.remove();
}

/* =======================
   👀 REALTIME CHECK
======================= */
DOM.email.addEventListener("input", () => {
  const email = DOM.email.value.trim();
  const id = DOM.id.value;

  if (!email) {
    clearWarning();
    DOM.save.disabled = false;
    return;
  }

  if (isDuplicate(email, id)) {
    showWarning("⚠️ Email sudah ada!");
    DOM.save.disabled = true;
  } else {
    clearWarning();
    DOM.save.disabled = false;
  }
});

/* =======================
   RENDER + SEARCH
======================= */
function render() {
  DOM.list.innerHTML = "";

  const keyword = DOM.search.value.toLowerCase();

  const filtered = accounts.filter(a =>
    a.email.toLowerCase().includes(keyword)
  );

  document.getElementById("total-count").innerText = accounts.length;

  const checked = accounts.filter(a => a.checked).length;
  document.getElementById("checked-count").innerText = checked;

  const unchecked = accounts.filter(a => !a.checked).length;
  document.getElementById("unchecked-count").innerText = unchecked;

  filtered.forEach(a => {
    const card = document.createElement("div");
    card.className = "card " + (a.checked ? "checked" : "");

    card.innerHTML = `
      <div class="card-content">
        <div class="email">${a.email}</div>
        <div class="password">${"•".repeat(a.password.length)}</div>
      </div>
      <div class="checkbox-container">
        <input type="checkbox" ${a.checked ? "checked" : ""}>
      </div>
    `;

    const content = card.querySelector(".card-content");
    content.onclick = () => {
      if (isAdmin) openModal(a);
    };

    const checkbox = card.querySelector("input");
    checkbox.onchange = async (e) => {
      a.checked = e.target.checked;

      await supabase
        .from("accounts")
        .update({ checked: a.checked })
        .eq("id", a.id);

      loadData();
    };

    DOM.list.appendChild(card);
  });
}

/* =======================
   SEARCH
======================= */
DOM.search.addEventListener("input", render);

/* =======================
   MODAL
======================= */
function openModal(data = null) {
  DOM.modal.classList.add("active");
  clearWarning();

  if (data) {
    modalContent.classList.remove("add-mode");

    DOM.title.innerText = "Edit Data";
    DOM.id.value = data.id;
    DOM.email.value = data.email;
    DOM.password.value = data.password;

  } else {
    modalContent.classList.add("add-mode");

    DOM.title.innerText = "Tambah Data";
    DOM.id.value = "";
    DOM.email.value = "";
    DOM.password.value = "";
  }
}

function closeModal() {
  DOM.modal.classList.remove("active");
  clearWarning();
}

/* =======================
   SAVE
======================= */
DOM.save.onclick = async () => {
  const id = DOM.id.value;
  const email = DOM.email.value.trim();
  const password = DOM.password.value;

  if (!email || !password) return;

  if (isDuplicate(email, id)) {
    showWarning("⚠️ Email sudah terdaftar!");
    return;
  }

  if (id) {
    await supabase
      .from("accounts")
      .update({ email, password })
      .eq("id", id);
  } else {
    await supabase
      .from("accounts")
      .insert([{ email, password }]);
  }

  closeModal();
  loadData();
};

/* =======================
   DELETE
======================= */
DOM.del.onclick = async () => {
  await supabase
    .from("accounts")
    .delete()
    .eq("id", DOM.id.value);

  closeModal();
  loadData();
};

DOM.cancel.onclick = closeModal;

/* =======================
   FAB
======================= */
DOM.fab.onclick = () => openModal();

/* =======================
   INIT
======================= */
document.addEventListener("DOMContentLoaded", loadData);