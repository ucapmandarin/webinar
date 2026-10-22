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
const reviewForm = document.getElementById("reviewForm");
const reviewBtn = document.getElementById("reviewBtn");
const reviewBtnLabel = reviewBtn.querySelector(".btn-label");
const ratingEl = document.getElementById("rating");
const reviewStatus = document.getElementById("reviewStatus");

let selectedRating = 0;
let currentEmail = "";
let currentName = "";

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

function renderRating(value) {
  selectedRating = value;
  ratingEl.querySelectorAll(".star").forEach(function (star) {
    star.classList.toggle("active", Number(star.getAttribute("data-value")) <= value);
    star.setAttribute("aria-checked", Number(star.getAttribute("data-value")) === value ? "true" : "false");
  });
}

function resetReviewForm() {
  selectedRating = 0;
  reviewForm.elements.review.value = "";
  reviewStatus.textContent = "";
  reviewForm.querySelectorAll(".invalid").forEach(function (el) { el.classList.remove("invalid"); });
  reviewForm.querySelectorAll(".error-text.show").forEach(function (el) { el.classList.remove("show"); });
  renderRating(0);
}

function setReviewError(name) {
  const el = reviewForm.elements[name];
  if (el) {
    el.classList.add("invalid");
    const px = reviewForm.querySelector('.error-text[data-for="' + name + '"]');
    if (px) px.classList.add("show");
  }
}

function setReviewVisible(visible) {
  reviewForm.classList.toggle("show", visible);
}

function setDownloadVisible(visible) {
  downloadBtn.style.display = visible ? "inline-flex" : "none";
}

ratingEl.querySelectorAll(".star").forEach(function (star) {
  star.addEventListener("click", function () {
    renderRating(Number(star.getAttribute("data-value")));
    const err = reviewForm.querySelector('.error-text[data-for="rating"]');
    if (err) err.classList.remove("show");
  });
});

reviewForm.elements.review.addEventListener("input", function () {
  reviewForm.elements.review.classList.remove("invalid");
  const err = reviewForm.querySelector('.error-text[data-for="review"]');
  if (err) err.classList.remove("show");
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  clearErrors();
  hideResult();
  notice.className = "notice";
  setReviewVisible(false);
  setDownloadVisible(false);
  resetReviewForm();

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
        setDownloadVisible(true);
        setReviewVisible(false);
        showResult(
          "success",
          "&#127942;",
          "Sertifikat Ditemukan!",
          greeting + "sertifikatmu sudah siap. Klik tombol di bawah untuk membuka atau mengunduhnya."
        );
      } else if (data.needReview) {
        currentEmail = email;
        currentName = data.nama || "";
        resetReviewForm();
        showResult(
          "success",
          "&#127942;",
          "Sertifikat Siap!",
          greeting + "berikan review webinar dulu. Setelah review dikirim, tombol download akan langsung muncul."
        );
        setDownloadVisible(false);
        setReviewVisible(true);
      } else {
        setDownloadVisible(false);
        setReviewVisible(false);
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

reviewForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  reviewStatus.textContent = "";

  let ok = true;
  const errRating = reviewForm.querySelector('.error-text[data-for="rating"]');
  const reviewText = reviewForm.elements.review.value.trim();

  if (!selectedRating) {
    if (errRating) errRating.classList.add("show");
    ok = false;
  }
  if (!reviewText) {
    setReviewError("review");
    ok = false;
  }
  if (!ok) return;

  reviewBtn.disabled = true;
  reviewBtn.classList.add("loading");
  reviewBtnLabel.textContent = "Mengirim review...";

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      // text/plain menghindari preflight CORS yang tidak didukung Apps Script
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "review",
        email: currentEmail,
        nama: currentName,
        rating: selectedRating,
        review: reviewText
      })
    });
    const data = await res.json();

    if (data && data.status === "success" && data.link) {
      downloadBtn.setAttribute("href", data.link);
      setReviewVisible(false);
      setDownloadVisible(true);
      const safeName = String(currentName || "").replace(/[<>&]/g, "");
      const greeting = safeName ? "Hai <strong>" + safeName + "</strong>, " : "";
      resultTitle.textContent = "Sertifikat Ditemukan!";
      resultText.innerHTML = greeting + "terima kasih! Review kamu sudah terkirim. Silakan buka atau download sertifikatmu.";
      downloadBtn.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      throw new Error(data && data.message ? data.message : "Gagal mengirim review.");
    }
  } catch (err) {
    reviewStatus.textContent = "Maaf, review gagal dikirim. Silakan coba lagi. (" + err.message + ")";
  } finally {
    reviewBtn.disabled = false;
    reviewBtn.classList.remove("loading");
    reviewBtnLabel.textContent = "Kirim Review & Buka Download";
  }
});
