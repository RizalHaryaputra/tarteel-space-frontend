<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const api = useApi()

// Fetch data (client-side only to ensure token is available)
const { data: weeklyData, pending: loadingWeekly, error: weeklyError } = useAsyncData('weeklyScores', () => api.getWeeklyScores(), { server: false })
const { data: historyList, pending: loadingHistory, error: historyError } = useAsyncData('historyList', () => api.getHistory(100, 0), { server: false })

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

const paginatedHistory = computed(() => {
  if (!historyList.value) return []
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return historyList.value.slice(start, end)
})

// State for AI Explanations
const isModalOpen = ref(false)
const selectedEvalId = ref<string | null>(null)
const explanations = ref<Record<string, { loading: boolean, text: string }>>({})

const openExplanationModal = async (evalId: string) => {
  selectedEvalId.value = evalId
  isModalOpen.value = true
  
  if (!explanations.value[evalId] || !explanations.value[evalId].text) {
    explanations.value[evalId] = { loading: true, text: '' }
    try {
      const res = await api.getExplanation(evalId)
      explanations.value[evalId] = { loading: false, text: res.explanation }
      
      const item = historyList.value?.find((i: any) => i.id === evalId)
      if (item) item.ai_explanation = res.explanation
    } catch (err) {
      explanations.value[evalId] = { loading: false, text: 'Gagal memuat penjelasan dari AI. Silakan coba lagi.' }
    }
  }
}

const closeExplanationModal = () => {
  isModalOpen.value = false
  setTimeout(() => {
    selectedEvalId.value = null
  }, 300)
}

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
const svgHeight = 300
const maxScore = 100
const minScore = 0 // Fixed: using 0 so actual scores under 50% are shown correctly

const points = computed(() => {
  const dataList = weeklyData.value
  if (!Array.isArray(dataList) || dataList.length === 0) return []
  
  if (dataList.length === 1) {
    const firstWeekly = dataList[0]
    if (!firstWeekly) return []
    const normalizedScore = Math.max(0, firstWeekly.rata_rata - minScore) / (maxScore - minScore)
    const y = svgHeight - (normalizedScore * (svgHeight - 60)) - 30
    const dateStr = new Date(firstWeekly.tanggal).toLocaleDateString('id-ID', { weekday: 'short' })
    
    // Jika hanya 1 data, buat garis lurus mendatar agar grafik tetap terlihat
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
    const y = svgHeight - (normalizedScore * (svgHeight - 60)) - 30 // Add padding
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

const formatDate = (isoStr: string) => {
  return new Date(isoStr).toLocaleDateString('id-ID', {
    weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 shrink-0 gap-4 border-b border-dark-800 pb-5">
      <div>
        <h2 class="text-3xl font-extrabold text-white tracking-tight">Riwayat & Kemajuan</h2>
        <p class="text-slate-400 mt-1 text-sm">Pantau perkembangan pelafalan Anda dari waktu ke waktu.</p>
      </div>
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
              <th class="py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Huruf Target</th>
              <th class="py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider text-center">Putar Audio</th>
              <th class="py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider text-right">Skor Akurasi</th>
              <th class="py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider text-center w-36">Penjelasan AI</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark-800/50">
            <tr v-if="loadingHistory">
              <td colspan="5" class="py-8 text-center text-slate-500 animate-pulse">Memuat riwayat...</td>
            </tr>
            <tr v-else-if="!historyList?.length">
              <td colspan="5" class="py-8 text-center text-slate-500">Belum ada riwayat latihan.</td>
            </tr>
            <template v-else v-for="item in paginatedHistory" :key="item.id">
              <tr class="hover:bg-dark-800/30 transition-colors group">
              <td class="py-4 px-4 text-slate-300 font-medium text-sm">
                {{ formatDate(item.created_at) }}
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-dark-950 border border-dark-700 flex items-center justify-center font-arabic text-xl text-white group-hover:text-primary-400 transition-colors shadow-inner">
                    {{ item.arabic_script }}
                  </div>
                  <div>
                    <div class="font-medium text-slate-300">{{ item.base_letter }} · {{ item.harakat }}</div>
                    <div v-if="item.tajweed_grade" class="text-xs text-slate-500 font-semibold mt-0.5">{{ item.tajweed_grade }}</div>
                  </div>
                </div>
              </td>
              
              <!-- Audio Playback Column -->
              <td class="py-4 px-4 text-center">
                <div class="flex items-center justify-center gap-4">
                  <!-- User Audio Button -->
                  <div class="flex flex-col items-center gap-1.5">
                    <button v-if="item.user_audio" @click.stop="toggleAudio(item.user_audio, 'user', item.id)"
                      class="p-2 rounded-lg transition-all shadow-md"
                      :class="currentlyPlaying?.id === item.id && currentlyPlaying?.type === 'user' ? 'bg-primary-600 text-white' : 'bg-primary-500 hover:bg-primary-600 text-white'"
                      title="Putar Rekaman Anda">
                      <svg v-if="currentlyPlaying?.id === item.id && currentlyPlaying?.type === 'user'" xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd"
                          d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                          clip-rule="evenodd" />
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="currentColor"
                        viewBox="0 0 24 24">
                        <path fill-rule="evenodd"
                          d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                          clip-rule="evenodd" />
                      </svg>
                    </button>
                    <span v-else class="text-[10px] text-slate-600 italic leading-none py-2">Kosong</span>
                    <span v-if="item.user_audio" class="text-[10px] text-slate-400 font-medium">Anda</span>
                  </div>

                  <!-- Ustadz Audio Button -->
                  <div class="flex flex-col items-center gap-1.5">
                    <button v-if="item.ustadz_audio" @click.stop="toggleAudio(item.ustadz_audio, 'ustadz', item.id)"
                      class="p-2 rounded-lg transition-all shadow-md"
                      :class="currentlyPlaying?.id === item.id && currentlyPlaying?.type === 'ustadz' ? 'bg-purple-600 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'"
                      title="Putar Audio Ustadz">
                      <svg v-if="currentlyPlaying?.id === item.id && currentlyPlaying?.type === 'ustadz'" xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd"
                          d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                          clip-rule="evenodd" />
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="currentColor"
                        viewBox="0 0 24 24">
                        <path fill-rule="evenodd"
                          d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                          clip-rule="evenodd" />
                      </svg>
                    </button>
                    <span v-else class="text-[10px] text-slate-600 italic leading-none py-2">Kosong</span>
                    <span v-if="item.ustadz_audio" class="text-[10px] text-slate-400 font-medium">Ustadz</span>
                  </div>
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
              <td class="py-4 px-4 text-center">
                <button 
                  @click="openExplanationModal(item.id)"
                  class="p-2 rounded-xl transition-colors tooltip-trigger flex items-center justify-center mx-auto gap-1.5 px-3"
                  :class="item.ai_explanation || explanations[item.id]?.text ? 'text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20' : 'text-slate-400 bg-dark-800 hover:text-primary-400 hover:bg-primary-500/10 border border-dark-700'"
                  :title="item.ai_explanation || explanations[item.id]?.text ? 'Lihat Penjelasan AI (Tersedia)' : 'Minta Penjelasan AI'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span class="text-xs font-bold" v-if="item.ai_explanation || explanations[item.id]?.text">Lihat</span>
                  <span class="text-xs font-bold" v-else>Minta</span>
                </button>
              </td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="px-6 pb-6 mt-6 border-t border-dark-800/50 pt-6">
        <AppPagination 
          v-if="historyList && historyList.length > 0"
          :totalItems="historyList.length" 
          :itemsPerPage="itemsPerPage" 
          v-model="currentPage" 
        />
      </div>
    </div>
    
    <!-- AI Explanation Modal -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-sm transition-opacity" @click="closeExplanationModal"></div>
        <div class="relative w-full max-w-lg bg-dark-900 border border-dark-800 rounded-3xl shadow-2xl overflow-hidden animate-fade-in" style="animation-duration: 0.3s;">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-dark-800 flex items-center justify-between bg-dark-800/50">
            <h4 class="text-lg font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Analisis AI Tarteel
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-500 text-white uppercase tracking-wider ml-1">Gemini</span>
            </h4>
            <button @click="closeExplanationModal" class="text-slate-400 hover:text-white transition-colors bg-dark-800 hover:bg-dark-700 p-1.5 rounded-xl border border-dark-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Content -->
          <div class="p-6 min-h-[150px] max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div v-if="selectedEvalId && explanations[selectedEvalId]?.loading" class="flex flex-col items-center justify-center py-8">
              <div class="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4"></div>
              <p class="text-slate-400 text-sm font-medium">AI sedang menganalisis pelafalan Anda...</p>
            </div>
            <div v-else-if="selectedEvalId" class="text-slate-300 text-[15px] leading-relaxed whitespace-pre-wrap">
              {{ explanations[selectedEvalId]?.text }}
            </div>
          </div>
          
          <!-- Footer -->
          <div class="px-6 py-4 border-t border-dark-800 bg-dark-950/50 flex justify-end">
            <button @click="closeExplanationModal" class="px-6 py-2.5 bg-dark-950/50 hover:bg-dark-900 text-slate-300 hover:text-white border border-dark-800 rounded-xl text-sm font-bold transition-colors">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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
