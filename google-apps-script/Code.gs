/**
 * UCAP MANDARIN - Backend Registrasi Webinar & Cek Sertifikat
 * Google Apps Script Web App untuk:
 *  - menerima data pendaftaran dari index.html  (doPost)
 *  - mengecek link sertifikat dari cek-sertifikat.html (doGet?action=cert)
 *
 * Cara pakai singkat (detail lihat README.md):
 *  1. Buat Google Spreadsheet baru.
 *  2. Extensions > Apps Script, hapus isi Code.gs, tempel file ini.
 *  3. Deploy > New deployment > Type: Web app
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  4. Copy URL /exec, tempel ke js/config.js (SCRIPT_URL).
 *
 * CATATAN: kolom "Link Sertifikat" diisi manual oleh admin setelah webinar.
 */

var SHEET_NAME = "Registrasi";

var COL_TS = "Timestamp";
var COL_NAMA = "Nama";
var COL_HP = "No.Hp (Whatsapp)";
var COL_EMAIL = "Email";
var COL_UMUR = "Umur";
var COL_DOMISILI = "Asal Domisili";
var COL_PEKERJAAN = "Pekerjaan";
var COL_MOTIVASI = "Motivasi belajar Mandarin";
var COL_KURSUS = "Apakah pernah mengikuti kursus bahasa Mandarin?";
var COL_SUMBER = "Dari mana kamu menemukan informasi webinar?";
var COL_SERTIFIKAT = "Link Sertifikat";

var HEADERS = [
  COL_TS,
  COL_NAMA,
  COL_HP,
  COL_EMAIL,
  COL_UMUR,
  COL_DOMISILI,
  COL_PEKERJAAN,
  COL_MOTIVASI,
  COL_KURSUS,
  COL_SUMBER,
  COL_SERTIFIKAT
];

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  ensureHeaders_(sheet);
  return sheet;
}

/** Pastikan baris header lengkap (tambahkan kolom yang belum ada). */
function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    styleHeader_(sheet);
    return;
  }
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var existing = sheet.getRange(1, 1, 1, lastCol).getValues()[0]
    .map(function (h) { return String(h).trim(); });
  var missing = HEADERS.filter(function (h) { return existing.indexOf(h) === -1; });
  if (missing.length) {
    sheet.getRange(1, existing.length + 1, 1, missing.length).setValues([missing]);
    styleHeader_(sheet);
  }
}

function styleHeader_(sheet) {
  var cols = Math.max(sheet.getLastColumn(), HEADERS.length);
  sheet.getRange(1, 1, 1, cols)
    .setFontWeight("bold")
    .setBackground("#16305E")
    .setFontColor("#FFFFFF");
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 170);
  sheet.setColumnWidth(2, 180);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 200);
  sheet.setColumnWidth(8, 260);
  sheet.setColumnWidth(9, 240);
  sheet.setColumnWidth(10, 240);
  sheet.setColumnWidth(11, 260);
}

/** Peta nama kolom -> indeks (0-based). */
function headerIndex_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0]
    .map(function (h) { return String(h).trim(); });
  var map = {};
  headers.forEach(function (h, i) { map[h] = i; });
  return map;
}

/* ============================ POST (pendaftaran) ============================ */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return jsonOut_({ status: "error", message: "Server sedang sibuk, coba lagi." });
  }

  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }

    // Honeypot: jika terisi, anggap spam dan tolak diam-diam
    if (body.website && String(body.website).trim() !== "") {
      return jsonOut_({ status: "success", message: "OK" });
    }

    var nama = String(body.nama || "").trim();
    var hp = String(body.hp || "").trim();
    if (!nama || !hp) {
      return jsonOut_({ status: "error", message: "Nama dan No.Hp wajib diisi." });
    }

    var sheet = getSheet_();
    var idx = headerIndex_(sheet);
    var width = Math.max(sheet.getLastColumn(), HEADERS.length);
    var row = [];
    for (var i = 0; i < width; i++) row.push("");

    function setV(col, val) { if (idx[col] !== undefined) row[idx[col]] = val; }
    setV(COL_TS, new Date()); // waktu server
    setV(COL_NAMA, nama);
    setV(COL_HP, hp);
    setV(COL_EMAIL, String(body.email || "").trim());
    setV(COL_UMUR, body.umur || "");
    setV(COL_DOMISILI, String(body.domisili || "").trim());
    setV(COL_PEKERJAAN, body.pekerjaan || "");
    setV(COL_MOTIVASI, String(body.motivasi || "").trim());
    setV(COL_KURSUS, body.kursus || "");
    setV(COL_SUMBER, body.sumber || "");

    sheet.appendRow(row);
    return jsonOut_({ status: "success", message: "Pendaftaran berhasil disimpan." });

  } catch (err) {
    return jsonOut_({ status: "error", message: "Terjadi kesalahan: " + err });
  } finally {
    lock.releaseLock();
  }
}

/* ============================ GET (cek sertifikat) ============================ */
function doGet(e) {
  var action = e && e.parameter ? String(e.parameter.action || "") : "";
  if (action === "cert") {
    return cekSertifikat_(e.parameter);
  }
  return jsonOut_({ status: "success", message: "Endpoint UCAP MANDARIN aktif." });
}

function cekSertifikat_(param) {
  var email = String(param.email || "").trim().toLowerCase();

  if (!email) {
    return jsonOut_({ status: "error", message: "Email wajib diisi." });
  }

  var sheet = getSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return jsonOut_({ status: "notfound", found: false, message: "Data pendaftaran belum tersedia." });
  }

  var idx = headerIndex_(sheet);
  var iNama = idx[COL_NAMA];
  var iEmail = idx[COL_EMAIL];
  var iLink = idx[COL_SERTIFIKAT];
  var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();

  var match = null;
  for (var i = 0; i < data.length; i++) {
    var rowEmail = String(iEmail !== undefined ? data[i][iEmail] : "").trim().toLowerCase();
    if (rowEmail === email) {
      var link = String(iLink !== undefined ? data[i][iLink] : "").trim();
      var nama = String(iNama !== undefined ? data[i][iNama] : "").trim();
      // Prioritaskan baris yang sudah punya link sertifikat
      if (link) {
        return jsonOut_({
          status: "success",
          found: true,
          nama: nama,
          link: link,
          message: "Sertifikat ditemukan."
        });
      }
      if (!match) {
        match = { nama: nama, link: "" };
      }
    }
  }

  if (match) {
    return jsonOut_({
      status: "success",
      found: true,
      nama: match.nama,
      link: "",
      message: "Sertifikat belum tersedia."
    });
  }

  return jsonOut_({
    status: "notfound",
    found: false,
    message: "Email tidak ditemukan. Pastikan sama dengan saat mendaftar."
  });
}
