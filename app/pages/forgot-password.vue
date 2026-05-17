<script setup lang="ts">
definePageMeta({ layout: false })

const email     = ref('')
const isLoading = ref(false)
const isSuccess = ref(false)
const errorMsg  = ref('')
const api       = useApi()

const handleSubmit = async () => {
  if (isLoading.value) return
  isLoading.value = true
  errorMsg.value  = ''

  try {
    await api.forgotPassword(email.value)
    isSuccess.value = true
  } catch (err: any) {
    errorMsg.value = err.message || 'Terjadi kesalahan. Coba lagi.'
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
        <p class="text-slate-400 mt-2 text-sm">Reset password akun Anda</p>
      </div>

      <!-- Card -->
      <div class="bg-dark-900/80 backdrop-blur-xl border border-dark-800 rounded-2xl p-8 shadow-2xl">

        <!-- Success State -->
        <div v-if="isSuccess" class="text-center">
          <div class="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-white mb-2">Cek Email Anda</h2>
          <p class="text-sm text-slate-400 mb-6 leading-relaxed">
            Kami telah mengirimkan link reset password ke <span class="text-white font-medium">{{ email }}</span>. Periksa juga folder <em>spam</em> jika tidak ditemukan di inbox.
          </p>
          <NuxtLink to="/login"
            class="block w-full text-center py-3 px-4 bg-dark-800 hover:bg-dark-700 text-white rounded-xl font-medium transition-colors border border-dark-700">
            Kembali ke Login
          </NuxtLink>
        </div>

        <!-- Form State -->
        <template v-else>
          <h2 class="text-lg font-bold text-white mb-1">Lupa Password?</h2>
          <p class="text-sm text-slate-400 mb-6">
            Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.
            <span class="block mt-2 text-xs text-slate-500">
              *Catatan: Fitur ini ditujukan bagi pengguna yang mendaftar secara manual, bukan melalui Google atau GitHub.
            </span>
          </p>

          <!-- Error Alert -->
          <div v-if="errorMsg"
            class="mb-5 flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {{ errorMsg }}
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5">
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

            <button type="submit" :disabled="isLoading"
              class="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary-500/25 flex justify-center items-center gap-2">
              <svg v-if="isLoading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>{{ isLoading ? 'Mengirim...' : 'Kirim Link Reset' }}</span>
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-slate-400">
            Ingat password?
            <NuxtLink to="/login" class="font-medium text-primary-400 hover:text-primary-300 transition-colors">
              Kembali ke Login
            </NuxtLink>
          </p>
        </template>
      </div>
    </main>
  </div>
</template>
