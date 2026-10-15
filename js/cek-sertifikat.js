/* Konfigurasi (SCRIPT_URL, WA_GROUP_URL) ada di js/config.js */
const SCRIPT_URL = window.APP_CONFIG.SCRIPT_URL;

const form = document.getElementById("certForm");
const btn = document.getElementById("checkBtn");
const btnLabel = btn.querySelector(".btn-label");
const notice = document.getElementById("notice");
const result = document.getElementById("result");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");
const downloadBtn = document.getElementById("downloadBtn");

document.getElementById("year").textContent = new Date().getFullYear();

function showNotice(type, msg) {
  notice.className = "notice show " + type;
  notice.textContent = msg;
}

function clearErrors() {
  form.querySelectorAll(".invalid").forEach(function (el) { el.classList.remove("invalid"); });
  form.querySelectorAll(".error-text.show").forEach(function (el) { el.classList.remove("show"); });
}

function setError(name) {
  const el = form.elements[name];
  if (el) {
    el.classList.add("invalid");
    const px = form.querySelector('.error-text[data-for="' + name + '"]');
    if (px) px.classList.add("show");
  }
}

function hideResult() {
  result.className = "result";
}

function showResult(kind, icon, title, html) {
  result.className = "result show " + kind;
  result.querySelector(".result-icon").innerHTML = icon;
  resultTitle.textContent = title;
  resultText.innerHTML = html;
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  clearErrors();
  hideResult();
  notice.className = "notice";

  const email = form.email.value.trim();
  let ok = true;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("email"); ok = false; }

  if (!ok) {
    showNotice("error", "Mohon isi email dengan benar.");
    return;
  }

  if (SCRIPT_URL.indexOf("PASTE_URL") !== -1) {
    showNotice("error", "URL Apps Script belum diatur. Hubungi admin.");
    return;
  }

  btn.disabled = true;
  btn.classList.add("loading");
  btnLabel.textContent = "Mencari...";

  try {
    const url = SCRIPT_URL +
      "?action=cert" +
      "&email=" + encodeURIComponent(email) +
      "&t=" + Date.now();

    const res = await fetch(url);
    const data = await res.json();

    if (data && data.status === "success" && data.found) {
      const safeName = String(data.nama || "").replace(/[<>&]/g, "");
      const greeting = safeName ? "Hai <strong>" + safeName + "</strong>, " : "";
      if (data.link) {
        downloadBtn.setAttribute("href", data.link);
        showResult(
          "success",
          "&#127942;",
          "Sertifikat Ditemukan!",
          greeting + "sertifikatmu sudah siap. Klik tombol di bawah untuk membuka atau mengunduhnya."
        );
      } else {
        showResult(
          "pending",
          "&#9203;",
          "Sertifikat Belum Tersedia",
          greeting + "data kamu terdaftar, tetapi link sertifikat belum diunggah. Silakan cek kembali nanti."
        );
      }
    } else {
      showNotice(
        "error",
        (data && data.message) ? data.message : "Email tidak ditemukan. Pastikan sama dengan saat mendaftar."
      );
    }
  } catch (err) {
    showNotice("error", "Maaf, terjadi kesalahan saat mencari data. Silakan coba lagi. (" + err.message + ")");
  } finally {
    btn.disabled = false;
    btn.classList.remove("loading");
    btnLabel.textContent = "Cek Sertifikat";
  }
});
