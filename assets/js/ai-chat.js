document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("aiFloatBtn");
  const sidebar = document.getElementById("aiSidebar");
  const overlay = document.getElementById("aiOverlay");
  const close = document.getElementById("aiClose");
  const send = document.getElementById("aiSend");
  const input = document.getElementById("aiPrompt");

  if (!btn) return; // safety

  btn.onclick = () => {
    sidebar.classList.add("open");
    overlay.classList.add("open");
    input.focus();
  };

  function closeAI() {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
  }

  overlay.onclick = closeAI;
  close.onclick = closeAI;

  send.onclick = sendAI;
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendAI();
  });
});

function sendAI() {
  const input = document.getElementById("aiPrompt");
  const box = document.getElementById("aiMessages");
  const text = input.value.trim();
  if (!text) return;

  box.innerHTML += `<div><b>Kamu:</b> ${text}</div>`;
  input.value = "";

  // sementara dummy
  box.innerHTML += `<div><b>AI:</b> (respon dari Gemini)</div>`;
  box.scrollTop = box.scrollHeight;
}
