<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const api = useApi()
const authStore = useAuthStore()

// Fetch real data dari API (client-side only to use auth token)
const { data: stats, pending: isLoading, error } = useAsyncData('dashboardStats', () => api.getDashboard(), { server: false })

// Rekomendasi dinamis berdasarkan response API
const recommendations = computed(() => {
  const recs = []
  if (stats.value?.huruf_terlemah) {
    recs.push({ letter: stats.value.huruf_terlemah, transliteration: 'Fokus Utama', accuracy: 0, status: 'Perlu Latihan' })
  }
  if (stats.value?.huruf_terkuat) {
    recs.push({ letter: stats.value.huruf_terkuat, transliteration: 'Kemajuan Baik', accuracy: 100, status: 'Terus Pertahankan' })
  }
  return recs
})
</script>

<template>
  <div class="h-full">
    <!-- Bento Grid Container -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      
      <!-- 1. Greeting Card (Spans 2 or 3 cols depending on breakpoint) -->
      <div class="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-dark-900/80 to-dark-950/80 backdrop-blur-xl border border-dark-800 rounded-3xl p-8 relative overflow-hidden group">
        <!-- Background decorative elements -->
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-700"></div>
        <div class="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 select-none pointer-events-none">
          <svg class="w-64 h-64 text-primary-500" viewBox="0 0 100 100" fill="currentColor">
            <!-- Simplified abstract pattern -->
            <path d="M50 0 C77.6 0 100 22.4 100 50 C100 77.6 77.6 100 50 100 C22.4 100 0 77.6 0 50 C0 22.4 22.4 0 50 0 Z M50 20 C33.4 20 20 33.4 20 50 C20 66.6 33.4 80 50 80 C66.6 80 80 66.6 80 50 C80 33.4 66.6 20 50 20 Z" />
          </svg>
        </div>

        <div class="relative z-10 flex flex-col justify-between h-full">
          <div>
            <span class="inline-block px-3 py-1 bg-primary-500/20 border border-primary-500/30 text-primary-400 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              Progres Berlanjut
            </span>
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-2">
              Selamat datang kembali, <br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-300">{{ authStore.userName?.split(' ')[0] || 'Pengguna' }}!</span>
            </h2>
            <p class="text-slate-400 max-w-md">
              Anda sedang dalam <span class="text-orange-400 font-semibold">{{ stats?.streak_hari || 0 }} hari beruntun</span>. Lanjutkan latihan untuk menyempurnakan pelafalan huruf hijaiyah Anda.
            </p>
          </div>
          
          <div class="mt-8">
            <NuxtLink to="/dashboard/practice" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/25 group/btn">
              <span>Mulai Sesi Latihan</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- 2. Mini Stat Card - Accuracy -->
      <div class="md:col-span-1 bg-dark-900/60 backdrop-blur-xl border border-dark-800 hover:border-primary-500/50 rounded-3xl p-6 flex flex-col justify-center items-center text-center transition-colors duration-300 group">
        <div class="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-dark-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <div class="text-4xl font-bold text-white mb-1 flex items-baseline justify-center gap-1">
          <span v-if="isLoading" class="text-2xl text-slate-500 animate-pulse">...</span>
          <template v-else>
            {{ stats?.rata_rata_akurasi?.toFixed(1) || '0.0' }}<span class="text-xl text-primary-400">%</span>
          </template>
        </div>
        <p class="text-sm text-slate-400 font-medium">Akurasi Rata-rata</p>
      </div>

      <!-- 3. Mini Stat Card - Exercises -->
      <div class="md:col-span-1 bg-dark-900/60 backdrop-blur-xl border border-dark-800 hover:border-purple-500/50 rounded-3xl p-6 flex flex-col justify-center items-center text-center transition-colors duration-300 group">
        <div class="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(168,85,247,0.1)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-dark-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div class="text-4xl font-bold text-white mb-1">
          <span v-if="isLoading" class="text-2xl text-slate-500 animate-pulse">...</span>
          <template v-else>
            {{ stats?.total_latihan || 0 }}
          </template>
        </div>
        <p class="text-sm text-slate-400 font-medium">Latihan Selesai</p>
      </div>

      <!-- 4. Recommendations Card -->
      <div class="md:col-span-2 lg:col-span-3 bg-dark-900/60 backdrop-blur-xl border border-dark-800 rounded-3xl p-6 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-white">Rekomendasi Belajar</h3>
          <NuxtLink to="/dashboard/practice" class="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Lihat Semua →
          </NuxtLink>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <div class="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="recommendations.length === 0" class="flex flex-col items-center justify-center py-8 px-4 text-center bg-dark-950/30 rounded-2xl border border-dark-800/50 border-dashed">
          <div class="w-12 h-12 rounded-full bg-dark-800/50 flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p class="text-slate-300 font-medium mb-1">Belum Ada Rekomendasi</p>
          <p class="text-slate-500 text-sm">Selesaikan beberapa sesi latihan agar kami dapat menganalisis perkembangan Anda.</p>
        </div>

        <!-- Data List -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="rec in recommendations" :key="rec.letter" class="flex items-center gap-4 p-4 rounded-2xl bg-dark-950/50 border border-dark-800/50 hover:bg-dark-800/50 transition-colors cursor-pointer group">
            <div class="w-14 h-14 rounded-xl bg-dark-800 flex items-center justify-center border border-dark-700 shadow-inner">
              <span class="text-3xl text-white font-arabic group-hover:text-primary-400 transition-colors">{{ rec.letter }}</span>
            </div>
            <div class="flex-1">
              <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-white">{{ rec.transliteration }}</span>
                <span class="text-xs font-medium px-2 py-0.5 rounded-md" :class="rec.status === 'Perlu Latihan' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'">
                  {{ rec.status === 'Perlu Latihan' ? 'Target' : 'Excellent' }}
                </span>
              </div>
              <p class="text-xs text-slate-500">{{ rec.status }}</p>
            </div>
            <button class="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri&display=swap');
.font-arabic {
  font-family: 'Amiri', serif;
}
</style>
