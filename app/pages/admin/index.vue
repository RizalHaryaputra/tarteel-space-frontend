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

const maxTrendCount = computed(() => {
  if (!stats.value?.daily_trend?.length) return 1
  return Math.max(...stats.value.daily_trend.map((d: any) => d.count), 1)
})

const chartData = computed(() => {
  if (!stats.value?.daily_trend?.length) {
    // Fallback if empty or not loaded
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
    // scale to 5% min, 100% max so bar is always visible
    const percent = Math.max(5, (d.count / max) * 100)
    return {
      ...d,
      percent,
      active: idx === list.length - 1 // Make today (last item) active
    }
  })
})
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

      <!-- Quick Actions & Visuals Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Main Content Area (Takes 2 columns on large screens) -->
        <div class="lg:col-span-2 space-y-6 flex flex-col">
          
          <!-- Chart Container (Mockup Data) -->
          <div class="bg-dark-900/60 backdrop-blur-xl border border-dark-800 rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden group flex-1">
            <div class="absolute -right-20 -top-20 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-all duration-500"></div>
            
            <div class="flex items-center justify-between mb-8 z-10">
              <div>
                <h3 class="text-lg md:text-xl font-bold text-white flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  Aktivitas Latihan
                </h3>
                <p class="text-xs text-slate-400 mt-1.5 ml-1">Statistik jumlah latihan pengguna 7 hari terakhir</p>
              </div>
            </div>
            
            <!-- Custom CSS Bar Chart -->
            <div class="h-44 w-full flex items-end justify-between gap-3 md:gap-6 z-10 mt-auto pt-4 border-b border-dark-800/50 pb-2">
              <div v-for="(item, idx) in chartData" :key="idx" class="flex flex-col items-center gap-3 flex-1 h-full group/bar relative">
                
                <!-- Tooltip -->
                <div class="absolute -top-8 bg-dark-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-lg">
                  {{ item.count }} Latihan
                </div>

                <div class="w-full bg-dark-950/50 rounded-t-lg relative h-full flex items-end overflow-hidden group-hover/bar:bg-dark-800/30 transition-colors">
                  <div 
                    class="w-full transition-all duration-500 relative rounded-t-sm"
                    :class="item.active ? 'bg-primary-500/40 border-t-2 border-primary-400 group-hover/bar:bg-primary-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-blue-500/15 border-t-2 border-blue-500/50 group-hover/bar:bg-blue-500/30'"
                    :style="{ height: `${item.percent}%` }"
                  >
                    <div class="absolute inset-0 bg-gradient-to-t from-transparent" :class="item.active ? 'to-primary-400/20' : 'to-blue-400/10'"></div>
                  </div>
                </div>
                <span class="text-[11px]" :class="item.active ? 'text-primary-400 font-bold' : 'text-slate-500 font-medium'">{{ item.day }}</span>
              </div>
            </div>
          </div>

          <!-- Workflow Guide Card -->
          <div class="bg-dark-900/60 backdrop-blur-xl border border-dark-800 hover:border-primary-500/30 transition-colors rounded-3xl p-6 md:p-8 flex flex-col">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg md:text-xl font-bold text-white flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                Alur Active Learning
              </h3>
              <span class="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] uppercase tracking-wider font-bold rounded-full border border-purple-500/20 hidden sm:block">Pipeline</span>
            </div>
            
            <div class="relative flex-1 flex flex-col justify-center">
              <!-- Connecting Line (Desktop) -->
              <div class="hidden md:block absolute top-8 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-dark-800 via-purple-500/30 to-dark-800 z-0"></div>
              
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative z-10">
                <!-- Step 1 -->
                <div class="flex flex-col items-center text-center group">
                  <div class="w-16 h-16 rounded-2xl bg-dark-950 border border-dark-700 group-hover:border-primary-500/50 flex items-center justify-center mb-3 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-500 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 class="text-sm font-bold text-white mb-1">1. Keluhan</h4>
                  <p class="text-[11px] text-slate-400 leading-snug">User lapor prediksi tidak akurat.</p>
                </div>

                <!-- Step 2 -->
                <div class="flex flex-col items-center text-center group">
                  <div class="w-16 h-16 rounded-2xl bg-dark-950 border border-dark-700 group-hover:border-purple-500/50 flex items-center justify-center mb-3 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-500 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h4 class="text-sm font-bold text-white mb-1">2. Peninjauan</h4>
                  <p class="text-[11px] text-slate-400 leading-snug">Admin validasi label makhraj.</p>
                </div>

                <!-- Step 3 -->
                <div class="flex flex-col items-center text-center group">
                  <div class="w-16 h-16 rounded-2xl bg-dark-950 border border-dark-700 group-hover:border-green-500/50 flex items-center justify-center mb-3 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-500 group-hover:text-green-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                  </div>
                  <h4 class="text-sm font-bold text-white mb-1">3. Dataset Pool</h4>
                  <p class="text-[11px] text-slate-400 leading-snug">Tersimpan sebagai bahan latih.</p>
                </div>

                <!-- Step 4 -->
                <div class="flex flex-col items-center text-center group">
                  <div class="w-16 h-16 rounded-2xl bg-dark-950 border border-dark-700 group-hover:border-cyan-500/50 flex items-center justify-center mb-3 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-500 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <h4 class="text-sm font-bold text-white mb-1">4. Ekspor</h4>
                  <p class="text-[11px] text-slate-400 leading-snug">Unduh metadata retraining.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Shortcuts Card (Takes 1 column) -->
        <div class="bg-dark-900/60 backdrop-blur-xl border border-dark-800 hover:border-slate-700/50 transition-colors rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Pintasan Menu
            </h3>
            <div class="space-y-3">
              
              <NuxtLink to="/admin/users" class="flex items-center gap-4 p-3 bg-dark-950/50 border border-dark-800 hover:border-blue-500/40 hover:bg-blue-500/5 rounded-2xl transition-all group">
                <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <div>
                  <span class="block text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Kelola Pengguna</span>
                  <span class="text-xs text-slate-500">Akses akun & role</span>
                </div>
              </NuxtLink>

              <NuxtLink to="/admin/letters" class="flex items-center gap-4 p-3 bg-dark-950/50 border border-dark-800 hover:border-amber-500/40 hover:bg-amber-500/5 rounded-2xl transition-all group">
                <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                </div>
                <div>
                  <span class="block text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Huruf Hijaiyah</span>
                  <span class="text-xs text-slate-500">Edit huruf & audio</span>
                </div>
              </NuxtLink>

              <NuxtLink to="/admin/feedbacks" class="flex items-center gap-4 p-3 bg-dark-950/50 border border-dark-800 hover:border-red-500/40 hover:bg-red-500/5 rounded-2xl transition-all group">
                <div class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                </div>
                <div>
                  <span class="block text-sm font-bold text-white group-hover:text-red-400 transition-colors">Periksa Keluhan</span>
                  <span class="text-xs text-slate-500">Validasi makhraj</span>
                </div>
              </NuxtLink>

              <NuxtLink to="/admin/dataset" class="flex items-center gap-4 p-3 bg-dark-950/50 border border-dark-800 hover:border-cyan-500/40 hover:bg-cyan-500/5 rounded-2xl transition-all group">
                <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </div>
                <div>
                  <span class="block text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Ekspor Dataset</span>
                  <span class="text-xs text-slate-500">Unduh data latih</span>
                </div>
              </NuxtLink>

            </div>
          </div>

          <div class="mt-6 pt-5 border-t border-dark-800 flex items-center justify-between">
            <span class="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span class="relative flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              Sistem Live
            </span>
            <button @click="() => refresh()" class="text-primary-400 hover:text-white font-semibold transition-colors flex items-center gap-1.5 bg-primary-500/10 hover:bg-primary-500/30 px-3 py-1.5 rounded-lg text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
              </svg>
              Segarkan
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
