<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const api = useApi()
const authStore = useAuthStore()

// Fetch real data dari API (client-side only to use auth token)
const { data: stats, pending: isLoading } = useAsyncData('dashboardStats', () => api.getDashboard(), { server: false })
const { data: weeklyData, pending: loadingWeekly } = useAsyncData('dashboardWeekly', () => api.getWeeklyScores(), { server: false })
const { data: recentHistory, pending: loadingHistory } = useAsyncData('dashboardHistory', () => api.getHistory(5, 0), { server: false })

// Rekomendasi dinamis berdasarkan response API
const recommendations = computed(() => {
  const recs: Array<{ letter: string; transliteration: string; accuracy: number; status: string }> = []
  
  if (stats.value?.huruf_terlemah) {
    stats.value.huruf_terlemah.forEach(item => {
      recs.push({ 
        letter: item.arabic_script, 
        transliteration: item.base_letter, 
        accuracy: item.avg_score, 
        status: 'Perlu Latihan' 
      })
    })
  }
  
  if (stats.value?.huruf_terkuat) {
    stats.value.huruf_terkuat.forEach(item => {
      // Avoid duplicate if same letter appears in both lists
      if (!recs.find(r => r.letter === item.arabic_script)) {
         recs.push({ 
           letter: item.arabic_script, 
           transliteration: item.base_letter, 
           accuracy: item.avg_score, 
           status: 'Kemajuan Baik' 
         })
      }
    })
  }
  return recs
})

const getAccuracyColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  if (score >= 60) return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const clean = dateString.includes('T') ? dateString : dateString.replace(' ', 'T')
  return new Date(clean).toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="pb-10 space-y-6">
    
    <!-- Row 1: Greeting and Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- 1. Greeting Card (Spans 2 cols) -->
      <div class="lg:col-span-2 bg-dark-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden group shadow-xl">
        <!-- Background decorative elements -->
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-primary-500/15 rounded-full blur-3xl group-hover:bg-primary-500/25 transition-all duration-700"></div>

        <div class="relative z-10 flex flex-col justify-between h-full space-y-6">
          <div>
            <span class="inline-block px-3.5 py-1 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-full font-mono text-xs font-bold tracking-widest uppercase mb-4">
              PROGRES LATIHAN
            </span>
            <h2 class="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-ink-0 tracking-tight mb-3 leading-tight">
              Selamat datang kembali, <br/>
              <span class="text-primary-400 font-serif italic font-normal">{{ authStore.userName?.split(' ')[0] || 'Pengguna' }}</span>
            </h2>
            <p class="font-sans text-sm sm:text-base text-ink-1 max-w-lg leading-relaxed">
              Anda sedang dalam <span class="font-mono text-amber-400 font-bold">{{ stats?.streak_hari || 0 }} hari beruntun</span>. Lanjutkan latihan untuk menyempurnakan pelafalan huruf hijaiyah Anda.
            </p>
          </div>
          
          <div>
            <NuxtLink to="/dashboard/practice" class="ts-btn ts-btn--primary ts-btn--lg">
              <span>Mulai Sesi Latihan</span>
              <span aria-hidden="true">→</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Right Column: Mini Stats -->
      <div class="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-6">
        <!-- 2. Mini Stat Card - Accuracy -->
        <div class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 hover:border-primary-500/40 rounded-3xl p-6 sm:p-7 flex flex-col justify-center items-center text-center transition-all duration-300 group relative overflow-hidden shadow-xl">
          <div class="w-12 h-12 rounded-2xl bg-dark-950 border border-white/10 flex items-center justify-center mb-3 text-primary-400 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div class="font-mono font-bold text-3xl sm:text-4xl text-ink-0 mb-1 flex items-baseline justify-center gap-1">
            <span v-if="isLoading" class="text-xl text-ink-3 animate-pulse">...</span>
            <template v-else>
              {{ stats?.rata_rata_akurasi?.toFixed(1) || '0.0' }}<span class="text-base text-primary-400 font-sans">%</span>
            </template>
          </div>
          <p class="font-mono text-xs sm:text-sm text-ink-2 uppercase tracking-wider font-semibold">Akurasi Rata-rata</p>
        </div>

        <!-- 3. Mini Stat Card - Exercises -->
        <div class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 hover:border-cyan-500/40 rounded-3xl p-6 sm:p-7 flex flex-col justify-center items-center text-center transition-all duration-300 group relative overflow-hidden shadow-xl">
          <div class="w-12 h-12 rounded-2xl bg-dark-950 border border-white/10 flex items-center justify-center mb-3 text-cyan-400 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div class="font-mono font-bold text-3xl sm:text-4xl text-ink-0 mb-1">
            <span v-if="isLoading" class="text-xl text-ink-3 animate-pulse">...</span>
            <template v-else>
              {{ stats?.total_latihan || 0 }}
            </template>
          </div>
          <p class="font-mono text-xs sm:text-sm text-ink-2 uppercase tracking-wider font-semibold">Latihan Selesai</p>
        </div>
      </div>
    </div>

    <!-- Row 2: Chart and Recommendations -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Interactive Chart Section (Spans 2 cols) -->
      <div class="lg:col-span-2 bg-dark-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden group shadow-xl">
        <div class="flex items-center justify-between mb-6 relative z-10">
          <div>
            <h3 class="font-display font-semibold text-xl sm:text-2xl text-ink-0 tracking-tight">Grafik Kemajuan Latihan</h3>
            <p class="font-sans text-sm text-ink-1 mt-1 leading-relaxed">Tren akurasi pelafalan selama 7 hari terakhir</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
            <span class="font-mono text-xs sm:text-sm text-ink-2 font-semibold">Akurasi (%)</span>
          </div>
        </div>

        <WeeklyScoreChart
          :data="weeklyData"
          :loading="loadingWeekly"
          empty-title="Belum Ada Data Skor"
          empty-description="Belum ada data latihan minggu ini."
          :svg-width="720"
          :svg-height="220"
        />
      </div>

      <!-- 4. Recommendations Card (Spans 1 col) -->
      <div class="lg:col-span-1 bg-dark-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col group relative overflow-hidden shadow-xl">
        <div class="flex items-center justify-between mb-6 relative z-10">
          <h3 class="font-display font-semibold text-xl text-ink-0 tracking-tight">Rekomendasi</h3>
          <NuxtLink to="/dashboard/practice" class="font-mono text-xs text-primary-400 hover:text-primary-300 font-semibold transition-colors">
            Semua →
          </NuxtLink>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="flex-1 flex items-center justify-center py-8 relative z-10">
          <div class="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="recommendations.length === 0" class="flex-1 flex flex-col items-center justify-center py-8 px-4 text-center bg-dark-950/40 rounded-2xl border border-dashed border-white/10 relative z-10">
          <p class="font-semibold text-sm text-ink-1 mb-1">Belum Ada Rekomendasi</p>
          <p class="text-ink-2 text-xs sm:text-sm leading-relaxed">Selesaikan beberapa sesi latihan agar AI dapat menganalisis perkembangan Anda.</p>
        </div>

        <!-- Data List -->
        <div v-else class="flex flex-col gap-3 relative z-10">
          <NuxtLink to="/dashboard/practice" v-for="rec in recommendations" :key="rec.letter" class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-dark-950/60 border border-white/10 hover:border-primary-500/40 transition-all cursor-pointer group/rec">
            <div class="w-12 h-12 rounded-xl bg-dark-900 border border-white/10 flex items-center justify-center shrink-0">
              <span class="text-2xl text-ink-0 font-sans font-bold group-hover/rec:text-primary-400 transition-colors">{{ rec.letter }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center mb-0.5">
                <span class="font-semibold text-sm sm:text-base text-ink-0 truncate">{{ rec.transliteration }}</span>
                <span class="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full" :class="rec.status === 'Perlu Latihan' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'">
                  {{ rec.accuracy.toFixed(1) }}%
                </span>
              </div>
              <p class="font-mono text-xs text-ink-2 font-medium">{{ rec.status }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Row 3: Recent History Section -->
    <div class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden group shadow-xl">
      <div class="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h3 class="font-display font-semibold text-xl sm:text-2xl text-ink-0 tracking-tight">Riwayat Latihan Terakhir</h3>
          <p class="font-sans text-sm text-ink-1 mt-1 leading-relaxed">Evaluasi suara terkini yang telah dianalisis oleh AI CNN</p>
        </div>
        <NuxtLink to="/dashboard/history" class="font-mono text-xs text-primary-400 hover:text-primary-300 font-semibold transition-colors">
          Lihat Semua Riwayat →
        </NuxtLink>
      </div>

      <div v-if="loadingHistory" class="flex items-center justify-center py-12">
        <div class="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
      <div v-else-if="!recentHistory || recentHistory.length === 0" class="flex flex-col items-center justify-center py-12 text-center bg-dark-950/40 rounded-2xl border border-dashed border-white/10">
        <p class="font-sans text-sm text-ink-2">Belum ada riwayat latihan.</p>
      </div>
      
      <!-- Horizontal Grid for Recent History -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div v-for="item in recentHistory" :key="item.id" class="flex flex-col items-center justify-center p-5 rounded-2xl bg-dark-950/60 border border-white/10 hover:border-primary-500/40 transition-all text-center group/history">
          <div class="w-14 h-14 rounded-2xl bg-dark-900 border border-white/10 flex items-center justify-center text-3xl text-ink-0 font-sans font-bold group-hover/history:text-primary-400 transition-colors mb-2.5">
            {{ item.arabic_script }}
          </div>
          <p class="font-sans font-semibold text-base text-ink-0 mb-1">{{ item.base_letter }} <span class="text-ink-3 font-normal text-xs sm:text-sm">({{ item.harakat }})</span></p>
          <div :class="['px-3 py-1 rounded-full font-mono text-xs sm:text-sm font-bold w-full mt-1.5', getAccuracyColor(item.accuracy_score)]">
            {{ item.accuracy_score.toFixed(1) }}%
          </div>
          <p class="font-mono text-xs text-ink-2 mt-2.5">{{ formatDate(item.created_at) }}</p>
        </div>
      </div>
    </div>

  </div>
</template>
