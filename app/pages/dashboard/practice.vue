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
const top3Predictions = ref<Array<{ label: string; score: number }>>([])

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


let recordingStartTime = 0
const MAX_RECORDING_TIME_MS = 5000 // 5 detik

onUnmounted(() => {
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

  canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1)
  canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1)
  canvasCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)

  analyser.fftSize = 2048
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  const draw = () => {
    if (!isRecording.value) return

    animationFrameId = requestAnimationFrame(draw)
    analyser!.getByteTimeDomainData(dataArray)

    canvasCtx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)

    canvasCtx.lineWidth = 2.5
    canvasCtx.strokeStyle = '#60a5fa'
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
    mediaRecorder.value?.stop()
    isRecording.value = false
    
    if (audioContext) {
      audioContext.close()
      audioContext = null
    }
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  } else {
    showResult.value = false

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

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      audioContext = new AudioContextClass()
      analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      
      setTimeout(() => drawVisualizer(), 50)

      mediaRecorder.value.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.value.push(e.data)
      }

      mediaRecorder.value.onstop = () => {
        stream.getTracks().forEach(track => track.stop())

        const duration = Date.now() - recordingStartTime
        if (duration > MAX_RECORDING_TIME_MS) {
          showCustomAlert(`Durasi rekaman terlalu lama (${(duration / 1000).toFixed(1)} detik). Maksimal 5 detik. Silakan coba lagi.`, 'Rekaman Terlalu Lama')
          return
        }

        if (duration < 1000) {
          showCustomAlert('Durasi rekaman terlalu singkat. Silakan tekan dan ucapkan makhraj huruf dengan jelas.', 'Rekaman Terlalu Singkat')
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
  const startTime = performance.now()

  try {
    const result = await api.evaluate(targetLetter.value.id, audioBlob, currentSessionId.value || undefined)

    evalId.value = result.id
    top3Predictions.value = result.top3_predictions || []

    evaluationResult.value.score = Math.round(result.accuracy_score)
    evaluationResult.value.feedback = result.feedback

    if (result.accuracy_score >= 80) {
      evaluationResult.value.color = 'text-emerald-400'
    } else if (result.accuracy_score >= 60) {
      evaluationResult.value.color = 'text-amber-400'
    } else {
      evaluationResult.value.color = 'text-rose-400'
    }

    const endTime = performance.now()
    const e2eTimeMs = endTime - startTime
    console.log(`⏱️ [METRIK] Waktu Respons End-to-End: ${(e2eTimeMs / 1000).toFixed(3)} detik (${e2eTimeMs.toFixed(1)} ms)`)

    // Deteksi tipe perangkat (mobile vs desktop)
    const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const deviceType = isMobile ? 'mobile' : 'desktop'

    // Kirim metrik telemetri ke server secara asinkron (fire-and-forget) tanpa memblokir UI
    api.recordMetric({
      evaluation_id: result.id,
      client_e2e_ms: Number(e2eTimeMs.toFixed(2)),
      device_type: deviceType
    }).catch(metricErr => {
      console.warn('[Benchmark] Gagal mencatat metrik latensi:', metricErr)
    })

  } catch (err: any) {
    console.error(err)
    evaluationResult.value.score = 0
    evaluationResult.value.feedback = err.message || 'Terjadi kesalahan saat mengevaluasi audio.'
    evaluationResult.value.color = 'text-rose-400'
    evalId.value = null
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
    showCustomAlert('File audio referensi untuk huruf ini belum tersedia.', 'Audio Belum Ada')
    return
  }

  const audio = new Audio(audioUrl)

  isPlayingAudio.value = true
  audio.play().catch(() => {
    showCustomAlert('File audio untuk huruf ini gagal diputar.', 'Gagal Memutar')
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
  <div class="h-full flex flex-col max-w-6xl mx-auto px-2 pb-10 font-sans">

    <!-- Header Area -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 shrink-0 gap-4 border-b border-white/10 pb-5">
      <div>
        <h1 class="font-display font-semibold text-3xl sm:text-4xl text-ink-0 tracking-tight">Ruang Latihan Pelafalan</h1>
        <p class="font-sans text-sm sm:text-base text-ink-1 mt-1 leading-relaxed">Pilih huruf target dan rekam suara Anda untuk evaluasi tajwid berbasis AI CNN.</p>
      </div>
      <button @click="showLetterPicker = true"
        class="px-6 py-2.5 bg-dark-900/80 backdrop-blur-2xl border border-white/10 hover:border-primary-500/40 rounded-full flex items-center gap-3 text-ink-0 transition-all group shadow-xl cursor-pointer">
        <span class="font-sans font-bold text-2xl text-primary-400 leading-none">{{ targetLetter?.arabic_script || '?' }}</span>
        <span class="font-mono text-xs uppercase tracking-wider text-ink-1 group-hover:text-ink-0 font-semibold">Pilih Huruf</span>
      </button>
    </div>

    <!-- Main Content Grid -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">

      <!-- Left Column: Target Letter Card -->
      <div
        class="lg:col-span-5 min-h-[480px] w-full bg-dark-900/80 backdrop-blur-2xl border border-white/10 hover:border-primary-500/30 transition-all rounded-3xl p-8 flex flex-col items-center justify-between relative overflow-hidden shadow-xl group/card">
        
        <div v-if="loadingLetters" class="flex flex-col items-center justify-center animate-pulse gap-4 h-full w-full py-20">
          <div class="w-20 h-20 bg-dark-850 rounded-full"></div>
          <div class="h-4 w-32 bg-dark-850 rounded"></div>
        </div>

        <template v-else-if="targetLetter">
          <!-- Letter and Audio Group Centered -->
          <div class="flex-1 flex flex-col items-center justify-center w-full my-auto text-center">
            <div class="font-mono text-xs sm:text-sm text-ink-2 uppercase tracking-widest mb-3 font-semibold">Target Lafal: {{ targetLetter.pronunciation }}</div>

            <!-- Big Arabic Character -->
            <div
              class="leading-none font-sans font-bold text-ink-0 mb-4 transition-all select-none"
              style="font-size: 130px;">
              {{ targetLetter.arabic_script }}
            </div>

            <div class="font-display font-semibold text-2xl text-primary-400 mb-8 tracking-tight">
              {{ targetLetter.base_letter }} <span class="text-ink-3">·</span> {{ targetLetter.harakat }}
            </div>

            <!-- Audio Reference Button -->
            <button @click="playReferenceAudio" :disabled="isPlayingAudio"
              class="flex items-center gap-2.5 px-6 py-3 bg-dark-950 hover:bg-dark-850 text-ink-0 rounded-full transition-all border border-white/10 hover:border-white/20 group disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-md">
              <div
                class="w-6 h-6 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-dark-950 transition-colors text-primary-400">
                <svg v-if="isPlayingAudio" class="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 ml-0.5" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <span class="font-sans text-sm font-semibold">{{ isPlayingAudio ? 'Memutar...' : 'Dengarkan Contoh Ustadz' }}</span>
            </button>
          </div>

          <!-- Navigation -->
          <div class="flex items-center gap-4 w-full justify-between shrink-0 pt-6 border-t border-white/5 mt-4">
            <button @click="prevLetter" :disabled="currentLetterIndex === 0"
              class="w-10 h-10 rounded-full bg-dark-950 border border-white/10 flex items-center justify-center text-ink-2 hover:text-ink-0 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clip-rule="evenodd" />
              </svg>
            </button>
            <span class="font-mono text-xs sm:text-sm text-ink-3 font-semibold">{{ currentLetterIndex + 1 }} / {{ letters?.length || 0 }}</span>
            <button @click="nextLetter" :disabled="!letters || currentLetterIndex === letters.length - 1"
              class="w-10 h-10 rounded-full bg-dark-950 border border-white/10 flex items-center justify-center text-ink-2 hover:text-ink-0 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </template>
      </div>

      <!-- Right Column: Action Area -->
      <div class="lg:col-span-7 min-h-[480px] w-full flex flex-col items-center justify-center relative">

        <!-- Processing State -->
        <div v-if="isProcessing" class="flex flex-col items-center justify-center animate-fade-in w-full py-16">
          <div class="w-16 h-16 relative flex items-center justify-center mb-4">
            <div class="absolute inset-0 border-2 border-white/10 rounded-full"></div>
            <div class="absolute inset-0 border-2 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-400" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <p class="font-display font-semibold text-ink-0 text-lg">Menganalisis pelafalan...</p>
          <p class="font-sans text-sm text-ink-2 mt-1">Ekstraksi MFCC & klasifikasi Convolutional Neural Network</p>
        </div>

        <!-- Evaluation Result -->
        <div v-else-if="showResult"
          class="w-full max-h-full overflow-y-auto custom-scrollbar bg-dark-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center animate-slide-up shadow-xl">
          
          <p class="font-mono text-xs sm:text-sm text-ink-2 uppercase tracking-widest font-bold mb-1">Skor Akurasi</p>
          
          <div class="font-mono font-bold text-6xl mb-2 flex items-baseline gap-1" :class="evaluationResult.color">
            {{ evaluationResult.score }}<span class="text-3xl font-medium">%</span>
          </div>


          <div
            class="bg-dark-950/60 px-6 py-4 rounded-2xl border border-white/10 mb-4 w-full min-h-[50px] flex items-center justify-center">
            <p class="font-sans text-ink-0 font-medium text-sm sm:text-base leading-relaxed">{{ evaluationResult.feedback }}</p>
          </div>

          <!-- Report Accuracy Button -->
          <button v-if="evalId" @click="showFeedbackModal = true"
            class="w-full mb-5 font-mono text-xs sm:text-sm text-ink-2 hover:text-ink-0 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-rose-400" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="underline underline-offset-2">Laporkan Koreksi Prediksi AI</span>
          </button>

          <!-- Similarity Analysis -->
          <div v-if="top3Predictions && top3Predictions.length > 0" class="w-full text-left mb-6 bg-dark-950/40 p-5 rounded-2xl border border-white/5">
            <p class="font-mono text-xs sm:text-sm text-ink-2 mb-3 uppercase tracking-wider font-bold">Analisis Kemiripan CNN</p>
            <div class="space-y-3">
              <div v-for="pred in top3Predictions" :key="pred.label" class="flex flex-col gap-1.5">
                <div class="flex justify-between font-mono text-xs sm:text-sm text-ink-1">
                  <span class="font-medium">{{ formatLabel(pred.label) }}</span>
                  <span class="font-bold">{{ pred.score.toFixed(1) }}%</span>
                </div>
                <div class="w-full bg-dark-950 rounded-full h-2 overflow-hidden border border-white/5">
                  <div class="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    :style="{ width: `${pred.score}%` }"></div>
                </div>
              </div>
            </div>
          </div>


          <div class="flex flex-col sm:flex-row gap-3 w-full mt-auto">
            <button @click="showResult = false"
              class="ts-btn ts-btn--ghost flex-1 py-3">
              Coba Lagi
            </button>
            <button @click="nextLetter"
              class="ts-btn ts-btn--primary flex-1 py-3">
              <span>Lanjut Huruf Berikutnya</span>
            </button>
          </div>
        </div>

        <!-- Recording Control -->
        <div v-else class="flex flex-col items-center animate-fade-in w-full">

          <div class="relative w-28 h-28 flex items-center justify-center">
            <!-- Wave Animations -->
            <div v-if="isRecording" class="absolute inset-0 pointer-events-none">
              <div class="w-full h-full rounded-full border-2 border-rose-500/60 animate-ping absolute inset-0"
                style="animation-duration: 1.5s;"></div>
              <div class="w-full h-full rounded-full border-2 border-rose-500/40 animate-ping absolute inset-0"
                style="animation-duration: 2s; animation-delay: 0.5s;"></div>
            </div>

            <button @click="toggleRecording"
              class="relative z-10 w-full h-full rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-2xl cursor-pointer"
              :class="isRecording ? 'bg-rose-500 shadow-rose-500/40 hover:bg-rose-600' : 'bg-primary-500 hover:bg-primary-400 shadow-primary-500/30 hover:scale-105'">
              <svg v-if="!isRecording" xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-dark-950" fill="none"
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

          <p class="mt-6 font-display font-medium text-ink-0 text-base min-h-[24px] text-center">
            {{ isRecording ? 'Mendengarkan... (Tekan untuk selesai)' : 'Tekan untuk Merekam Suara' }}
          </p>
          <p class="font-sans text-xs text-ink-3 mt-1">Ucapkan makhraj huruf dengan jelas selama 1-5 detik.</p>

          <!-- Audio Visualizer Canvas -->
          <div class="w-full max-w-sm mt-6 h-20 bg-dark-950/60 rounded-2xl border border-white/10 shadow-inner flex items-center justify-center overflow-hidden transition-all duration-300" :class="isRecording ? 'opacity-100' : 'opacity-0 scale-95 pointer-events-none'">
            <canvas ref="visualizerCanvas" class="w-full h-full"></canvas>
          </div>
        </div>

      </div>
    </div>

    <!-- Feedback Modal -->
    <Teleport to="body">
      <div v-if="showFeedbackModal" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-md transition-opacity"
          @click="showFeedbackModal = false">
        </div>
        <div
          class="relative bg-dark-900/95 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl overflow-hidden font-sans">
          <button @click="showFeedbackModal = false"
            class="absolute top-4 right-4 text-ink-3 hover:text-ink-0 transition-colors p-1.5 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h3 class="font-display font-semibold text-lg text-ink-0 mb-1 tracking-tight">Laporkan Koreksi Prediksi</h3>
          <p class="font-sans text-xs text-ink-2 mb-4">Jika Anda merasa penilaian AI kurang tepat, berikan masukan agar admin dapat meninjau dan memperbaiki model.</p>

          <div v-if="feedbackSubmitted" class="py-6 flex flex-col items-center justify-center text-center">
            <div
              class="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p class="font-display font-semibold text-ink-0 text-base">Laporan Terkirim!</p>
            <p class="font-sans text-xs text-ink-3 mt-0.5">Terima kasih atas kontribusi Anda dalam meningkatkan dataset.</p>
          </div>

          <form v-else @submit.prevent="sendFeedback">
            <div class="space-y-1.5 mb-4">
              <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Catatan Keluhan</label>
              <textarea v-model="feedbackComment" rows="4" required
                placeholder="Tuliskan catatan keluhan (misal: pelafalan fathah sudah tepat namun terdeteksi kasrah)..."
                class="w-full bg-dark-950 border border-white/10 hover:border-white/20 text-ink-0 text-xs sm:text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-ink-3 resize-none"></textarea>
            </div>

            <div class="flex gap-3 justify-end">
              <button type="button" @click="showFeedbackModal = false"
                class="ts-btn ts-btn--ghost">
                Batal
              </button>
              <button type="submit" :disabled="isSubmittingFeedback || !feedbackComment.trim()"
                class="ts-btn ts-btn--primary">
                <svg v-if="isSubmittingFeedback" class="animate-spin h-4 w-4 text-dark-950"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span>{{ isSubmittingFeedback ? 'Mengirim...' : 'Kirim Laporan' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Letter Picker Modal -->
    <Teleport to="body">
      <div v-if="showLetterPicker" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-md transition-opacity"
          @click="showLetterPicker = false">
        </div>
        <div
          class="relative bg-dark-900/95 border border-white/10 rounded-3xl p-6 w-full max-w-4xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden font-sans">
          <div class="flex items-center justify-between mb-5 shrink-0">
            <div>
              <h3 class="font-display font-semibold text-lg text-ink-0 tracking-tight">Pilih Huruf Target Hijaiyah</h3>
              <p class="font-sans text-xs text-ink-2 mt-0.5">Pilih huruf hijaiyah dan harakat yang ingin Anda latih.</p>
            </div>
            <button @click="showLetterPicker = false"
              class="text-ink-3 hover:text-ink-0 transition-colors p-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div v-if="loadingLetters" class="flex justify-center py-12">
              <div class="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
            <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pb-4">
              <button v-for="(l, idx) in letters" :key="l.id" @click="selectLetter(idx)"
                class="flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden group/item cursor-pointer"
                :class="currentLetterIndex === idx ? 'bg-primary-500/10 border-primary-500/50' : 'bg-dark-950/60 border-white/10 hover:border-primary-500/40 hover:bg-dark-850'">
                <span
                  class="font-sans font-bold text-3xl text-ink-0 group-hover/item:text-primary-400 transition-colors leading-none pt-1 mb-2"
                  :class="{ 'text-primary-400': currentLetterIndex === idx }">
                  {{ l.arabic_script }}
                </span>
                <span class="font-medium text-xs text-ink-1 group-hover/item:text-ink-0 transition-colors"
                  :class="{ 'text-primary-400 font-semibold': currentLetterIndex === idx }">
                  {{ l.base_letter }}
                </span>
                <span class="font-mono text-[10px] text-ink-3 mt-0.5">
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
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-md transition-opacity"
          @click="showAlertModal = false">
        </div>
        <div
          class="relative bg-dark-900/95 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center text-center font-sans">
          <div
            class="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3.5 border border-amber-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="font-display font-semibold text-lg text-ink-0 mb-1.5">{{ alertTitle }}</h3>
          <p class="font-sans text-xs text-ink-2 mb-5 leading-relaxed">{{ alertMessage }}</p>
          <button @click="showAlertModal = false"
            class="w-full py-2.5 px-5 bg-primary-500 hover:bg-primary-400 text-dark-950 font-medium text-xs rounded-full transition-colors shadow-md shadow-primary-500/25 cursor-pointer">
            Mengerti
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.25s ease-out forwards;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out forwards;
}
</style>
