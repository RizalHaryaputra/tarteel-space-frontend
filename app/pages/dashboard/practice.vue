<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const api = useApi()

// State Data
const { data: letters, pending: loadingLetters } = useAsyncData('letters', () => api.getLetters())
const currentLetterIndex = ref(0)
const targetLetter = computed(() => letters.value?.[currentLetterIndex.value] || null)

// State Recording & Session
const currentSessionId = ref<string | null>(null)
const isRecording = ref(false)
const isProcessing = ref(false)
const isPlayingAudio = ref(false)
const showResult = ref(false)

const mediaRecorder = ref<MediaRecorder | null>(null)
const audioChunks = ref<BlobPart[]>([])

const evaluationResult = ref({
  score: 0,
  feedback: '',
  color: ''
})

const evalId = ref<string | null>(null)
const tajweedGrade = ref<string>('')
const top3Predictions = ref<Array<{ label: string; score: number }>>([])
const explanationText = ref<string>('')
const isFetchingExplanation = ref(false)
const showExplanation = ref(false)

const formatLabel = (label: string) => {
  if (!label) return ''
  return label
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Custom Alert State
const showAlertModal = ref(false)
const alertTitle = ref('Informasi')
const alertMessage = ref('')

const showCustomAlert = (message: string, title = 'Informasi') => {
  alertMessage.value = message
  alertTitle.value = title
  showAlertModal.value = true
}

const fetchExplanation = async () => {
  if (!evalId.value) return
  isFetchingExplanation.value = true
  try {
    const res = await api.getExplanation(evalId.value)
    explanationText.value = res.explanation
    showExplanation.value = true
  } catch (err: any) {
    console.error(err)
    showCustomAlert(err.message || 'Gagal mendapatkan penjelasan tajwid.', 'Terjadi Kesalahan')
  } finally {
    isFetchingExplanation.value = false
  }
}

let recordingStartTime = 0
const MAX_RECORDING_TIME_MS = 5000 // 5 detik

onUnmounted(() => {
  // End session jika berpindah halaman
  if (currentSessionId.value) {
    api.endSession(currentSessionId.value).catch(console.error)
  }
})

// Visualizer State
const visualizerCanvas = ref<HTMLCanvasElement | null>(null)
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let animationFrameId: number | null = null

const drawVisualizer = () => {
  if (!visualizerCanvas.value || !analyser) return

  const canvas = visualizerCanvas.value
  const canvasCtx = canvas.getContext('2d')
  if (!canvasCtx) return

  // Using Time Domain for waveform
  analyser.fftSize = 2048
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  // Ensure canvas dimensions are sharp
  canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1)
  canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1)
  canvasCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)

  const draw = () => {
    if (!isRecording.value) return

    animationFrameId = requestAnimationFrame(draw)
    analyser!.getByteTimeDomainData(dataArray)

    canvasCtx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)

    canvasCtx.lineWidth = 3
    canvasCtx.strokeStyle = '#60a5fa' // primary-400
    canvasCtx.lineCap = 'round'
    canvasCtx.lineJoin = 'round'

    canvasCtx.beginPath()

    const sliceWidth = canvas.clientWidth * 1.0 / bufferLength
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      const v = (dataArray[i] || 128) / 128.0
      const y = v * canvas.clientHeight / 2

      if (i === 0) {
        canvasCtx.moveTo(x, y)
      } else {
        canvasCtx.lineTo(x, y)
      }

      x += sliceWidth
    }

    canvasCtx.lineTo(canvas.clientWidth, canvas.clientHeight / 2)
    canvasCtx.stroke()
  }

  draw()
}

const toggleRecording = async () => {
  if (isRecording.value) {
    // Stop recording
    mediaRecorder.value?.stop()
    isRecording.value = false
    
    // Stop visualizer
    if (audioContext) {
      audioContext.close()
      audioContext = null
    }
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  } else {
    // Start recording
    showResult.value = false

    // Start new session if doesn't exist
    if (!currentSessionId.value) {
      try {
        const session = await api.startSession()
        currentSessionId.value = session.session_id
      } catch (e) {
        console.error("Gagal memulai sesi", e)
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.value = new MediaRecorder(stream)
      audioChunks.value = []

      // Setup Visualizer
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      audioContext = new AudioContextClass()
      analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      
      // Delay drawing slightly to let DOM update if canvas just showed up
      setTimeout(() => drawVisualizer(), 50)

      mediaRecorder.value.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.value.push(e.data)
      }

      mediaRecorder.value.onstop = () => {
        // Clean up microphone tracks
        stream.getTracks().forEach(track => track.stop())

        const duration = Date.now() - recordingStartTime
        if (duration > MAX_RECORDING_TIME_MS) {
          showCustomAlert(`Durasi rekaman terlalu lama (${(duration / 1000).toFixed(1)} detik). Maksimal 5 detik. Silakan coba lagi.`, 'Rekaman Terlalu Lama')
          return
        }

        if (duration < 1000) {
          showCustomAlert('Durasi rekaman terlalu singkat. Tahan tombol untuk merekam suara.', 'Rekaman Terlalu Singkat')
          return
        }

        const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' })
        processAudio(audioBlob)
      }

      recordingStartTime = Date.now()
      mediaRecorder.value.start()
      isRecording.value = true
    } catch (err) {
      console.error('Error accessing microphone:', err)
      showCustomAlert('Gagal mengakses mikrofon. Pastikan browser Anda memiliki izin untuk menggunakan mikrofon.', 'Akses Ditolak')
    }
  }
}

const processAudio = async (audioBlob: Blob) => {
  if (!targetLetter.value) return
  isProcessing.value = true
  const startTime = performance.now() // Mulai hitung waktu end-to-end

  try {
    const result = await api.evaluate(targetLetter.value.id, audioBlob, currentSessionId.value || undefined)

    evalId.value = result.id
    tajweedGrade.value = result.tajweed_grade
    top3Predictions.value = result.top3_predictions || []
    explanationText.value = ''
    showExplanation.value = false

    evaluationResult.value.score = Math.round(result.accuracy_score)
    evaluationResult.value.feedback = result.feedback

    if (result.is_correct) {
      evaluationResult.value.color = 'text-green-400'
    } else if (result.accuracy_score >= 70) {
      evaluationResult.value.color = 'text-yellow-400'
    } else {
      evaluationResult.value.color = 'text-red-400'
    }

    // Tampilkan log end-to-end untuk laporan
    const endTime = performance.now()
    const e2eTime = (endTime - startTime) / 1000
    console.log(`⏱️ [METRIK] Waktu Respons End-to-End: ${e2eTime.toFixed(3)} detik`)

  } catch (err: any) {
    console.error(err)
    evaluationResult.value.score = 0
    evaluationResult.value.feedback = err.message || 'Terjadi kesalahan saat mengevaluasi audio.'
    evaluationResult.value.color = 'text-red-400'
    evalId.value = null
    tajweedGrade.value = ''
    top3Predictions.value = []
  } finally {
    isProcessing.value = false
    showResult.value = true
  }
}

const playReferenceAudio = async () => {
  if (!targetLetter.value || isPlayingAudio.value) return

  const audioUrl = targetLetter.value.audio_url
  if (!audioUrl) {
    alert('File audio untuk huruf ini belum tersedia.')
    return
  }

  const audio = new Audio(audioUrl)

  isPlayingAudio.value = true
  audio.play().catch(() => {
    alert('File audio untuk huruf ini gagal diputar.')
    isPlayingAudio.value = false
  })
  audio.onended = () => { isPlayingAudio.value = false }
  audio.onerror = () => { isPlayingAudio.value = false }
}

const nextLetter = () => {
  if (letters.value && currentLetterIndex.value < letters.value.length - 1) {
    currentLetterIndex.value++
    showResult.value = false
  }
}

const prevLetter = () => {
  if (currentLetterIndex.value > 0) {
    currentLetterIndex.value--
    showResult.value = false
  }
}

const showLetterPicker = ref(false)

const selectLetter = (index: number) => {
  currentLetterIndex.value = index
  showLetterPicker.value = false
  showResult.value = false
}

// User Feedback State & Methods
const showFeedbackModal = ref(false)
const feedbackComment = ref('')
const isSubmittingFeedback = ref(false)
const feedbackSubmitted = ref(false)

const sendFeedback = async () => {
  if (!evalId.value || !feedbackComment.value.trim()) return
  isSubmittingFeedback.value = true
  try {
    await api.submitFeedback(evalId.value, feedbackComment.value)
    feedbackSubmitted.value = true
    setTimeout(() => {
      showFeedbackModal.value = false
      feedbackComment.value = ''
      feedbackSubmitted.value = false
    }, 2000)
  } catch (err: any) {
    console.error(err)
    showCustomAlert(err.message || 'Gagal mengirimkan masukan.', 'Gagal Mengirim')
  } finally {
    isSubmittingFeedback.value = false
  }
}
</script>

<template>
  <div class="h-full flex flex-col max-w-6xl mx-auto px-2 pb-4">

    <!-- Header Area -->
    <div
      class="flex flex-col md:flex-row md:items-center justify-between mb-8 shrink-0 gap-4 border-b border-dark-800 pb-5">
      <div>
        <h1 class="text-3xl font-extrabold text-white tracking-tight">Ruang Latihan</h1>
        <p class="text-slate-400 mt-1 text-sm">Pilih huruf dan rekam suara Anda untuk evaluasi tajwid AI.</p>
      </div>
      <button @click="showLetterPicker = true"
        class="px-5 py-2.5 bg-dark-900/60 backdrop-blur-sm border border-dark-800 hover:border-primary-500/50 hover:bg-dark-800 rounded-2xl flex items-center gap-3 text-white transition-all group shadow-sm">
        <span class="font-arabic text-2xl text-primary-400 leading-none pt-1">{{ targetLetter?.arabic_script || '?'
        }}</span>
        <span class="font-semibold text-sm">Pilih Huruf</span>
      </button>
    </div>

    <!-- Main Content: No forced max-height -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">

      <!-- Left Column: Target Letter Card -->
      <div
        class="lg:col-span-5 min-h-[450px] w-full bg-dark-900/60 backdrop-blur-xl border border-dark-800 hover:border-primary-500/30 transition-all rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl group/card">
        <!-- Decoration -->
        <div class="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/5 rounded-full blur-2xl pointer-events-none">
        </div>

        <div v-if="loadingLetters" class="flex flex-col items-center justify-center animate-pulse gap-4 h-full w-full">
          <div class="w-20 h-20 bg-dark-800 rounded-full"></div>
          <div class="h-4 w-32 bg-dark-800 rounded"></div>
        </div>

        <template v-else-if="targetLetter">
          <!-- Letter and Audio Group Centered -->
          <div class="flex-1 flex flex-col items-center justify-center w-full mb-6">
            <div class="text-slate-400 text-xs font-medium mb-2 uppercase tracking-widest">Ucapkan: {{
              targetLetter.pronunciation }}</div>

            <div
              class="leading-none font-arabic text-white mb-2 drop-shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all"
              style="font-size: 130px;">
              {{ targetLetter.arabic_script }}
            </div>

            <div class="text-xl font-bold text-primary-400 mb-8">{{ targetLetter.base_letter }} <span
                class="text-slate-500">·</span> {{ targetLetter.harakat }}</div>

            <!-- Audio Reference Button -->
            <button @click="playReferenceAudio" :disabled="isPlayingAudio"
              class="flex items-center gap-2 px-5 py-2.5 bg-dark-800 hover:bg-dark-700 text-white rounded-full transition-colors border border-dark-700 hover:border-primary-500/50 group disabled:opacity-60 disabled:cursor-not-allowed">
              <div
                class="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors text-primary-400">
                <!-- Spinner saat audio diputar -->
                <svg v-if="isPlayingAudio" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <!-- Ikon Play saat idle -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-0.5" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <span class="text-sm font-medium">{{ isPlayingAudio ? 'Memutar...' : 'Dengarkan Contoh' }}</span>
            </button>
          </div>

          <!-- Navigation -->
          <div class="flex items-center gap-4 w-full justify-between shrink-0 pt-4 border-t border-dark-800/50">
            <button @click="prevLetter" :disabled="currentLetterIndex === 0"
              class="w-10 h-10 rounded-full bg-dark-950 border border-dark-800 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:border-dark-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clip-rule="evenodd" />
              </svg>
            </button>
            <span class="text-xs text-slate-500 font-medium">{{ currentLetterIndex + 1 }} / {{ letters?.length || 0
            }}</span>
            <button @click="nextLetter" :disabled="!letters || currentLetterIndex === letters.length - 1"
              class="w-10 h-10 rounded-full bg-dark-950 border border-dark-800 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:border-dark-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </template>
      </div>
      <!-- Right Column: Action Area -->
      <div class="lg:col-span-7 min-h-[450px] w-full flex flex-col items-center justify-center relative">

        <!-- Processing State -->
        <div v-if="isProcessing" class="flex flex-col items-center justify-center animate-fade-in w-full">
          <div class="w-20 h-20 relative flex items-center justify-center mb-4">
            <div class="absolute inset-0 border-4 border-dark-800 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin">
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-400 animate-pulse" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <p class="text-white font-medium">Menganalisis pelafalan...</p>
        </div>

        <!-- Evaluation Result -->
        <div v-else-if="showResult"
          class="w-full max-h-full overflow-y-auto custom-scrollbar bg-dark-900/60 backdrop-blur-xl border border-dark-800 rounded-3xl p-6 flex flex-col items-center text-center animate-slide-up shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <p class="text-xs text-slate-400 mb-1 uppercase tracking-widest font-medium">Skor Akurasi</p>
          <div class="text-5xl font-bold mb-1 flex items-baseline gap-1" :class="evaluationResult.color">
            {{ evaluationResult.score }}<span class="text-xl">%</span>
          </div>

          <div v-if="tajweedGrade" class="mb-4">
            <span
              class="px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-400 border border-primary-500/20">
              {{ tajweedGrade }}
            </span>
          </div>

          <div
            class="bg-dark-950 px-4 py-3 rounded-xl border border-dark-800 mb-4 w-full min-h-[60px] flex items-center justify-center">
            <p class="text-white font-medium text-sm">{{ evaluationResult.feedback }}</p>
          </div>

          <!-- Report Accuracy Button -->
          <button v-if="evalId" @click="showFeedbackModal = true"
            class="w-full mb-4 text-xs font-semibold text-slate-400 hover:text-white transition-colors underline underline-offset-2 flex items-center justify-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Laporkan Kesalahan Akurasi
          </button>

          <!-- Similarity Analysis -->
          <div v-if="top3Predictions && top3Predictions.length > 0" class="w-full text-left mb-6">
            <p class="text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Analisis Kemiripan AI</p>
            <div class="space-y-2">
              <div v-for="pred in top3Predictions" :key="pred.label" class="flex flex-col gap-1">
                <div class="flex justify-between text-xs font-medium text-slate-300">
                  <span>{{ formatLabel(pred.label) }}</span>
                  <span>{{ pred.score.toFixed(1) }}%</span>
                </div>
                <div class="w-full bg-dark-950 rounded-full h-1.5 overflow-hidden border border-dark-800">
                  <div class="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
                    :style="{ width: `${pred.score}%` }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Gemini Explanation Button / Box -->
          <button v-if="!showExplanation && evalId" @click="fetchExplanation" :disabled="isFetchingExplanation"
            class="w-full mb-6 py-2.5 px-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            <svg v-if="isFetchingExplanation" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {{ isFetchingExplanation ? 'Membuat Penjelasan...' : 'Lihat Penjelasan Tajwid (AI)' }}
          </button>

          <div v-if="showExplanation"
            class="w-full text-left bg-gradient-to-br from-emerald-950/40 to-teal-950/40 border border-emerald-500/20 rounded-xl p-4 mb-6 shadow-inner animate-fade-in">
            <div class="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Penjelasan Ustadz AI
            </div>
            <p class="text-slate-300 text-xs leading-relaxed whitespace-pre-line">{{ explanationText }}</p>
          </div>

          <div class="flex gap-3 w-full mt-auto">
            <button @click="showResult = false"
              class="flex-1 py-2.5 px-6 bg-dark-950/50 hover:bg-dark-900 text-slate-300 hover:text-white border border-dark-800 text-sm font-bold rounded-xl transition-colors">
              Coba Lagi
            </button>
            <button @click="nextLetter"
              class="flex-1 py-2.5 px-6 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2">
              Lanjut
            </button>
          </div>
        </div>

        <!-- Recording Control -->
        <div v-else class="flex flex-col items-center animate-fade-in w-full">

          <div class="relative w-28 h-28 flex items-center justify-center">
            <!-- Wave Animations -->
            <div v-if="isRecording" class="absolute inset-0 pointer-events-none">
              <div class="w-full h-full rounded-full border-2 border-red-500/60 animate-ping absolute inset-0"
                style="animation-duration: 1.5s;"></div>
              <div class="w-full h-full rounded-full border-2 border-red-500/40 animate-ping absolute inset-0"
                style="animation-duration: 2s; animation-delay: 0.5s;"></div>
              <div class="w-full h-full rounded-full border-2 border-red-500/20 animate-ping absolute inset-0"
                style="animation-duration: 2.5s; animation-delay: 1s;"></div>
            </div>

            <button @click="toggleRecording"
              class="relative z-10 w-full h-full rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-2xl"
              :class="isRecording ? 'bg-red-500 shadow-red-500/40 hover:bg-red-600' : 'bg-gradient-to-br from-primary-400 to-primary-600 shadow-primary-500/40 hover:scale-105'">
              <svg v-if="!isRecording" xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white animate-pulse" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </button>
          </div>

          <p class="mt-6 text-base font-medium text-white min-h-[24px] text-center">
            {{ isRecording ? 'Mendengarkan... (Tekan untuk stop)' : 'Tekan untuk Merekam' }}
          </p>

          <!-- Audio Visualizer Canvas -->
          <div class="w-full max-w-sm mt-6 h-20 bg-dark-950/30 rounded-2xl border border-dark-800/50 shadow-inner flex items-center justify-center overflow-hidden transition-all duration-300" :class="isRecording ? 'opacity-100' : 'opacity-0 scale-95 pointer-events-none'">
            <canvas ref="visualizerCanvas" class="w-full h-full"></canvas>
          </div>
        </div>

      </div>
    </div>

    <!-- Feedback Modal -->
    <Teleport to="body">
      <div v-if="showFeedbackModal" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-sm transition-opacity"
          @click="showFeedbackModal = false">
        </div>
        <div
          class="relative bg-dark-900 border border-dark-800 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-fade-in overflow-hidden">
          <button @click="showFeedbackModal = false"
            class="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd" />
            </svg>
          </button>

          <h3 class="text-lg font-bold text-white mb-2">Laporkan Kesalahan Akurasi</h3>
          <p class="text-xs text-slate-400 mb-4">Jika Anda merasa skor akurasi yang diberikan tidak sesuai dengan
            pelafalan
            asli Anda, berikan masukan di bawah ini untuk membantu kami menyempurnakan model.</p>

          <div v-if="feedbackSubmitted" class="py-6 flex flex-col items-center justify-center text-center">
            <div
              class="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p class="text-white text-sm font-semibold">Laporan Terkirim!</p>
            <p class="text-xs text-slate-500">Terima kasih atas kontribusi Anda.</p>
          </div>

          <form v-else @submit.prevent="sendFeedback">
            <div class="space-y-2 mb-4">
              <label class="block text-sm font-medium text-slate-300">Catatan Keluhan</label>
              <textarea v-model="feedbackComment" rows="4" required
                placeholder="Tuliskan catatan keluhan Anda (misal: pelafalan saya sudah fasih fathah namun terdeteksi kasrah)..."
                class="w-full bg-dark-950 border border-dark-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-600"></textarea>
            </div>

            <div class="flex gap-3 mt-4">
              <button type="button" @click="showFeedbackModal = false"
                class="flex-1 py-2.5 px-6 bg-dark-950/50 hover:bg-dark-900 text-slate-300 hover:text-white border border-dark-800 text-sm font-bold rounded-xl transition-colors">
                Batal
              </button>
              <button type="submit" :disabled="isSubmittingFeedback || !feedbackComment.trim()"
                class="flex-1 py-2.5 px-6 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2">
                <svg v-if="isSubmittingFeedback" class="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                {{ isSubmittingFeedback ? 'Mengirim...' : 'Kirim Masukan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Letter Picker Modal -->
    <Teleport to="body">
      <div v-if="showLetterPicker" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-sm transition-opacity"
          @click="showLetterPicker = false">
        </div>
        <div
          class="relative bg-dark-900 border border-dark-800 rounded-3xl p-6 w-full max-w-4xl shadow-2xl animate-fade-in flex flex-col max-h-[90vh] overflow-hidden">
          <div class="flex items-center justify-between mb-6 shrink-0">
            <div>
              <h3 class="text-xl font-bold text-white">Pilih Huruf Target</h3>
              <p class="text-xs text-slate-400 mt-1">Lompat ke huruf spesifik untuk mulai berlatih.</p>
            </div>
            <button @click="showLetterPicker = false"
              class="text-slate-400 hover:text-white transition-colors bg-dark-800 hover:bg-dark-700 p-2 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div v-if="loadingLetters" class="flex justify-center py-12">
              <div class="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
            <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pb-4">
              <button v-for="(l, idx) in letters" :key="l.id" @click="selectLetter(idx)"
                class="flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group/item"
                :class="currentLetterIndex === idx ? 'bg-primary-500/10 border-primary-500/50' : 'bg-dark-950/50 border-dark-800 hover:border-primary-500/30 hover:bg-dark-800'">
                <div v-if="currentLetterIndex === idx" class="absolute inset-0 bg-primary-500/5 pointer-events-none">
                </div>
                <span
                  class="font-arabic text-4xl text-white group-hover/item:text-primary-400 transition-colors leading-none pt-2 mb-2 drop-shadow-md"
                  :class="{ 'text-primary-400': currentLetterIndex === idx }">
                  {{ l.arabic_script }}
                </span>
                <span class="text-xs font-semibold text-slate-300 group-hover/item:text-white transition-colors"
                  :class="{ 'text-white': currentLetterIndex === idx }">
                  {{ l.base_letter }}
                </span>
                <span class="text-[10px] text-slate-500 mt-0.5 group-hover/item:text-slate-400"
                  :class="{ 'text-primary-300/70': currentLetterIndex === idx }">
                  {{ l.harakat }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Custom Alert Modal -->
    <Teleport to="body">
      <div v-if="showAlertModal" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-sm transition-opacity"
          @click="showAlertModal = false">
        </div>
        <div
          class="relative bg-dark-900 border border-dark-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-fade-in flex flex-col items-center text-center">
          <div
            class="w-16 h-16 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-4 border border-yellow-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">{{ alertTitle }}</h3>
          <p class="text-sm text-slate-400 mb-6">{{ alertMessage }}</p>
          <button @click="showAlertModal = false"
            class="w-full py-3 px-6 bg-dark-800 hover:bg-dark-700 border border-dark-700 text-white font-semibold rounded-xl transition-colors">
            Mengerti
          </button>
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

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.4s ease-out forwards;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.3);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.4);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.6);
}
</style>
