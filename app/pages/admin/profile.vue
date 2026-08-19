<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const api = useApi()
const authStore = useAuthStore()

// State
const isLoading = ref(true)
const isSavingProfile = ref(false)
const isSavingPassword = ref(false)
const isUploadingAvatar = ref(false)

const profile = ref({
  id: '',
  name: '',
  email: '',
  bio: '',
  avatar_url: '',
  auth_provider: 'local'
})

const passwordForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const selectedAvatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)

// Toast State
const successToast = ref('')
const errorToast = ref('')

const showToast = (message: string, isError = false) => {
  if (isError) {
    errorToast.value = message
    setTimeout(() => { errorToast.value = '' }, 3000)
  } else {
    successToast.value = message
    setTimeout(() => { successToast.value = '' }, 3000)
  }
}

// Fetch Profile
const fetchProfile = async () => {
  try {
    isLoading.value = true
    const data = await api.getProfile()
    profile.value = {
      id: data.id,
      name: data.name,
      email: data.email,
      bio: data.bio || '',
      avatar_url: data.avatar_url || '',
      auth_provider: data.auth_provider
    }

    // Sync to auth store
    if (data.name && authStore.userName !== data.name) {
      authStore.userName = data.name
      if (import.meta.client) localStorage.setItem('tarteel_username', data.name)
    }
    if (data.avatar_url && authStore.avatarUrl !== data.avatar_url) {
      authStore.avatarUrl = data.avatar_url
      if (import.meta.client) localStorage.setItem('tarteel_avatar_url', data.avatar_url)
    }
  } catch (error: any) {
    showToast(error.message || 'Gagal memuat profil', true)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchProfile()
})

// Update Profile
const handleUpdateProfile = async () => {
  if (!profile.value.name || !profile.value.email) {
    return showToast('Nama dan Email wajib diisi', true)
  }

  try {
    isSavingProfile.value = true
    await api.updateProfile(profile.value.name, profile.value.email, profile.value.bio)
    showToast('Profil berhasil diperbarui')

    // Update store state
    if (authStore.userName !== profile.value.name) {
      authStore.userName = profile.value.name
      if (import.meta.client) localStorage.setItem('tarteel_username', profile.value.name)
    }
  } catch (error: any) {
    showToast(error.message || 'Gagal memperbarui profil', true)
  } finally {
    isSavingProfile.value = false
  }
}

// Handle Avatar Selection
const handleAvatarChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return showToast('Format gambar harus JPG, PNG, atau WEBP', true)
    }
    selectedAvatarFile.value = file
    avatarPreview.value = URL.createObjectURL(file)
  }
}

// Upload Avatar
const handleUploadAvatar = async () => {
  if (!selectedAvatarFile.value) return

  try {
    isUploadingAvatar.value = true
    const res = await api.updateAvatar(selectedAvatarFile.value)
    profile.value.avatar_url = res.avatar_url

    authStore.avatarUrl = res.avatar_url
    if (import.meta.client) localStorage.setItem('tarteel_avatar_url', res.avatar_url)

    avatarPreview.value = null
    selectedAvatarFile.value = null
    showToast('Foto profil berhasil diunggah')
  } catch (error: any) {
    showToast(error.message || 'Gagal mengunggah foto profil', true)
  } finally {
    isUploadingAvatar.value = false
  }
}

// Delete Avatar
const isDeletingAvatar = ref(false)
const isDeleteModalOpen = ref(false)

const confirmDeleteAvatar = () => {
  isDeleteModalOpen.value = true
}

const handleDeleteAvatar = async () => {
  try {
    isDeletingAvatar.value = true
    await api.deleteAvatar()
    profile.value.avatar_url = ''

    authStore.avatarUrl = null
    if (import.meta.client) localStorage.removeItem('tarteel_avatar_url')

    avatarPreview.value = null
    selectedAvatarFile.value = null

    showToast('Foto profil berhasil dihapus')
    isDeleteModalOpen.value = false
  } catch (error: any) {
    showToast(error.message || 'Gagal menghapus foto profil', true)
  } finally {
    isDeletingAvatar.value = false
  }
}

// Update Password
const handleUpdatePassword = async () => {
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    return showToast('Konfirmasi password tidak cocok', true)
  }
  if (passwordForm.value.new_password.length < 8) {
    return showToast('Password baru minimal 8 karakter', true)
  }

  try {
    isSavingPassword.value = true
    await api.updatePassword(passwordForm.value.old_password, passwordForm.value.new_password)
    showToast('Password berhasil diperbarui')
    passwordForm.value = { old_password: '', new_password: '', confirm_password: '' }
  } catch (error: any) {
    showToast(error.message || 'Gagal memperbarui password', true)
  } finally {
    isSavingPassword.value = false
  }
}

// Get initials
const getInitials = (name: string) => {
  if (!name) return 'A'
  return name.charAt(0).toUpperCase()
}
</script>

<template>
  <div class="h-full space-y-8 relative pb-20 max-w-4xl mx-auto font-sans">
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

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
      <div>
        <h2 class="font-display font-semibold text-3xl sm:text-4xl text-ink-0 tracking-tight">Pengaturan Profil Admin</h2>
        <p class="font-sans text-sm sm:text-base text-ink-1 mt-1 leading-relaxed">Sesuaikan informasi administrator, avatar, dan kata sandi akun.</p>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div class="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- Kiri: Info Dasar & Foto -->
      <div class="lg:col-span-2 space-y-8">

        <!-- Foto Profil Card -->
        <div class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 class="font-display font-semibold text-xl sm:text-2xl text-ink-0 mb-6 tracking-tight">Foto Profil</h3>

          <div class="flex flex-col sm:flex-row items-center gap-6">
            <!-- Avatar Circle -->
            <div
              class="relative shrink-0 w-28 h-28 rounded-full border-2 border-white/10 overflow-hidden bg-dark-950 flex items-center justify-center shadow-xl">
              <img v-if="avatarPreview || profile.avatar_url" :src="avatarPreview || profile.avatar_url"
                class="w-full h-full object-cover" alt="Avatar" />
              <span v-else class="font-mono font-bold text-4xl text-ink-1">{{ authStore.initials ||
                getInitials(profile.name) }}</span>
            </div>

            <!-- Upload Controls -->
            <div class="flex-1 space-y-3.5 text-center sm:text-left">
              <p class="font-sans text-xs sm:text-sm text-ink-2 leading-relaxed">
                Unggah foto profil baru (rasio persegi 1:1, ukuran maks. 2MB bertipe JPG, PNG, atau WEBP).
              </p>

              <div class="flex flex-wrap gap-2.5 justify-center sm:justify-start">
                <label
                  class="px-5 py-2.5 bg-dark-950 hover:bg-dark-850 text-ink-1 hover:text-ink-0 border border-white/10 hover:border-white/20 rounded-full font-mono text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer inline-flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Pilih File</span>
                  <input type="file" class="hidden" accept=".jpg,.jpeg,.png,.webp" @change="handleAvatarChange" />
                </label>

                <button v-if="selectedAvatarFile" @click="handleUploadAvatar" :disabled="isUploadingAvatar"
                  class="px-5 py-2.5 bg-primary-500 hover:bg-primary-400 text-dark-950 disabled:opacity-50 rounded-full font-semibold text-xs sm:text-sm transition-all shadow-md shadow-primary-500/25 inline-flex items-center gap-2 cursor-pointer">
                  <span v-if="isUploadingAvatar"
                    class="w-3.5 h-3.5 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin"></span>
                  <span>Simpan Foto</span>
                </button>

                <button v-if="profile.avatar_url && !selectedAvatarFile" @click="confirmDeleteAvatar"
                  class="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-full font-mono text-xs uppercase tracking-wider font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Informasi Dasar Card -->
        <div class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 class="font-display font-semibold text-xl sm:text-2xl text-ink-0 mb-6 tracking-tight">Informasi Dasar</h3>

          <form @submit.prevent="handleUpdateProfile" class="space-y-4">
            <div class="space-y-1.5">
              <label class="block font-mono text-xs uppercase tracking-wider text-ink-2 font-semibold">Nama Lengkap</label>
              <input v-model="profile.name" type="text" required
                class="w-full bg-dark-950 border border-white/10 hover:border-white/20 text-ink-0 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-ink-3 font-sans" />
            </div>

            <div class="space-y-1.5">
              <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Alamat Email</label>
              <div class="relative">
                <input v-model="profile.email" type="email" required :disabled="profile.auth_provider !== 'local'"
                  class="w-full bg-dark-950 border border-white/10 text-ink-0 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500 transition-all placeholder:text-ink-3 font-sans disabled:opacity-50 disabled:cursor-not-allowed" />
                <div v-if="profile.auth_provider !== 'local'" class="absolute right-3.5 top-3 text-ink-3"
                  title="Email terhubung dengan SSO">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <p v-if="profile.auth_provider !== 'local'" class="font-sans text-xs text-ink-3">
                Email Anda terhubung dengan akun SSO ({{ profile.auth_provider }}).
              </p>
            </div>

            <div class="space-y-1.5">
              <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Bio Singkat</label>
              <textarea v-model="profile.bio" rows="3" placeholder="Tuliskan sedikit tentang diri Anda..."
                class="w-full bg-dark-950 border border-white/10 hover:border-white/20 text-ink-0 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-ink-3 font-sans resize-none"></textarea>
            </div>

            <div class="pt-2">
              <button type="submit" :disabled="isSavingProfile"
                class="w-full sm:w-auto px-6 py-2.5 bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-dark-950 font-medium text-sm rounded-full transition-all shadow-md shadow-primary-500/25 inline-flex items-center justify-center gap-2 cursor-pointer">
                <span v-if="isSavingProfile"
                  class="w-3.5 h-3.5 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin"></span>
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      <!-- Kanan: Keamanan / Side -->
      <div class="space-y-8">

        <div class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl h-full flex flex-col">
          <h3 class="font-display font-semibold text-lg text-ink-0 mb-1 tracking-tight">Keamanan Sandi</h3>
          <p class="font-sans text-xs text-ink-2 mb-6">Kelola kata sandi akun lokal Anda secara berkala.</p>

          <div v-if="profile.auth_provider !== 'local'"
            class="bg-dark-950/50 border border-white/10 rounded-2xl p-5 text-center my-auto">
            <div class="w-10 h-10 bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-ink-2" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p class="font-medium text-xs text-ink-0 mb-1">Masuk dengan {{ profile.auth_provider }}</p>
            <p class="font-sans text-xs text-ink-3 leading-relaxed">
              Autentikasi akun ini dikelola langsung oleh penyedia pihak ketiga.
            </p>
          </div>

          <form v-else @submit.prevent="handleUpdatePassword" class="space-y-4">
            <div class="space-y-1.5">
              <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Password Lama</label>
              <input v-model="passwordForm.old_password" type="password" required placeholder="••••••••"
                class="w-full bg-dark-950 border border-white/10 hover:border-white/20 text-ink-0 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all font-sans" />
            </div>

            <div class="space-y-1.5">
              <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Password Baru</label>
              <input v-model="passwordForm.new_password" type="password" required placeholder="Min. 8 karakter"
                class="w-full bg-dark-950 border border-white/10 hover:border-white/20 text-ink-0 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all font-sans" />
            </div>

            <div class="space-y-1.5">
              <label class="block font-mono text-xs uppercase tracking-wider text-ink-2">Konfirmasi Password</label>
              <input v-model="passwordForm.confirm_password" type="password" required placeholder="Ulangi password baru"
                class="w-full bg-dark-950 border border-white/10 hover:border-white/20 text-ink-0 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all font-sans" />
            </div>

            <div class="pt-2">
              <button type="submit" :disabled="isSavingPassword"
                class="w-full py-2.5 bg-dark-950 hover:bg-dark-850 text-ink-0 border border-white/10 hover:border-white/20 disabled:opacity-50 rounded-full font-mono text-xs uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 cursor-pointer">
                <span v-if="isSavingPassword"
                  class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Ubah Password</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>

    <!-- Modal Hapus Foto -->
    <Teleport to="body">
      <div v-if="isDeleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-md" @click="isDeleteModalOpen = false"></div>
        <div
          class="relative w-full max-w-sm bg-dark-900/95 border border-white/10 rounded-3xl p-6 shadow-2xl text-center space-y-4 font-sans">
          <div
            class="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h4 class="font-display font-semibold text-lg text-ink-0">Hapus Foto Profil?</h4>
            <p class="font-sans text-xs text-ink-2 mt-1">Foto profil Anda akan dihapus dan kembali ke inisial nama.</p>
          </div>
          <div class="flex gap-2.5 justify-center pt-2">
            <button @click="isDeleteModalOpen = false"
              class="px-4 py-2 bg-dark-950 hover:bg-dark-850 text-ink-1 border border-white/10 rounded-full font-mono text-xs uppercase tracking-wider cursor-pointer">
              Batal
            </button>
            <button @click="handleDeleteAvatar" :disabled="isDeletingAvatar"
              class="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-full font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer">
              {{ isDeletingAvatar ? 'Menghapus...' : 'Ya, Hapus' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
