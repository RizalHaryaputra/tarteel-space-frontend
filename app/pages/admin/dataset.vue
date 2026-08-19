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
  selectedIds.value = []
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
    showToast(err.message || 'Gagal mengubah status training dataset', true)
  }
}

// Audio Playback
const playAudio = (url: string) => {
  if (currentPlayingUrl.value === url && audioObj) {
    audioObj.pause()
    currentPlayingUrl.value = null
    return
  }

  if (audioObj) {
    audioObj.pause()
  }

  audioObj = new Audio(url)
  currentPlayingUrl.value = url

  audioObj.onended = () => {
    currentPlayingUrl.value = null
  }

  audioObj.onerror = () => {
    showToast('Gagal memutar rekaman audio', true)
    currentPlayingUrl.value = null
  }

  audioObj.play().catch(() => {
    showToast('Autoplay dicegah oleh browser', true)
    currentPlayingUrl.value = null
  })
}

// Stats Calculation
const totalCount = computed(() => dataset.value.length)
const correctCount = computed(() => dataset.value.filter(i => i.is_verified_correct).length)
const incorrectCount = computed(() => dataset.value.filter(i => !i.is_verified_correct).length)

// Upload Model States
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

  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n')

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

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="h-full space-y-8 relative pb-20 font-sans">
    
    <!-- Toast Notifications -->
    <div class="fixed bottom-8 right-8 z-50 space-y-3 pointer-events-none">
      <div v-if="successToast" class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-2xl flex items-center gap-3 animate-fade-in pointer-events-auto max-w-sm font-mono text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ successToast }}</span>
      </div>
      <div v-if="errorToast" class="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-2xl flex items-center gap-3 animate-fade-in pointer-events-auto max-w-sm font-mono text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
        <span>{{ errorToast }}</span>
      </div>
    </div>

    <!-- Sub-navigation & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
      <div>
        <h2 class="font-display font-semibold text-3xl sm:text-4xl text-ink-0 tracking-tight">Dataset Pool AI</h2>
        <p class="font-sans text-sm sm:text-base text-ink-1 mt-1 leading-relaxed">Kelola sampel audio pelafalan yang telah diverifikasi dan siap digunakan untuk retraining model CNN.</p>
      </div>
    </div>

    <!-- Stats summary & Action Buttons -->
    <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
      <!-- Pool quick mini stat cards -->
      <div class="grid grid-cols-3 gap-4 w-full xl:w-auto">
        <div class="px-6 py-5 rounded-3xl bg-dark-900/80 backdrop-blur-2xl border border-white/10 flex flex-col justify-center gap-1.5 shadow-xl flex-1 relative overflow-hidden">
          <div class="flex items-center gap-2 mb-0.5">
            <div class="w-2.5 h-2.5 rounded-full bg-primary-400"></div>
            <span class="font-mono text-xs text-ink-2 uppercase tracking-widest font-bold">Total Validasi</span>
          </div>
          <span class="font-mono font-bold text-3xl sm:text-4xl text-ink-0 leading-tight">{{ totalCount }}</span>
        </div>

        <div class="px-6 py-5 rounded-3xl bg-dark-900/80 backdrop-blur-2xl border border-white/10 flex flex-col justify-center gap-1.5 shadow-xl flex-1 relative overflow-hidden">
          <div class="flex items-center gap-2 mb-0.5">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
            <span class="font-mono text-xs text-ink-2 uppercase tracking-widest font-bold">Lafal Benar</span>
          </div>
          <span class="font-mono font-bold text-3xl sm:text-4xl text-emerald-400 leading-tight">{{ correctCount }}</span>
        </div>

        <div class="px-6 py-5 rounded-3xl bg-dark-900/80 backdrop-blur-2xl border border-white/10 flex flex-col justify-center gap-1.5 shadow-xl flex-1 relative overflow-hidden">
          <div class="flex items-center gap-2 mb-0.5">
            <div class="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
            <span class="font-mono text-xs text-ink-2 uppercase tracking-widest font-bold">Lafal Salah</span>
          </div>
          <span class="font-mono font-bold text-3xl sm:text-4xl text-rose-400 leading-tight">{{ incorrectCount }}</span>
        </div>
      </div>

      <!-- Actions & Filters -->
      <div class="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-3 w-full xl:w-auto">
        <!-- Filter Status Training -->
        <select 
          v-model="filterStatus"
          class="bg-dark-900/80 border border-white/10 text-ink-0 text-xs sm:text-sm rounded-full px-4 py-2.5 focus:border-primary-500 outline-none cursor-pointer shadow-xl font-mono uppercase tracking-wider"
        >
          <option value="all" class="bg-dark-950 text-white">Semua Data</option>
          <option value="unused" class="bg-dark-950 text-white">Belum Ditraining</option>
          <option value="used" class="bg-dark-950 text-white">Sudah Ditraining</option>
        </select>

        <div class="flex flex-col sm:flex-row flex-wrap items-stretch gap-2.5 w-full md:w-auto">
          <!-- Upload Model Button -->
          <button 
            @click="isUploadModalOpen = true"
            class="flex items-center justify-center gap-2 px-5 py-2.5 bg-dark-950 hover:bg-dark-850 text-ink-0 border border-white/10 hover:border-white/20 rounded-full font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Upload Model Baru</span>
          </button>

          <div class="flex gap-2">
            <!-- Export CSV Button -->
            <button 
              @click="exportCSV" 
              :disabled="dataset.length === 0"
              class="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-dark-950 rounded-full font-medium text-xs transition-all shadow-md shadow-primary-500/25 cursor-pointer whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>CSV</span>
            </button>

            <!-- Export JSON Button -->
            <button 
              @click="exportJSON" 
              :disabled="dataset.length === 0"
              class="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-dark-950 rounded-full font-medium text-xs transition-all shadow-md shadow-cyan-500/25 cursor-pointer whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Dataset Pool -->
    <div class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-3"></div>
        <p class="font-sans text-xs text-ink-2">Memuat dataset pool...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="dataset.length === 0" class="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h3 class="font-display font-semibold text-base text-ink-0 mb-1">Dataset Pool Kosong</h3>
        <p class="font-sans text-xs text-ink-3 max-w-sm">Belum ada rekaman audio terverifikasi. Validasi rekaman umpan balik pengguna di menu <strong>Periksa Keluhan</strong> terlebih dahulu.</p>
      </div>

      <!-- Table list -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse font-sans text-sm">
          <thead>
            <tr class="border-b border-white/10 bg-dark-950/40 font-mono text-xs uppercase tracking-wider text-ink-2">
              <th class="p-4 w-12 text-center">
                <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="accent-primary-500 rounded cursor-pointer">
              </th>
              <th class="py-3.5 px-4 font-semibold">ID</th>
              <th class="py-3.5 px-4 font-semibold">Target Awal</th>
              <th class="py-3.5 px-4 font-semibold">Ground Truth</th>
              <th class="py-3.5 px-4 font-semibold">Evaluasi</th>
              <th class="py-3.5 px-4 font-semibold">Training</th>
              <th class="py-3.5 px-4 font-semibold">Audio</th>
              <th class="py-3.5 px-4 font-semibold">Akurasi</th>
              <th class="py-3.5 px-4 font-semibold">Catatan Admin</th>
              <th class="py-3.5 px-4 font-semibold">Tanggal</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-ink-0">
            <tr v-for="item in paginatedDataset" :key="item.id" class="hover:bg-dark-850/40 transition-colors group" :class="{ 'bg-primary-500/5': selectedIds.includes(item.id) }">
              <!-- Checkbox -->
              <td class="p-4 w-12 text-center">
                <input type="checkbox" :value="item.id" :checked="selectedIds.includes(item.id)" @change="toggleSelection(item.id)" class="accent-primary-500 rounded cursor-pointer">
              </td>
              <!-- ID -->
              <td class="py-3.5 px-4 font-mono text-xs text-ink-3">
                #{{ item.id }}
              </td>
              <!-- Original Label Target -->
              <td class="py-3.5 px-4 font-medium text-sm text-ink-0">
                {{ item.arabic_script || '' }} 
                <span class="text-xs text-ink-3 font-normal">({{ item.original_target_label || '-' }})</span>
              </td>
              <!-- Ground Truth Verified Label -->
              <td class="py-3.5 px-4 font-mono text-xs font-semibold text-primary-400">
                {{ item.verified_label }}
              </td>
              <!-- Correct / Incorrect -->
              <td class="py-3.5 px-4">
                <span class="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase" :class="item.is_verified_correct ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'">
                  {{ item.is_verified_correct ? 'Benar' : 'Salah' }}
                </span>
              </td>
              <!-- Training Status -->
              <td class="py-3.5 px-4">
                <span class="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase" :class="item.is_used_for_training ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'">
                  {{ item.is_used_for_training ? 'Ditraining' : 'Belum' }}
                </span>
              </td>
              <!-- Audio Player -->
              <td class="py-3.5 px-4">
                <button 
                  v-if="item.audio_url"
                  @click="playAudio(item.audio_url)"
                  class="p-1.5 rounded-full bg-primary-500 hover:bg-primary-400 text-dark-950 transition-all shadow-md shadow-primary-500/25 cursor-pointer"
                  :title="currentPlayingUrl === item.audio_url ? 'Pause' : 'Putar Audio'"
                >
                  <svg v-if="currentPlayingUrl === item.audio_url" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
                  </svg>
                </button>
                <span v-else class="font-mono text-[10px] text-ink-3 italic">-</span>
              </td>
              <!-- Accuracy -->
              <td class="py-3.5 px-4 font-mono text-xs font-semibold text-ink-0">
                {{ item.accuracy_score?.toFixed(1) }}%
              </td>
              <!-- Notes -->
              <td class="py-3.5 px-4 font-sans text-xs text-ink-2 max-w-xs truncate" :title="item.admin_notes || ''">
                {{ item.admin_notes || '-' }}
              </td>
              <!-- Date Verified -->
              <td class="py-3.5 px-4 font-mono text-xs text-ink-3">
                {{ formatDate(item.verified_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p v-if="!isNaN(currentPage)" class="font-sans text-xs text-ink-2">
          Menampilkan <span class="font-mono font-semibold text-ink-0">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> - 
          <span class="font-mono font-semibold text-ink-0">{{ Math.min(currentPage * itemsPerPage, dataset.length) }}</span> dari 
          <span class="font-mono font-semibold text-ink-0">{{ dataset.length }}</span> baris
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
        <div v-if="selectedIds.length > 0" class="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3 p-2 sm:px-4 sm:py-2.5 bg-dark-900/95 backdrop-blur-2xl border border-primary-500/30 rounded-full shadow-2xl whitespace-nowrap font-sans">
          <div class="flex items-center gap-2 pr-3 border-r border-white/10">
            <div class="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-mono font-bold text-xs">{{ selectedIds.length }}</div>
            <span class="text-xs text-ink-0 font-medium hidden sm:inline">Dipilih</span>
          </div>
          
          <button 
            @click="handleMarkTrained(true)"
            class="px-4 py-1.5 bg-primary-500 hover:bg-primary-400 text-dark-950 rounded-full font-medium text-xs transition-colors shadow-md cursor-pointer"
          >
            Tandai Ditraining
          </button>
          
          <button 
            @click="handleMarkTrained(false)"
            class="px-4 py-1.5 bg-dark-950 hover:bg-dark-850 text-ink-1 border border-white/10 rounded-full font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Unmark
          </button>
          
          <button @click="selectedIds = []" class="p-1 text-ink-3 hover:text-ink-0 rounded-full cursor-pointer" title="Batal Pilih Semua">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
          </button>
        </div>
      </Transition>
    </Teleport>

    <!-- Upload Model Modal -->
    <Teleport to="body">
      <div v-if="isUploadModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-md transition-opacity" @click="isUploadModalOpen = false"></div>
        <div class="relative bg-dark-900/95 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl font-sans">
          <button @click="isUploadModalOpen = false" class="absolute top-4 right-4 text-ink-3 hover:text-ink-0 transition-colors p-1.5 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 class="font-display font-semibold text-lg text-ink-0 mb-1 tracking-tight">Upload Model CNN Baru</h3>
          <p class="font-sans text-xs text-ink-2 mb-6">Unggah file TFLite beserta array normalisasi mean dan std untuk hot-swap model AI.</p>

          <form @submit.prevent="submitModelUpload" class="space-y-3.5">
            <!-- TFLite Model -->
            <div class="space-y-1.5">
              <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Model TFLite (.tflite)</label>
              <input type="file" accept=".tflite" @change="(e) => handleFileUpload(e, 'model')" class="block w-full text-xs text-ink-2 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-mono file:bg-dark-850 file:text-primary-400 hover:file:bg-dark-800 border border-white/10 rounded-xl bg-dark-950 p-1 cursor-pointer">
            </div>

            <!-- Norm Mean -->
            <div class="space-y-1.5">
              <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Array Mean (.npy)</label>
              <input type="file" accept=".npy" @change="(e) => handleFileUpload(e, 'mean')" class="block w-full text-xs text-ink-2 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-mono file:bg-dark-850 file:text-emerald-400 hover:file:bg-dark-800 border border-white/10 rounded-xl bg-dark-950 p-1 cursor-pointer">
            </div>

            <!-- Norm Std -->
            <div class="space-y-1.5">
              <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Array Std (.npy)</label>
              <input type="file" accept=".npy" @change="(e) => handleFileUpload(e, 'std')" class="block w-full text-xs text-ink-2 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-mono file:bg-dark-850 file:text-cyan-400 hover:file:bg-dark-800 border border-white/10 rounded-xl bg-dark-950 p-1 cursor-pointer">
            </div>

            <!-- Submit -->
            <div class="flex gap-2.5 mt-6 pt-2 justify-end">
              <button type="button" @click="isUploadModalOpen = false" class="px-5 py-2 bg-dark-950 hover:bg-dark-850 text-ink-1 border border-white/10 rounded-full font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer">
                Batal
              </button>
              <button type="submit" :disabled="isUploadingModel || !modelFile || !meanFile || !stdFile" class="px-5 py-2 bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-dark-950 font-medium text-xs rounded-full transition-colors shadow-md shadow-primary-500/25 flex items-center justify-center gap-2 cursor-pointer">
                <template v-if="isUploadingModel">
                  <div class="w-3.5 h-3.5 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </template>
                <template v-else>
                  <span>Upload & Swap</span>
                </template>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
