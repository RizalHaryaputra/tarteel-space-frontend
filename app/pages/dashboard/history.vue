<script setup lang="ts">
import { computed } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

// Mock Data
const historyData = [
  { date: 'Senin', score: 65, letter: 'بَ', transliteration: 'Ba' },
  { date: 'Selasa', score: 70, letter: 'تَ', transliteration: 'Ta' },
  { date: 'Rabu', score: 68, letter: 'ثَ', transliteration: 'Tsa' },
  { date: 'Kamis', score: 80, letter: 'جَ', transliteration: 'Ja' },
  { date: 'Jumat', score: 85, letter: 'حَ', transliteration: 'Ha' },
  { date: 'Sabtu', score: 82, letter: 'خَ', transliteration: 'Kha' },
  { date: 'Minggu', score: 92, letter: 'نَ', transliteration: 'Nun' }
]

// SVG Line Chart Logic
const svgWidth = 1000
const svgHeight = 300
const maxScore = 100
const minScore = 50 // Base for dynamic looking graph

const points = computed(() => {
  return historyData.map((data, index) => {
    const x = (index / (historyData.length - 1)) * svgWidth
    const normalizedScore = Math.max(0, data.score - minScore) / (maxScore - minScore)
    const y = svgHeight - (normalizedScore * (svgHeight - 60)) - 30 // Add padding
    return { x, y, score: data.score, date: data.date }
  })
})

const polylinePoints = computed(() => {
  return points.value.map(p => `${p.x},${p.y}`).join(' ')
})

const polygonPoints = computed(() => {
  return `${polylinePoints.value} ${svgWidth},${svgHeight} 0,${svgHeight}`
})
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
        <div class="min-w-[600px]">
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
            <tr v-for="(item, idx) in historyData.slice().reverse()" :key="idx" class="hover:bg-dark-800/30 transition-colors group">
              <td class="py-4 px-4 text-slate-300 font-medium">
                {{ item.date }}
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-dark-950 border border-dark-700 flex items-center justify-center font-arabic text-xl text-white group-hover:text-primary-400 transition-colors shadow-inner">
                    {{ item.letter }}
                  </div>
                  <span class="font-medium text-slate-300">{{ item.transliteration }}</span>
                </div>
              </td>
              <td class="py-4 px-4 text-right">
                <span 
                  class="inline-block px-3 py-1 rounded-md text-sm font-bold"
                  :class="item.score >= 90 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                          item.score >= 75 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                          'bg-red-500/10 text-red-400 border border-red-500/20'"
                >
                  {{ item.score }}%
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
