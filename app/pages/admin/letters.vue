<script setup lang="ts">
import { useRoute } from 'vue-router'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const api = useApi()

// State
const searchQuery = ref('')
const successToast = ref('')
const errorToast = ref('')
const isLoadingLetters = ref(false)

// Modals
const isFormModalOpen = ref(false)
const isAudioModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

// Form States
const formLetterId = ref<number | null>(null)
const formBaseLetter = ref('')
const formHarakat = ref('')
const formPronunciation = ref('')
const formArabicScript = ref('')
const formModelLabel = ref('')
const formIsSubmitting = ref(false)

// Audio Upload States
const uploadLetterId = ref<number | null>(null)
const uploadLetterDisplay = ref('')
const selectedAudioFile = ref<File | null>(null)
const isUploadingAudio = ref(false)

// Delete State
const deleteLetterId = ref<number | null>(null)
const deleteLetterDisplay = ref('')

// Audio Player State
const currentPlayingUrl = ref<string | null>(null)
let audioObj: HTMLAudioElement | null = null

// Fetch Letters
const { data: letters, refresh } = useAsyncData(
  'adminLettersList',
  async () => {
    isLoadingLetters.value = true
    try {
      return await api.getLetters()
    } finally {
      isLoadingLetters.value = false
    }
  },
  { server: false }
)

// Computed Filtered Letters
const filteredLetters = computed(() => {
  if (!letters.value) return []
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return letters.value
  return letters.value.filter((l: any) =>
    l.base_letter.toLowerCase().includes(query) ||
    l.pronunciation.toLowerCase().includes(query) ||
    (l.model_label && l.model_label.toLowerCase().includes(query)) ||
    l.arabic_script.includes(query)
  )
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

const paginatedLetters = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredLetters.value.slice(start, end)
})

watch(searchQuery, () => {
  currentPage.value = 1
})

// Trigger Toast
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
  if (currentPlayingUrl.value === url && audioObj) {
    audioObj.pause()
    currentPlayingUrl.value = null
    return
  }

  if (audioObj) {
    audioObj.pause()
  }

  currentPlayingUrl.value = url
  audioObj = new Audio(url)
  audioObj.play()

  audioObj.onended = () => {
    currentPlayingUrl.value = null
  }
}

// Open Form Modal (Add / Edit)
const openFormModal = (letter: any = null) => {
  if (letter) {
    // Edit Mode
    formLetterId.value = letter.id
    formBaseLetter.value = letter.base_letter
    formHarakat.value = letter.harakat
    formPronunciation.value = letter.pronunciation
    formArabicScript.value = letter.arabic_script
    formModelLabel.value = letter.model_label || ''
  } else {
    // Add Mode
    formLetterId.value = null
    formBaseLetter.value = ''
    formHarakat.value = 'Fathah'
    formPronunciation.value = ''
    formArabicScript.value = ''
    formModelLabel.value = ''
  }
  isFormModalOpen.value = true
}

const handleFormSubmit = async () => {
  if (formIsSubmitting.value) return
  formIsSubmitting.value = true

  const payload = {
    base_letter: formBaseLetter.value,
    harakat: formHarakat.value,
    pronunciation: formPronunciation.value,
    arabic_script: formArabicScript.value,
    model_label: formModelLabel.value
  }

  try {
    if (formLetterId.value) {
      // Edit
      await api.updateLetter(formLetterId.value, payload)
      showToast('Data huruf hijaiyah berhasil diperbarui')
    } else {
      // Add
      await api.createLetter(payload)
      showToast('Huruf hijaiyah baru berhasil ditambahkan')
    }
    isFormModalOpen.value = false
    refresh()
  } catch (err: any) {
    showToast(err.message || 'Gagal menyimpan data huruf hijaiyah', true)
  } finally {
    formIsSubmitting.value = false
  }
}

// Open Audio Upload Modal
const openAudioModal = (letter: any) => {
  uploadLetterId.value = letter.id
  uploadLetterDisplay.value = `${letter.arabic_script} (${letter.pronunciation})`
  selectedAudioFile.value = null
  isAudioModalOpen.value = true
}

const handleFileChange = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files && files.length > 0) {
    selectedAudioFile.value = files[0] || null
  }
}

const handleAudioUpload = async () => {
  if (!uploadLetterId.value || !selectedAudioFile.value || isUploadingAudio.value) return
  isUploadingAudio.value = true

  try {
    const res = await api.uploadLetterAudio(uploadLetterId.value, selectedAudioFile.value)
    showToast('Audio referensi Ustadz berhasil diunggah ke Cloudinary')
    isAudioModalOpen.value = false
    refresh()
  } catch (err: any) {
    showToast(err.message || 'Gagal mengunggah audio', true)
  } finally {
    isUploadingAudio.value = false
  }
}

// Open Delete letter modal
const confirmDelete = (letter: any) => {
  deleteLetterId.value = letter.id
  deleteLetterDisplay.value = `${letter.arabic_script} (${letter.pronunciation})`
  isDeleteModalOpen.value = true
}

const handleDeleteLetter = async () => {
  if (!deleteLetterId.value) return
  const id = deleteLetterId.value
  isDeleteModalOpen.value = false

  try {
    await api.deleteLetter(id)
    showToast('Huruf hijaiyah berhasil dihapus')
    refresh()
  } catch (err: any) {
    showToast(err.message || 'Gagal menghapus huruf hijaiyah', true)
  }
}
</script>

<template>
  <div class="h-full space-y-8 relative pb-20">

    <!-- Toast Notifications -->
    <div class="fixed bottom-8 right-8 z-50 space-y-3 pointer-events-none">
      <div v-if="successToast"
        class="bg-green-500/10 border border-green-500/30 text-green-400 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-xl flex items-center gap-3 animate-fade-in pointer-events-auto max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-sm font-medium">{{ successToast }}</span>
      </div>
      <div v-if="errorToast"
        class="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-xl flex items-center gap-3 animate-fade-in pointer-events-auto max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <span class="text-sm font-medium">{{ errorToast }}</span>
      </div>
    </div>

    <!-- Sub-navigation & Header -->
    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-dark-800 pb-5">
      <div>
        <h2 class="text-3xl font-extrabold text-white tracking-tight">Manajemen Huruf Hijaiyah</h2>
        <p class="text-slate-400 mt-1 text-sm">Kelola daftar huruf, ubah makhraj, atau tambahkan audio referensi Ustadz.
        </p>
      </div>
    </div>

    <!-- Filtering & Add Button -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h3 class="text-xl font-bold text-white flex items-center gap-2">
        <span>Huruf Hijaiyah</span>
        <span
          class="px-2.5 py-0.5 rounded-full bg-dark-800 border border-dark-700 text-slate-400 text-xs font-medium">{{
            filteredLetters.length }}</span>
      </h3>

      <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <!-- Search Input -->
        <div class="relative group w-full sm:max-w-xs">
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input v-model="searchQuery" type="text" placeholder="Cari nama, transliterasi, label..."
            class="w-full bg-dark-900/50 border border-dark-800 text-white rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-600 text-sm" />
        </div>

        <!-- Add Button -->
        <button @click="openFormModal()"
          class="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary-500/20 whitespace-nowrap">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Huruf
        </button>
      </div>
    </div>

    <!-- Letter List Card Grid -->
    <div v-if="isLoadingLetters" class="flex flex-col items-center justify-center py-20">
      <div class="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4"></div>
      <p class="text-slate-400 text-sm">Mengambil data huruf...</p>
    </div>

    <div v-else-if="filteredLetters.length === 0"
      class="flex flex-col items-center justify-center py-20 bg-dark-900/40 border border-dark-800 rounded-3xl text-center">
      <div class="w-16 h-16 rounded-full bg-dark-800/60 flex items-center justify-center mb-4 border border-dark-700">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-white mb-1">Huruf Tidak Ditemukan</h3>
      <p class="text-slate-500 text-sm max-w-sm">Coba cari dengan kata kunci lain.</p>
    </div>

    <!-- Letter Table List -->
    <div v-else class="bg-dark-900/40 backdrop-blur-xl border border-dark-800 rounded-3xl overflow-hidden shadow-2xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-dark-800 bg-dark-950/40">
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Simbol Arab</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nama Huruf</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Harakat</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Cara Baca / Pronunciation
              </th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Model Label (CNN)</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Contoh Audio</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark-800/50">
            <tr v-for="letter in paginatedLetters" :key="letter.id" class="hover:bg-dark-950/20 transition-colors group">
              <!-- Arabic Script -->
              <td class="p-5 text-3xl font-bold font-arabic text-white group-hover:text-primary-400 transition-colors">
                {{ letter.arabic_script }}
              </td>
              <!-- Base Letter -->
              <td class="p-5 text-sm font-semibold text-slate-200">
                {{ letter.base_letter }}
              </td>
              <!-- Harakat -->
              <td class="p-5">
                <span
                  class="px-2 py-1 rounded-md bg-dark-950 border border-dark-800 text-xs font-medium text-slate-400">
                  {{ letter.harakat }}
                </span>
              </td>
              <!-- Pronunciation -->
              <td class="p-5 text-sm font-semibold text-white">
                {{ letter.pronunciation }}
              </td>
              <!-- Model Label -->
              <td class="p-5 text-xs font-mono text-slate-500">
                {{ letter.model_label || '-' }}
              </td>
              <!-- Audio Reference -->
              <td class="p-5">
                <div class="flex items-center gap-2">
                  <!-- Play Button -->
                  <button v-if="letter.audio_url" @click="playAudio(letter.audio_url)"
                    class="p-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-all shadow-md"
                    :title="currentPlayingUrl === letter.audio_url ? 'Pause' : 'Putar Audio Referensi'">
                    <svg v-if="currentPlayingUrl === letter.audio_url" xmlns="http://www.w3.org/2000/svg"
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

                  <span v-else class="text-xs text-slate-600 italic">Belum ada</span>

                  <!-- Upload Icon Button -->
                  <button @click="openAudioModal(letter)"
                    class="p-2 rounded-xl border border-dark-800 hover:border-primary-500/50 bg-dark-950/60 hover:bg-primary-500/10 text-slate-500 hover:text-primary-400 transition-all"
                    title="Unggah Audio Referensi Ustadz">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                </div>
              </td>
              <!-- Actions -->
              <td class="p-5 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openFormModal(letter)"
                    class="p-2 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-xl transition-all"
                    title="Edit Huruf">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="confirmDelete(letter)"
                    class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                    title="Hapus Huruf">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-6 pb-6">
        <AppPagination 
          v-if="filteredLetters.length > 0"
          :totalItems="filteredLetters.length" 
          :itemsPerPage="itemsPerPage" 
          v-model="currentPage" 
        />
      </div>
    </div>

    <!-- Letter Add/Edit Form Modal -->
    <Teleport to="body">
      <div v-if="isFormModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-sm transition-opacity"
          @click="isFormModalOpen = false"></div>
        <div
          class="relative bg-dark-900 border border-dark-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-fade-in overflow-hidden">
          <div class="absolute -right-20 -top-20 w-48 h-48 bg-primary-500/5 rounded-full blur-2xl"></div>

          <h4 class="text-xl font-bold text-white mb-6">
            {{ formLetterId ? 'Edit Huruf Hijaiyah' : 'Tambah Huruf Hijaiyah Baru' }}
          </h4>

          <form @submit.prevent="handleFormSubmit" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <!-- Base Letter -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-300">Nama Huruf</label>
                <input v-model="formBaseLetter" type="text" required placeholder="Contoh: Alif"
                  class="w-full bg-dark-950 border border-dark-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-600" />
              </div>

              <!-- Harakat -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-300">Harakat</label>
                <select v-model="formHarakat" required
                  class="w-full bg-dark-950 border border-dark-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all cursor-pointer">
                  <option value="Fathah">Fathah</option>
                  <option value="Kasrah">Kasrah</option>
                  <option value="Dhummah">Dommah</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Pronunciation -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-300">Cara Baca (Transliterasi)</label>
                <input v-model="formPronunciation" type="text" required placeholder="Contoh: A"
                  class="w-full bg-dark-950 border border-dark-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-600" />
              </div>

              <!-- Arabic Script -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-300">Simbol Arab</label>
                <input v-model="formArabicScript" type="text" required placeholder="Contoh: أ"
                  class="w-full bg-dark-950 border border-dark-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-600 font-arabic text-lg" />
              </div>
            </div>

            <!-- Model Label -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-300">Label Kelas Model (CNN / TFLite)</label>
              <input v-model="formModelLabel" type="text" required placeholder="Contoh: alif_fathah"
                class="w-full bg-dark-950 border border-dark-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-600 font-mono" />
              <p class="text-[10px] text-slate-500 mt-0.5">Label ini harus sesuai dengan output kelas dari model neural
                network Anda.</p>
            </div>

            <div class="flex gap-3 justify-end pt-4">
              <button type="button" @click="isFormModalOpen = false"
                class="px-6 py-2.5 bg-dark-950/50 hover:bg-dark-900 text-slate-300 hover:text-white border border-dark-800 rounded-xl text-sm font-bold transition-colors">
                Batal
              </button>
              <button type="submit" :disabled="formIsSubmitting"
                class="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2">
                <span v-if="formIsSubmitting"
                  class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                <span>Simpan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Audio Upload Modal -->
    <Teleport to="body">
      <div v-if="isAudioModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-sm transition-opacity"
          @click="isAudioModalOpen = false"></div>
        <div
          class="relative bg-dark-900 border border-dark-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-fade-in overflow-hidden">
          <div class="absolute -right-20 -top-20 w-48 h-48 bg-primary-500/5 rounded-full blur-2xl"></div>

          <div class="flex items-center gap-3 text-primary-400 mb-4">
            <div
              class="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h4 class="text-lg font-bold text-white">Unggah Audio Referensi</h4>
          </div>

          <p class="text-slate-400 text-sm leading-relaxed mb-4">
            Unggah contoh rekaman pelafalan Ustadz untuk huruf <strong class="text-white">{{ uploadLetterDisplay
              }}</strong>. Audio ini akan disimpan di Cloudinary dan menjadi referensi pembanding bagi pengguna.
          </p>

          <!-- Dropzone / Input -->
          <div
            class="border-2 border-dashed border-dark-800 hover:border-primary-500/50 rounded-2xl p-6 text-center cursor-pointer hover:bg-dark-950/20 transition-all flex flex-col items-center justify-center relative group">
            <input type="file" accept="audio/wav" @change="handleFileChange"
              class="absolute inset-0 opacity-0 cursor-pointer" />
            <svg xmlns="http://www.w3.org/2000/svg"
              class="h-10 w-10 text-slate-500 group-hover:text-primary-400 mb-2 transition-colors" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <span class="text-xs font-bold text-slate-300">{{ selectedAudioFile ? selectedAudioFile.name : `Pilih File WAV Pelafalan Ustadz` }}</span>
            <span class="text-[10px] text-slate-500 mt-1">Format wajib: .wav saja (Mono/Stereo)</span>
          </div>

          <div class="flex gap-3 justify-end mt-6">
            <button @click="isAudioModalOpen = false"
              class="px-6 py-2.5 bg-dark-950/50 hover:bg-dark-900 text-slate-300 hover:text-white border border-dark-800 rounded-xl text-sm font-bold transition-colors">
              Batal
            </button>
            <button @click="handleAudioUpload" :disabled="!selectedAudioFile || isUploadingAudio"
              class="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2">
              <span v-if="isUploadingAudio"
                class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              <span>Unggah ke Cloudinary</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Confirm Delete Letter Modal -->
    <Teleport to="body">
      <div v-if="isDeleteModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-sm transition-opacity"
          @click="isDeleteModalOpen = false"></div>
        <div
          class="relative bg-dark-900 border border-dark-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-fade-in overflow-hidden">
          <div class="absolute -right-20 -top-20 w-48 h-48 bg-red-500/5 rounded-full blur-2xl"></div>

          <div class="flex items-center gap-4 text-red-400 mb-4">
            <div
              class="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h4 class="text-lg font-bold text-white">Hapus Huruf Hijaiyah?</h4>
          </div>

          <p class="text-slate-400 text-sm leading-relaxed mb-6">
            Apakah Anda yakin ingin menghapus huruf <strong class="text-white">{{ deleteLetterDisplay }}</strong> dari
            daftar latihan? Riwayat pengujian pelafalan user pada huruf ini akan ikut terpengaruh.
          </p>

          <div class="flex gap-3 justify-end mt-2">
            <button @click="isDeleteModalOpen = false"
              class="px-6 py-2.5 bg-dark-950/50 hover:bg-dark-900 text-slate-300 hover:text-white border border-dark-800 rounded-xl text-sm font-bold transition-colors">
              Batal
            </button>
            <button @click="handleDeleteLetter"
              class="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-red-500/20">
              Hapus
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

.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
