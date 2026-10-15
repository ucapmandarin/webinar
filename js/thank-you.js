/* Konfigurasi (SCRIPT_URL, WA_GROUP_URL) ada di js/config.js */
const WA_GROUP_URL = window.APP_CONFIG.WA_GROUP_URL;

document.getElementById("year").textContent = new Date().getFullYear();

// Ambil nama dari query string (?nama=...)
const params = new URLSearchParams(window.location.search);
const nama = (params.get("nama") || "").trim();

if (nama) {
  const lead = document.getElementById("leadText");
  lead.innerHTML = "Terima kasih, <strong>" + nama.replace(/[<>&]/g, "") +
    "</strong>! Kamu berhasil terdaftar di webinar UCAP MANDARIN. Data kamu sudah kami terima.";
  document.title = "Terima kasih, " + nama + " - UCAP MANDARIN";
}

// Tombol WhatsApp
const waBtn = document.getElementById("waBtn");
const waWarn = document.getElementById("waWarn");
if (WA_GROUP_URL.indexOf("PASTE_LINK") !== -1) {
  waBtn.setAttribute("href", "#");
  waBtn.addEventListener("click", function (e) {
    e.preventDefault();
    waWarn.classList.add("show");
  });
} else {
  waBtn.setAttribute("href", WA_GROUP_URL);
  waBtn.setAttribute("target", "_blank");
  waBtn.setAttribute("rel", "noopener");
}
