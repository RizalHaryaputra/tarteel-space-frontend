<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const api = useApi()

// Fetch real data dari API (client-side only)
const { data: stats, pending: isLoading, error, refresh } = useAsyncData(
  'adminOverviewStats',
  () => api.getAdminStats(),
  { server: false }
)

const maxTrendCount = computed(() => {
  if (!stats.value?.daily_trend?.length) return 1
  return Math.max(...stats.value.daily_trend.map((d: any) => d.count), 1)
})

const chartData = computed(() => {
  if (!stats.value?.daily_trend?.length) {
    return [
      { day: 'Sen', percent: 5, count: 0, active: false },
      { day: 'Sel', percent: 5, count: 0, active: false },
      { day: 'Rab', percent: 5, count: 0, active: false },
      { day: 'Kam', percent: 5, count: 0, active: false },
      { day: 'Jum', percent: 5, count: 0, active: false },
      { day: 'Sab', percent: 5, count: 0, active: false },
      { day: 'Min', percent: 5, count: 0, active: true },
    ]
  }
  const max = maxTrendCount.value
  const list = stats.value.daily_trend
  return list.map((d: any, idx: number) => {
    const percent = Math.max(5, (d.count / max) * 100)
    return {
      ...d,
      percent,
      active: idx === list.length - 1
    }
  })
})
</script>

<template>
  <div class="h-full space-y-8 font-sans pb-10">
    <!-- Sub-navigation & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
      <div>
        <h2 class="font-display font-semibold text-3xl sm:text-4xl text-ink-0 tracking-tight">Ringkasan Sistem</h2>
        <p class="font-sans text-sm sm:text-base text-ink-1 mt-1 leading-relaxed">Overview performa platform, aktivitas
          pengguna, dan metrik AI CNN.</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4"></div>
      <p class="font-sans text-sm text-ink-2">Memuat data statistik admin...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error"
      class="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-6 rounded-2xl max-w-xl font-mono text-sm">
      <h3 class="font-bold mb-2 text-base">Gagal Memuat Statistik</h3>
      <p class="text-sm mb-4 text-ink-1">{{ error.message }}</p>
      <button @click="() => refresh()"
        class="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white rounded-full font-mono text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer">
        Coba Lagi
      </button>
    </div>

    <div v-else class="space-y-8">
      <!-- Stats Cards Bento Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">

        <!-- 1. Users Card -->
        <div
          class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 hover:border-primary-500/40 rounded-3xl p-6 transition-all duration-300 group relative overflow-hidden shadow-xl">
          <div
            class="w-11 h-11 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-3.5 text-primary-400 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p class="font-mono text-xs sm:text-sm text-ink-2 uppercase tracking-wider font-semibold">Total Pengguna</p>
          <p class="font-mono font-bold text-3xl sm:text-4xl text-ink-0 mt-1.5">{{ stats?.total_users ?? 0 }}</p>
        </div>

        <!-- 2. Evaluations Card -->
        <div
          class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 hover:border-cyan-500/40 rounded-3xl p-6 transition-all duration-300 group relative overflow-hidden shadow-xl">
          <div
            class="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3.5 text-cyan-400 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <p class="font-mono text-xs sm:text-sm text-ink-2 uppercase tracking-wider font-semibold">Total Latihan</p>
          <p class="font-mono font-bold text-3xl sm:text-4xl text-ink-0 mt-1.5">{{ stats?.total_evaluations ?? 0 }}</p>
        </div>

        <!-- 3. Accuracy Card -->
        <div
          class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 hover:border-emerald-500/40 rounded-3xl p-6 transition-all duration-300 group relative overflow-hidden shadow-xl">
          <div
            class="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3.5 text-emerald-400 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p class="font-mono text-xs sm:text-sm text-ink-2 uppercase tracking-wider font-semibold">Akurasi Global</p>
          <p class="font-mono font-bold text-3xl sm:text-4xl text-ink-0 mt-1.5">{{ stats?.average_accuracy?.toFixed(1)
            ?? '0.0' }}%</p>
        </div>

        <!-- 4. Feedbacks Card -->
        <div
          class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 hover:border-rose-500/40 rounded-3xl p-6 transition-all duration-300 group relative overflow-hidden shadow-xl">
          <div
            class="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3.5 text-rose-400 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p class="font-mono text-xs sm:text-sm text-ink-2 uppercase tracking-wider font-semibold">Laporan Koreksi</p>
          <p class="font-mono font-bold text-3xl sm:text-4xl text-ink-0 mt-1.5">{{ stats?.total_feedbacks ?? 0 }}</p>
        </div>

        <!-- 5. Dataset Pool Card -->
        <div
          class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 hover:border-amber-500/40 rounded-3xl p-6 transition-all duration-300 group relative overflow-hidden shadow-xl">
          <div
            class="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3.5 text-amber-400 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <p class="font-mono text-xs sm:text-sm text-ink-2 uppercase tracking-wider font-semibold">Dataset Pool</p>
          <p class="font-mono font-bold text-3xl sm:text-4xl text-ink-0 mt-1.5">{{ stats?.total_dataset_pool ?? 0 }}</p>
        </div>

      </div>

      <!-- Quick Actions & Visuals Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Main Content Area (Takes 2 columns on large screens) -->
        <div class="lg:col-span-2 space-y-6 flex flex-col">

          <!-- Chart Container -->
          <div
            class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col relative overflow-hidden group flex-1 shadow-xl">
            <div class="flex items-center justify-between mb-6 z-10">
              <div>
                <h3 class="font-display font-semibold text-xl sm:text-2xl text-ink-0 tracking-tight">Aktivitas Latihan
                  Harian</h3>
                <p class="font-sans text-sm text-ink-1 mt-1 leading-relaxed">Jumlah rekaman latihan pengguna dalam 7
                  hari terakhir</p>
              </div>
            </div>

            <!-- Custom CSS Bar Chart -->
            <div
              class="h-48 w-full flex items-end justify-between gap-3 sm:gap-6 z-10 mt-auto pt-4 border-b border-white/5 pb-2">
              <div v-for="(item, idx) in chartData" :key="idx"
                class="flex flex-col items-center gap-2.5 flex-1 h-full group/bar relative">

                <!-- Tooltip -->
                <div
                  class="absolute -top-8 bg-dark-950 border border-white/10 text-ink-0 font-mono text-xs font-semibold px-2.5 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-xl">
                  {{ item.count }} Latihan
                </div>

                <div
                  class="w-full bg-dark-950/60 rounded-t-xl relative h-full flex items-end overflow-hidden group-hover/bar:bg-dark-850 transition-colors">
                  <div class="w-full transition-all duration-500 relative rounded-t-lg"
                    :class="item.active ? 'bg-primary-500/60 border-t-2 border-primary-400 shadow-[0_0_16px_rgba(59,130,246,0.4)]' : 'bg-primary-500/20 border-t-2 border-primary-500/40 group-hover/bar:bg-primary-500/40'"
                    :style="{ height: `${item.percent}%` }">
                  </div>
                </div>
                <span class="font-mono text-xs sm:text-sm font-semibold"
                  :class="item.active ? 'text-primary-400' : 'text-ink-2'">{{ item.day }}</span>
              </div>
            </div>
          </div>

          <!-- Workflow Guide Card -->
          <div
            class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col shadow-xl">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="font-display font-semibold text-xl sm:text-2xl text-ink-0 tracking-tight">Alur Community
                  Active Learning</h3>
                <p class="font-sans text-sm text-ink-1 mt-1 leading-relaxed">Siklus augmentasi dataset dan peningkatan
                  akurasi model AI CNN</p>
              </div>
              <span
                class="px-3 py-1 bg-primary-500/10 text-primary-400 font-mono text-xs uppercase tracking-widest font-bold rounded-full border border-primary-500/20 hidden sm:block">PIPELINE</span>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              <!-- Step 1 -->
              <div
                class="flex flex-col items-center text-center p-4 rounded-2xl bg-dark-950/50 border border-white/10 hover:border-white/20 transition-all">
                <div
                  class="w-12 h-12 rounded-2xl bg-dark-900 border border-white/10 flex items-center justify-center mb-3 text-ink-2 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-400" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 class="font-sans font-semibold text-sm text-ink-0 mb-1">1. Laporan</h4>
                <p class="font-sans text-xs text-ink-2 leading-relaxed">User melaporkan koreksi prediksi AI.</p>
              </div>

              <!-- Step 2 -->
              <div
                class="flex flex-col items-center text-center p-4 rounded-2xl bg-dark-950/50 border border-white/10 hover:border-white/20 transition-all">
                <div
                  class="w-12 h-12 rounded-2xl bg-dark-900 border border-white/10 flex items-center justify-center mb-3 text-ink-2 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h4 class="font-sans font-semibold text-sm text-ink-0 mb-1">2. Validasi</h4>
                <p class="font-sans text-xs text-ink-2 leading-relaxed">Admin memvalidasi label makhraj audio.</p>
              </div>

              <!-- Step 3 -->
              <div
                class="flex flex-col items-center text-center p-4 rounded-2xl bg-dark-950/50 border border-white/10 hover:border-white/20 transition-all">
                <div
                  class="w-12 h-12 rounded-2xl bg-dark-900 border border-white/10 flex items-center justify-center mb-3 text-ink-2 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-400" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <h4 class="font-sans font-semibold text-sm text-ink-0 mb-1">3. Dataset Pool</h4>
                <p class="font-sans text-xs text-ink-2 leading-relaxed">Audio masuk ke koleksi data latih terverifikasi.
                </p>
              </div>

              <!-- Step 4 -->
              <div
                class="flex flex-col items-center text-center p-4 rounded-2xl bg-dark-950/50 border border-white/10 hover:border-white/20 transition-all">
                <div
                  class="w-12 h-12 rounded-2xl bg-dark-900 border border-white/10 flex items-center justify-center mb-3 text-ink-2 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <h4 class="font-sans font-semibold text-sm text-ink-0 mb-1">4. Ekspor AI</h4>
                <p class="font-sans text-xs text-ink-2 leading-relaxed">Unduh dataset untuk retraining model CNN.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Shortcuts Card (Takes 1 column) -->
        <div
          class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div>
            <h3 class="font-display font-semibold text-xl sm:text-2xl text-ink-0 mb-6 tracking-tight">Pintasan Menu
              Admin</h3>
            <div class="space-y-3">

              <NuxtLink to="/admin/users"
                class="flex items-center gap-3.5 p-3.5 bg-dark-950/60 border border-white/10 hover:border-primary-500/40 rounded-2xl transition-all group cursor-pointer">
                <div
                  class="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <span
                    class="block text-sm font-semibold text-ink-0 group-hover:text-primary-400 transition-colors">Kelola
                    Pengguna</span>
                  <span class="font-mono text-xs text-ink-2 uppercase tracking-wide">Hak akses & role akun</span>
                </div>
              </NuxtLink>

              <NuxtLink to="/admin/letters"
                class="flex items-center gap-3.5 p-3.5 bg-dark-950/60 border border-white/10 hover:border-primary-500/40 rounded-2xl transition-all group cursor-pointer">
                <div
                  class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <span
                    class="block text-sm font-semibold text-ink-0 group-hover:text-cyan-400 transition-colors">Kelola
                    Huruf Hijaiyah</span>
                  <span class="font-mono text-xs text-ink-2 uppercase tracking-wide">84 kelas & target makhraj</span>
                </div>
              </NuxtLink>

              <NuxtLink to="/admin/feedbacks"
                class="flex items-center gap-3.5 p-3.5 bg-dark-950/60 border border-white/10 hover:border-primary-500/40 rounded-2xl transition-all group cursor-pointer">
                <div
                  class="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <div>
                  <span
                    class="block text-sm font-semibold text-ink-0 group-hover:text-rose-400 transition-colors">Periksa
                    Keluhan</span>
                  <span class="font-mono text-xs text-ink-2 uppercase tracking-wide">Umpan balik prediksi</span>
                </div>
              </NuxtLink>

              <NuxtLink to="/admin/dataset"
                class="flex items-center gap-3.5 p-3.5 bg-dark-950/60 border border-white/10 hover:border-primary-500/40 rounded-2xl transition-all group cursor-pointer">
                <div
                  class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div>
                  <span
                    class="block text-sm font-semibold text-ink-0 group-hover:text-amber-400 transition-colors">Ekspor
                    Dataset</span>
                  <span class="font-mono text-xs text-ink-2 uppercase tracking-wide">Download audio & metadata</span>
                </div>
              </NuxtLink>

            </div>
          </div>

          <div class="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
            <span class="flex items-center gap-2 font-mono text-xs text-ink-1 font-semibold">
              <span class="relative flex h-2.5 w-2.5">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              SISTEM AKTIF
            </span>
            <button @click="() => refresh()"
              class="ts-btn ts-btn--ghost ts-btn--sm text-primary-300 hover:text-white border-primary-500/30 hover:border-primary-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24"
                stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>Segarkan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
