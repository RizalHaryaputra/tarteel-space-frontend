# 🌙 Tarteel Space - Frontend

![Nuxt 4](https://img.shields.io/badge/Nuxt_4-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)
![Vue.js 3](https://img.shields.io/badge/Vue.js_3-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-FFE56C?style=for-the-badge&logo=pinia&logoColor=black)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)

**Tarteel Space** adalah aplikasi web interaktif dan adaptif yang dirancang untuk membantu pengguna menyempurnakan pelafalan huruf hijaiyah dan kaidah tajwid Al-Qur'an secara mandiri. Aplikasi ini mengintegrasikan kecerdasan buatan berbasis *Deep Learning* (Convolutional Neural Network / CNN) serta LLM (Google Gemini) pada backend untuk menghadirkan evaluasi akurasi pelafalan secara *real-time*, visualisasi makhraj, dan penjelasan korektif yang terpersonalisasi.

Repositori ini memuat kode sumber antarmuka (*frontend*) yang dibangun menggunakan arsitektur modern [Nuxt 4](https://nuxt.com/) (Vue 3 Composition API), dipadukan dengan [Tailwind CSS](https://tailwindcss.com/) dan animasi halus berbasis [GSAP](https://greensock.com/gsap/).

---

## ✨ Fitur Utama

### 👤 Pengalaman Pengguna (*User Space*)
- **Autentikasi & Keamanan Sesi**:
  - Pendaftaran dan masuk akun lokal yang aman dengan *token-based authentication*.
  - **Single Sign-On (SSO)** via Google dan GitHub OAuth.
  - Pemulihan akun mandiri (lupa sandi dan reset via verifikasi email).
  - Manajemen sesi pengguna otomatis melalui Pinia Store dan *route middleware*.
- **Ruang Latihan Hijaiyah Interaktif**:
  - Rekam suara langsung dari browser tanpa instalasi software menggunakan **Web Audio API** dan **MediaRecorder**.
  - **Real-Time Audio Visualizer**: Animasi spektrum/gelombang suara interaktif berbasis HTML5 Canvas selama proses perekaman.
  - **Audio Referensi Ustadz**: Pemutar contoh pelafalan tartil yang fasih sebagai tolok ukur latihan.
  - Pemilihan 84 kombinasi kelas huruf hijaiyah dan harakat (fathah, kasrah, dhammah) melalui modal *Letter Picker*.
- **Evaluasi Cerdas (Dual AI Assessment)**:
  - **Skor Akurasi & Predikat Tajwid**: Penilaian kuantitatif (0–100%) dan kualitatif (*Mumtaz*, *Jayyid Jiddan*, *Jayyid*, *Maqbul*).
  - **Analisis Kemiripan CNN**: Peringkat 3 prediksi teratas model dengan visualisasi persentase probabilitas kelas.
  - **Asistensi Tajwid AI (Gemini)**: Analisis mendalam penjelasan posisi makhraj, sifat huruf, penyebab ketidaktepatan, serta kiat perbaikan.
  - **Feedback Koreksi Prediksi & Consent Dataset**: Pengguna dapat mengajukan koreksi pelafalan secara sukarela untuk membantu pengayaan dataset AI (*Active Learning*).
- **Dasbor Kemajuan & Analisis Riwayat**:
  - Ringkasan pencapaian harian (*streak counter*), kartu statistik akurasi rata-rata, dan evaluasi terkini.
  - **Grafik Tren Skor Mingguan**: Grafik SVG area dan poliline interaktif tanpa ketergantungan library berat pihak ketiga.
  - **Tabel Riwayat Latihan Lengkap**: Dilengkapi pemutar komparasi audio rekaman pengguna vs audio ustadz, status nilai, serta paginasi modular (`AppPagination`).
- **Kelola Profil Pengguna**:
  - Pembaruan nama, bio, dan alamat email.
  - Pengunggahan dan penghapusan foto profil avatar pengguna.
  - Pembaruan kata sandi akun lokal dengan indikator penyedia autentikasi SSO.

### 🛡️ Ruang Admin & MLOps (*Admin Space*)
- **Role-Based Access Control (RBAC)**: Pelindung rute khusus (`middleware/admin.ts`) yang membatasi akses hanya untuk pengguna berwenang.
- **Ringkasan Metrik Sistem**: Statistik langsung mencakup jumlah pengguna, total evaluasi, rata-rata akurasi global, jumlah feedback, dan volume dataset pool.
- **Bento Pipeline Active Learning**: Visualisasi 4 tahap siklus pembelajaran aktif (Pengumpulan Suara $\rightarrow$ Peninjauan Feedback $\rightarrow$ Ekspor Dataset $\rightarrow$ Hot-Swap Model).
- **Manajemen Huruf Hijaiyah**: Pengelolaan database 84 huruf hijaiyah (simbol Arab, transliterasi, harakat, label kelas CNN, serta unggah audio master WAV).
- **Manajemen Pengguna**: Inspeksi daftar pengguna aktif, role, serta opsi penghapusan akun.
- **Validasi Feedback (Active Learning Loop)**:
  - Peninjauan rekaman pengguna yang dilaporkan tidak akurat.
  - *Re-labeling* makhraj yang sebenarnya (*ground truth*) oleh admin/pakar tajwid.
  - Kurasi dan transfer otomatis rekaman tervalidasi ke dalam *training pool*.
- **Dataset Manager & MLOps Hot-Swap**:
  - Filter status dataset (*Trained* / *Untrained*) dengan *floating multi-select action bar*.
  - Ekspor kumpulan data format CSV dan JSON untuk proses *retraining*.
  - **Model Hot-Swap**: Fitur penggantian file model CNN (`.tflite`) beserta normalisasi *mean* dan *std* (`.npy`) langsung dari antarmuka web tanpa memicu *downtime* server.

### 🎨 Desain & Pengalaman Antarmuka (UI/UX)
- **Tema Gelap Premium (*Dark Mode Baseline*)**: Palet warna *slate-dark* dengan latar belakang *glow radial* lembut.
- **Sistem Tombol Interaktif (`.ts-btn`)**: Dilengkapi efek sapuan kilau (*light-glare sweep animation*), *outer focus glow ring*, dan transisi *hover lift*.
- **Tipografi Harmonis**: Menggunakan font modern **Geist Sans** dan **Geist Mono** untuk keterbacaan data numerik/kode, serta aksen klasik **Instrument Serif**.
- **Mobile-First & Native Scroll**: Pengalaman mulus pada layar smartphone dengan *bottom navigation bar*, responsivitas dinamis, dan penyesuaian tinggi layar *viewport* (`100dvh`).

---

## 🛠️ Tumpukan Teknologi (*Tech Stack*)

| Kategori | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Core Framework** | [Nuxt 4](https://nuxt.com/) & [Vue 3](https://vuejs.org/) | Framework SSR/SSG & Composition API |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) | Pengetikan statis untuk keandalan kode |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utilitas styling responsif berbasis token |
| **State Management** | [Pinia](https://pinia.vuejs.org/) | Manajemen state global terpusat & persistensi autentikasi |
| **Animasi** | [GSAP (GreenSock)](https://greensock.com/gsap/) | Animasi timeline pada halaman autentikasi dan komponen |
| **Tipografi** | [Geist](https://vercel.com/font) & [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) | Font modern untuk UI, grafik data, dan aksen |
| **Audio Processing** | Web Audio API & MediaStream | Perekaman audio PCM/WAV di sisi peramban web |
| **Visualizer** | HTML5 Canvas API | Render visualizer frekuensi dan gelombang suara *real-time* |

---

## 📁 Struktur Direktori Proyek

Proyek ini menerapkan struktur standar Nuxt 4 dengan direktori `app/`:

```text
tarteel-space-frontend/
├── app/
│   ├── assets/
│   │   └── css/
│   │       ├── fonts.css       # Definisi variasi Geist Sans & Geist Mono
│   │       └── main.css        # Design system tombol (.ts-btn) & animasi global
│   ├── components/
│   │   └── AppPagination.vue   # Komponen paginasi tabel & list yang reusable
│   ├── composables/
│   │   └── useApi.ts           # Abstraksi endpoint REST API & integrasi backend
│   ├── layouts/
│   │   ├── admin.vue           # Layout khusus panel administrator
│   │   └── dashboard.vue       # Layout dasbor pengguna & navigasi mobile
│   ├── middleware/
│   │   ├── admin.ts            # Route guard untuk hak akses administrator
│   │   └── auth.ts             # Route guard untuk proteksi halaman privat
│   ├── pages/
│   │   ├── index.vue           # Landing page interaktif Tarteel Space
│   │   ├── login.vue           # Halaman login lokal & SSO
│   │   ├── register.vue        # Halaman registrasi pengguna baru
│   │   ├── forgot-password.vue # Formulir permohonan pemulihan sandi
│   │   ├── reset-password.vue  # Formulir penetapan sandi baru via token
│   │   ├── admin/              # Halaman-halaman panel administrator
│   │   │   ├── index.vue       # Ringkasan analitik & bento flow MLOps
│   │   │   ├── letters.vue     # Manajemen huruf hijaiyah & master audio
│   │   │   ├── users.vue       # Manajemen data pengguna & peran
│   │   │   ├── dataset.vue     # Dataset pool kurasi & model hot-swap
│   │   │   ├── feedbacks.vue   # Validasi laporan kesalahan & re-labeling
│   │   │   └── profile.vue     # Pengaturan profil akun admin
│   │   ├── auth/
│   │   │   └── callback.vue    # Handler penanganan callback OAuth SSO
│   │   └── dashboard/          # Halaman-halaman dasbor latihan pengguna
│   │       ├── index.vue       # Ringkasan progres harian & kartu streak
│   │       ├── practice.vue    # Ruang latihan audio, visualizer, & skor AI
│   │       ├── history.vue     # Grafik mingguan & riwayat komparasi audio
│   │       └── profile.vue     # Pengaturan identitas & keamanan akun
│   ├── stores/
│   │   └── auth.ts             # Pinia store untuk token, role, dan sesi user
│   └── app.vue                 # Root layout wrapper dan deklarasi gaya global
├── public/                     # Aset statis publik (logo, font woff2, dsb.)
├── nuxt.config.ts              # Konfigurasi modul Nuxt, runtime config, & link CSS
├── tailwind.config.ts          # Skema warna, extended utilities, dan tipografi
└── package.json                # Daftar dependensi dan skrip proyek
```

---

## 🚀 Panduan Memulai (*Quick Start*)

Pastikan lingkungan lokal Anda telah terpasang **Node.js** (versi 18.x atau versi 20.x ke atas) dan manajer paket (`npm`, `pnpm`, atau `yarn`).

### 1. Kloning Repositori
```bash
git clone https://github.com/RizalHaryaputra/tarteel-space-frontend.git
cd tarteel-space-frontend
```

### 2. Instalasi Dependensi
```bash
npm install
# atau
pnpm install
```

### 3. Konfigurasi Variabel Lingkungan
Aplikasi membutuhkan alamat backend API Tarteel Space. Buat file `.env` pada *root directory* (atau salin dari `.env.example` jika tersedia):

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000
```
> **Catatan**: Sesuaikan nilai `NUXT_PUBLIC_API_BASE` dengan alamat instance backend Anda berjalan.

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
# atau
pnpm dev
```
Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

### 5. Kompilasi Produksi (*Production Build*)
```bash
npm run build
```
Untuk menguji hasil kompilasi produksi secara lokal:
```bash
npm run preview
```

---

## 👥 Kredit & Penghargaan

- **Pengembang Utama**: [Rizal Haryaputra](https://github.com/RizalHaryaputra)
- **Konteks Proyek**: Proyek Skripsi / Tugas Akhir Program Studi Teknologi Informasi.
- **Pustaka & Referensi Desain**:
  - [Nuxt.js](https://nuxt.com/) & [Vue.js](https://vuejs.org/) untuk ekosistem aplikasi web reaktif.
  - [Tailwind CSS](https://tailwindcss.com/) untuk sistem token desain utilitas.
  - [Geist Font](https://vercel.com/font) oleh Vercel untuk tipografi modern dan presisi tinggi.
  - [GreenSock (GSAP)](https://greensock.com/) untuk performa animasi antarmuka.
  - Komunitas pengembang *Open Source* atas dukungan pustaka dan komponen terbuka.

---

## 📄 Lisensi

Proyek ini dikembangkan untuk tujuan penelitian akademis dan pengembangan edukasi Al-Qur'an digital. Hak cipta dilindungi oleh pengembang dan institusi terkait.
