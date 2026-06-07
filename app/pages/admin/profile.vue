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
    
    // Update store state
    authStore.avatarUrl = res.avatar_url
    if (import.meta.client) localStorage.setItem('tarteel_avatar_url', res.avatar_url)

    showToast('Foto profil berhasil diunggah')
    selectedAvatarFile.value = null
    avatarPreview.value = null
  } catch (error: any) {
    showToast(error.message || 'Gagal mengunggah foto', true)
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
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
}
</script>

<template>
  <div class="h-full space-y-8 relative pb-20 max-w-4xl mx-auto">
    <!-- Toast Notifications -->
    <div class="fixed bottom-8 right-8 z-50 space-y-3 pointer-events-none">
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
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-dark-800 pb-5">
      <div>
        <h2 class="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <span>Kelola Profil</span>
        </h2>
        <p class="text-slate-400 mt-2 text-sm">Sesuaikan informasi dasar, foto profil, dan pengaturan keamanan akun Anda.</p>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Kiri: Info Dasar & Foto -->
      <div class="lg:col-span-2 space-y-8">
        
        <!-- Foto Profil Card -->
        <div class="bg-dark-900 border border-dark-800 rounded-3xl p-6 shadow-lg">
          <h3 class="text-xl font-bold text-white mb-6">Foto Profil</h3>
          
          <div class="flex flex-col sm:flex-row items-center gap-6">
            <!-- Avatar Circle -->
            <div class="relative shrink-0 w-32 h-32 rounded-full border-4 border-dark-700 overflow-hidden bg-gradient-to-br from-dark-800 to-dark-750 flex items-center justify-center shadow-xl shadow-dark-800/20">
              <img v-if="avatarPreview || profile.avatar_url" 
                   :src="avatarPreview || profile.avatar_url" 
                   class="w-full h-full object-cover" 
                   alt="Avatar" />
              <span v-else class="text-5xl font-extrabold text-slate-300">{{ authStore.initials || getInitials(profile.name) }}</span>
            </div>

            <!-- Upload Controls -->
            <div class="flex-1 space-y-4 text-center sm:text-left">
              <p class="text-sm text-slate-400 leading-relaxed">
                Unggah foto profil baru. Kami menyarankan rasio persegi 1:1, ukuran maksimal 2MB (JPG, PNG, atau WEBP).
              </p>
              
              <div class="flex flex-wrap gap-3 justify-center sm:justify-start">
                <label class="px-5 py-2.5 bg-dark-950/50 hover:bg-dark-900 text-slate-300 hover:text-white border border-dark-800 rounded-xl text-sm font-bold transition-all cursor-pointer inline-flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Pilih File Foto</span>
                  <input type="file" class="hidden" accept=".jpg,.jpeg,.png,.webp" @change="handleAvatarChange" />
                </label>

                <button 
                  v-if="selectedAvatarFile"
                  @click="handleUploadAvatar" 
                  :disabled="isUploadingAvatar"
                  class="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary-500/20 inline-flex items-center gap-2"
                >
                  <span v-if="isUploadingAvatar" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  <span>Simpan Foto Baru</span>
                </button>

                <button 
                  v-if="profile.avatar_url && !selectedAvatarFile"
                  @click="confirmDeleteAvatar" 
                  class="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-red-500/20 inline-flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Informasi Dasar Card -->
        <div class="bg-dark-900 border border-dark-800 rounded-3xl p-6 shadow-lg">
          <h3 class="text-xl font-bold text-white mb-6">Informasi Dasar</h3>
          
          <form @submit.prevent="handleUpdateProfile" class="space-y-5">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-300">Nama Lengkap</label>
              <input v-model="profile.name" type="text" required
                class="w-full bg-dark-950 border border-dark-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-600" />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-300">Alamat Email</label>
              <div class="relative">
                <input v-model="profile.email" type="email" required
                  :disabled="profile.auth_provider !== 'local'"
                  class="w-full bg-dark-950 border border-dark-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed" />
                <div v-if="profile.auth_provider !== 'local'" class="absolute right-3 top-3 text-slate-500" title="Email terhubung dengan SSO">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <p v-if="profile.auth_provider !== 'local'" class="text-xs text-slate-500">
                Email Anda terhubung dengan akun pihak ketiga ({{ profile.auth_provider }}) dan tidak dapat diubah di sini.
              </p>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-300">Bio (Opsional)</label>
              <textarea v-model="profile.bio" rows="3" placeholder="Tuliskan sedikit tentang diri Anda..."
                class="w-full bg-dark-950 border border-dark-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-600 resize-none"></textarea>
            </div>

            <div class="pt-2">
              <button type="submit" :disabled="isSavingProfile"
                class="w-full sm:w-auto px-8 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-primary-500/20 inline-flex items-center justify-center gap-2">
                <span v-if="isSavingProfile" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      <!-- Kanan: Keamanan / Side -->
      <div class="space-y-8">
        
        <div class="bg-dark-900 border border-dark-800 rounded-3xl p-6 shadow-lg h-full flex flex-col">
          <h3 class="text-xl font-bold text-white mb-2">Keamanan Akun</h3>
          <p class="text-sm text-slate-400 mb-6">Kelola kata sandi akun lokal Anda secara berkala untuk menjaga keamanan.</p>
          
          <div v-if="profile.auth_provider !== 'local'" class="bg-dark-950/50 border border-dark-800 rounded-xl p-5 text-center my-auto">
            <div class="w-12 h-12 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p class="text-sm text-slate-300 font-medium mb-1">Metode Login Pihak Ketiga</p>
            <p class="text-xs text-slate-500 leading-relaxed">
              Anda menggunakan akun <strong>{{ profile.auth_provider }}</strong> untuk masuk. Pengaturan kata sandi dikelola oleh penyedia layanan Anda.
            </p>
          </div>

          <form v-else @submit.prevent="handleUpdatePassword" class="space-y-5 flex-1">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-300">Password Lama</label>
              <input v-model="passwordForm.old_password" type="password" required placeholder="••••••••"
                class="w-full bg-dark-950 border border-dark-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-600" />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-300">Password Baru</label>
              <input v-model="passwordForm.new_password" type="password" required placeholder="••••••••"
                class="w-full bg-dark-950 border border-dark-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-600" />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-300">Konfirmasi Password Baru</label>
              <input v-model="passwordForm.confirm_password" type="password" required placeholder="••••••••"
                class="w-full bg-dark-950 border border-dark-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-600" />
            </div>

            <div class="pt-4">
              <button type="submit" :disabled="isSavingPassword"
                class="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-primary-500/20 inline-flex items-center justify-center gap-2">
                <span v-if="isSavingPassword" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                <span>Ubah Password</span>
              </button>
            </div>
          </form>

        </div>
      </div>
      
    </div>

    <!-- Confirm Delete Avatar Modal -->
    <Teleport to="body">
      <div v-if="isDeleteModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-sm transition-opacity"
          @click="isDeleteModalOpen = false"></div>
        <div
          class="relative bg-dark-900 border border-dark-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-fade-in overflow-hidden">
          <div class="absolute -right-20 -top-20 w-48 h-48 bg-red-500/5 rounded-full blur-2xl"></div>

          <div class="flex items-center gap-4 text-red-400 mb-4">
            <div
              class="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h4 class="text-lg font-bold text-white">Hapus Foto Profil?</h4>
          </div>

          <p class="text-slate-400 text-sm leading-relaxed mb-6">
            Apakah Anda yakin ingin menghapus foto profil Anda? Tampilan foto Anda akan kembali ke inisial nama secara default.
          </p>

          <div class="flex gap-3 justify-end mt-2">
            <button @click="isDeleteModalOpen = false"
              class="px-6 py-2.5 bg-dark-950/50 hover:bg-dark-900 text-slate-300 hover:text-white border border-dark-800 rounded-xl text-sm font-bold transition-colors">
              Batal
            </button>
            <button @click="handleDeleteAvatar" :disabled="isDeletingAvatar"
              class="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2">
              <span v-if="isDeletingAvatar" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              Hapus
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
</style>
