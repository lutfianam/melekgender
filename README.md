# Melek Gender — Web Pembelajaran Interaktif

Web pembelajaran interaktif berbasis microlearning untuk materi **Studi Gender I**
pada kader MAKESTA IPNU IPPNU. Dibangun sebagai website statis (HTML/CSS/JS murni,
tanpa framework) agar bisa dihosting gratis di **GitHub Pages**.

## Fitur yang Sudah Ada

- Animasi loading (splash) dengan logo Melek Gender saat situs pertama dibuka
- Sticky bottom navigation (5 tab: Beranda, Belajar, Galeri, Sertifikat, Info) — menempel di layar seperti Instagram/TikTok
- Animasi teks muncul bertahap saat discroll (di halaman modul)
- Identitas kader (nama + ranting/komisariat, input teks bebas) tersimpan di localStorage, opsional terkirim ke Google Sheet dengan persetujuan
- 4 modul microlearning dengan kuis per modul, plus slot siap pakai untuk menyisipkan infografis/gambar/video
- Evaluasi akhir 15 soal dengan gerbang kelulusan (70%)
- Sertifikat personalisasi, bisa diunduh sebagai **gambar PNG** (otomatis, tanpa perlu apa-apa) maupun **dicetak sebagai PDF** — lihat `CERTIFICATE.md` untuk cara memakai desain sertifikat sendiri
- Galeri referensi dengan cover buku (bisa dikustom) dan tautan pencarian ke tiap buku
- Halaman Tentang & Kebijakan Privasi

## Struktur Folder

```
melek-gender/
├── index.html              # Beranda Publik (splash + cek identitas otomatis)
├── form.html                # Form input Nama & Ranting/Komisariat (teks bebas) + consent
├── dashboard.html           # Beranda Anggota / progres belajar
├── modul1.html ... modul4.html   # 4 modul microlearning (dengan slot media)
├── evaluasi.html            # Evaluasi akhir (15 soal), gerbang menuju sertifikat
├── sertifikat.html          # Sertifikat personalisasi (unduh PNG / cetak PDF)
├── galeri.html              # Galeri referensi buku (cover + link sumber)
├── tentang.html             # Tentang aplikasi
├── kebijakan-privasi.html   # Kebijakan privasi
├── css/style.css            # Semua styling, termasuk animasi & sticky nav
├── js/app.js                # Logika localStorage, progres, kuis, sertifikat, kirim data
├── assets/logo.png          # Logo Melek Gender
├── assets/covers/           # Taruh cover buku asli di sini (lihat galeri.html)
├── assets/modul/            # Taruh gambar/video materi di sini (lihat modul*.html)
├── CERTIFICATE.md           # Panduan kustomisasi desain sertifikat sendiri
└── README.md                # File ini
```

## Cara Deploy ke GitHub Pages (gratis, tanpa coding tambahan)

1. Buat repository baru di GitHub, misal `melek-gender`.
2. Upload **semua isi folder ini** (bukan foldernya, tapi isinya) ke root repository.
3. Buka menu **Settings > Pages** di repository tersebut.
4. Pada bagian "Source", pilih branch `main` dan folder `/root`, lalu klik **Save**.
5. Tunggu 1-2 menit, GitHub akan memberi tautan seperti:
   `https://namaakun.github.io/melek-gender/`
6. Buka tautan itu di HP — web sudah bisa dipakai kader.

## WAJIB Dikonfigurasi Sebelum Ujicoba

### 1. Sambungkan ke Google Form/Sheet (untuk mendata ranting kader)

Buka file `js/app.js`, cari komentar `TODO GANTI` di bagian
`submitToGoogleForm`. Ikuti langkah di dalam komentar tersebut:
1. Buat Google Form baru dengan 2 pertanyaan singkat: "Nama" dan
   "Ranting/Komisariat Asal".
2. Ambil *pre-filled link* dari Form tersebut untuk menemukan
   `entry.xxxxxxx` milik tiap field.
3. Ganti `GOOGLE_FORM_ACTION`, `ENTRY_NAMA`, dan `ENTRY_RANTING` di
   `js/app.js` sesuai punya Anda.

Selama belum dikonfigurasi, web tetap berjalan normal (identitas
tetap tersimpan di perangkat lewat localStorage), hanya saja data
tidak otomatis masuk ke Google Sheet — akan muncul peringatan di
console browser sebagai pengingat.

### 2. Sesuaikan daftar Ranting/Komisariat

Buka `form.html`, cari tag `<select id="ranting">`, ganti daftar
`<option>` sesuai ranting/komisariat riil di PC IPNU IPPNU
Temanggung.

### 3. Sesuaikan standar kelulusan evaluasi (opsional)

Buka `evaluasi.html`, cari baris `const PASS_RATIO = 0.7;` — ubah
angka ini kalau standar kelulusan mau diubah dari 70%.

### 4. Sesuaikan kontak di Kebijakan Privasi

Buka `kebijakan-privasi.html`, tambahkan nomor WhatsApp/kontak
pengurus kaderisasi yang bisa dihubungi kader untuk menghapus data.

## Catatan Penting (untuk Laporan TAPS)

- **Implementasi teknis memakai `localStorage`, bukan `document.cookie`.**
  Di flowchart dan proposal, istilah "cookie" dipakai sebagai istilah
  konseptual yang lebih dikenal ("data tersimpan di perangkat
  pengguna"). Secara teknis, kode ini memakai `localStorage` karena
  lebih andal — bekerja normal baik saat situs dibuka langsung dari
  file lokal (`file://`, dites 100+ kali otomatis dan semua alur
  form → 4 modul → evaluasi → sertifikat berjalan tanpa error) maupun
  setelah di-deploy ke GitHub Pages (`https://`). `document.cookie`
  sempat dicoba lebih dulu tapi tidak konsisten saat dibuka dari
  file lokal, sehingga diganti — silakan sebutkan detail teknis ini
  kalau dosen pembimbing menanyakan alasan pemilihan `localStorage`.
- **Status kelulusan bukan mekanisme anti-kecurangan.** Nilai yang
  tersimpan di sisi klien secara teknis bisa diubah manual lewat
  DevTools browser (`localStorage.setItem('mg_lulus','1')`). Data
  pretest-posttest resmi untuk mengukur efektivitas produk (sesuai
  Metodologi proposal) tetap dikumpulkan terpisah dan diawasi
  langsung oleh peneliti saat ujicoba lapangan, bukan mengandalkan
  status ini.
- Semua isi materi di `modul1.html`–`modul4.html` sudah diisi
  konten nyata (bukan lorem ipsum), diambil dan disarikan dari
  Tinjauan Pustaka proposal. Silakan diperkaya lagi sebelum
  ujicoba sungguhan, dan divalidasi oleh ahli materi (sesuai
  Metodologi Tahap Development).
- Soal-soal kuis modul dan evaluasi akhir juga sudah diisi
  pertanyaan sungguhan sesuai kisi-kisi di proposal, tapi tetap
  perlu dicek ulang oleh ahli materi sebelum dipakai untuk
  pengambilan data penelitian resmi.

## Uji Coba Lokal (sebelum di-deploy)

Tidak perlu server khusus — cukup buka `index.html` langsung lewat
browser (klik dua kali filenya), atau kalau ingin lebih mirip
kondisi asli, jalankan server lokal sederhana:

```bash
# Kalau ada Python terpasang di komputer:
python -m http.server 8000
# lalu buka http://localhost:8000 di browser
```
