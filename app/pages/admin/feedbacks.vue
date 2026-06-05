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
  // Cloudinary fallback checks or local path checks
  let playUrl = url
  if (url && !url.startsWith('http') && !url.startsWith('/')) {
    // If it is stored locally e.g. "uploads/audio/xxx.wav"
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

// Open Verification Modal
const openVerifyModal = (fb: any) => {
  selectedFeedback.value = fb
  
  // Find matching model_label from lettersList by base_letter and harakat
  const matchedLetter = lettersList.value.find((l: any) => l.arabic_script === fb.arabic_script && l.harakat === fb.harakat)
  verifiedLabel.value = matchedLetter ? matchedLetter.model_label : (fb.top_prediction || '')
  
  isVerifiedCorrect.value = fb.is_correct
  adminNotes.value = ''
  isVerifyModalOpen.value = true
}

// Submit Verification
const handleVerifySubmit = async () => {
  if (!selectedFeedback.value || isSubmittingVerification.value) return
  isSubmittingVerification.value = true
  
  const payload = {
    evaluation_id: selectedFeedback.value.evaluation_id,
    verified_label: verifiedLabel.value,
    is_verified_correct: isVerifiedCorrect.value,
    admin_notes: adminNotes.value
  }

  try {
    await api.verifyDatasetPool(payload)
    showToast('Validasi pelafalan berhasil disimpan ke dataset pool!')
    isVerifyModalOpen.value = false
    fetchData() // Refresh list to reflect verified status if backend filters it out
  } catch (err: any) {
    showToast(err.message || 'Gagal menyimpan validasi pelafalan', true)
  } finally {
    isSubmittingVerification.value = false
  }
}

// Format Date Helper
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
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

    <!-- Header -->
    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-dark-800 pb-5">
      <div>
        <h2 class="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <span>Keluhan & Feedback</span>
          <span class="px-3 py-1 rounded-full bg-dark-800 border border-dark-700 text-slate-400 text-sm font-medium">{{ feedbacks.length }}</span>
        </h2>
        <p class="text-slate-400 mt-2 text-sm">Dengarkan audio keluhan pengguna, lihat prediksi model, dan simpan sebagai dataset tervalidasi.</p>
      </div>
    </div>

    <!-- Table Container / List -->
    <div class="bg-dark-900/40 backdrop-blur-xl border border-dark-800 rounded-3xl overflow-hidden shadow-2xl">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4"></div>
        <p class="text-slate-400 text-sm">Mengambil laporan keluhan pengguna...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="feedbacks.length === 0" class="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div class="w-16 h-16 rounded-full bg-dark-800/60 flex items-center justify-center mb-4 border border-dark-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white mb-1">Tidak Ada Keluhan Aktif</h3>
        <p class="text-slate-500 text-sm max-w-sm">Semua keluhan akurasi pelafalan telah ditinjau atau belum ada keluhan baru dari pengguna.</p>
      </div>

      <!-- Feedback list -->
      <div v-else class="divide-y divide-dark-800">
        <div v-for="fb in feedbacks" :key="fb.feedback_id" class="p-6 hover:bg-dark-950/20 transition-all flex flex-col lg:flex-row gap-6 justify-between items-start">
          
          <div class="space-y-4 flex-1">
            <!-- Header Info -->
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-sm font-bold text-white">{{ fb.user_name }}</span>
              <span class="text-xs text-slate-500">{{ fb.user_email }}</span>
              <span class="w-1 h-1 rounded-full bg-slate-700"></span>
              <span class="text-xs text-slate-400">{{ formatDate(fb.created_at) }}</span>
            </div>

            <!-- Comment Card -->
            <div class="bg-dark-950/50 border border-dark-800/80 p-4 rounded-2xl">
              <p class="text-sm text-slate-300 leading-relaxed font-medium">"{{ fb.comment }}"</p>
            </div>

            <!-- Evaluation Detail Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <!-- Target Letter -->
              <div class="bg-dark-950/30 border border-dark-800/50 p-3 rounded-xl">
                <span class="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Target Latihan</span>
                <span class="text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <span class="font-arabic text-xl text-primary-400">{{ fb.arabic_script }}</span>
                  <span class="text-xs">({{ fb.pronunciation }})</span>
                </span>
              </div>

              <!-- Model Decision -->
              <div class="bg-dark-950/30 border border-dark-800/50 p-3 rounded-xl">
                <span class="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Hasil Model CNN</span>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1" :class="fb.is_correct ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'">
                  {{ fb.is_correct ? 'Pelafalan Benar' : 'Pelafalan Salah' }}
                </span>
              </div>

              <!-- Accuracy Score -->
              <div class="bg-dark-950/30 border border-dark-800/50 p-3 rounded-xl">
                <span class="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Akurasi Prediksi</span>
                <span class="text-base font-extrabold text-white block mt-0.5">
                  {{ fb.accuracy_score?.toFixed(1) }}%
                </span>
              </div>

              <!-- Playing User Audio -->
              <div class="bg-dark-950/30 border border-dark-800/50 p-2.5 rounded-xl flex items-center justify-between">
                <div>
                  <span class="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Rekaman User</span>
                  <span class="text-[10px] text-slate-400">Dengarkan audio</span>
                </div>
                <button 
                  @click="playAudio(fb.audio_url)"
                  class="p-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-all shadow-md"
                  :title="currentPlayingUrl === fb.audio_url ? 'Pause' : 'Putar rekaman user'"
                >
                  <svg v-if="currentPlayingUrl === fb.audio_url" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Top 5 Predictions -->
            <div class="space-y-1.5" v-if="fb.top5_predictions && fb.top5_predictions.length > 0">
              <span class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Top 5 Prediksi CNN</span>
              <div class="flex flex-wrap gap-2">
                <div 
                  v-for="(pred, i) in fb.top5_predictions" 
                  :key="pred.label" 
                  class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-950/80 border border-dark-800 text-[11px]"
                  :class="i === 0 ? 'border-primary-500/30 bg-primary-950/10 text-primary-400' : 'text-slate-400'"
                >
                  <span class="font-bold font-mono">#{{ Number(i) + 1 }}</span>
                  <span class="font-semibold">{{ pred.label }}</span>
                  <span class="text-slate-500">({{ (pred.score * 100).toFixed(0) }}%)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Learning Action -->
          <div class="w-full lg:w-auto shrink-0 flex flex-col justify-center items-end self-stretch lg:border-l border-dark-800 lg:pl-6 pt-4 lg:pt-0">
            <button 
              @click="openVerifyModal(fb)"
              class="w-full lg:w-auto px-5 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary-500/20 hover:scale-[1.02] text-sm flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Validasi & Masukkan Pool
            </button>
            <p class="text-[10px] text-slate-500 text-center lg:text-right mt-2 w-full">Masukkan rekaman ke dataset pool latih.</p>
          </div>

        </div>
      </div>
    </div>

    <!-- Active Learning Verification Modal -->
    <div v-if="isVerifyModalOpen" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-dark-900 border border-dark-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-fade-in relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-48 h-48 bg-primary-500/5 rounded-full blur-2xl"></div>
        
        <div class="flex items-center gap-3 text-primary-400 mb-4">
          <div class="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 class="text-lg font-bold text-white">Validasi Active Learning</h4>
        </div>

        <p class="text-slate-400 text-sm leading-relaxed mb-5">
          Tentukan kebenaran lafal & label makhraj yang benar untuk rekaman ini agar dapat digunakan sebagai dataset latih model selanjutnya.
        </p>

        <form @submit.prevent="handleVerifySubmit" class="space-y-4">
          
          <!-- Selected Label Dropdown -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-400 block">Label Makhraj Sebenarnya (Ground Truth)</label>
            <select v-model="verifiedLabel" required
              class="w-full bg-dark-950 border border-dark-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer font-semibold">
              <option v-for="letOpt in lettersList" :key="letOpt.id" :value="letOpt.model_label">
                {{ letOpt.arabic_script }} — {{ letOpt.pronunciation }} ({{ letOpt.model_label }})
              </option>
            </select>
            <p class="text-[10px] text-slate-500 mt-1">Ground truth label yang diucapkan oleh user dalam rekaman audio.</p>
          </div>

          <!-- Pronunciation correctness check -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-400 block mb-2">Penilaian Pelafalan</label>
            <div class="grid grid-cols-2 gap-4">
              <!-- Benar -->
              <label 
                class="flex items-center justify-center gap-2 p-3 rounded-xl border border-dark-800 cursor-pointer bg-dark-950/50 hover:bg-dark-950 transition-all font-semibold text-sm"
                :class="isVerifiedCorrect ? 'border-green-500/50 text-green-400 bg-green-500/5' : 'text-slate-400'"
              >
                <input type="radio" :value="true" v-model="isVerifiedCorrect" class="hidden" />
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
                Pelafalan Benar
              </label>

              <!-- Salah -->
              <label 
                class="flex items-center justify-center gap-2 p-3 rounded-xl border border-dark-800 cursor-pointer bg-dark-950/50 hover:bg-dark-950 transition-all font-semibold text-sm"
                :class="!isVerifiedCorrect ? 'border-red-500/50 text-red-400 bg-red-500/5' : 'text-slate-400'"
              >
                <input type="radio" :value="false" v-model="isVerifiedCorrect" class="hidden" />
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                Pelafalan Salah
              </label>
            </div>
            <p class="text-[10px] text-slate-500 mt-1">Tandai pelafalan makhraj dalam rekaman sudah benar secara tajwid atau salah.</p>
          </div>

          <!-- Notes -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-400 block">Catatan Admin</label>
            <textarea v-model="adminNotes" placeholder="Tulis catatan opsional mengenai pelafalan makhraj atau kualitas audio..." rows="3"
              class="w-full bg-dark-950 border border-dark-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"></textarea>
          </div>

          <div class="flex gap-3 justify-end pt-4">
            <button type="button" @click="isVerifyModalOpen = false" class="px-5 py-2.5 bg-dark-950 border border-dark-800 hover:bg-dark-800 text-slate-400 hover:text-white rounded-xl text-sm font-semibold transition-colors">
              Batal
            </button>
            <button type="submit" :disabled="isSubmittingVerification" class="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
              <span v-if="isSubmittingVerification" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              <span>Masukkan Pool Dataset</span>
            </button>
          </div>

        </form>
      </div>
    </div>

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
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
