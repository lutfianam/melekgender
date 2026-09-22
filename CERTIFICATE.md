# Panduan Kustomisasi Desain Sertifikat

Situs ini menyediakan dua cara mengunduh sertifikat:
1. **Unduh sebagai Gambar (PNG)** — hasil digambar langsung oleh browser lewat `<canvas>`, di `js/app.js` fungsi `downloadCertificateImage()`.
2. **Cetak / Simpan sebagai PDF** — pakai dialog print bawaan browser (`window.print()`), kader tinggal pilih "Save as PDF".

Bawaannya (kalau belum dikustomisasi) tampilannya sederhana: latar krem polos dengan bingkai emas-hijau. Kalau Anda sudah punya desain sertifikat sendiri (dari Canva, Photoshop, Illustrator, dll.), ikuti salah satu dari dua cara di bawah ini.

---

## Cara 1 — Pakai Gambar Latar Sendiri (paling mudah, disarankan)

Cocok kalau desain Anda berbentuk **gambar utuh** (JPG/PNG) dengan ornamen/bingkai, dan Anda cuma perlu menambahkan teks nama, ranting, dan tanggal di atasnya.

### Langkah:

1. **Ekspor desain Anda sebagai gambar** ukuran **1600 x 1131 piksel** (rasio ini sengaja dipilih mendekati A4 landscape). Kalau desain Anda beda rasio, sesuaikan angka `W` dan `H` di `js/app.js` pada fungsi `downloadCertificateImage()`.
2. **Kosongkan bagian yang akan diisi teks** (nama, ranting, tanggal) di desain Anda — jangan taruh tulisan apa pun di area itu, biar tidak tertumpuk dengan teks yang digambar otomatis oleh sistem.
3. Simpan file dengan nama persis **`sertifikat-bg.jpg`**, taruh di folder **`assets/`** (sejajar dengan `logo.png`).
4. Selesai! Sistem otomatis mendeteksi file ini — kalau `assets/sertifikat-bg.jpg` ada, itu yang dipakai sebagai latar; kalau tidak ada, otomatis kembali ke latar polos bawaan.

### Menyesuaikan posisi teks

Posisi teks (nama, ranting, dst.) diatur dengan persentase tinggi kanvas (`H`), supaya proporsional di ukuran berapa pun. Cari bagian ini di `js/app.js`:

```js
ctx.fillText('SERTIFIKAT PENYELESAIAN', W / 2, H * 0.24);   // ubah 0.24 buat naik/turunkan posisi
ctx.fillText('Melek Gender', W / 2, H * 0.34);
ctx.fillText('Diberikan kepada', W / 2, H * 0.44);
ctx.fillText(nama, W / 2, H * 0.53);
ctx.fillText(ranting, W / 2, H * 0.6);
ctx.fillText(tanggal, W / 2, H * 0.85);
```

- Angka setelah `H *` adalah posisi vertikal (0 = paling atas, 1 = paling bawah). Naikkan/turunkan sesuai tata letak desain Anda.
- Warna teks diatur lewat `ctx.fillStyle = '#14532D'` (kode warna hex) tepat sebelum tiap `fillText`.
- Ukuran & jenis font diatur lewat `ctx.font = '700 64px Poppins, Arial, sans-serif'` — angka pertama tebal huruf (700=bold), lalu ukuran piksel, lalu daftar font.

### Menguji hasilnya

Buka `sertifikat.html` di browser (setelah lulus evaluasi), klik "Unduh sebagai Gambar (PNG)", lalu cek hasil unduhannya. Ulangi sampai posisi teksnya pas dengan desain Anda.

---

## Cara 2 — Isi Template PDF Asli (untuk desain berbentuk file PDF)

Cocok kalau desain sertifikat Anda **sudah dalam bentuk file PDF** (misalnya hasil ekspor dari Illustrator/Canva dalam format PDF, bukan gambar), dan Anda ingin hasil akhirnya juga benar-benar file PDF (bukan gambar).

Ini butuh sedikit kode tambahan memakai library **pdf-lib** (gratis, jalan sepenuhnya di browser, tidak perlu server).

### Langkah:

1. Taruh file PDF desain Anda di folder `assets/`, misalnya `assets/sertifikat-template.pdf`.
2. Tambahkan baris ini di bagian `<head>` pada `sertifikat.html` (sebelum tag `</head>`), untuk memuat library pdf-lib dari CDN:

   ```html
   <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"></script>
   ```

3. Tambahkan fungsi baru ini di `js/app.js` (boleh taruh persis di bawah fungsi `downloadCertificateImage`):

   ```js
   async function downloadCertificatePDF(nama, ranting, tanggal) {
     const existingPdfBytes = await fetch('assets/sertifikat-template.pdf').then(res => res.arrayBuffer());
     const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
     const page = pdfDoc.getPages()[0];
     const { width, height } = page.getSize();
     const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

     // Ganti angka x/y di bawah ini sesuai posisi yang Anda mau
     // (x dihitung dari kiri, y dihitung dari BAWAH halaman PDF).
     page.drawText(nama, {
       x: width / 2 - font.widthOfTextAtSize(nama, 24) / 2,
       y: height * 0.45,
       size: 24,
       font,
       color: PDFLib.rgb(0.11, 0.33, 0.18), // hijau tua, format 0-1 bukan 0-255
     });
     page.drawText(ranting, {
       x: width / 2 - font.widthOfTextAtSize(ranting, 14) / 2,
       y: height * 0.38,
       size: 14,
       font,
       color: PDFLib.rgb(0.34, 0.33, 0.31),
     });
     page.drawText(tanggal, {
       x: width / 2 - font.widthOfTextAtSize(tanggal, 12) / 2,
       y: height * 0.15,
       size: 12,
       font,
     });

     const pdfBytes = await pdfDoc.save();
     const blob = new Blob([pdfBytes], { type: 'application/pdf' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `sertifikat-${nama.replace(/\s+/g, '-').toLowerCase()}.pdf`;
     a.click();
     URL.revokeObjectURL(url);
   }
   ```

4. Di `sertifikat.html`, ganti/tambah tombol baru untuk memanggil fungsi ini:

   ```html
   <button class="btn btn-primary" onclick="downloadCertificatePDF(identity.nama, identity.ranting, tanggal)">
     Unduh sebagai PDF
   </button>
   ```

   (taruh dalam blok `else` yang sama tempat `identity` dan `tanggal` sudah didefinisikan di script `sertifikat.html`)

### Catatan penting

- Koordinat `y` di PDF dihitung **dari bawah**, kebalikan dari gambar/canvas biasa yang dari atas. Kalau posisi teks meleset, coba naik-turunkan nilai `height * 0.xx` sampai pas.
- `pdf-lib` butuh koneksi internet untuk memuat library dari CDN — pastikan sudah online saat mengetes (tidak akan jalan kalau dibuka dari file lokal tanpa internet).
- Kalau font desain Anda pakai huruf khusus (bukan Helvetica bawaan), `pdf-lib` bisa `embedFont` dari file `.ttf` juga — cari dokumentasi resminya di [pdf-lib.js.org](https://pdf-lib.js.org) untuk detail lanjut.

---

## Ringkasan: Pilih yang Mana?

| Situasi Anda | Pakai Cara |
|---|---|
| Desain sudah jadi gambar (JPG/PNG) dari Canva/Photoshop | **Cara 1** (lebih gampang) |
| Desain dalam bentuk file PDF/Illustrator dan ingin hasil akhir PDF asli | **Cara 2** |
| Belum sempat bikin desain sendiri | Tetap pakai tampilan bawaan (latar polos hijau-emas), sudah cukup layak dipakai untuk ujicoba |
