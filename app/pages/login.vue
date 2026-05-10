<script setup lang="ts">
definePageMeta({ layout: false })   // halaman login tidak pakai layout sidebar

const email       = ref('')
const password    = ref('')
const showPass    = ref(false)
const isLoading   = ref(false)
const errorMsg    = ref('')

const api       = useApi()
const authStore = useAuthStore()
const router    = useRouter()
const route     = useRoute()

// Jika sudah login, langsung ke dashboard
if (authStore.isLoggedIn) {
  navigateTo('/dashboard')
}

const handleLogin = async () => {
  if (isLoading.value) return
  errorMsg.value  = ''
  isLoading.value = true

  try {
    const data = await api.login(email.value, password.value)
    authStore.setAuth(data.access_token, data.user_id, data.user_name)

    // Redirect ke halaman yang dituju sebelumnya, atau dashboard
    const redirect = route.query.redirect as string || '/dashboard'
    router.push(redirect)
  } catch (err: any) {
    errorMsg.value = err.message || 'Login gagal. Periksa email dan password Anda.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-dark-950 flex flex-col justify-center items-center relative overflow-hidden font-sans">

    <!-- Background Effects -->
    <div class="absolute top-0 left-0 w-full h-full bg-hero-glow pointer-events-none opacity-50"></div>
    <div class="absolute w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

    <main class="w-full max-w-md px-6 py-12 relative z-10">
      <!-- Brand -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex flex-col items-center gap-3">
          <img src="/logo.png" alt="Tarteel Space Logo" class="w-12 rounded-lg h-12 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <h1 class="text-3xl font-bold text-white tracking-tight">
            Tarteel <span class="text-primary-400">Space</span>
          </h1>
        </NuxtLink>
        <p class="text-slate-400 mt-2 text-sm">Masuk ke akun Anda untuk melanjutkan</p>
      </div>

      <!-- Card -->
      <div class="bg-dark-900/80 backdrop-blur-xl border border-dark-800 rounded-2xl p-8 shadow-2xl">

        <!-- Error Alert -->
        <div v-if="errorMsg"
          class="mb-5 flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {{ errorMsg }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">

          <!-- Email -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-slate-300">Email</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input v-model="email" type="email" required placeholder="nama@email.com"
                class="w-full bg-dark-950 border border-dark-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-600" />
            </div>
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-sm font-medium text-slate-300">Password</label>
              <a href="#" class="text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors">Lupa password?</a>
            </div>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input v-model="password" :type="showPass ? 'text' : 'password'" required placeholder="••••••••"
                class="w-full bg-dark-950 border border-dark-800 text-white rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-600" />
              <button type="button" @click="showPass = !showPass"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                <svg v-if="!showPass" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button type="submit" :disabled="isLoading"
            class="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary-500/25 flex justify-center items-center gap-2">
            <svg v-if="isLoading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span>{{ isLoading ? 'Memproses...' : 'Masuk' }}</span>
            <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

        </form>

        <div class="mt-6 flex items-center gap-3">
          <span class="flex-1 border-b border-dark-800"></span>
          <span class="text-xs text-slate-500 uppercase tracking-wider">Atau</span>
          <span class="flex-1 border-b border-dark-800"></span>
        </div>

        <p class="mt-6 text-center text-sm text-slate-400">
          Belum punya akun?
          <NuxtLink to="/register" class="font-medium text-primary-400 hover:text-primary-300 transition-colors">
            Daftar sekarang
          </NuxtLink>
        </p>
      </div>
    </main>
  </div>
</template>