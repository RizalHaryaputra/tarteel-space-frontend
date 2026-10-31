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
  const role = route.query.role as string || 'user'
  const error = route.query.error as string

  if (error) {
    errorMsg.value = error
    setTimeout(() => {
      router.push('/login')
    }, 3000)
    return
  }

  if (token && userId && userName) {
    authStore.setAuth(token, userId, userName, role)
    if (role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  } else {
    errorMsg.value = 'Data autentikasi tidak lengkap.'
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }
})
</script>

<template>
  <div class="min-h-screen bg-dark-950 flex flex-col justify-center items-center relative overflow-hidden font-sans p-4">
    <div class="absolute top-0 left-0 w-full h-full bg-hero-glow pointer-events-none opacity-50"></div>
    
    <div class="z-10 text-center max-w-md w-full">
      <div v-if="errorMsg" class="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-3 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <h2 class="font-display font-semibold text-lg sm:text-xl text-ink-0 mb-1 tracking-tight">Autentikasi Gagal</h2>
        <p class="font-sans text-xs sm:text-sm text-ink-2">{{ errorMsg }}</p>
        <p class="font-mono text-xs text-ink-3 mt-4">Mengalihkan ke halaman masuk...</p>
      </div>
      
      <div v-else class="flex flex-col items-center bg-dark-900/80 border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-2xl">
        <div class="relative mb-6">
          <div class="w-12 h-12 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
        <h2 class="font-display font-semibold text-xl sm:text-2xl text-ink-0 tracking-tight mb-1.5">Menyiapkan Sesi Akun...</h2>
        <p class="font-sans text-xs sm:text-sm text-ink-2">Mohon tunggu sebentar, kami sedang memproses data login Anda.</p>
      </div>
    </div>
  </div>
</template>
