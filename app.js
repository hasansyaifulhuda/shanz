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
  title: $('#modal-title')
};

const modalContent = document.querySelector(".modal-content");
const adminToggle = document.getElementById("admin-toggle");

/* =======================
   🔐 ADMIN MODE (TAP 5x)
======================= */
let clickCount = 0;
let timer = null;

adminToggle.addEventListener("click", () => {
  clickCount++;

  if (clickCount === 1) {
    timer = setTimeout(() => {
      clickCount = 0;
    }, 700);
  }

  if (clickCount === 5) {
    clearTimeout(timer);
    clickCount = 0;

    toggleAdmin();
  }
});

/* =======================
   💻 ADMIN MODE (CTRL + Q)
======================= */
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === "q") {
    e.preventDefault();
    toggleAdmin();
  }
});

/* =======================
   🔁 TOGGLE ADMIN
======================= */
function toggleAdmin() {
  isAdmin = !isAdmin;
  document.body.classList.toggle("admin-mode", isAdmin);
  adminToggle.classList.toggle("active");
}

/* =======================
   SORT DATA
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
   LOAD DATA
======================= */
async function loadData() {
  const { data } = await supabase.from("accounts").select("*");
  accounts = sortData(data || []);
  DOM.loading.style.display = "none";
  render();
}

/* =======================
   RENDER
======================= */
function render() {
  DOM.list.innerHTML = "";

  // TOTAL
  document.getElementById("total-count").innerText = accounts.length;

  // SELESAI
  const checked = accounts.filter(a => a.checked).length;
  document.getElementById("checked-count").innerText = checked;

  const unchecked = accounts.filter(a => !a.checked).length;
document.getElementById("unchecked-count").innerText = unchecked;

  accounts.forEach(a => {
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

    /* ✏️ EDIT (klik kiri) */
    const content = card.querySelector(".card-content");
    content.onclick = () => {
      if (isAdmin) openModal(a);
    };

    /* ☑️ CHECKBOX */
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
   MODAL
======================= */
function openModal(data = null) {
  DOM.modal.classList.add("active");

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
}

/* =======================
   SAVE
======================= */
DOM.save.onclick = async () => {
  const id = DOM.id.value;
  const email = DOM.email.value;
  const password = DOM.password.value;

  if (!email || !password) return;

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