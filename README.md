# Tarteel Space - Frontend

Tarteel Space adalah aplikasi web inovatif yang dirancang untuk membantu pengguna menyempurnakan pelafalan huruf hijaiyah dan kaidah tajwid Al-Qur'an. Aplikasi ini menggunakan teknologi kecerdasan buatan (Deep Learning / CNN) melalui backend-nya untuk memberikan evaluasi *real-time* atas rekaman suara pengguna. 

Repositori ini berisi kode *frontend* dari aplikasi Tarteel Space yang dibangun menggunakan kerangka kerja [Nuxt 3](https://nuxt.com/) dan antarmuka yang dirancang dengan [Tailwind CSS](https://tailwindcss.com/).

## ✨ Fitur Utama

- **Autentikasi Pengguna**: Sistem pendaftaran dan masuk yang aman. Seluruh rute dilindungi dengan *middleware* Nuxt.
- **Ruang Latihan Interaktif**: Kemampuan merekam suara secara langsung dari *browser* dan mengirimkannya ke *backend* untuk dievaluasi oleh model AI.
- **Laporan Evaluasi *Real-time***: Menampilkan skor akurasi (0-100%) dan umpan balik atas pelafalan secara seketika.
- **Dasbor Statistik**: Melacak dan memvisualisasikan kemajuan harian pengguna (hari beruntun/ *streak*), huruf terkuat, dan huruf yang perlu perbaikan.
- **Riwayat Belajar**: Dilengkapi grafik skor akurasi 7 hari terakhir (menggunakan grafik SVG responsif tanpa pustaka eksternal) dan tabel riwayat latihan.
- **Responsif & Estetik**: Tampilan bernuansa gelap (Dark Mode) modern dengan aksen *glow*, komponen *glassmorphism*, animasi yang halus, dan dioptimalkan untuk berbagai layar genggam (*mobile*) maupun *desktop*.

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
