/* =====================================================
   Anti Inspect (best-effort) - hanya menambah, tidak mengubah kode lama.
   - Blokir klik kanan (kecuali di dalam kolom form agar paste tetap bisa).
   - Blokir shortcut DevTools / view source / save.
   - Matikan lewat js/config.js: NO_INSPECT: false
   CATATAN: ini hanya penghalang, bukan proteksi nyata.
   ===================================================== */
(function () {
  const cfg = window.APP_CONFIG || {};
  if (cfg.NO_INSPECT === false) return;

  /* ---- Blokir klik kanan ---- */
  document.addEventListener("contextmenu", function (e) {
    const el = e.target;
    const tag = (el && el.tagName ? el.tagName : "").toLowerCase();
    const isFormField =
      tag === "input" || tag === "textarea" || tag === "select" ||
      (el && el.isContentEditable);
    if (isFormField) return; // biarkan klik kanan di kolom form (untuk paste)
    e.preventDefault();
  });

  /* ---- Blokir shortcut DevTools / view source / save ---- */
  document.addEventListener("keydown", function (e) {
    const key = (e.key || "").toLowerCase();
    const mod = e.ctrlKey || e.metaKey; // Ctrl (Win/Linux) atau Cmd (Mac)

    // F12
    if (e.key === "F12") {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (mod && e.shiftKey) {
      // Ctrl/Cmd + Shift + I / J / C / K / E
      if (["i", "j", "c", "k", "e"].indexOf(key) !== -1) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }

    if (mod && !e.shiftKey && !e.altKey) {
      // Ctrl/Cmd + U (view source), Ctrl/Cmd + S (save)
      if (key === "u" || key === "s") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }
  }, true);
})();
