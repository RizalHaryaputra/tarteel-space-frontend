<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const api = useApi()
const authStore = useAuthStore()

// Fetch real data dari API (client-side only to use auth token)
const { data: stats, pending: isLoading, error } = useAsyncData('dashboardStats', () => api.getDashboard(), { server: false })
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

// SVG Line Chart Logic
const svgWidth = 1000
const svgHeight = 200
const maxScore = 100
const minScore = 0

const points = computed(() => {
  const dataList = weeklyData.value
  if (!Array.isArray(dataList) || dataList.length === 0) return []
  
  if (dataList.length === 1) {
    const firstWeekly = dataList[0]
    if (!firstWeekly) return []
    const normalizedScore = Math.max(0, firstWeekly.rata_rata - minScore) / (maxScore - minScore)
    const y = svgHeight - (normalizedScore * (svgHeight - 50)) - 30
    const dateStr = new Date(firstWeekly.tanggal).toLocaleDateString('id-ID', { weekday: 'short' })
    
    return [
      { x: 0, y, score: Math.round(firstWeekly.rata_rata), date: dateStr, isFake: true },
      { x: svgWidth / 2, y, score: Math.round(firstWeekly.rata_rata), date: dateStr },
      { x: svgWidth, y, score: Math.round(firstWeekly.rata_rata), date: dateStr, isFake: true }
    ]
  }

  const paddingX = 40
  const availableWidth = svgWidth - (paddingX * 2)

  return dataList.map((item, index) => {
    if (!item) return null
    const x = paddingX + (index / (dataList.length - 1)) * availableWidth
    const normalizedScore = Math.max(0, item.rata_rata - minScore) / (maxScore - minScore)
    const y = svgHeight - (normalizedScore * (svgHeight - 50)) - 30
    return { x, y, score: Math.round(item.rata_rata), date: new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short' }) }
  }).filter((p): p is { x: number; y: number; score: number; date: string; isFake?: boolean } => p !== null)
})

const polylinePoints = computed(() => {
  if (points.value.length === 0) return ''
  if (points.value.length === 1) {
    const p = points.value[0]
    return p ? `${p.x},${p.y}` : ''
  }
  return points.value.map(p => p ? `${p.x},${p.y}` : '').join(' ')
})

const polygonPoints = computed(() => {
  if (points.value.length === 0) return ''
  if (points.value.length === 1) {
    const p = points.value[0]
    return p ? `${p.x},${p.y} ${p.x},${svgHeight} ${p.x},${svgHeight}` : ''
  }
  
  const firstP = points.value[0]
  const lastP = points.value[points.value.length - 1]
  if (!firstP || !lastP) return ''
  
  return `${polylinePoints.value} ${lastP.x},${svgHeight} ${firstP.x},${svgHeight}`
})

const getAccuracyColor = (score: number) => {
  if (score >= 90) return 'text-green-400 bg-green-400/10 border-green-400/20'
  if (score >= 70) return 'text-primary-400 bg-primary-400/10 border-primary-400/20'
  if (score >= 50) return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
  return 'text-red-400 bg-red-400/10 border-red-400/20'
}

const formatDate = (isoStr: string) => {
  return new Date(isoStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <div class="h-full pb-10">
    
    <!-- Row 1: Greeting and Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      <!-- 1. Greeting Card (Spans 2 cols) -->
      <div class="lg:col-span-2 bg-gradient-to-br from-dark-900/80 to-dark-950/80 backdrop-blur-xl border border-dark-800 rounded-3xl p-8 relative overflow-hidden group">
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

      <!-- Right Column: Mini Stats -->
      <div class="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-6">
        <!-- 2. Mini Stat Card - Accuracy -->
        <div class="bg-dark-900/60 backdrop-blur-xl border border-dark-800 hover:border-primary-500/50 rounded-3xl p-6 flex flex-col justify-center items-center text-center transition-colors duration-300 group relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-colors"></div>
          <div class="w-14 h-14 rounded-2xl bg-dark-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-dark-700 relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div class="text-3xl font-bold text-white mb-1 flex items-baseline justify-center gap-1 relative z-10">
            <span v-if="isLoading" class="text-xl text-slate-500 animate-pulse">...</span>
            <template v-else>
              {{ stats?.rata_rata_akurasi?.toFixed(1) || '0.0' }}<span class="text-lg text-primary-400">%</span>
            </template>
          </div>
          <p class="text-xs text-slate-400 font-medium relative z-10">Akurasi Rata-rata</p>
        </div>

        <!-- 3. Mini Stat Card - Exercises -->
        <div class="bg-dark-900/60 backdrop-blur-xl border border-dark-800 hover:border-purple-500/50 rounded-3xl p-6 flex flex-col justify-center items-center text-center transition-colors duration-300 group relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
          <div class="w-14 h-14 rounded-2xl bg-dark-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(168,85,247,0.1)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-dark-700 relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div class="text-3xl font-bold text-white mb-1 relative z-10">
            <span v-if="isLoading" class="text-xl text-slate-500 animate-pulse">...</span>
            <template v-else>
              {{ stats?.total_latihan || 0 }}
            </template>
          </div>
          <p class="text-xs text-slate-400 font-medium relative z-10">Latihan Selesai</p>
        </div>
      </div>
    </div>

    <!-- Row 2: Chart and Recommendations -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      <!-- Interactive Chart Section (Spans 2 cols) -->
      <div class="lg:col-span-2 bg-dark-900/60 backdrop-blur-xl border border-dark-800 rounded-3xl p-6 relative overflow-hidden group">
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl pointer-events-none transition-all duration-1000 group-hover:bg-primary-500/10"></div>
        <div class="flex items-center justify-between mb-6 relative z-10">
          <h3 class="text-lg font-bold text-white">Grafik Kemajuan (7 Hari)</h3>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
            <span class="text-xs font-medium text-slate-400">Akurasi (%)</span>
          </div>
        </div>

        <div class="w-full relative z-10 overflow-x-auto custom-scrollbar">
          <div v-if="loadingWeekly" class="flex items-center justify-center py-12">
            <div class="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
          <div v-else-if="!weeklyData || weeklyData.length === 0" class="flex flex-col items-center justify-center py-12 text-center bg-dark-950/30 rounded-2xl border border-dark-800/50 border-dashed">
             <p class="text-slate-400 text-sm">Belum ada data latihan minggu ini.</p>
          </div>
          <div v-else class="min-w-[400px] h-[200px] relative mt-2">
            <!-- Y-axis Guidelines -->
            <div class="absolute inset-0 pointer-events-none">
              <div class="absolute top-[20px] w-full border-t border-dark-800/50 flex items-center justify-start">
                <span class="absolute -top-3 -left-1 text-[10px] text-slate-600 bg-dark-900 px-1">100</span>
              </div>
              <div class="absolute top-[95px] w-full border-t border-dark-800/50 flex items-center justify-start">
                <span class="absolute -top-3 -left-1 text-[10px] text-slate-600 bg-dark-900 px-1">50</span>
              </div>
              <div class="absolute top-[170px] w-full border-t border-dark-800/50 flex items-center justify-start">
                <span class="absolute -top-3 -left-1 text-[10px] text-slate-600 bg-dark-900 px-1">0</span>
              </div>
            </div>

            <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="w-full h-full overflow-visible" preserveAspectRatio="none">
              <!-- Gradient definition for area -->
              <defs>
                <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(59,130,246,0.3)" />
                  <stop offset="100%" stop-color="rgba(59,130,246,0.0)" />
                </linearGradient>
              </defs>

              <!-- Filled Area -->
              <polygon :points="polygonPoints" fill="url(#area-gradient)" class="transition-all duration-700 ease-in-out" />

              <!-- Stroke Line -->
              <polyline :points="polylinePoints" fill="none" stroke="rgba(59,130,246,0.8)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-700 ease-in-out" />

              <!-- Data Points & Labels -->
              <g v-for="(p, index) in points" :key="index" class="transition-all duration-700 ease-in-out group/point cursor-crosshair">
                <template v-if="!p.isFake">
                  <!-- X-axis Label -->
                  <text :x="p.x" :y="195" fill="#64748b" font-size="12" text-anchor="middle" font-weight="500" class="select-none pointer-events-none">{{ p.date }}</text>
                  <!-- Value Text (Hover) -->
                  <text :x="p.x" :y="p.y - 15" fill="#fff" font-size="14" text-anchor="middle" font-weight="bold" class="opacity-0 group-hover/point:opacity-100 transition-opacity drop-shadow-md select-none pointer-events-none">{{ p.score }}%</text>
                  <!-- Point Dot -->
                  <circle :cx="p.x" :cy="p.y" r="6" fill="#1e293b" stroke="#3b82f6" stroke-width="3" class="group-hover/point:r-8 group-hover/point:fill-[#3b82f6] transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                </template>
              </g>
            </svg>
          </div>
        </div>
      </div>

      <!-- 4. Recommendations Card (Spans 1 col) -->
      <div class="lg:col-span-1 bg-dark-900/60 backdrop-blur-xl border border-dark-800 rounded-3xl p-6 flex flex-col group relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none transition-all duration-1000 group-hover:bg-orange-500/10"></div>
        <div class="flex items-center justify-between mb-6 relative z-10">
          <h3 class="text-lg font-bold text-white">Rekomendasi Belajar</h3>
          <NuxtLink to="/dashboard/practice" class="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Lihat Semua →
          </NuxtLink>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="flex-1 flex items-center justify-center py-8 relative z-10">
          <div class="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="recommendations.length === 0" class="flex-1 flex flex-col items-center justify-center py-8 px-4 text-center bg-dark-950/30 rounded-2xl border border-dark-800/50 border-dashed relative z-10">
          <div class="w-12 h-12 rounded-full bg-dark-800/50 flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p class="text-slate-300 font-medium mb-1">Belum Ada Rekomendasi</p>
          <p class="text-slate-500 text-sm">Selesaikan beberapa sesi latihan agar kami dapat menganalisis perkembangan Anda.</p>
        </div>

        <!-- Data List -->
        <div v-else class="flex flex-col gap-4 relative z-10">
          <div v-for="rec in recommendations" :key="rec.letter" class="flex items-center gap-4 p-4 rounded-2xl bg-dark-900/60 border border-dark-800 hover:border-primary-500/50 transition-all duration-300 cursor-pointer group/rec relative overflow-hidden">
            <!-- Glow effect matching admin cards -->
            <div class="absolute -right-10 -top-10 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl group-hover/rec:bg-primary-500/15 transition-all pointer-events-none"></div>
            
            <div class="w-14 h-14 rounded-xl bg-dark-800 flex items-center justify-center border border-dark-700 shadow-inner relative z-10">
              <span class="text-4xl text-white font-arabic group-hover/rec:text-primary-400 transition-colors leading-none pt-2">{{ rec.letter }}</span>
            </div>
            <div class="flex-1 relative z-10">
              <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-white">{{ rec.transliteration }}</span>
                <span class="text-xs font-medium px-2 py-0.5 rounded-md" :class="rec.status === 'Perlu Latihan' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'">
                  {{ rec.accuracy.toFixed(1) }}%
                </span>
              </div>
              <p class="text-xs text-slate-500">{{ rec.status }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 3: Recent History Section -->
    <div class="bg-dark-900/60 backdrop-blur-xl border border-dark-800 rounded-3xl p-6 relative overflow-hidden group">
      <div class="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h3 class="text-lg font-bold text-white">Riwayat Latihan Terakhir</h3>
          <p class="text-sm text-slate-400">Pilih huruf untuk mendengarkan kembali rekaman Anda.</p>
        </div>
        <NuxtLink to="/dashboard/history" class="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors">
          Lihat Semua Riwayat →
        </NuxtLink>
      </div>

      <div v-if="loadingHistory" class="flex items-center justify-center py-12">
          <div class="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
      <div v-else-if="!recentHistory || recentHistory.length === 0" class="flex flex-col items-center justify-center py-12 text-center bg-dark-950/30 rounded-2xl border border-dark-800/50 border-dashed">
            <p class="text-slate-400 text-sm">Belum ada riwayat latihan.</p>
      </div>
      <!-- Horizontal Grid for Recent History -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div v-for="item in recentHistory" :key="item.id" class="flex flex-col items-center justify-center p-5 rounded-2xl bg-dark-900/60 border border-dark-800 hover:border-primary-500/50 transition-all duration-300 group/history text-center relative overflow-hidden">
          <!-- Top-right blur glow matching admin cards -->
          <div class="absolute -right-10 -top-10 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl group-hover/history:bg-primary-500/15 transition-all pointer-events-none"></div>
          
          <div class="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center border border-dark-700 text-4xl text-white font-arabic group-hover/history:text-primary-400 transition-all duration-300 leading-none pt-2 mb-3 relative z-10 shadow-inner">
            {{ item.arabic_script }}
          </div>
          <p class="font-bold text-white mb-1 relative z-10">{{ item.base_letter }} <span class="text-slate-500 font-normal">({{ item.harakat }})</span></p>
          <div :class="['px-3 py-1.5 rounded-lg border text-sm font-bold w-full mt-2 relative z-10', getAccuracyColor(item.accuracy_score)]">
            {{ item.accuracy_score.toFixed(1) }}%
          </div>
          <p class="text-xs text-slate-500 mt-3 relative z-10">{{ formatDate(item.created_at) }}</p>
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
