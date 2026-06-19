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

// Filter & Selection State
const filterStatus = ref('all')
const selectedIds = ref<number[]>([])

// Audio Player State
const currentPlayingUrl = ref<string | null>(null)
let audioObj: HTMLAudioElement | null = null

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

const paginatedDataset = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return dataset.value.slice(start, end)
})

// Fetch data
const fetchDataset = async () => {
  isLoading.value = true
  selectedIds.value = [] // Reset selection on fetch
  try {
    const data = await api.getDatasetPoolExport(filterStatus.value)
    dataset.value = data
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat dataset pool', true)
  } finally {
    isLoading.value = false
  }
}

watch(filterStatus, () => {
  currentPage.value = 1
  fetchDataset()
})

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

// Bulk Actions
const toggleSelectAll = (e: Event) => {
  const isChecked = (e.target as HTMLInputElement).checked
  if (isChecked) {
    selectedIds.value = paginatedDataset.value.map(item => item.id)
  } else {
    selectedIds.value = []
  }
}

const toggleSelection = (id: number) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

const isAllSelected = computed(() => {
  return paginatedDataset.value.length > 0 && selectedIds.value.length === paginatedDataset.value.length
})

const handleMarkTrained = async (isTrained: boolean) => {
  if (selectedIds.value.length === 0) return
  
  try {
    const res = await api.markDatasetPoolTrained(selectedIds.value, isTrained)
    showToast(res.message)
    fetchDataset()
  } catch (err: any) {
    showToast(err.message || 'Gagal menandai data', true)
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

// Upload Model State
const isUploadModalOpen = ref(false)
const isUploadingModel = ref(false)
const modelFile = ref<File | null>(null)
const meanFile = ref<File | null>(null)
const stdFile = ref<File | null>(null)

const handleFileUpload = (e: Event, type: 'model' | 'mean' | 'std') => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    if (type === 'model') modelFile.value = target.files[0] || null
    else if (type === 'mean') meanFile.value = target.files[0] || null
    else if (type === 'std') stdFile.value = target.files[0] || null
  }
}

const submitModelUpload = async () => {
  if (!modelFile.value || !meanFile.value || !stdFile.value) {
    showToast('Harap unggah ketiga file terlebih dahulu', true)
    return
  }

  isUploadingModel.value = true
  const formData = new FormData()
  formData.append('tflite_file', modelFile.value)
  formData.append('mean_file', meanFile.value)
  formData.append('std_file', stdFile.value)

  try {
    const res = await api.uploadModelFiles(formData)
    showToast(res.message)
    isUploadModalOpen.value = false
    // Reset form
    modelFile.value = null
    meanFile.value = null
    stdFile.value = null
  } catch (err: any) {
    showToast(err.data?.detail || err.message || 'Gagal mengunggah model', true)
  } finally {
    isUploadingModel.value = false
  }
}

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
    <div class="fixed bottom-8 right-8 z-50 space-y-3 pointer-events-none">
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
    <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
      <!-- Pool quick mini stat cards -->
      <div class="grid grid-cols-2 lg:flex lg:flex-row gap-3 w-full xl:w-auto">
        <div class="px-5 py-4 rounded-2xl bg-gradient-to-br from-dark-900/90 to-dark-950/90 backdrop-blur-md border border-dark-800/60 flex flex-col justify-center gap-1 shadow-xl flex-1 relative overflow-hidden group">
          <div class="absolute inset-0 bg-primary-500/5 group-hover:bg-primary-500/10 transition-colors"></div>
          <div class="absolute -right-4 -top-4 w-16 h-16 bg-primary-500/10 rounded-full blur-xl group-hover:bg-primary-500/20 transition-all"></div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-2 h-2 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
            <span class="text-[10px] text-slate-400 uppercase tracking-widest font-bold relative z-10">Total Validasi</span>
          </div>
          <span class="text-3xl font-black text-white leading-tight drop-shadow-md relative z-10">{{ totalCount }}</span>
        </div>

        <div class="px-5 py-4 rounded-2xl bg-gradient-to-br from-dark-900/90 to-dark-950/90 backdrop-blur-md border border-dark-800/60 flex flex-col justify-center gap-1 shadow-xl flex-1 relative overflow-hidden group">
          <div class="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors"></div>
          <div class="absolute -right-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/20 transition-all"></div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
            <span class="text-[10px] text-slate-400 uppercase tracking-widest font-bold relative z-10">Lafal Benar</span>
          </div>
          <span class="text-3xl font-black text-white leading-tight drop-shadow-md relative z-10">{{ correctCount }}</span>
        </div>

        <div class="col-span-2 lg:col-span-1 px-5 py-4 rounded-2xl bg-gradient-to-br from-dark-900/90 to-dark-950/90 backdrop-blur-md border border-dark-800/60 flex flex-col justify-center gap-1 shadow-xl flex-1 relative overflow-hidden group">
          <div class="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors"></div>
          <div class="absolute -right-4 -top-4 w-16 h-16 bg-red-500/10 rounded-full blur-xl group-hover:bg-red-500/20 transition-all"></div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]"></div>
            <span class="text-[10px] text-slate-400 uppercase tracking-widest font-bold relative z-10">Lafal Salah</span>
          </div>
          <span class="text-3xl font-black text-white leading-tight drop-shadow-md relative z-10">{{ incorrectCount }}</span>
        </div>
      </div>

      <!-- Actions & Filters -->
      <div class="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-3 w-full xl:w-auto">
        <!-- Filter Status Training -->
        <select 
          v-model="filterStatus"
          class="bg-dark-900 border border-dark-700 text-white text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none appearance-none pr-8 cursor-pointer shadow-lg transition-colors w-full md:w-auto"
          style="background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E'); background-repeat: no-repeat; background-position: right 0.7rem top 50%; background-size: 0.65rem auto;"
        >
          <option value="all">Semua Data</option>
          <option value="unused">Belum Ditraining</option>
          <option value="used">Sudah Ditraining</option>
        </select>

        <div class="flex flex-col sm:flex-row flex-wrap items-stretch gap-3 w-full md:w-auto">
          <!-- Upload Model Button -->
          <button 
            @click="isUploadModalOpen = true"
            class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20 whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Model Baru
          </button>

          <div class="flex gap-3 flex-1 sm:flex-none">
            <!-- Export CSV Button -->
            <button 
              @click="exportCSV" 
              :disabled="dataset.length === 0"
              class="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-green-500/20 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>

            <!-- Export JSON Button -->
            <button 
              @click="exportJSON" 
              :disabled="dataset.length === 0"
              class="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-cyan-500/20 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" />
              </svg>
              JSON
            </button>
          </div>
        </div>
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
              <th class="p-5 w-14 text-center">
                <div class="relative flex items-center justify-center w-5 h-5 mx-auto">
                  <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="peer appearance-none w-5 h-5 border-2 border-dark-600 rounded bg-dark-800/80 checked:bg-primary-500 checked:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 focus:ring-offset-dark-900 cursor-pointer transition-all">
                  <svg class="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Awal</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ground Truth</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Penilaian Lafal</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Training</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Audio Rekaman</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Akurasi Asli</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Catatan Admin</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal Validasi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark-800/50">
            <tr v-for="item in paginatedDataset" :key="item.id" class="hover:bg-dark-950/20 transition-colors group" :class="{ 'bg-primary-500/5': selectedIds.includes(item.id) }">
              <!-- Checkbox -->
              <td class="p-5 w-14 text-center">
                <div class="relative flex items-center justify-center w-5 h-5 mx-auto">
                  <input type="checkbox" :value="item.id" :checked="selectedIds.includes(item.id)" @change="toggleSelection(item.id)" class="peer appearance-none w-5 h-5 border-2 border-dark-600 rounded bg-dark-800/80 checked:bg-primary-500 checked:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 focus:ring-offset-dark-900 cursor-pointer transition-all">
                  <svg class="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </td>
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
              <!-- Training Status -->
              <td class="p-5">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md inline-block uppercase" :class="item.is_used_for_training ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'">
                  {{ item.is_used_for_training ? 'Ditraining' : 'Belum' }}
                </span>
              </td>
              <!-- Audio Player -->
              <td class="p-5">
                <button 
                  v-if="item.audio_url"
                  @click="playAudio(item.audio_url)"
                  class="p-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-all shadow-md"
                  :title="currentPlayingUrl === item.audio_url ? 'Pause' : 'Putar Audio'"
                >
                  <svg v-if="currentPlayingUrl === item.audio_url" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
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

      <!-- Pagination -->
      <div class="px-6 py-4 bg-dark-900/60 border-t border-dark-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p v-if="!isNaN(currentPage)" class="text-sm text-slate-400">
          Menampilkan <span class="font-bold text-white">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> hingga 
          <span class="font-bold text-white">{{ Math.min(currentPage * itemsPerPage, dataset.length) }}</span> dari 
          <span class="font-bold text-white">{{ dataset.length }}</span> entri
        </p>
        
        <AppPagination
          :totalItems="dataset.length"
          :itemsPerPage="itemsPerPage"
          v-model="currentPage"
        />
      </div>
    </div>

    <!-- Bulk Action Floating Bar -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform translate-y-10 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform translate-y-10 opacity-0"
      >
        <div v-if="selectedIds.length > 0" class="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3 p-2 sm:px-4 sm:py-3 bg-dark-900/90 backdrop-blur-xl border border-primary-500/30 rounded-full shadow-[0_10px_40px_-10px_rgba(59,130,246,0.4)] whitespace-nowrap overflow-x-auto max-w-[95vw] custom-scrollbar">
          <div class="flex items-center gap-2 pr-2 sm:pr-4 border-r border-dark-700">
            <div class="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-sm">{{ selectedIds.length }}</div>
            <span class="text-sm font-semibold text-white hidden sm:inline">Terpilih</span>
          </div>
          
          <button 
            @click="handleMarkTrained(true)"
            class="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full text-sm font-bold transition-colors shadow-lg flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            <span class="hidden sm:inline">Tandai</span> Ditraining
          </button>
          
          <button 
            @click="handleMarkTrained(false)"
            class="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-slate-300 border border-dark-600 rounded-full text-sm font-bold transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Unmark
          </button>
          
          <button @click="selectedIds = []" class="ml-1 sm:ml-2 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-red-500/20 transition-colors" title="Batal Pilih Semua">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
          </button>
        </div>
      </Transition>
    </Teleport>

    <!-- Upload Model Modal -->
    <Teleport to="body">
      <div v-if="isUploadModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-sm transition-opacity" @click="isUploadModalOpen = false"></div>
        <div class="relative bg-dark-900 border border-dark-800 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
          <button @click="isUploadModalOpen = false" class="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
          <h3 class="text-xl font-bold text-white mb-2">Upload Model Baru</h3>
          <p class="text-xs text-slate-400 mb-6">Unggah file TFLite beserta array normalisasi mean dan std untuk mengganti model yang sedang berjalan secara instan (hot-swap).</p>

          <form @submit.prevent="submitModelUpload" class="space-y-4">
            <!-- TFLite Model -->
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-2">File Model (.tflite)</label>
              <input type="file" accept=".tflite" @change="(e) => handleFileUpload(e, 'model')" class="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-dark-800 file:text-primary-400 hover:file:bg-dark-700 focus:outline-none transition-colors border border-dark-800 rounded-xl bg-dark-950 p-1 cursor-pointer">
            </div>

            <!-- Norm Mean -->
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-2">File Norm Mean (.npy)</label>
              <input type="file" accept=".npy" @change="(e) => handleFileUpload(e, 'mean')" class="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-dark-800 file:text-green-400 hover:file:bg-dark-700 focus:outline-none transition-colors border border-dark-800 rounded-xl bg-dark-950 p-1 cursor-pointer">
            </div>

            <!-- Norm Std -->
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-2">File Norm Std (.npy)</label>
              <input type="file" accept=".npy" @change="(e) => handleFileUpload(e, 'std')" class="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-dark-800 file:text-cyan-400 hover:file:bg-dark-700 focus:outline-none transition-colors border border-dark-800 rounded-xl bg-dark-950 p-1 cursor-pointer">
            </div>

            <!-- Submit -->
            <div class="flex gap-3 mt-6 pt-2">
              <button type="button" @click="isUploadModalOpen = false" class="flex-1 py-2.5 px-6 bg-dark-950/50 hover:bg-dark-900 text-slate-300 hover:text-white border border-dark-800 text-sm font-bold rounded-xl transition-colors">
                Batal
              </button>
              <button type="submit" :disabled="isUploadingModel || !modelFile || !meanFile || !stdFile" class="flex-1 py-2.5 px-6 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2">
                <template v-if="isUploadingModel">
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </template>
                <template v-else>
                  Upload & Swap
                </template>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
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
