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

// Feedbacks list
const feedbacks = ref<any[]>([])
const isLoading = ref(false)
const lettersList = ref<any[]>([])

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(5)

const paginatedFeedbacks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return feedbacks.value.slice(start, end)
})

// Verification modal/drawer states
const isVerifyModalOpen = ref(false)
const selectedFeedback = ref<any>(null)
const verifiedLabel = ref('')
const isVerifiedCorrect = ref(true)
const adminNotes = ref('')
const isSubmittingVerification = ref(false)

// Audio Player states
const currentPlayingUrl = ref<string | null>(null)
let audioObj: HTMLAudioElement | null = null

// Fetch data
const fetchData = async () => {
  isLoading.value = true
  try {
    const [fbs, lets] = await Promise.all([
      api.getAdminFeedbacks(100, 0),
      api.getLetters()
    ])
    feedbacks.value = fbs
    lettersList.value = lets
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat data keluhan pelafalan', true)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const getStatusBadge = (score: number) => {
  if (score >= 80) {
    return {
      label: 'Sangat Baik',
      class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    }
  }
  if (score >= 60) {
    return {
      label: 'Cukup Baik',
      class: 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    }
  }
  return {
    label: 'Perlu Latihan',
    class: 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
  }
}

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

  audioObj.onerror = () => {
    showToast('Gagal memutar rekaman suara user', true)
    currentPlayingUrl.value = null
  }
}

// Open Verification Modal
const openVerifyModal = (fb: any) => {
  selectedFeedback.value = fb
  verifiedLabel.value = fb.verified_label || fb.original_target_label || (lettersList.value[0]?.model_label || '')
  isVerifiedCorrect.value = fb.is_verified ? fb.is_verified_correct : true
  adminNotes.value = fb.admin_notes || ''
  isVerifyModalOpen.value = true
}

// Submit Verification
const handleVerifySubmit = async () => {
  if (!selectedFeedback.value || !verifiedLabel.value) return

  isSubmittingVerification.value = true
  try {
    const payload = {
      feedback_id: selectedFeedback.value.feedback_id,
      verified_label: verifiedLabel.value,
      is_verified_correct: isVerifiedCorrect.value,
      admin_notes: adminNotes.value
    }

    const res = await api.verifyFeedbackEvaluation(payload)
    showToast(res.message || 'Validasi active learning berhasil disimpan!')
    isVerifyModalOpen.value = false

    // Refresh feedback list to reflect status
    fetchData()
  } catch (err: any) {
    showToast(err.message || 'Gagal menyimpan validasi feedback', true)
  } finally {
    isSubmittingVerification.value = false
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
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
        <h2 class="font-display font-semibold text-3xl sm:text-4xl text-ink-0 tracking-tight">Periksa Keluhan Prediksi AI</h2>
        <p class="font-sans text-sm sm:text-base text-ink-1 mt-1 leading-relaxed">Dengarkan rekaman audio keluhan pengguna, tinjau prediksi CNN, dan masukkan ke dataset pool latih.</p>
      </div>
    </div>

    <!-- Table Container / List -->
    <div class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4"></div>
        <p class="font-sans text-sm text-ink-2">Mengambil laporan keluhan pengguna...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="feedbacks.length === 0" class="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h3 class="font-display font-semibold text-lg text-ink-0 mb-1">Tidak Ada Keluhan Aktif</h3>
        <p class="font-sans text-sm text-ink-2 max-w-sm">Semua keluhan akurasi pelafalan telah ditinjau atau belum ada keluhan baru dari pengguna.</p>
      </div>

      <!-- Feedback list -->
      <div v-else class="divide-y divide-white/5">
        <div v-for="fb in paginatedFeedbacks" :key="fb.feedback_id"
          class="p-6 sm:p-8 hover:bg-dark-850/30 transition-all flex flex-col lg:flex-row gap-6 justify-between items-start">

          <div class="space-y-4 flex-1 w-full">
            <!-- Header Info -->
            <div class="flex flex-wrap items-center gap-3 font-sans">
              <span class="text-base font-semibold text-ink-0">{{ fb.user_name }}</span>
              <span class="font-mono text-xs sm:text-sm text-ink-2">{{ fb.user_email }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-white/20"></span>
              <span class="font-mono text-xs sm:text-sm text-ink-2">{{ formatDate(fb.created_at) }}</span>
            </div>

            <!-- Comment Card -->
            <div class="bg-dark-950/60 border border-white/10 p-5 rounded-2xl">
              <p class="font-sans text-sm sm:text-base text-ink-1 leading-relaxed">"{{ fb.comment }}"</p>
            </div>

            <!-- Evaluation Detail Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <!-- Target Letter -->
              <div class="bg-dark-950/40 border border-white/5 p-4 rounded-2xl">
                <span class="block font-mono text-xs text-ink-2 uppercase tracking-wider font-semibold">Target Latihan</span>
                <span class="text-base font-semibold text-ink-0 flex items-center gap-2 mt-1">
                  <span class="font-sans text-2xl text-primary-400 font-bold">{{ fb.arabic_script }}</span>
                  <span class="text-xs sm:text-sm font-normal text-ink-2">({{ fb.pronunciation }})</span>
                </span>
              </div>

              <!-- Model Decision -->
              <div class="bg-dark-950/40 border border-white/5 p-4 rounded-2xl">
                <span class="block font-mono text-xs text-ink-2 uppercase tracking-wider font-semibold">Hasil Model CNN</span>
                <span class="font-mono text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-full inline-block mt-1.5"
                  :class="getStatusBadge(fb.accuracy_score).class">
                  {{ getStatusBadge(fb.accuracy_score).label }}
                </span>
              </div>

              <!-- Accuracy Score -->
              <div class="bg-dark-950/40 border border-white/5 p-4 rounded-2xl">
                <span class="block font-mono text-xs text-ink-2 uppercase tracking-wider font-semibold">Akurasi Prediksi</span>
                <span class="font-mono text-lg font-bold text-ink-0 block mt-1">
                  {{ fb.accuracy_score?.toFixed(1) }}%
                </span>
              </div>

              <!-- Playing User Audio -->
              <div class="bg-dark-950/40 border border-white/5 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <span class="block font-mono text-[10px] text-ink-3 uppercase tracking-wider">Rekaman User</span>
                  <span class="font-sans text-[10px] text-ink-2">Audio pelafalan</span>
                </div>
                <button @click="playAudio(fb.audio_url)"
                  class="w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-400 text-dark-950 transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 shadow-md shadow-primary-500/25 flex items-center justify-center cursor-pointer"
                  :title="currentPlayingUrl === fb.audio_url ? 'Pause' : 'Putar rekaman user'">
                  <svg v-if="currentPlayingUrl === fb.audio_url" xmlns="http://www.w3.org/2000/svg"
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
              </div>
            </div>

            <!-- Top 3 Predictions -->
            <div class="space-y-1.5" v-if="fb.top3_predictions && fb.top3_predictions.length > 0">
              <span class="font-mono text-[10px] text-ink-3 uppercase tracking-wider block">Top 3 Prediksi CNN</span>
              <div class="flex flex-wrap gap-2">
                <div v-for="(pred, i) in fb.top3_predictions" :key="pred.label"
                  class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-950 border border-white/10 font-mono text-[11px]"
                  :class="i === 0 ? 'border-primary-500/40 text-primary-400' : 'text-ink-2'">
                  <span class="font-semibold">#{{ Number(i) + 1 }}</span>
                  <span>{{ pred.label }}</span>
                  <span class="text-ink-3">({{ Number(pred.score).toFixed(2) }}%)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Learning Action -->
          <div
            class="w-full lg:w-auto shrink-0 flex flex-col justify-center items-end self-stretch lg:border-l border-white/5 lg:pl-6 pt-4 lg:pt-0">
            <template v-if="fb.is_verified">
              <div
                class="w-full lg:w-auto px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs uppercase tracking-wider font-semibold rounded-full flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Tervalidasi</span>
              </div>
              <p class="font-sans text-[11px] text-ink-3 text-center lg:text-right mt-2 w-full">Dataset telah disimpan di pool latih.</p>
            </template>
            <template v-else>
              <button @click="openVerifyModal(fb)"
                class="ts-btn ts-btn--primary w-full lg:w-auto">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Validasi Laporan</span>
              </button>
              <p class="font-sans text-[11px] text-ink-3 text-center lg:text-right mt-2 w-full">Simpan audio ke dataset pool latih.</p>
            </template>
          </div>

        </div>
      </div>

      <div class="px-6 py-4 border-t border-white/5">
        <AppPagination 
          v-if="feedbacks.length > 0"
          :totalItems="feedbacks.length" 
          :itemsPerPage="itemsPerPage" 
          v-model="currentPage" 
        />
      </div>
    </div>

    <!-- Active Learning Verification Modal -->
    <Teleport to="body">
      <div v-if="isVerifyModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-md transition-opacity"
          @click="isVerifyModalOpen = false">
        </div>
        <div
          class="relative bg-dark-900/95 border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl overflow-hidden font-sans">
          
          <div class="flex items-center gap-3 text-primary-400 mb-4">
            <div
              class="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 class="font-display font-semibold text-lg text-ink-0">Validasi Active Learning</h4>
          </div>

          <p class="font-sans text-xs text-ink-2 leading-relaxed mb-5">
            Tentukan kebenaran lafal & label makhraj yang benar untuk rekaman ini agar dapat dimasukkan ke dataset pool.
          </p>

          <form @submit.prevent="handleVerifySubmit" class="space-y-4">

            <!-- Selected Label Dropdown -->
            <div class="space-y-1.5">
              <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Label Makhraj Sebenarnya (Ground Truth)</label>
              <select v-model="verifiedLabel" required
                class="w-full bg-dark-950 border border-white/10 text-ink-0 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500 transition-all font-mono cursor-pointer">
                <option v-for="letOpt in lettersList" :key="letOpt.id" :value="letOpt.model_label" class="bg-dark-950 text-white">
                  {{ letOpt.arabic_script }} - {{ letOpt.pronunciation }} ({{ letOpt.model_label }})
                </option>
              </select>
            </div>

            <!-- Is Correct Radio -->
            <div class="space-y-1.5">
              <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Status Pelafalan User</label>
              <div class="grid grid-cols-2 gap-3">
                <label
                  class="flex items-center justify-center gap-2 p-3 rounded-xl border border-white/10 bg-dark-950/60 cursor-pointer transition-all font-medium text-xs"
                  :class="isVerifiedCorrect ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'text-ink-3'">
                  <input type="radio" :value="true" v-model="isVerifiedCorrect" class="hidden" />
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Lafal Benar</span>
                </label>

                <label
                  class="flex items-center justify-center gap-2 p-3 rounded-xl border border-white/10 bg-dark-950/60 cursor-pointer transition-all font-medium text-xs"
                  :class="!isVerifiedCorrect ? 'border-rose-500/50 text-rose-400 bg-rose-500/10' : 'text-ink-3'">
                  <input type="radio" :value="false" v-model="isVerifiedCorrect" class="hidden" />
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Lafal Salah</span>
                </label>
              </div>
            </div>

            <!-- Notes -->
            <div class="space-y-1.5">
              <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Catatan Admin</label>
              <textarea v-model="adminNotes"
                placeholder="Tulis catatan opsional mengenai kualitas audio..." rows="3"
                class="w-full bg-dark-950 border border-white/10 hover:border-white/20 text-ink-0 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-ink-3 font-sans resize-none"></textarea>
            </div>

            <div class="flex gap-3 justify-end pt-3">
              <button type="button" @click="isVerifyModalOpen = false"
                class="ts-btn ts-btn--ghost">
                Batal
              </button>
              <button type="submit" :disabled="isSubmittingVerification"
                class="ts-btn ts-btn--primary">
                <span v-if="isSubmittingVerification"
                  class="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin"></span>
                <span>Simpan ke Pool</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </Teleport>

  </div>
</template>
