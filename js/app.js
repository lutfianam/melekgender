/* ===========================================================
   Melek Gender — app.js
   Logika inti: cookie identitas, progres modul, status lulus,
   pengiriman data (dengan persetujuan) ke Google Form/Sheet.

   >>> BAGIAN YANG WAJIB ANDA SESUAIKAN <<<
   Cari komentar "TODO GANTI" di bawah ini.
   =========================================================== */

const MG = {
  /* ---------- Helper penyimpanan dasar ----------
     Catatan teknis: disebut "cookie" di flowchart & proposal
     karena itu istilah konseptual yang lebih dikenal ("data
     tersimpan di perangkat pengguna"). Implementasi aslinya
     memakai localStorage, karena document.cookie tidak
     konsisten saat situs dibuka langsung dari file lokal
     (file://) — localStorage bekerja andal baik saat dites
     lokal maupun setelah di-deploy ke GitHub Pages (https://). */
  setCookie(name, value) {
    try { localStorage.setItem(name, value); } catch (e) { console.warn('Storage tidak tersedia:', e); }
  },

  getCookie(name) {
    try { return localStorage.getItem(name); } catch (e) { return null; }
  },

  deleteCookie(name) {
    try { localStorage.removeItem(name); } catch (e) { /* noop */ }
  },

  /* ---------- Identitas kader ---------- */
  hasIdentity() {
    return !!MG.getCookie('mg_nama');
  },

  getIdentity() {
    return {
      nama: MG.getCookie('mg_nama') || '',
      ranting: MG.getCookie('mg_ranting') || '',
    };
  },

  saveIdentity(nama, ranting) {
    MG.setCookie('mg_nama', nama);
    MG.setCookie('mg_ranting', ranting);
  },

  logout() {
    MG.deleteCookie('mg_nama');
    MG.deleteCookie('mg_ranting');
    MG.deleteCookie('mg_progress');
    MG.deleteCookie('mg_lulus');
    window.location.href = 'index.html';
  },

  /* ---------- Proteksi halaman anggota ----------
     Panggil MG.requireIdentity() di awal <script> halaman
     dashboard/modul/evaluasi/sertifikat. Kalau belum ada
     identitas, kader otomatis diarahkan ke form.html. */
  requireIdentity() {
    if (!MG.hasIdentity()) {
      window.location.href = 'form.html';
    }
  },

  /* ---------- Progres modul (1-4) ---------- */
  getProgress() {
    const raw = MG.getCookie('mg_progress');
    try { return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
  },

  isModuleDone(n) {
    return MG.getProgress().includes(n);
  },

  markModuleDone(n) {
    const p = MG.getProgress();
    if (!p.includes(n)) p.push(n);
    MG.setCookie('mg_progress', JSON.stringify(p));
  },

  allModulesDone() {
    const p = MG.getProgress();
    return [1, 2, 3, 4].every((n) => p.includes(n));
  },

  nextModuleUrl() {
    for (let n = 1; n <= 4; n++) {
      if (!MG.isModuleDone(n)) return `modul${n}.html`;
    }
    return 'evaluasi.html';
  },

  /* ---------- Status kelulusan evaluasi akhir ----------
     PENTING: cookie ini hanya untuk KENYAMANAN pengguna
     (supaya tidak mengulang evaluasi tiap buka web), BUKAN
     mekanisme anti-kecurangan — nilainya bisa diubah manual
     lewat DevTools browser. Data pretest-posttest resmi untuk
     penelitian tetap diambil terpisah & diawasi langsung saat
     ujicoba lapangan (lihat proposal bagian Metodologi). */
  isLulus() {
    return MG.getCookie('mg_lulus') === '1';
  },

  setLulus() {
    MG.setCookie('mg_lulus', '1');
  },

  /* ---------- Kirim data ke Google Form (dengan persetujuan) ----------
     Teknik: submit tersembunyi ke URL "formResponse" milik Google
     Form. Setiap field Form Google punya "entry.xxxxxxx" sebagai
     name-nya. Data otomatis masuk ke Google Sheet yang terhubung
     ke Form tersebut.

     >>> TODO GANTI <<<
     1. Buat Google Form baru dengan 2 pertanyaan singkat:
        "Nama" dan "Ranting/Komisariat Asal".
     2. Klik menu titik tiga > Get pre-filled link, isi contoh
        jawaban, salin link yang dihasilkan. Link itu berisi
        entry ID tiap field, contoh:
        https://docs.google.com/forms/d/e/XXXXXXX/viewform?entry.111=A&entry.222=B
     3. Ganti GOOGLE_FORM_ACTION di bawah dengan URL sebelum
        "?entry..." tapi ganti "/viewform" jadi "/formResponse".
     4. Ganti ENTRY_NAMA dan ENTRY_RANTING dengan angka entry.xxx
        yang sesuai dari link pre-filled tadi.                     */
  GOOGLE_FORM_ACTION: 'https://docs.google.com/forms/d/e/GANTI_DENGAN_ID_FORM_ANDA/formResponse',
  ENTRY_NAMA: 'entry.111111111',
  ENTRY_RANTING: 'entry.222222222',

  submitToGoogleForm(nama, ranting) {
    if (MG.GOOGLE_FORM_ACTION.includes('GANTI_DENGAN_ID_FORM_ANDA')) {
      console.warn('[Melek Gender] Google Form belum dikonfigurasi — lihat komentar TODO GANTI di js/app.js. Data hanya tersimpan di cookie perangkat ini.');
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.name = 'mg-hidden-submit';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.action = MG.GOOGLE_FORM_ACTION;
    form.method = 'POST';
    form.target = 'mg-hidden-submit';

    const addField = (entryName, value) => {
      const inp = document.createElement('input');
      inp.type = 'hidden';
      inp.name = entryName;
      inp.value = value;
      form.appendChild(inp);
    };
    addField(MG.ENTRY_NAMA, nama);
    addField(MG.ENTRY_RANTING, ranting);

    document.body.appendChild(form);
    form.submit();
    setTimeout(() => { form.remove(); iframe.remove(); }, 2000);
  },
};

/* ---------- Komponen kuis generik ----------
   Dipakai di halaman modul (kuis singkat, 3 soal) dan
   evaluasi.html (15 soal). Tidak butuh library luar. */
function renderQuiz(mountEl, questions, onFinish) {
  const state = questions.map(() => null);

  function draw() {
    mountEl.innerHTML = questions.map((q, qi) => `
      <div style="margin-bottom:22px;">
        <div class="q-text">${qi + 1}. ${q.q}</div>
        ${q.options.map((opt, oi) => `
          <label class="opt ${state[qi] === oi ? 'sel' : ''}">
            <input type="radio" name="q${qi}" value="${oi}" ${state[qi] === oi ? 'checked' : ''}>
            ${opt}
          </label>
        `).join('')}
      </div>
    `).join('') + '<button class="btn btn-primary" id="quiz-submit">Kumpulkan Jawaban</button>';

    mountEl.querySelectorAll('input[type=radio]').forEach((inp) => {
      inp.addEventListener('change', (e) => {
        const qi = parseInt(e.target.name.replace('q', ''), 10);
        state[qi] = parseInt(e.target.value, 10);
        draw();
      });
    });

    document.getElementById('quiz-submit').addEventListener('click', () => {
      if (state.includes(null)) {
        alert('Yuk, jawab dulu semua soalnya sebelum dikumpulkan.');
        return;
      }
      let score = 0;
      questions.forEach((q, qi) => { if (state[qi] === q.correct) score++; });
      onFinish(score, questions.length, state);
    });
  }
  draw();
}
function renderTabbar(activeId) {
  const el = document.getElementById('tabbar-slot');
  if (!el) return;
  const tabs = [
    { id: 'beranda', href: 'dashboard.html', label: 'Beranda', icon: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>' },
    { id: 'belajar', href: () => MG.nextModuleUrl(), label: 'Belajar', icon: '<path d="M4 5.5c2-1 5-1 7 .5v13c-2-1.5-5-1.5-7-.5z"/><path d="M20 5.5c-2-1-5-1-7 .5v13c2-1.5 5-1.5 7-.5z"/>' },
    { id: 'galeri', href: 'galeri.html', label: 'Galeri', icon: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.3"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.3"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.3"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.3"/>' },
    { id: 'sertifikat', href: 'sertifikat.html', label: 'Sertifikat', icon: '<circle cx="12" cy="8.2" r="4.3"/><path d="M8.2 12 6.7 21l5.3-3 5.3 3-1.5-9"/>' },
    { id: 'info', href: 'tentang.html', label: 'Info', icon: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16.5"/><circle cx="12" cy="7.8" r="0.9" fill="currentColor" stroke="none"/>' },
  ];
  el.innerHTML = `<div class="tabbar">${tabs.map(t => {
    const href = typeof t.href === 'function' ? t.href() : t.href;
    return `<a class="tab ${t.id === activeId ? 'active' : ''}" href="${href}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${t.icon}</svg>
        <span class="tab-label">${t.label}</span>
      </a>`;
  }).join('')}</div>`;
}

/* ---------- Animasi teks muncul saat discroll ----------
   Cara pakai: beri class="reveal" pada elemen (judul,
   paragraf, kartu soal, dsb), lalu panggil MG.initScrollReveal()
   sekali di akhir halaman. Elemen yang sudah kelihatan duluan
   (di atas layar) langsung ditampilkan tanpa animasi supaya
   halaman tidak terasa "kosong" sesaat sebelum discroll. */
/* ---------- Unduh sertifikat sebagai file gambar (JPEG/PNG) ----------
   Menggambar sertifikat ke <canvas> lalu memicu unduhan file asli
   (bukan cuma dialog print browser). Kalau file custom di
   assets/sertifikat-bg.jpg ada, itu dipakai sebagai latar; kalau
   tidak ada, dipakai latar polos bawaan sebagai cadangan.
   Lihat CERTIFICATE.md untuk cara memakai desain sertifikat sendiri. */
function downloadCertificateImage(nama, ranting, tanggal) {
  const W = 1600, H = 1131; // rasio kira-kira A4 landscape
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  function drawFallbackBackground() {
    ctx.fillStyle = '#FAF7EF';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#C89116';
    ctx.lineWidth = 10;
    ctx.strokeRect(40, 40, W - 80, H - 80);
    ctx.strokeStyle = '#1E7A42';
    ctx.lineWidth = 3;
    ctx.strokeRect(64, 64, W - 128, H - 128);
  }

  function drawText() {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#C89116';
    ctx.font = '600 28px Poppins, Arial, sans-serif';
    ctx.fillText('SERTIFIKAT PENYELESAIAN', W / 2, H * 0.24);

    ctx.fillStyle = '#14532D';
    ctx.font = '700 64px Poppins, Arial, sans-serif';
    ctx.fillText('Melek Gender', W / 2, H * 0.34);

    ctx.fillStyle = '#57534E';
    ctx.font = '400 26px Poppins, Arial, sans-serif';
    ctx.fillText('Diberikan kepada', W / 2, H * 0.44);

    ctx.fillStyle = '#1C1917';
    ctx.font = '600 46px Poppins, Arial, sans-serif';
    ctx.fillText(nama, W / 2, H * 0.53);
    ctx.strokeStyle = '#C89116';
    ctx.lineWidth = 3;
    const tw = ctx.measureText(nama).width;
    ctx.beginPath();
    ctx.moveTo(W / 2 - tw / 2 - 20, H * 0.55);
    ctx.lineTo(W / 2 + tw / 2 + 20, H * 0.55);
    ctx.stroke();

    ctx.fillStyle = '#57534E';
    ctx.font = '400 24px Poppins, Arial, sans-serif';
    ctx.fillText(ranting, W / 2, H * 0.6);

    ctx.font = '400 22px Poppins, Arial, sans-serif';
    ctx.fillText('atas keberhasilannya menyelesaikan seluruh materi Studi Gender I', W / 2, H * 0.7);
    ctx.fillText('berbasis microlearning', W / 2, H * 0.735);

    ctx.font = '400 20px Poppins, Arial, sans-serif';
    ctx.fillText(tanggal, W / 2, H * 0.85);
  }

  function finishAndDownload() {
    drawText();
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sertifikat-${nama.replace(/\s+/g, '-').toLowerCase()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  const bg = new Image();
  bg.crossOrigin = 'anonymous';
  bg.onload = () => { ctx.drawImage(bg, 0, 0, W, H); finishAndDownload(); };
  bg.onerror = () => { drawFallbackBackground(); finishAndDownload(); };
  bg.src = 'assets/sertifikat-bg.jpg';
}

/* ---------- Animasi teks muncul saat discroll ----------
   Cara pakai: beri class="reveal" pada elemen (judul,
   paragraf, kartu soal, dsb), lalu panggil initScrollReveal()
   sekali di akhir halaman. Elemen yang sudah kelihatan duluan
   (di atas layar) langsung ditampilkan tanpa animasi supaya
   halaman tidak terasa "kosong" sesaat sebelum discroll. */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in-view'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => io.observe(el));
}
