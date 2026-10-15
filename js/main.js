/* Konfigurasi (SCRIPT_URL, WA_GROUP_URL) ada di js/config.js */
const SCRIPT_URL = window.APP_CONFIG.SCRIPT_URL;

const form = document.getElementById("regForm");
const btn = document.getElementById("submitBtn");
const btnLabel = btn.querySelector(".btn-label");
const notice = document.getElementById("notice");
document.getElementById("year").textContent = new Date().getFullYear();

function showNotice(type, msg) {
  notice.className = "notice show " + type;
  notice.textContent = msg;
}

function clearErrors() {
  form.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));
  form.querySelectorAll(".error-text.show").forEach(el => el.classList.remove("show"));
}

function setError(name) {
  const field = form.elements[name];
  if (field) {
    const el = field.length ? field[0] : field;
    el.classList.add("invalid");
    const px = form.querySelector('.error-text[data-for="' + name + '"]');
    if (px) px.classList.add("show");
  }
}

function validate() {
  clearErrors();
  let ok = true;

  const nama = form.nama.value.trim();
  const hp = form.hp.value.trim();
  const email = form.email.value.trim();
  const umur = parseInt(form.umur.value, 10);
  const domisili = form.domisili.value.trim();
  const motivasi = form.motivasi.value.trim();

  if (!nama) { setError("nama"); ok = false; }
  if (!/^[0-9+\-\s()]{9,}$/.test(hp)) { setError("hp"); ok = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("email"); ok = false; }
  if (!umur || umur < 5 || umur > 100) { setError("umur"); ok = false; }
  if (!domisili) { setError("domisili"); ok = false; }
  if (!form.pekerjaan.value) { setError("pekerjaan"); ok = false; }
  if (!motivasi) { setError("motivasi"); ok = false; }
  if (!form.querySelector('input[name="kursus"]:checked')) { setError("kursus"); ok = false; }
  if (!form.sumber.value) { setError("sumber"); ok = false; }

  return ok;
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (registrationClosed) {
    showNotice("info", "Pendaftaran sudah ditutup karena webinar telah dimulai.");
    return;
  }

  if (!validate()) {
    showNotice("error", "Mohon lengkapi data yang masih kosong / belum valid.");
    const firstErr = form.querySelector(".invalid");
    if (firstErr) { firstErr.scrollIntoView({ behavior: "smooth", block: "center" }); firstErr.focus?.(); }
    return;
  }

  if (SCRIPT_URL.indexOf("PASTE_URL") !== -1) {
    showNotice("error", "URL Apps Script belum diatur. Hubungi admin.");
    return;
  }

  const data = {
    timestamp: new Date().toISOString(),
    nama: form.nama.value.trim(),
    hp: form.hp.value.trim(),
    email: form.email.value.trim(),
    umur: form.umur.value.trim(),
    domisili: form.domisili.value.trim(),
    pekerjaan: form.pekerjaan.value,
    motivasi: form.motivasi.value.trim(),
    kursus: form.querySelector('input[name="kursus"]:checked').value,
    sumber: form.sumber.value,
    website: form.website.value
  };

  btn.disabled = true;
  btn.classList.add("loading");
  btnLabel.textContent = "Mengirim...";
  notice.className = "notice";

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      // text/plain menghindari preflight CORS yang tidak didukung Apps Script
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (result && result.status === "success") {
      showNotice("success", "Pendaftaran berhasil! Mengarahkan ke halaman konfirmasi...");
      form.reset();
      window.location.href = "thank-you.html?nama=" + encodeURIComponent(data.nama);
    } else {
      throw new Error(result && result.message ? result.message : "Gagal mengirim data.");
    }
  } catch (err) {
    showNotice("error", "Maaf, terjadi kesalahan. Silakan coba lagi. (" + err.message + ")");
  } finally {
    btn.disabled = false;
    btn.classList.remove("loading");
    btnLabel.textContent = "Daftar Sekarang";
  }
});

/* ---------- Info webinar (dari config) ---------- */
(function () {
  const cfg = window.APP_CONFIG || {};
  const meta = document.getElementById("heroMeta");
  if (!meta || !Array.isArray(cfg.WEBINAR_INFO) || !cfg.WEBINAR_INFO.length) return;

  meta.innerHTML = "";
  cfg.WEBINAR_INFO.forEach(function (item) {
    const chip = document.createElement("div");
    chip.className = "meta-chip";
    const ico = document.createElement("span");
    ico.className = "ico";
    ico.textContent = item.icon || "";
    chip.appendChild(ico);
    chip.appendChild(document.createTextNode(" " + (item.text || "")));
    meta.appendChild(chip);
  });
})();

/* ---------- Parse tanggal webinar (format Indonesia, asumsi WIB) ---------- */
const NAMA_BULAN = {
  januari: 0, jan: 0,
  februari: 1, feb: 1,
  maret: 2, mar: 2,
  april: 3, apr: 3,
  mei: 4,
  juni: 5, jun: 5,
  juli: 6, jul: 6,
  agustus: 7, agu: 7, agt: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  oktober: 9, okt: 9,
  november: 10, nov: 10,
  desember: 11, des: 11, dec: 11
};

function parseWebinarDate(input) {
  if (!input) return null;
  const str = String(input).trim();
  if (!str) return null;

  // ISO 8601 lengkap (dengan T + zona waktu / Z) -> langsung
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str) && /(?:Z|[+-]\d{2}:?\d{2})$/.test(str)) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  const s = str.toLowerCase()
    .replace(/\bpukul\b/g, " ")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let y, mon, day, hh = 0, mm = 0;
  let m;

  // 2026-12-15 19:00
  if ((m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:\s+(\d{1,2})[:.](\d{2}))?$/))) {
    y = +m[1]; mon = +m[2] - 1; day = +m[3];
    if (m[4]) { hh = +m[4]; mm = +m[5] || 0; }
  }
  // 15-12-2026 19:00
  else if ((m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:\s+(\d{1,2})[:.](\d{2}))?$/))) {
    day = +m[1]; mon = +m[2] - 1; y = +m[3];
    if (m[4]) { hh = +m[4]; mm = +m[5] || 0; }
  }
  // 15 desember 2026 19:00
  else if ((m = s.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})(?:\s+(\d{1,2})[:.](\d{2}))?$/))) {
    day = +m[1]; mon = NAMA_BULAN[m[2]]; y = +m[3];
    if (mon === undefined) return null;
    if (m[4]) { hh = +m[4]; mm = +m[5] || 0; }
  }
  else {
    return null;
  }

  // Dibangun sebagai waktu WIB (UTC+7) agar sama untuk semua pengunjung
  const ms = Date.UTC(y, mon, day, hh, mm) - (7 * 60 * 60 * 1000);
  const d = new Date(ms);
  return isNaN(d.getTime()) ? null : d;
}

/* ---------- Tutup pendaftaran saat webinar dimulai ---------- */
const WEBINAR_TARGET = parseWebinarDate(window.APP_CONFIG && window.APP_CONFIG.WEBINAR_DATE);

let registrationClosed = false;
function closeRegistration() {
  if (registrationClosed) return;
  registrationClosed = true;

  form.querySelectorAll("input, select, textarea, button").forEach(function (el) {
    el.disabled = true;
  });

  btn.classList.remove("loading");
  btnLabel.textContent = "Pendaftaran Ditutup";
  showNotice("info", "Pendaftaran sudah ditutup karena webinar telah dimulai. Terima kasih atas antusiasme kamu!");
}

if (WEBINAR_TARGET && Date.now() >= WEBINAR_TARGET.getTime()) {
  closeRegistration();
}

/* ---------- Countdown webinar ---------- */
(function () {
  const el = document.getElementById("countdown");
  if (!el || !WEBINAR_TARGET) return;

  const target = WEBINAR_TARGET;
  const boxes = el.querySelector(".countdown-boxes");
  const title = el.querySelector(".countdown-title");
  const dEl = document.getElementById("cd-days");
  const hEl = document.getElementById("cd-hours");
  const mEl = document.getElementById("cd-mins");
  const sEl = document.getElementById("cd-secs");

  let timer = null;

  function pad(n) { return String(n).padStart(2, "0"); }

  function render() {
    const diff = target.getTime() - Date.now();

    if (diff <= 0) {
      el.hidden = false;
      if (boxes) boxes.style.display = "none";
      title.textContent = "Webinar telah dimulai";
      title.classList.add("countdown-live");
      closeRegistration();
      if (timer) clearInterval(timer);
      return;
    }

    const totalSec = Math.floor(diff / 1000);
    dEl.textContent = pad(Math.floor(totalSec / 86400));
    hEl.textContent = pad(Math.floor((totalSec % 86400) / 3600));
    mEl.textContent = pad(Math.floor((totalSec % 3600) / 60));
    sEl.textContent = pad(totalSec % 60);
    el.hidden = false;
  }

  render();
  timer = setInterval(render, 1000);
})();
