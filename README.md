# 🌙 Tarteel Space - Frontend

![Nuxt](https://img.shields.io/badge/Nuxt_3-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Tarteel Space adalah aplikasi web inovatif yang dirancang untuk membantu pengguna menyempurnakan pelafalan huruf hijaiyah dan kaidah tajwid Al-Qur'an. Aplikasi ini menggunakan teknologi kecerdasan buatan (Deep Learning / CNN) melalui backend-nya untuk memberikan evaluasi *real-time* atas rekaman suara pengguna. 

Repositori ini berisi kode *frontend* dari aplikasi Tarteel Space yang dibangun menggunakan kerangka kerja [Nuxt 3](https://nuxt.com/) dan antarmuka yang dirancang dengan [Tailwind CSS](https://tailwindcss.com/).

## ✨ Fitur Utama

### 👤 Pengalaman Pengguna (User Space)
- **Autentikasi & Keamanan**: Sistem pendaftaran, masuk, dan manajemen sesi yang aman menggunakan *middleware* Nuxt.
- **Single Sign-On (SSO)**: Integrasi login praktis menggunakan akun Google dan GitHub.
- **Pemulihan Akun**: Fitur lupa dan reset password melalui verifikasi email.
- **Ruang Latihan Interaktif**: Kemampuan merekam suara secara langsung dari *browser* menggunakan Web Audio API, serta pemutaran audio contoh pelafalan hijaiyah yang benar.
- **Evaluasi AI Detil (Tajweed & Gemini)**:
  - **Skor Akurasi & Tajweed Grade**: Menampilkan skor persentase serta predikat tajwid (*Mumtaz*, *Jayyid Jiddan*, *Jayyid*, *Maqbul*).
  - **Analisis Kemiripan AI**: Visualisasi bar persentase untuk 3 prediksi teratas model CNN.
  - **Penjelasan Ustadz AI (Gemini)**: Penjelasan berbasis AI yang memberikan koreksi tajwid secara detail, menjelaskan makhraj huruf, dan memberikan saran latihan yang dipersonalisasi.
- **Dasbor Statistik & Kemajuan**: Melacak dan memvisualisasikan kemajuan harian pengguna (*streak*/hari beruntun), huruf terkuat/terlemah, serta grafik perkembangan skor 7 hari terakhir (menggunakan grafik SVG responsif buatan sendiri tanpa pustaka eksternal) dan tabel riwayat latihan lengkap.
- **Responsif & Premium UI**: Tampilan bernuansa gelap (*Dark Mode*) modern dengan aksen *glow*, komponen *glassmorphism*, animasi halaman (*page transitions*), serta dioptimalkan untuk perangkat mobile maupun desktop.

### 🛡️ Ruang Admin & Active Learning Loop (Admin Space)
- **Role-based Route Guard**: Keamanan rute `/admin` dengan pelindung (*middleware*) khusus admin untuk mencegah akses tidak sah.
- **Ringkasan Statistik Admin**: Dasbor untuk memantau data agregat seperti total pengguna, total huruf hijaiyah, total feedback, dan jumlah dataset audio.
- **Manajemen Huruf Hijaiyah**: Kemampuan untuk menambah, menyunting, menghapus data huruf target, harakat, makhraj, serta mengunggah file contoh audio pelafalan.
- **Manajemen Pengguna**: Fitur melihat daftar pengguna terdaftar, mengelola hak akses (*role*), dan menghapus pengguna.
- **Active Learning Loop (Dataset Manager)**: Fitur penting untuk meningkatkan kecerdasan model AI secara berkelanjutan:
  - Peninjauan audio rekaman pengguna yang disimpan di server.
  - Fitur pelabelan ulang (*re-labeling*) jika terdapat salah klasifikasi oleh model AI.
  - Fitur ekspor kumpulan data audio baru (file ZIP audio beserta metadata CSV) untuk digunakan langsung pada proses pelatihan ulang (*retraining*) model Deep Learning.
- **Laporan & Umpan Balik Pengguna**: Panel terintegrasi untuk membaca keluhan, saran, dan laporan dari pengguna.

## 🛠️ Teknologi yang Digunakan

- **Framework**: [Nuxt 3](https://nuxt.com/) (Vue 3, Composition API)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Data Fetching**: `useAsyncData`, `$fetch`
- **Audio API**: Web Audio API / `MediaRecorder`

## 🚀 Panduan Setup

Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) (disarankan versi 18 atau yang lebih baru).

### 1. Kloning Repositori & Instalasi Dependensi

```bash
# Salin repositori (sesuaikan URL dengan milik Anda)
git clone https://github.com/RizalHaryaputra/tarteel-space-frontend.git
cd tarteel-space-frontend

# Instal dependensi (Gunakan npm, pnpm, atau yarn)
npm install
```

### 2. Variabel Lingkungan (*Environment Variables*)

Aplikasi ini membutuhkan konfigurasi URL API agar dapat berkomunikasi dengan *backend* (Tarteel Space API). 
Buat file `.env` di *root directory* dan tambahkan baris berikut:

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000
```
*(Ganti URL di atas sesuai dengan alamat backend Anda beroperasi)*

### 3. Menjalankan Development Server

Jalankan server pengembangan di mode *hot-reload*:

```bash
npm run dev
```

Aplikasi akan berjalan pada `http://localhost:3000`.

### 4. Build untuk Production

Untuk melakukan kompilasi aplikasi untuk lingkungan produksi (*production*):

```bash
npm run build
```

Anda dapat melihat pratinjau hasil kompilasi dengan:

```bash
npm run preview
```

## 📝 Catatan Tambahan

Proyek ini merupakan bagian dari Proyek Skripsi Teknologi Informasi. Kami mendesain antarmuka agar terasa premium, mudah digunakan, dan memotivasi pengguna untuk terus berlatih.

## 👥 Kredit

Proyek ini dikembangkan oleh [Rizal Haryaputra](https://github.com/RizalHaryaputra).
