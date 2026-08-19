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

  audioObj = new Audio(url)
  currentPlayingUrl.value = url

  audioObj.onended = () => {
    currentPlayingUrl.value = null
  }

  audioObj.onerror = () => {
    showToast('Gagal memutar audio referensi', true)
    currentPlayingUrl.value = null
  }

  audioObj.play().catch(() => {
    showToast('Autoplay dicegah oleh browser', true)
    currentPlayingUrl.value = null
  })
}

// Open Form Modal (Add / Edit)
const openFormModal = (letter: any = null) => {
  if (letter) {
    formLetterId.value = letter.id
    formBaseLetter.value = letter.base_letter
    formHarakat.value = letter.harakat
    formPronunciation.value = letter.pronunciation
    formArabicScript.value = letter.arabic_script
    formModelLabel.value = letter.model_label || ''
  } else {
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
  if (!formBaseLetter.value || !formHarakat.value || !formPronunciation.value || !formArabicScript.value || !formModelLabel.value) {
    showToast('Semua field formulir wajib diisi', true)
    return
  }

  formIsSubmitting.value = true
  try {
    const payload = {
      base_letter: formBaseLetter.value,
      harakat: formHarakat.value,
      pronunciation: formPronunciation.value,
      arabic_script: formArabicScript.value,
      model_label: formModelLabel.value
    }

    if (formLetterId.value) {
      await api.updateLetter(formLetterId.value, payload)
      showToast('Huruf hijaiyah berhasil diperbarui')
    } else {
      await api.createLetter(payload)
      showToast('Huruf hijaiyah baru berhasil ditambahkan')
    }

    isFormModalOpen.value = false
    refresh()
  } catch (err: any) {
    showToast(err.message || 'Gagal menyimpan huruf hijaiyah', true)
  } finally {
    formIsSubmitting.value = false
  }
}

// Open Audio Upload modal
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
    await api.uploadLetterAudio(uploadLetterId.value, selectedAudioFile.value)
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
  <div class="h-full space-y-8 relative pb-20 font-sans">

    <!-- Toast Notifications -->
    <div class="fixed bottom-8 right-8 z-50 space-y-3 pointer-events-none">
      <div v-if="successToast"
        class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-2xl flex items-center gap-3 animate-fade-in pointer-events-auto max-w-sm font-mono text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ successToast }}</span>
      </div>
      <div v-if="errorToast"
        class="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-2xl flex items-center gap-3 animate-fade-in pointer-events-auto max-w-sm font-mono text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <span>{{ errorToast }}</span>
      </div>
    </div>

    <!-- Sub-navigation & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
      <div>
        <h2 class="font-display font-semibold text-3xl sm:text-4xl text-ink-0 tracking-tight">Manajemen Huruf Hijaiyah</h2>
        <p class="font-sans text-sm sm:text-base text-ink-1 mt-1 leading-relaxed">Kelola 84 kelas target hijaiyah, harakat, label kelas AI CNN, dan audio ustadz.</p>
      </div>
    </div>

    <!-- Filtering & Add Button -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h3 class="font-display font-semibold text-xl sm:text-2xl text-ink-0 flex items-center gap-2.5 tracking-tight">
        <span>Daftar Huruf</span>
        <span
          class="px-3 py-0.5 rounded-full bg-dark-900 border border-white/10 text-ink-2 font-mono text-xs font-semibold">{{
            filteredLetters.length }}</span>
      </h3>

      <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <!-- Search Input -->
        <div class="relative group w-full sm:max-w-xs">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-ink-3 group-focus-within:text-primary-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input v-model="searchQuery" type="text" placeholder="Cari transliterasi, label..."
            class="w-full bg-dark-900/80 border border-white/10 hover:border-white/20 text-ink-0 rounded-full pl-11 pr-5 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-ink-3 text-sm font-sans" />
        </div>

        <!-- Add Button -->
        <button @click="openFormModal()"
          class="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-400 text-dark-950 rounded-full text-sm font-semibold transition-all shadow-md shadow-primary-500/25 whitespace-nowrap cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Tambah Huruf</span>
        </button>
      </div>
    </div>

    <!-- Letter List Card Grid -->
    <div v-if="isLoadingLetters" class="flex flex-col items-center justify-center py-20">
      <div class="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4"></div>
      <p class="font-sans text-sm text-ink-2">Mengambil data huruf...</p>
    </div>

    <div v-else-if="filteredLetters.length === 0"
      class="flex flex-col items-center justify-center py-20 bg-dark-900/80 border border-white/10 rounded-3xl text-center">
      <h3 class="font-display font-semibold text-lg text-ink-0 mb-1">Huruf Tidak Ditemukan</h3>
      <p class="font-sans text-sm text-ink-2 max-w-sm">Coba cari dengan kata kunci lain.</p>
    </div>

    <!-- Letter Table List -->
    <div v-else class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse font-sans text-sm">
          <thead>
            <tr class="border-b border-white/10 bg-dark-950/40 font-mono text-xs uppercase tracking-wider text-ink-2">
              <th class="py-4 px-6 font-semibold">Simbol Arab</th>
              <th class="py-4 px-6 font-semibold">Nama Huruf</th>
              <th class="py-4 px-6 font-semibold">Harakat</th>
              <th class="py-4 px-6 font-semibold">Cara Baca</th>
              <th class="py-4 px-6 font-semibold">Label Model (CNN)</th>
              <th class="py-4 px-6 font-semibold">Audio Referensi</th>
              <th class="py-4 px-6 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-ink-0">
            <tr v-for="letter in paginatedLetters" :key="letter.id"
              class="hover:bg-dark-850/40 transition-colors group">
              <!-- Arabic Script -->
              <td class="p-5 text-2xl font-bold font-sans text-ink-0 group-hover:text-primary-400 transition-colors">
                {{ letter.arabic_script }}
              </td>
              <!-- Base Letter -->
              <td class="p-5 font-medium text-sm text-ink-0">
                {{ letter.base_letter }}
              </td>
              <!-- Harakat -->
              <td class="p-5">
                <span
                  class="px-2.5 py-0.5 rounded-full bg-dark-950 border border-white/10 font-mono text-xs text-ink-2">
                  {{ letter.harakat }}
                </span>
              </td>
              <!-- Pronunciation -->
              <td class="p-5 font-medium text-sm text-ink-0">
                {{ letter.pronunciation }}
              </td>
              <!-- Model Label -->
              <td class="p-5 font-mono text-xs text-primary-400">
                {{ letter.model_label || '-' }}
              </td>
              <!-- Audio Reference -->
              <td class="p-5">
                <div class="flex items-center gap-2">
                  <!-- Play Button -->
                  <button v-if="letter.audio_url" @click="playAudio(letter.audio_url)"
                    class="p-2 rounded-full bg-primary-500 hover:bg-primary-400 text-dark-950 transition-all shadow-md shadow-primary-500/25 cursor-pointer"
                    :title="currentPlayingUrl === letter.audio_url ? 'Pause' : 'Putar Audio Referensi'">
                    <svg v-if="currentPlayingUrl === letter.audio_url" xmlns="http://www.w3.org/2000/svg"
                      class="h-3.5 w-3.5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                      <path fill-rule="evenodd"
                        d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                        clip-rule="evenodd" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="currentColor"
                      viewBox="0 0 24 24">
                      <path fill-rule="evenodd"
                        d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>

                  <span v-else class="font-mono text-[11px] text-ink-3 italic">Belum ada</span>

                  <!-- Upload Icon Button -->
                  <button @click="openAudioModal(letter)"
                    class="p-2 rounded-full border border-white/10 hover:border-white/20 bg-dark-950 text-ink-2 hover:text-ink-0 transition-all cursor-pointer"
                    title="Unggah Audio Referensi Ustadz">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" stroke-width="1.75">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                </div>
              </td>
              <!-- Actions -->
              <td class="p-5 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openFormModal(letter)"
                    class="p-1.5 text-ink-2 hover:text-primary-400 hover:bg-primary-500/10 rounded-full transition-all cursor-pointer"
                    title="Edit Huruf">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" stroke-width="1.75">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="confirmDelete(letter)"
                    class="p-1.5 text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-all cursor-pointer"
                    title="Hapus Huruf">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" stroke-width="1.75">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-6 py-4 border-t border-white/5">
        <AppPagination v-if="filteredLetters.length > 0" :totalItems="filteredLetters.length"
          :itemsPerPage="itemsPerPage" v-model="currentPage" />
      </div>
    </div>

    <!-- Letter Add/Edit Form Modal -->
    <Teleport to="body">
      <div v-if="isFormModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-md transition-opacity"
          @click="isFormModalOpen = false"></div>
        <div
          class="relative bg-dark-900/95 border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl overflow-hidden font-sans">
          
          <h4 class="font-display font-semibold text-lg text-ink-0 mb-5 tracking-tight">
            {{ formLetterId ? 'Edit Huruf Hijaiyah' : 'Tambah Huruf Hijaiyah Baru' }}
          </h4>

          <form @submit.prevent="handleFormSubmit" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <!-- Base Letter -->
              <div class="space-y-1.5">
                <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Nama Huruf</label>
                <input v-model="formBaseLetter" type="text" required placeholder="Contoh: Alif"
                  class="w-full bg-dark-950 border border-white/10 hover:border-white/20 text-ink-0 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-ink-3 font-sans" />
              </div>

              <!-- Harakat -->
              <div class="space-y-1.5">
                <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Harakat</label>
                <select v-model="formHarakat" required
                  class="w-full bg-dark-950 border border-white/10 text-ink-0 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500 transition-all cursor-pointer font-sans">
                  <option value="Fathah" class="bg-dark-950 text-white">Fathah</option>
                  <option value="Kasrah" class="bg-dark-950 text-white">Kasrah</option>
                  <option value="Dhummah" class="bg-dark-950 text-white">Dommah</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Pronunciation -->
              <div class="space-y-1.5">
                <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Transliterasi</label>
                <input v-model="formPronunciation" type="text" required placeholder="Contoh: A"
                  class="w-full bg-dark-950 border border-white/10 hover:border-white/20 text-ink-0 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-ink-3 font-sans" />
              </div>

              <!-- Arabic Script -->
              <div class="space-y-1.5">
                <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Simbol Arab</label>
                <input v-model="formArabicScript" type="text" required placeholder="Contoh: أ"
                  class="w-full bg-dark-950 border border-white/10 hover:border-white/20 text-ink-0 text-lg rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-ink-3 font-sans" />
              </div>
            </div>

            <!-- Model Label -->
            <div class="space-y-1.5">
              <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Label Kelas Model CNN</label>
              <input v-model="formModelLabel" type="text" required placeholder="Contoh: alif_fathah"
                class="w-full bg-dark-950 border border-white/10 hover:border-white/20 text-ink-0 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-ink-3 font-mono" />
            </div>

            <div class="flex gap-2.5 justify-end pt-3">
              <button type="button" @click="isFormModalOpen = false"
                class="px-5 py-2 bg-dark-950 hover:bg-dark-850 text-ink-1 border border-white/10 rounded-full font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer">
                Batal
              </button>
              <button type="submit" :disabled="formIsSubmitting"
                class="px-5 py-2 bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-dark-950 rounded-full font-medium text-xs transition-colors shadow-md shadow-primary-500/25 flex items-center gap-2 cursor-pointer">
                <span v-if="formIsSubmitting"
                  class="w-3 h-3 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin"></span>
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
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-md transition-opacity"
          @click="isAudioModalOpen = false"></div>
        <div
          class="relative bg-dark-900/95 border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl overflow-hidden font-sans">
          
          <div class="flex items-center gap-3 text-primary-400 mb-4">
            <div
              class="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h4 class="font-display font-semibold text-lg text-ink-0">Unggah Audio Referensi</h4>
          </div>

          <p class="font-sans text-xs text-ink-2 leading-relaxed mb-4">
            Unggah contoh rekaman pelafalan Ustadz untuk huruf <strong class="text-ink-0 font-medium">{{ uploadLetterDisplay }}</strong>.
          </p>

          <!-- Dropzone / Input -->
          <div
            class="border-2 border-dashed border-white/10 hover:border-primary-500/50 rounded-2xl p-6 text-center cursor-pointer hover:bg-dark-950/30 transition-all flex flex-col items-center justify-center relative group">
            <input type="file" accept="audio/wav" @change="handleFileChange"
              class="absolute inset-0 opacity-0 cursor-pointer" />
            <svg xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 text-ink-3 group-hover:text-primary-400 mb-2 transition-colors" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <span class="font-mono text-xs text-ink-1">{{ selectedAudioFile ? selectedAudioFile.name : `Pilih File WAV Pelafalan` }}</span>
            <span class="font-mono text-[10px] text-ink-3 mt-1">Format: .wav audio</span>
          </div>

          <div class="flex gap-2.5 justify-end mt-6">
            <button @click="isAudioModalOpen = false"
              class="px-5 py-2 bg-dark-950 hover:bg-dark-850 text-ink-1 border border-white/10 rounded-full font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer">
              Batal
            </button>
            <button @click="handleAudioUpload" :disabled="!selectedAudioFile || isUploadingAudio"
              class="px-5 py-2 bg-primary-500 hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed text-dark-950 rounded-full font-medium text-xs transition-colors shadow-md shadow-primary-500/25 flex items-center gap-2 cursor-pointer">
              <span v-if="isUploadingAudio"
                class="w-3 h-3 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin"></span>
              <span>Unggah Audio</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Confirm Delete Letter Modal -->
    <Teleport to="body">
      <div v-if="isDeleteModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-md transition-opacity"
          @click="isDeleteModalOpen = false"></div>
        <div
          class="relative bg-dark-900/95 border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl overflow-hidden font-sans">
          
          <div class="flex items-center gap-3.5 text-rose-400 mb-4">
            <div
              class="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h4 class="font-display font-semibold text-lg text-ink-0">Hapus Huruf Hijaiyah?</h4>
          </div>

          <p class="font-sans text-xs text-ink-2 leading-relaxed mb-6">
            Apakah Anda yakin ingin menghapus huruf <strong class="text-ink-0 font-medium">{{ deleteLetterDisplay }}</strong> dari daftar latihan?
          </p>

          <div class="flex gap-2.5 justify-end">
            <button @click="isDeleteModalOpen = false"
              class="px-5 py-2 bg-dark-950 hover:bg-dark-850 text-ink-1 border border-white/10 rounded-full font-mono text-xs uppercase tracking-wider cursor-pointer">
              Batal
            </button>
            <button @click="handleDeleteLetter"
              class="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-full font-mono text-xs uppercase tracking-wider transition-colors shadow-md shadow-rose-500/25 cursor-pointer">
              Hapus
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
