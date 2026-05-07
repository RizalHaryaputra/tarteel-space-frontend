<script setup lang="ts">
import { computed } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

const api = useApi()

// Fetch data (client-side only to ensure token is available)
const { data: weeklyData, pending: loadingWeekly, error: weeklyError } = useAsyncData('weeklyScores', () => api.getWeeklyScores(), { server: false })
const { data: historyList, pending: loadingHistory, error: historyError } = useAsyncData('historyList', () => api.getHistory(20, 0), { server: false })

// SVG Line Chart Logic
const svgWidth = 1000
const svgHeight = 300
const maxScore = 100
const minScore = 50 // Base for dynamic looking graph

const points = computed(() => {
  const dataList = weeklyData.value
  if (!Array.isArray(dataList) || dataList.length === 0) return []
  
  if (dataList.length === 1) {
    const data = dataList[0]
    if (!data) return []
    const normalizedScore = Math.max(0, data.rata_rata - minScore) / (maxScore - minScore)
    const y = svgHeight - (normalizedScore * (svgHeight - 60)) - 30
    const dateStr = new Date(data.tanggal).toLocaleDateString('id-ID', { weekday: 'short' })
    
    // Jika hanya 1 data, buat garis lurus mendatar agar grafik tetap terlihat
    return [
      { x: 0, y, score: Math.round(data.rata_rata), date: dateStr, isFake: true },
      { x: svgWidth / 2, y, score: Math.round(data.rata_rata), date: dateStr },
      { x: svgWidth, y, score: Math.round(data.rata_rata), date: dateStr, isFake: true }
    ]
  }

  const paddingX = 60
  const availableWidth = svgWidth - (paddingX * 2)

  return dataList.map((data, index) => {
    const x = paddingX + (index / (dataList.length - 1)) * availableWidth
    const normalizedScore = Math.max(0, data.rata_rata - minScore) / (maxScore - minScore)
    const y = svgHeight - (normalizedScore * (svgHeight - 60)) - 30 // Add padding
    return { x, y, score: Math.round(data.rata_rata), date: new Date(data.tanggal).toLocaleDateString('id-ID', { weekday: 'short' }) }
  })
})

const polylinePoints = computed(() => {
  if (points.value.length === 0) return ''
  if (points.value.length === 1) {
    const p = points.value[0]
    return p ? `${p.x},${p.y}` : ''
  }
  return points.value.map(p => `${p.x},${p.y}`).join(' ')
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

const formatDate = (isoStr: string) => {
  return new Date(isoStr).toLocaleDateString('id-ID', {
    weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-white mb-2">Riwayat & Kemajuan</h2>
      <p class="text-slate-400">Pantau perkembangan pelafalan Anda dari waktu ke waktu.</p>
    </div>

    <!-- Chart Section -->
    <div class="bg-dark-900/80 backdrop-blur-xl border border-dark-800 rounded-3xl p-6 mb-8 shadow-2xl overflow-hidden relative group">
      <!-- Glow background -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none transition-all duration-1000 group-hover:bg-primary-500/10"></div>
      
      <div class="flex items-center justify-between mb-8 relative z-10">
        <h3 class="text-lg font-bold text-white">Grafik Skor (7 Hari Terakhir)</h3>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
          <span class="text-sm font-medium text-slate-400">Akurasi (%)</span>
        </div>
      </div>

      <!-- Custom SVG Chart -->
      <div class="w-full relative z-10 overflow-x-auto pb-4 custom-scrollbar">
        <!-- Error State -->
        <div v-if="weeklyError" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 mx-auto border border-red-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-red-400 font-semibold text-lg mb-2">Gagal Memuat Data</p>
          <p class="text-slate-500 text-sm max-w-sm mx-auto">{{ weeklyError.message || 'Terjadi kesalahan saat menghubungi server.' }}</p>
        </div>

        <!-- Loading State -->
        <div v-else-if="loadingWeekly" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4 mx-auto"></div>
          <p class="text-slate-400 font-medium">Memuat grafik skor...</p>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="!points.length" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-16 h-16 rounded-full bg-dark-800/50 flex items-center justify-center mb-4 mx-auto border border-dark-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <p class="text-slate-300 font-semibold text-lg mb-2">Belum Ada Data Skor</p>
          <p class="text-slate-500 text-sm max-w-sm mx-auto">Selesaikan sesi latihan hari ini untuk mulai melihat perkembangan skor akurasi Anda di grafik ini.</p>
        </div>

        <div v-else class="min-w-[600px]">
          <svg :viewBox="`0 0 ${svgWidth} ${svgHeight + 40}`" class="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="rgba(59, 130, 246, 0.4)" />
                <stop offset="100%" stop-color="rgba(59, 130, 246, 0)" />
              </linearGradient>
            </defs>

            <!-- Grid Lines -->
            <line x1="0" y1="30" :x2="svgWidth" y2="30" stroke="rgba(255,255,255,0.05)" stroke-width="1" stroke-dasharray="5,5" />
            <line x1="0" :y1="(svgHeight/2)+15" :x2="svgWidth" :y2="(svgHeight/2)+15" stroke="rgba(255,255,255,0.05)" stroke-width="1" stroke-dasharray="5,5" />
            <line x1="0" :y1="svgHeight" :x2="svgWidth" :y2="svgHeight" stroke="rgba(255,255,255,0.1)" stroke-width="1" />

            <!-- Filled Area -->
            <polygon 
              :points="polygonPoints" 
              fill="url(#gradient-area)"
              class="animate-fade-in"
              style="animation-duration: 1.5s;"
            />

            <!-- Line Path -->
            <polyline 
              :points="polylinePoints" 
              fill="none" 
              stroke="#3b82f6" 
              stroke-width="4" 
              stroke-linecap="round"
              stroke-linejoin="round"
              class="draw-line drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            />

            <!-- Data Points -->
            <g v-for="(point, i) in points" :key="i" class="animate-fade-in" :style="`animation-delay: ${i * 0.1 + 0.5}s; opacity: 0; animation-fill-mode: forwards;`">
              <template v-if="!point.isFake">
                <!-- Point circle -->
                <circle 
                  :cx="point.x" 
                  :cy="point.y" 
                  r="6" 
                  fill="#0f172a" 
                  stroke="#60a5fa" 
                  stroke-width="3" 
                  class="hover:r-8 transition-all cursor-pointer shadow-lg drop-shadow-[0_0_5px_rgba(96,165,250,0.8)]"
                />
                
                <!-- Value Text -->
                <text :x="point.x" :y="point.y - 15" fill="white" font-size="14" font-weight="bold" text-anchor="middle" class="select-none">
                  {{ point.score }}%
                </text>
                
                <!-- X Axis Labels -->
                <text :x="point.x" :y="svgHeight + 25" fill="#94a3b8" font-size="14" font-weight="500" text-anchor="middle" class="select-none">
                  {{ point.date }}
                </text>
              </template>
            </g>
          </svg>
        </div>
      </div>
    </div>

    <!-- History Table -->
    <div class="bg-dark-900/80 backdrop-blur-xl border border-dark-800 rounded-3xl p-6 shadow-2xl">
      <h3 class="text-lg font-bold text-white mb-6">Riwayat Sesi Latihan</h3>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-dark-800/80">
              <th class="py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider w-1/4">Hari/Tanggal</th>
              <th class="py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider w-1/3">Huruf Target</th>
              <th class="py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider text-right">Skor Akurasi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark-800/50">
            <tr v-if="loadingHistory">
              <td colspan="3" class="py-8 text-center text-slate-500 animate-pulse">Memuat riwayat...</td>
            </tr>
            <tr v-else-if="!historyList?.length">
              <td colspan="3" class="py-8 text-center text-slate-500">Belum ada riwayat latihan.</td>
            </tr>
            <tr v-else v-for="item in historyList" :key="item.id" class="hover:bg-dark-800/30 transition-colors group">
              <td class="py-4 px-4 text-slate-300 font-medium text-sm">
                {{ formatDate(item.created_at) }}
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-dark-950 border border-dark-700 flex items-center justify-center font-arabic text-xl text-white group-hover:text-primary-400 transition-colors shadow-inner">
                    {{ item.arabic_script }}
                  </div>
                  <span class="font-medium text-slate-300">{{ item.base_letter }} · {{ item.harakat }}</span>
                </div>
              </td>
              <td class="py-4 px-4 text-right">
                <span 
                  class="inline-block px-3 py-1 rounded-md text-sm font-bold"
                  :class="item.accuracy_score >= 90 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                          item.accuracy_score >= 75 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                          'bg-red-500/10 text-red-400 border border-red-500/20'"
                >
                  {{ item.accuracy_score.toFixed(1) }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri&display=swap');
.font-arabic {
  font-family: 'Amiri', serif;
}

/* Custom SVG Draw Line Animation */
.draw-line {
  stroke-dasharray: 2000;
  stroke-dashoffset: 2000;
  animation: draw 1.5s ease-out forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation-name: fade-in;
  animation-duration: 0.5s;
  animation-fill-mode: forwards;
}

/* Custom Scrollbar for SVG container if overflows on small screens */
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.5);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.8);
}
</style>
