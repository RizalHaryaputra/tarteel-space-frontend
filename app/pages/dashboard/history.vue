<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const api = useApi()

// Fetch data (client-side only to ensure token is available)
const { data: weeklyData, pending: loadingWeekly, error: weeklyError } = useAsyncData('weeklyScores', () => api.getWeeklyScores(), { server: false })
const { data: historyList, pending: loadingHistory } = useAsyncData('historyList', () => api.getHistory(100, 0), { server: false })

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

const paginatedHistory = computed(() => {
  if (!historyList.value) return []
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return historyList.value.slice(start, end)
})


// State for Audio Playback
const currentlyPlaying = ref<{ url: string, type: 'user' | 'ustadz', id: string } | null>(null)
let currentAudioElement: HTMLAudioElement | null = null

const toggleAudio = (url: string | undefined | null, type: 'user' | 'ustadz', id: string) => {
  if (!url) return

  // Stop currently playing
  if (currentAudioElement) {
    currentAudioElement.pause()
    currentAudioElement.currentTime = 0
  }

  // If clicking the same one, just stop it
  if (currentlyPlaying.value?.id === id && currentlyPlaying.value?.type === type) {
    currentlyPlaying.value = null
    currentAudioElement = null
    return
  }

  // Play new one
  currentAudioElement = new Audio(url)
  currentlyPlaying.value = { url, type, id }
  
  currentAudioElement.onended = () => {
    if (currentlyPlaying.value?.id === id) {
      currentlyPlaying.value = null
    }
  }

  currentAudioElement.play().catch(e => {
    console.error("Gagal memutar audio:", e)
    currentlyPlaying.value = null
  })
}

onUnmounted(() => {
  if (currentAudioElement) {
    currentAudioElement.pause()
  }
})

// SVG Line Chart Logic
const svgWidth = 1000
const svgHeight = 280
const maxScore = 100
const minScore = 0

const points = computed(() => {
  const dataList = weeklyData.value
  if (!Array.isArray(dataList) || dataList.length === 0) return []
  
  if (dataList.length === 1) {
    const firstWeekly = dataList[0]
    if (!firstWeekly) return []
    const normalizedScore = Math.max(0, firstWeekly.rata_rata - minScore) / (maxScore - minScore)
    const y = svgHeight - (normalizedScore * (svgHeight - 60)) - 30
    const dateStr = new Date(firstWeekly.tanggal).toLocaleDateString('id-ID', { weekday: 'short' })
    
    return [
      { x: 0, y, score: Math.round(firstWeekly.rata_rata), date: dateStr, isFake: true },
      { x: svgWidth / 2, y, score: Math.round(firstWeekly.rata_rata), date: dateStr },
      { x: svgWidth, y, score: Math.round(firstWeekly.rata_rata), date: dateStr, isFake: true }
    ]
  }

  const paddingX = 60
  const availableWidth = svgWidth - (paddingX * 2)

  return dataList.map((item, index) => {
    if (!item) return null
    const x = paddingX + (index / (dataList.length - 1)) * availableWidth
    const normalizedScore = Math.max(0, item.rata_rata - minScore) / (maxScore - minScore)
    const y = svgHeight - (normalizedScore * (svgHeight - 60)) - 30
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
  
  return `${firstP.x},${svgHeight} ${polylinePoints.value} ${lastP.x},${svgHeight}`
})

const formatDate = (isoStr: string) => {
  return new Date(isoStr).toLocaleDateString('id-ID', {
    weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-8 pb-10">
    
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
      <div>
        <h2 class="font-display font-semibold text-3xl sm:text-4xl text-ink-0 tracking-tight">Riwayat & Kemajuan</h2>
        <p class="font-sans text-sm sm:text-base text-ink-1 mt-1 leading-relaxed">Pantau perkembangan dan detail akurasi pelafalan Anda dari waktu ke waktu.</p>
      </div>
    </div>

    <!-- Chart Section -->
    <div class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden relative group">
      <div class="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h3 class="font-display font-semibold text-xl sm:text-2xl text-ink-0 tracking-tight">Grafik Skor Mingguan</h3>
          <p class="font-sans text-sm text-ink-1 mt-1 leading-relaxed">Rata-rata akurasi 7 hari terakhir</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
          <span class="font-mono text-xs sm:text-sm text-ink-2 font-semibold">Akurasi (%)</span>
        </div>
      </div>

      <!-- Custom SVG Chart -->
      <div class="w-full relative z-10 overflow-x-auto custom-scrollbar">
        <!-- Error State -->
        <div v-if="weeklyError" class="flex flex-col items-center justify-center py-16 text-center">
          <p class="font-mono text-sm text-rose-400 mb-1 font-semibold">Gagal Memuat Data Grafik</p>
          <p class="font-sans text-xs sm:text-sm text-ink-2 max-w-sm mx-auto">{{ weeklyError.message || 'Terjadi kesalahan saat menghubungi server.' }}</p>
        </div>

        <!-- Loading State -->
        <div v-else-if="loadingWeekly" class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4 mx-auto"></div>
          <p class="font-sans text-sm text-ink-2">Memuat grafik skor...</p>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="!points.length" class="flex flex-col items-center justify-center py-16 text-center bg-dark-950/40 rounded-2xl border border-dashed border-white/10">
          <p class="font-semibold text-sm text-ink-1 mb-1">Belum Ada Data Skor</p>
          <p class="font-sans text-xs sm:text-sm text-ink-2 max-w-sm mx-auto">Selesaikan sesi latihan untuk mulai melihat grafik perkembangan skor Anda.</p>
        </div>

        <div v-else class="min-w-[600px]">
          <svg :viewBox="`0 0 ${svgWidth} ${svgHeight + 40}`" class="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="rgba(37, 99, 235, 0.25)" />
                <stop offset="100%" stop-color="rgba(37, 99, 235, 0.0)" />
              </linearGradient>
            </defs>

            <!-- Grid Lines -->
            <line x1="0" y1="30" :x2="svgWidth" y2="30" stroke="rgba(255,255,255,0.05)" stroke-width="1" stroke-dasharray="4,4" />
            <line x1="0" :y1="(svgHeight/2)+15" :x2="svgWidth" :y2="(svgHeight/2)+15" stroke="rgba(255,255,255,0.05)" stroke-width="1" stroke-dasharray="4,4" />
            <line x1="0" :y1="svgHeight" :x2="svgWidth" y2="svgHeight" stroke="rgba(255,255,255,0.08)" stroke-width="1" />

            <!-- Filled Area -->
            <polygon 
              :points="polygonPoints" 
              fill="url(#gradient-area)"
              class="transition-all duration-700 ease-in-out"
            />

            <!-- Line Path -->
            <polyline 
              :points="polylinePoints" 
              fill="none" 
              stroke="rgba(59,130,246,0.85)" 
              stroke-width="3" 
              stroke-linecap="round" 
              stroke-linejoin="round"
              class="draw-line drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]"
            />

            <!-- Data Points -->
            <g v-for="(point, i) in points" :key="i" class="group/point cursor-crosshair">
              <template v-if="!point.isFake">
                <circle 
                  :cx="point.x" 
                  :cy="point.y" 
                  r="5" 
                  fill="#0b0d11" 
                  stroke="#3b82f6" 
                  stroke-width="2.5" 
                  class="hover:r-7 transition-all duration-200"
                />
                
                <text :x="point.x" :y="point.y - 12" fill="#f4f6fb" font-family="'Geist Mono', monospace" font-size="13" font-weight="700" text-anchor="middle" class="opacity-0 group-hover/point:opacity-100 transition-opacity select-none pointer-events-none">
                  {{ point.score }}%
                </text>
                
                <text :x="point.x" :y="svgHeight + 25" fill="#6c7a9c" font-family="'Geist Mono', monospace" font-size="12" text-anchor="middle" class="select-none pointer-events-none font-semibold">
                  {{ point.date }}
                </text>
              </template>
            </g>
          </svg>
        </div>
      </div>
    </div>

    <!-- History Table -->
    <div class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
      <div class="mb-6">
        <h3 class="font-display font-semibold text-xl sm:text-2xl text-ink-0 tracking-tight">Riwayat Sesi Latihan</h3>
        <p class="font-sans text-sm text-ink-1 mt-1 leading-relaxed">Daftar rekaman latihan audio dan evaluasi AI</p>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse font-sans text-sm">
          <thead>
            <tr class="border-b border-white/10 font-mono text-xs uppercase tracking-wider text-ink-2 font-semibold">
              <th class="py-4 px-4 font-semibold">Hari / Tanggal</th>
              <th class="py-4 px-4 font-semibold">Huruf Target</th>
              <th class="py-4 px-4 font-semibold text-center">Putar Audio</th>
              <th class="py-4 px-4 font-semibold text-right">Skor Akurasi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-ink-0">
            <tr v-if="loadingHistory">
              <td colspan="4" class="py-10 text-center font-sans text-xs text-ink-3 animate-pulse">Memuat riwayat latihan...</td>
            </tr>
            <tr v-else-if="!historyList?.length">
              <td colspan="4" class="py-10 text-center font-sans text-xs text-ink-3">Belum ada riwayat latihan.</td>
            </tr>
            <template v-else v-for="item in paginatedHistory" :key="item.id">
              <tr class="hover:bg-dark-850/50 transition-colors group">
                <td class="py-4 px-4 font-mono text-xs text-ink-1">
                  {{ formatDate(item.created_at) }}
                </td>
                <td class="py-4 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-dark-950 border border-white/10 flex items-center justify-center font-sans text-xl font-semibold text-ink-0 group-hover:text-primary-400 transition-colors">
                      {{ item.arabic_script }}
                    </div>
                    <div>
                      <div class="font-medium text-sm text-ink-0">{{ item.base_letter }} · <span class="text-ink-2 font-normal text-xs">{{ item.harakat }}</span></div>
                    </div>
                  </div>
                </td>
                
                <!-- Audio Playback Column -->
                <td class="py-4 px-4 text-center">
                  <div class="flex items-center justify-center gap-3">
                    <!-- User Audio Button -->
                    <div class="flex flex-col items-center gap-1">
                      <button v-if="item.user_audio" @click.stop="toggleAudio(item.user_audio, 'user', item.id)"
                        class="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 border cursor-pointer"
                        :class="currentlyPlaying?.id === item.id && currentlyPlaying?.type === 'user' ? 'bg-primary-500 text-dark-950 border-primary-400 shadow-md shadow-primary-500/30' : 'bg-dark-950 text-ink-1 hover:text-ink-0 border-white/10 hover:border-white/20'"
                        title="Putar Rekaman Anda">
                        <svg v-if="currentlyPlaying?.id === item.id && currentlyPlaying?.type === 'user'" xmlns="http://www.w3.org/2000/svg"
                          class="h-3.5 w-3.5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                          <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
                        </svg>
                      </button>
                      <span v-else class="font-mono text-[9px] text-ink-3 italic py-1">-</span>
                      <span v-if="item.user_audio" class="font-mono text-[9px] text-ink-3 uppercase">Anda</span>
                    </div>

                    <!-- Ustadz Audio Button -->
                    <div class="flex flex-col items-center gap-1">
                      <button v-if="item.ustadz_audio" @click.stop="toggleAudio(item.ustadz_audio, 'ustadz', item.id)"
                        class="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 border cursor-pointer"
                        :class="currentlyPlaying?.id === item.id && currentlyPlaying?.type === 'ustadz' ? 'bg-cyan-500 text-dark-950 border-cyan-400 shadow-md shadow-cyan-500/30' : 'bg-dark-950 text-ink-1 hover:text-ink-0 border-white/10 hover:border-white/20'"
                        title="Putar Audio Referensi">
                        <svg v-if="currentlyPlaying?.id === item.id && currentlyPlaying?.type === 'ustadz'" xmlns="http://www.w3.org/2000/svg"
                          class="h-3.5 w-3.5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                          <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
                        </svg>
                      </button>
                      <span v-else class="font-mono text-[9px] text-ink-3 italic py-1">-</span>
                      <span v-if="item.ustadz_audio" class="font-mono text-[9px] text-ink-3 uppercase">Ustadz</span>
                    </div>
                  </div>
                </td>

                <td class="py-4 px-4 text-right">
                  <span 
                    class="inline-block px-2.5 py-1 rounded-full font-mono text-xs font-semibold"
                    :class="item.accuracy_score >= 90 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            item.accuracy_score >= 75 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'"
                  >
                    {{ item.accuracy_score.toFixed(1) }}%
                  </span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="mt-6 border-t border-white/5 pt-6">
        <AppPagination 
          v-if="historyList && historyList.length > 0"
          :totalItems="historyList.length" 
          :itemsPerPage="itemsPerPage" 
          v-model="currentPage" 
        />
      </div>
    </div>
    
  </div>
</template>
