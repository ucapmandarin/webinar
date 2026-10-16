# Registrasi Webinar - UCAP MANDARIN

Aplikasi registrasi webinar berbasis **HTML statis** (tanpa backend berbayar) yang
mengirim data langsung ke **Google Spreadsheet** melalui **Google Apps Script Web App**.
Siap di-upload ke **GitHub Pages**.

## Struktur file

```
.
├── index.html                  # Halaman registrasi (markup saja)
├── thank-you.html              # Halaman konfirmasi setelah pendaftaran berhasil
├── cek-sertifikat.html         # Halaman cek link sertifikat (nama + email)
├── Logo.png                    # Logo brand (dipakai di header & footer)
├── css/
│   ├── style.css               # Styling halaman registrasi
│   ├── thank-you.css           # Styling halaman konfirmasi
│   ├── cek-sertifikat.css      # Styling halaman cek sertifikat
│   └── floating-wa.css         # Styling tombol bantuan WhatsApp
├── js/
│   ├── config.js               # KONFIGURASI (SCRIPT_URL & WA_GROUP_URL)
│   ├── main.js                 # Logika form + kirim data ke Google Sheet
│   ├── thank-you.js            # Logika halaman konfirmasi + tombol WhatsApp
│   ├── cek-sertifikat.js       # Logika pencarian sertifikat
│   ├── floating-wa.js          # Tombol bantuan WhatsApp melayang
│   └── no-inspect.js           # Anti inspect (blokir klik kanan & shortcut)
├── google-apps-script/
│   └── Code.gs                 # Backend Apps Script (simpan data & cek sertifikat)
└── README.md
```

Setelah pendaftaran berhasil, pengguna otomatis diarahkan ke `thank-you.html`
(beserta nama mereka) dan bisa langsung bergabung ke grup WhatsApp.

## Alur halaman

1. `index.html` - pengunjung mengisi formulir pendaftaran.
2. `thank-you.html` - konfirmasi pendaftaran berhasil + tombol grup WhatsApp.
3. `cek-sertifikat.html` - peserta memasukkan **Email** untuk mendapatkan link sertifikat.

## Kolom yang tersimpan di Google Sheet

| Kolom | Sumber |
|---|---|
| Timestamp | Waktu server saat submit |
| Nama | Input teks |
| No.Hp (Whatsapp) | Input nomor |
| Email | Input email |
| Umur | Input angka |
| Asal Domisili | Input teks (nama kota/daerah) |
| Pekerjaan | Dropdown |
| Motivasi belajar Mandarin | Textarea |
| Apakah pernah mengikuti kursus bahasa Mandarin? | Radio (Ya / Tidak / Sedang berjalan) |
| Dari mana kamu menemukan informasi webinar? | Dropdown |
| Link Sertifikat | **Diisi manual oleh admin** setelah webinar |

---

## Langkah 1 - Siapkan Google Spreadsheet

1. Buka <https://sheets.new> untuk membuat Spreadsheet baru.
2. Beri nama misalnya **Registrasi Webinar UCAP MANDARIN**.

## Langkah 2 - Pasang Apps Script

1. Di Spreadsheet, klik menu **Extensions > Apps Script**.
2. Hapus semua isi file `Code.gs` yang kosong.
3. Buka file `google-apps-script/Code.gs` di repo ini, salin **seluruh** isinya,
   lalu tempel ke editor Apps Script.
4. Klik ikon **Save** (Ctrl+S). Beri nama project, misal `Registrasi Webinar`.

## Langkah 3 - Deploy sebagai Web App

1. Klik tombol **Deploy > New deployment**.
2. Klik ikon gerigi (Select type) dan pilih **Web app**.
3. Isi:
   - **Description**: `Registrasi Webinar v1`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Klik **Deploy**, lalu **Authorize access** dan izinkan (pilih akun Google Anda).
5. Salin **Web app URL** yang berakhiran `/exec`.

> Alternatif cepat: Anda juga bisa menempel langsung isi `Code.gs` ke
> [script.google.com](https://script.google.com) dan mengaitkan Spreadsheet
> lewat `File > Project Settings`, atau mengaksesnya via `SpreadsheetApp.getActiveSpreadsheet()`.
> Cara termudah tetap melalui menu **Extensions** di Spreadsheet.

## Langkah 4 - Hubungkan ke halaman

1. Buka `js/config.js`.
2. Ganti `SCRIPT_URL` dengan URL `/exec` Anda:

   ```js
   SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxxxxxxxx/exec",
   ```

3. Simpan file. Semua halaman (registrasi, terima kasih, cek sertifikat)
   memakai konfigurasi ini.

> Jika sebelumnya Sheet sudah terlanjur dibuat tanpa kolom **Email** dan
> **Link Sertifikat**, `Code.gs` akan otomatis menambahkan kolom tersebut di
> deployment berikutnya. Anda cukup klik **Deploy > Manage deployments > Edit >
> New version**.

## Langkah 5 - Upload ke GitHub Pages

1. Buat repository baru di GitHub (mis. `registrasi-webinar`).
2. Upload/simpan file `index.html` dan `Logo.png` ke **root** repository.

   ```bash
   git init
   git add .
   git commit -m "Registrasi webinar UCAP MANDARIN"
   git branch -M main
   git remote add origin https://github.com/USERNAME/registrasi-webinar.git
   git push -u origin main
   ```

3. Di repository: **Settings > Pages**.
4. Bagian **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` dan folder `/ (root)`
5. Klik **Save**. Tunggu 1-2 menit.
6. Situs aktif di `https://USERNAME.github.io/registrasi-webinar/`.

> **Penting (huruf besar/kecil nama file):** GitHub Pages membaca nama file secara
> *case-sensitive*. File logo di repo ini bernama **`Logo.png`** (huruf L kapital),
> jadi referensi di `index.html` harus sama persis: `src="Logo.png"`.

## Mengedit detail webinar

Semua teks hero (judul, tanggal, jam, mode, harga) ada di dalam tag
`<section class="hero">` pada `index.html`. Ganti sesuai kebutuhan.

## Mengatur countdown & info webinar

Semua diatur di `js/config.js`.

**Waktu mulai webinar** (untuk countdown) - format **DD/MM/YYYY HH:mm** (waktu WIB):

```js
WEBINAR_DATE: "31/12/2026 19:00",
```

Saat waktunya tiba, countdown otomatis berubah menjadi "Webinar telah dimulai"
dan **formulir pendaftaran otomatis dikunci** (semua field nonaktif, tombol
menjadi "Pendaftaran Ditutup", dan muncul pemberitahuan).

**Info yang tampil di halaman** (bisa diubah/tambah/kurang):

```js
WEBINAR_INFO: [
  { icon: "📅", text: "Minggu, 15 Desember 2026" },
  { icon: "🕐", text: "19.00 - 21.00 WIB" },
  { icon: "💻", text: "Online via Zoom" },
  { icon: "🎁", text: "GRATIS" }
],
```

> Teks judul & deskripsi besar di hero tetap diedit langsung di `<section class="hero">`
> pada `index.html`.

## Mengatur link grup WhatsApp

Buka `js/config.js`, ganti nilai `WA_GROUP_URL` dengan link grup Anda:

```js
WA_GROUP_URL: "https://chat.whatsapp.com/XXXXXXXXXXXXXXXXXXXX",
```

Selama belum diisi, tombol tetap tampil dan menampilkan pesan "hubungi admin".

## Tombol bantuan WhatsApp (floating)

Di pojok kanan bawah semua halaman ada tombol WhatsApp mengambang untuk membantu
peserta yang kesulitan. Atur di `js/config.js`:

```js
WA_HELP_NUMBER: "628xxxxxxxxxx",
WA_HELP_MESSAGE: "Halo UCAP MANDARIN, saya butuh bantuan pendaftaran webinar."
```

- `WA_HELP_NUMBER` boleh nomor lokal (`08...`) atau format `628...`. Bisa juga diisi
  URL WhatsApp lengkap (mis. link `wa.me` tertentu).
- `WA_HELP_MESSAGE` otomatis terisi di kolom chat saat tombol diklik.
- Selama masih placeholder (`628xxxxxxxxxx`), tombol **tidak ditampilkan**.

## Proteksi anti inspect (best-effort)

Memblokir **klik kanan** (kecuali di dalam kolom form agar paste tetap bisa) dan
**shortcut** `F12`, `Ctrl`/`Cmd`+`Shift`+`I`/`J`/`C`/`K`/`E`, `Ctrl`/`Cmd`+`U`, `Ctrl`/`Cmd`+`S`.
Diatur di `js/config.js`:

```js
NO_INSPECT: true,   // false untuk mematikan
```

> **Penting:** pada web statis, Inspect Element **tidak bisa diblokir 100%**.
> Pengguna tetap bisa membuka DevTools dari menu browser, menonaktifkan JavaScript,
> atau memakai browser lain. Fitur ini hanya penghalang untuk pengguna awam.

## Cara kerja Cek Sertifikat

1. Peserta membuka `cek-sertifikat.html` dan mengisi **Email**
   (harus sama dengan data saat mendaftar).
2. Halaman mengirim permintaan ke Web App: `?action=cert&email=...`.
3. Apps Script (`doGet`) mencari baris yang cocok di kolom **Email**,
   lalu mengembalikan isi kolom **Link Sertifikat**.
4. Jika link tersedia, peserta melihat tombol **Buka / Download Sertifikat**.
   Jika belum diisi admin, muncul pesan "Sertifikat Belum Tersedia".

**Untuk admin:** setelah webinar selesai, tempel link sertifikat (mis. Google Drive)
pada kolom **Link Sertifikat** di baris peserta yang bersangkutan.

## Mengganti tema warna

Warna diambil dari logo UCAP MANDARIN (maroon + navy). Nilainya ada di bagian
`:root` pada setiap file di folder `css/`:

```css
--maroon: #8C1D2F;   /* warna merah logo */
--navy:   #16305E;   /* warna biru logo  */
```

## Troubleshooting

| Masalah | Solusi |
|---|---|
| Data tidak masuk ke Sheet | Pastikan deployment Web App **Execute as: Me** dan **Who has access: Anyone**, lalu deploy ulang. |
| Muncul pesan "URL Apps Script belum diatur" | `SCRIPT_URL` di `js/config.js` belum diganti. |
| Cek sertifikat selalu "tidak ditemukan" | Pastikan email persis sama dengan saat mendaftar, dan kolom **Email** sudah terisi di Sheet. |
| Perubahan kode Apps Script tidak terasa | Harus **Deploy > Manage deployments > Edit > New version**. |
| Tombol kirim gagal / CORS | Jangan ubah header `Content-Type` dari `text/plain`. |
