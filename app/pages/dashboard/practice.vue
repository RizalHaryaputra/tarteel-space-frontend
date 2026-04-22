<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

// State
const targetLetter = {
  arabic: 'ن',
  transliteration: 'Nun',
  instruction: 'Ucapkan: NA'
}

const isRecording = ref(false)
const isProcessing = ref(false)
const showResult = ref(false)

const evaluationResult = ref({
  score: 0,
  feedback: '',
  color: ''
})

const toggleRecording = () => {
  if (isRecording.value) {
    // Stop recording
    isRecording.value = false
    processAudio()
  } else {
    // Start recording
    showResult.value = false
    isRecording.value = true
  }
}

const processAudio = () => {
  isProcessing.value = true
  
  // Mock processing delay
  setTimeout(() => {
    isProcessing.value = false
    
    // Mock result (Randomize for demo purposes)
    const mockScore = Math.floor(Math.random() * 40) + 60 // 60 to 99
    evaluationResult.value.score = mockScore
    
    if (mockScore >= 90) {
      evaluationResult.value.feedback = 'Sempurna! Makhraj sangat jelas.'
      evaluationResult.value.color = 'text-green-400'
    } else if (mockScore >= 75) {
      evaluationResult.value.feedback = 'Bagus. Perhatikan panjang pendeknya.'
      evaluationResult.value.color = 'text-yellow-400'
    } else {
      evaluationResult.value.feedback = 'Perlu perbaikan. Dengar referensi lagi.'
      evaluationResult.value.color = 'text-red-400'
    }
    
    showResult.value = true
  }, 2000)
}

const playReferenceAudio = () => {
  // TODO: Integrate actual audio playback
  console.log('Playing reference audio for', targetLetter.transliteration)
}
</script>

<template>
  <div class="h-full flex flex-col max-w-5xl mx-auto px-2 pb-4">
    
    <!-- Header Area (Compact) -->
    <div class="text-center mb-6 shrink-0">
      <h2 class="text-2xl font-bold text-white mb-1">Evaluasi Pelafalan</h2>
      <p class="text-sm text-slate-400">Tekan ikon mikrofon untuk mulai merekam suara Anda.</p>
    </div>

    <!-- Main Content: Takes remaining height, max height 500px, 2 columns -->
    <div class="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-h-[500px] w-full">
      
      <!-- Left Column: Target Letter Card -->
      <div class="h-full max-h-[400px] w-full bg-dark-900/80 backdrop-blur-xl border border-dark-800 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        <!-- Decoration -->
        <div class="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div class="text-slate-400 text-xs font-medium mb-2 uppercase tracking-widest">{{ targetLetter.instruction }}</div>
        
        <div class="leading-none font-arabic text-white mb-2 drop-shadow-[0_0_25px_rgba(255,255,255,0.1)]" style="font-size: 130px;">
          {{ targetLetter.arabic }}
        </div>
        
        <div class="text-xl font-bold text-primary-400 mb-6">{{ targetLetter.transliteration }}</div>
        
        <!-- Audio Reference Button -->
        <button 
          @click="playReferenceAudio"
          class="flex items-center gap-2 px-5 py-2.5 bg-dark-800 hover:bg-dark-700 text-white rounded-full transition-colors border border-dark-700 hover:border-primary-500/50 group"
        >
          <div class="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors text-primary-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
            </svg>
          </div>
          <span class="text-sm font-medium">Dengarkan Contoh</span>
        </button>
      </div>

      <!-- Right Column: Action Area -->
      <div class="h-full max-h-[400px] w-full flex flex-col items-center justify-center relative">
        
        <!-- Processing State -->
        <div v-if="isProcessing" class="flex flex-col items-center justify-center animate-fade-in w-full">
          <div class="w-20 h-20 relative flex items-center justify-center mb-4">
            <div class="absolute inset-0 border-4 border-dark-800 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <p class="text-white font-medium">Menganalisis pelafalan...</p>
        </div>

        <!-- Evaluation Result -->
        <div v-else-if="showResult" class="w-full bg-dark-900/60 backdrop-blur-xl border border-dark-800 rounded-3xl p-6 flex flex-col items-center text-center animate-slide-up shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <p class="text-xs text-slate-400 mb-1 uppercase tracking-widest font-medium">Skor Akurasi</p>
          <div class="text-5xl font-bold mb-3 flex items-baseline gap-1" :class="evaluationResult.color">
            {{ evaluationResult.score }}<span class="text-xl">%</span>
          </div>
          <div class="bg-dark-950 px-4 py-3 rounded-xl border border-dark-800 mb-6 w-full min-h-[60px] flex items-center justify-center">
            <p class="text-white font-medium text-sm">{{ evaluationResult.feedback }}</p>
          </div>
          
          <div class="flex gap-3 w-full">
            <button @click="showResult = false" class="flex-1 py-2.5 px-3 bg-dark-800 hover:bg-dark-700 text-white text-sm font-medium rounded-xl transition-colors border border-dark-700">
              Coba Lagi
            </button>
            <button class="flex-1 py-2.5 px-3 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-primary-500/25">
              Lanjut
            </button>
          </div>
        </div>

        <!-- Recording Control -->
        <div v-else class="flex flex-col items-center animate-fade-in w-full">
          
          <div class="relative w-28 h-28 flex items-center justify-center">
            <!-- Wave Animations -->
            <div v-if="isRecording" class="absolute inset-0 pointer-events-none">
              <div class="w-full h-full rounded-full border-2 border-red-500/60 animate-ping absolute inset-0" style="animation-duration: 1.5s;"></div>
              <div class="w-full h-full rounded-full border-2 border-red-500/40 animate-ping absolute inset-0" style="animation-duration: 2s; animation-delay: 0.5s;"></div>
              <div class="w-full h-full rounded-full border-2 border-red-500/20 animate-ping absolute inset-0" style="animation-duration: 2.5s; animation-delay: 1s;"></div>
            </div>

            <button 
              @click="toggleRecording"
              class="relative z-10 w-full h-full rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-2xl"
              :class="isRecording ? 'bg-red-500 shadow-red-500/40 hover:bg-red-600' : 'bg-gradient-to-br from-primary-400 to-primary-600 shadow-primary-500/40 hover:scale-105'"
            >
              <svg v-if="!isRecording" xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </button>
          </div>
          
          <p class="mt-6 text-base font-medium text-white min-h-[24px] text-center">
            {{ isRecording ? 'Mendengarkan... (Tekan untuk stop)' : 'Tekan untuk Merekam' }}
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri&display=swap');
.font-arabic {
  font-family: 'Amiri', serif;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-up {
  animation: slide-up 0.4s ease-out forwards;
}
</style>
