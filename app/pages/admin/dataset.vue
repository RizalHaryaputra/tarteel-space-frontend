<script setup lang="ts">
import { useRoute } from 'vue-router'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const api = useApi()

// Toast States
const successToast = ref('')
const errorToast = ref('')

// Dataset Pool Data
const dataset = ref<any[]>([])
const isLoading = ref(false)

// Audio Player State
const currentPlayingUrl = ref<string | null>(null)
let audioObj: HTMLAudioElement | null = null

// Fetch data
const fetchDataset = async () => {
  isLoading.value = true
  try {
    const data = await api.getDatasetPoolExport()
    dataset.value = data
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat dataset pool', true)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDataset()
})

const showToast = (message: string, isError = false) => {
  if (isError) {
    errorToast.value = message
    setTimeout(() => { errorToast.value = '' }, 4000)
  } else {
    successToast.value = message
    setTimeout(() => { successToast.value = '' }, 4000)
  }
}

// Play Audio
const playAudio = (url: string) => {
  let playUrl = url
  if (url && !url.startsWith('http') && !url.startsWith('/')) {
    const config = useRuntimeConfig()
    playUrl = `${config.public.apiBase}/${url}`
  }

  if (currentPlayingUrl.value === playUrl && audioObj) {
    audioObj.pause()
    currentPlayingUrl.value = null
    return
  }

  if (audioObj) {
    audioObj.pause()
  }

  currentPlayingUrl.value = playUrl
  audioObj = new Audio(playUrl)
  audioObj.play()
  
  audioObj.onended = () => {
    currentPlayingUrl.value = null
  }
}

// Stats computed
const totalCount = computed(() => dataset.value.length)
const correctCount = computed(() => dataset.value.filter(item => item.is_verified_correct).length)
const incorrectCount = computed(() => dataset.value.filter(item => !item.is_verified_correct).length)

// Export CSV Action
const exportCSV = () => {
  if (dataset.value.length === 0) {
    showToast('Dataset pool kosong, tidak ada data untuk diekspor', true)
    return
  }

  // Define headers
  const headers = [
    'ID',
    'Evaluation ID',
    'Base Letter',
    'Harakat',
    'Original Target Label',
    'Verified Label (Ground Truth)',
    'Is Verified Correct',
    'Accuracy Score',
    'Top Prediction',
    'Audio URL',
    'Admin Notes',
    'Verified At'
  ]

  // Map rows
  const rows = dataset.value.map(item => [
    item.id,
    item.evaluation_id,
    item.base_letter,
    item.harakat,
    item.original_target_label,
    item.verified_label,
    item.is_verified_correct ? 1 : 0,
    item.accuracy_score,
    item.top_prediction,
    item.audio_url,
    `"${(item.admin_notes || '').replace(/"/g, '""')}"`,
    item.verified_at
  ])

  // Combine into CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n')

  // Download File
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `tarteel_space_dataset_pool_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  showToast('Ekspor CSV berhasil diunduh!')
}

// Export JSON Action
const exportJSON = () => {
  if (dataset.value.length === 0) {
    showToast('Dataset pool kosong, tidak ada data untuk diekspor', true)
    return
  }

  const jsonContent = JSON.stringify(dataset.value, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `tarteel_space_dataset_pool_${new Date().toISOString().split('T')[0]}.json`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  showToast('Ekspor JSON berhasil diunduh!')
}

// Format Date Helper
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="h-full space-y-8 relative pb-20">
    
    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <div v-if="successToast" class="bg-green-500/10 border border-green-500/30 text-green-400 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-xl flex items-center gap-3 animate-fade-in pointer-events-auto max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span class="text-sm font-medium">{{ successToast }}</span>
      </div>
      <div v-if="errorToast" class="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-xl flex items-center gap-3 animate-fade-in pointer-events-auto max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
        <span class="text-sm font-medium">{{ errorToast }}</span>
      </div>
    </div>

    <!-- Sub-navigation & Header -->
    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-dark-800 pb-5">
      <div>
        <h2 class="text-3xl font-extrabold text-white tracking-tight">Dataset Pool</h2>
        <p class="text-slate-400 mt-1 text-sm">Kelola dan ekspor dataset dari hasil evaluasi active learning.</p>
      </div>
    </div>

    <!-- Stats summary & Action Buttons -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <!-- Pool quick mini stat cards -->
      <div class="flex flex-wrap gap-4">
        <div class="px-5 py-3 rounded-2xl bg-dark-900/50 border border-dark-800 flex items-center gap-3">
          <div class="w-2.5 h-2.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
          <div>
            <span class="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Total Validasi</span>
            <span class="text-lg font-bold text-white leading-tight">{{ totalCount }}</span>
          </div>
        </div>

        <div class="px-5 py-3 rounded-2xl bg-dark-900/50 border border-dark-800 flex items-center gap-3">
          <div class="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
          <div>
            <span class="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Lafal Benar</span>
            <span class="text-lg font-bold text-white leading-tight">{{ correctCount }}</span>
          </div>
        </div>

        <div class="px-5 py-3 rounded-2xl bg-dark-900/50 border border-dark-800 flex items-center gap-3">
          <div class="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]"></div>
          <div>
            <span class="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Lafal Salah</span>
            <span class="text-lg font-bold text-white leading-tight">{{ incorrectCount }}</span>
          </div>
        </div>
      </div>

      <!-- Export Actions -->
      <div class="flex items-center gap-3 self-end md:self-center">
        <!-- Export CSV Button -->
        <button 
          @click="exportCSV" 
          :disabled="dataset.length === 0"
          class="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-green-600/20 whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Unduh CSV
        </button>

        <!-- Export JSON Button -->
        <button 
          @click="exportJSON" 
          :disabled="dataset.length === 0"
          class="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-cyan-600/20 whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Unduh JSON
        </button>
      </div>
    </div>

    <!-- Table Dataset Pool -->
    <div class="bg-dark-900/40 backdrop-blur-xl border border-dark-800 rounded-3xl overflow-hidden shadow-2xl">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4"></div>
        <p class="text-slate-400 text-sm">Memuat data dataset pool...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="dataset.length === 0" class="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div class="w-16 h-16 rounded-full bg-dark-800/60 flex items-center justify-center mb-4 border border-dark-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white mb-1">Dataset Pool Kosong</h3>
        <p class="text-slate-500 text-sm max-w-sm">Belum ada rekaman audio terverifikasi. Kunjungi menu <strong>Laporan & Feedback</strong> untuk memvalidasi rekaman pelafalan user terlebih dahulu.</p>
      </div>

      <!-- Table list -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-dark-800 bg-dark-950/40">
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Awal</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ground Truth</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Penilaian Lafal</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Audio Rekaman</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Akurasi Asli</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Catatan Admin</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal Validasi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark-800/50">
            <tr v-for="item in dataset" :key="item.id" class="hover:bg-dark-950/20 transition-colors group">
              <!-- ID -->
              <td class="p-5 text-sm font-semibold text-slate-400 font-mono">
                #{{ item.id }}
              </td>
              <!-- Original Label Target -->
              <td class="p-5">
                <span class="text-sm font-bold text-slate-200">
                  {{ item.arabic_script || '' }} 
                  <span class="text-xs text-slate-500">({{ item.original_target_label || '-' }})</span>
                </span>
              </td>
              <!-- Ground Truth Verified Label -->
              <td class="p-5 text-sm font-bold text-primary-400 font-mono">
                {{ item.verified_label }}
              </td>
              <!-- Correct / Incorrect -->
              <td class="p-5">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md inline-block uppercase" :class="item.is_verified_correct ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'">
                  {{ item.is_verified_correct ? 'Benar' : 'Salah' }}
                </span>
              </td>
              <!-- Audio Player -->
              <td class="p-5">
                <button 
                  v-if="item.audio_url"
                  @click="playAudio(item.audio_url)"
                  class="p-2 rounded-xl border border-dark-800 hover:border-primary-500/50 bg-dark-950/60 hover:bg-primary-500/10 text-slate-400 hover:text-primary-400 transition-all"
                  :title="currentPlayingUrl === item.audio_url ? 'Pause' : 'Putar Audio'"
                >
                  <svg v-if="currentPlayingUrl === item.audio_url" xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 text-primary-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
                  </svg>
                </button>
                <span v-else class="text-xs text-slate-600 italic">Tidak ada audio</span>
              </td>
              <!-- Accuracy -->
              <td class="p-5 text-sm text-slate-300 font-semibold">
                {{ item.accuracy_score?.toFixed(1) }}%
              </td>
              <!-- Notes -->
              <td class="p-5 text-sm text-slate-400 italic max-w-xs truncate" :title="item.admin_notes || ''">
                {{ item.admin_notes || '-' }}
              </td>
              <!-- Date Verified -->
              <td class="p-5 text-sm text-slate-500">
                {{ formatDate(item.verified_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
