<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

definePageMeta({ layout: false })

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const errorMsg = ref('')

onMounted(() => {
  const token = route.query.token as string
  const userId = route.query.user_id as string
  const userName = route.query.user_name as string
  const error = route.query.error as string

  if (error) {
    errorMsg.value = error
    // Redirect back to login after showing error
    setTimeout(() => {
      router.push('/login')
    }, 3000)
    return
  }

  if (token && userId && userName) {
    authStore.setAuth(token, userId, userName)
    router.push('/dashboard')
  } else {
    errorMsg.value = 'Data autentikasi tidak lengkap.'
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }
})
</script>

<template>
  <div class="min-h-screen bg-dark-950 flex flex-col justify-center items-center relative overflow-hidden font-sans">
    <div class="absolute top-0 left-0 w-full h-full bg-hero-glow pointer-events-none opacity-50"></div>
    
    <div class="z-10 text-center">
      <div v-if="errorMsg" class="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-2xl max-w-md mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <h2 class="text-xl font-bold mb-2">Autentikasi Gagal</h2>
        <p>{{ errorMsg }}</p>
        <p class="text-sm mt-4 opacity-75">Mengalihkan ke halaman login...</p>
      </div>
      
      <div v-else class="flex flex-col items-center">
        <div class="relative mb-8">
          <div class="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-2 h-2 bg-primary-400 rounded-full"></div>
          </div>
        </div>
        <h2 class="text-2xl font-bold text-white tracking-tight mb-2">Menyiapkan Akun Anda...</h2>
        <p class="text-slate-400">Mohon tunggu sebentar, kami sedang memproses data Anda.</p>
      </div>
    </div>
  </div>
</template>
