/* =====================================================
   KONFIGURASI GLOBAL - cukup edit di file ini saja
   ===================================================== */
window.APP_CONFIG = {

  // URL Web App Apps Script (lihat README.md langkah 3)
  // Contoh: "https://script.google.com/macros/s/AKfycb.../exec"
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzbju2QZ8tWe_zIVpa6pkkWdnBWsWXDIYhlkL4-le_APUDp_DlXl4kWfSPsQ6jmjQKP/exec",

  // Link grup WhatsApp untuk tombol di halaman terima kasih
  // Contoh: "https://chat.whatsapp.com/XXXXXXXXXXXXXXXXXXXX"
  WA_GROUP_URL: "https://chat.whatsapp.com/EceDxAWqgYzGItWbVhJkB8?s=cl&p=i&mlu=0&ilr=4&iam=0",

  // Waktu mulai webinar (untuk COUNTDOWN). Format: DD/MM/YYYY HH:mm (waktu WIB).
  // Contoh: "31/12/2026 19:00"
  WEBINAR_DATE: "24/10/2026 13:00",

  // Info yang tampil di halaman registrasi (icon + teks). Bisa diubah bebas.
  WEBINAR_INFO: [
    { icon: "📅", text: "Sabtu, 24 Oktober 2026" },
    { icon: "🕐", text: "13:00 - 14:30 WIB" },
    { icon: "💻", text: "Online via Zoom" }
  ],

  // Tombol bantuan WhatsApp (floating, pojok kanan bawah semua halaman).
  // Isi nomor: boleh "08xxxxxxxxxx" atau "628xxxxxxxxxx".
  // Selama masih placeholder di bawah, tombol tidak akan muncul.
  WA_HELP_NUMBER: "6282123452163",
  WA_HELP_MESSAGE: "Halo UCAP MANDARIN, saya butuh bantuan pendaftaran webinar.",

  // Proteksi anti inspect (best-effort). false = matikan.
  NO_INSPECT: true

};