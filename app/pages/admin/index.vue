<script setup lang="ts">
import { useRoute } from 'vue-router'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const api = useApi()

// Fetch real data dari API (client-side only)
const { data: stats, pending: isLoading, error, refresh } = useAsyncData(
  'adminOverviewStats',
  () => api.getAdminStats(),
  { server: false }
)
</script>

<template>
  <div class="h-full space-y-8">
    <!-- Sub-navigation & Header -->
    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-dark-800 pb-5">
      <div>
        <h2 class="text-3xl font-extrabold text-white tracking-tight">Ringkasan</h2>
        <p class="text-slate-400 mt-1 text-sm">Overview performa dan metrik platform Tarteel Space.</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4"></div>
      <p class="text-slate-400 text-sm">Memuat data statistik admin...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-2xl max-w-xl">
      <h3 class="text-lg font-bold mb-2">Gagal Memuat Statistik</h3>
      <p class="text-sm mb-4">{{ error.message }}</p>
      <button @click="() => refresh()" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition-colors">
        Coba Lagi
      </button>
    </div>

    <div v-else class="space-y-8">
      <!-- Stats Cards Bento Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        
        <!-- 1. Users Card -->
        <div class="bg-dark-900/60 backdrop-blur-xl border border-dark-800 hover:border-blue-500/50 rounded-3xl p-6 transition-all duration-300 group relative overflow-hidden">
          <div class="absolute -right-10 -top-10 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/15 transition-all"></div>
          <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20 group-hover:scale-115 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p class="text-sm text-slate-400 font-medium">Total Pengguna</p>
          <p class="text-3xl font-bold text-white mt-1">{{ stats?.total_users ?? 0 }}</p>
        </div>

        <!-- 2. Evaluations Card -->
        <div class="bg-dark-900/60 backdrop-blur-xl border border-dark-800 hover:border-purple-500/50 rounded-3xl p-6 transition-all duration-300 group relative overflow-hidden">
          <div class="absolute -right-10 -top-10 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/15 transition-all"></div>
          <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20 group-hover:scale-115 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <p class="text-sm text-slate-400 font-medium">Latihan Pelafalan</p>
          <p class="text-3xl font-bold text-white mt-1">{{ stats?.total_evaluations ?? 0 }}</p>
        </div>

        <!-- 3. Accuracy Card -->
        <div class="bg-dark-900/60 backdrop-blur-xl border border-dark-800 hover:border-green-500/50 rounded-3xl p-6 transition-all duration-300 group relative overflow-hidden">
          <div class="absolute -right-10 -top-10 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/15 transition-all"></div>
          <div class="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/20 group-hover:scale-115 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p class="text-sm text-slate-400 font-medium">Akurasi Global</p>
          <p class="text-3xl font-bold text-white mt-1">{{ stats?.average_accuracy?.toFixed(1) ?? '0.0' }}%</p>
        </div>

        <!-- 4. Feedbacks Card -->
        <div class="bg-dark-900/60 backdrop-blur-xl border border-dark-800 hover:border-red-500/50 rounded-3xl p-6 transition-all duration-300 group relative overflow-hidden">
          <div class="absolute -right-10 -top-10 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/15 transition-all"></div>
          <div class="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20 group-hover:scale-115 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p class="text-sm text-slate-400 font-medium">Laporan Keluhan</p>
          <p class="text-3xl font-bold text-white mt-1">{{ stats?.total_feedbacks ?? 0 }}</p>
        </div>

        <!-- 5. Dataset Pool Card -->
        <div class="bg-dark-900/60 backdrop-blur-xl border border-dark-800 hover:border-cyan-500/50 rounded-3xl p-6 transition-all duration-300 group relative overflow-hidden">
          <div class="absolute -right-10 -top-10 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-all"></div>
          <div class="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/20 group-hover:scale-115 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <p class="text-sm text-slate-400 font-medium">Dataset Pool</p>
          <p class="text-3xl font-bold text-white mt-1">{{ stats?.total_dataset_pool ?? 0 }}</p>
        </div>

      </div>

      <!-- Quick Actions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <!-- Workflow Guide Card -->
        <div class="bg-dark-900/60 backdrop-blur-xl border border-dark-800 rounded-3xl p-8 space-y-6">
          <h3 class="text-xl font-bold text-white">Alur Active Learning (Pembelajaran Aktif)</h3>
          
          <div class="space-y-4">
            <div class="flex gap-4">
              <div class="w-8 h-8 rounded-full bg-primary-500/15 text-primary-400 flex items-center justify-center font-bold text-sm shrink-0 border border-primary-500/30">1</div>
              <div>
                <h4 class="text-sm font-semibold text-white">Pengguna Mengeluh</h4>
                <p class="text-xs text-slate-400 mt-1">Jika hasil prediksi CNN salah atau kurang akurat saat berlatih pelafalan, pengguna dapat mengirimkan keluhan pada riwayat pelafalan mereka.</p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="w-8 h-8 rounded-full bg-primary-500/15 text-primary-400 flex items-center justify-center font-bold text-sm shrink-0 border border-primary-500/30">2</div>
              <div>
                <h4 class="text-sm font-semibold text-white">Admin Meninjau Rekaman</h4>
                <p class="text-xs text-slate-400 mt-1">Admin mendengarkan audio rekaman pengguna di menu <strong>Laporan & Feedback</strong>, melihat 5 tebakan teratas model, dan merekomendasikan koreksi label makhraj yang benar.</p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="w-8 h-8 rounded-full bg-primary-500/15 text-primary-400 flex items-center justify-center font-bold text-sm shrink-0 border border-primary-500/30">3</div>
              <div>
                <h4 class="text-sm font-semibold text-white">Validasi ke Dataset Pool</h4>
                <p class="text-xs text-slate-400 mt-1">Setelah diverifikasi oleh admin, audio & metadata pelafalan tersebut masuk ke <strong>Dataset Pool</strong> sebagai data latih baru berkualitas tinggi.</p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="w-8 h-8 rounded-full bg-primary-500/15 text-primary-400 flex items-center justify-center font-bold text-sm shrink-0 border border-primary-500/30">4</div>
              <div>
                <h4 class="text-sm font-semibold text-white">Ekspor Dataset</h4>
                <p class="text-xs text-slate-400 mt-1">Admin dapat mengunduh daftar audio terverifikasi di menu <strong>Dataset Pool</strong> dalam format ekspor data untuk digunakan kembali pada siklus pelatihan ulang (retraining) model CNN.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Shortcuts Card -->
        <div class="bg-dark-900/60 backdrop-blur-xl border border-dark-800 rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <h3 class="text-xl font-bold text-white mb-6">Pintasan Cepat</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <NuxtLink to="/admin/users" class="flex flex-col p-4 bg-dark-950/50 border border-dark-800 hover:border-primary-500/50 hover:bg-dark-800/40 rounded-2xl transition-all group">
                <span class="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">Kelola Pengguna →</span>
                <span class="text-xs text-slate-500 mt-1">Lihat riwayat latihan, ubah role admin/user, atau hapus akun.</span>
              </NuxtLink>

              <NuxtLink to="/admin/letters" class="flex flex-col p-4 bg-dark-950/50 border border-dark-800 hover:border-primary-500/50 hover:bg-dark-800/40 rounded-2xl transition-all group">
                <span class="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">Kelola Huruf Hijaiyah →</span>
                <span class="text-xs text-slate-500 mt-1">Edit huruf, harakat, transkripsi, serta unggah audio contoh Ustadz.</span>
              </NuxtLink>

              <NuxtLink to="/admin/feedbacks" class="flex flex-col p-4 bg-dark-950/50 border border-dark-800 hover:border-primary-500/50 hover:bg-dark-800/40 rounded-2xl transition-all group">
                <span class="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">Periksa Keluhan Pelafalan →</span>
                <span class="text-xs text-slate-500 mt-1">Dengarkan audio keluhan akurasi dan validasi label makhraj.</span>
              </NuxtLink>

              <NuxtLink to="/admin/dataset" class="flex flex-col p-4 bg-dark-950/50 border border-dark-800 hover:border-primary-500/50 hover:bg-dark-800/40 rounded-2xl transition-all group">
                <span class="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">Ekspor Dataset Pool →</span>
                <span class="text-xs text-slate-500 mt-1">Lihat data terverifikasi dan unduh tabel metadata dataset.</span>
              </NuxtLink>

            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-dark-800 flex items-center justify-between text-xs text-slate-500">
            <span>Sistem berjalan di mode produksi</span>
            <button @click="() => refresh()" class="text-primary-400 hover:text-primary-300 font-semibold transition-colors flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
              </svg>
              Segarkan Data
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
