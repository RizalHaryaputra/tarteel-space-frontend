<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const api = useApi()
const authStore = useAuthStore()

// State
const searchQuery = ref('')
const isDeleting = ref<string | null>(null)
const actionLoading = ref<string | null>(null)
const successToast = ref('')
const errorToast = ref('')

// Fetch Users List
const { data: users, pending: isLoading, refresh } = useAsyncData(
  'adminUsersList',
  () => api.getAdminUsers(200, 0),
  { server: false }
)

// Computed Filtered Users
const filteredUsers = computed(() => {
  if (!users.value) return []
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return users.value
  return users.value.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredUsers.value.slice(start, end)
})

watch(searchQuery, () => {
  currentPage.value = 1
})

// Trigger Toast
const showToast = (message: string, isError = false) => {
  if (isError) {
    errorToast.value = message
    setTimeout(() => { errorToast.value = '' }, 4000)
  } else {
    successToast.value = message
    setTimeout(() => { successToast.value = '' }, 4000)
  }
}

// Change Role Action
const handleRoleChange = async (userId: string, newRole: string) => {
  actionLoading.value = userId
  try {
    await api.updateUserRole(userId, newRole)
    showToast(`Role pengguna berhasil diubah menjadi ${newRole}`)

    // Update local state
    if (users.value) {
      const idx = users.value.findIndex(u => u.id === userId)
      if (idx !== -1 && users.value[idx]) {
        users.value[idx].role = newRole
      }
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal mengubah role pengguna', true)
  } finally {
    actionLoading.value = null
  }
}

// Delete User Action
const confirmDelete = (userId: string) => {
  isDeleting.value = userId
}

const handleDeleteUser = async () => {
  if (!isDeleting.value) return
  const userId = isDeleting.value
  isDeleting.value = null
  actionLoading.value = userId

  try {
    await api.deleteUser(userId)
    showToast('Pengguna berhasil dihapus secara permanen beserta riwayatnya')
    refresh()
  } catch (err: any) {
    showToast(err.message || 'Gagal menghapus pengguna', true)
  } finally {
    actionLoading.value = null
  }
}

const formatDate = (isoStr: string) => {
  return new Date(isoStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}
</script>

<template>
  <div class="h-full space-y-8 font-sans pb-10">
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

    <!-- Sub-navigation & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
      <div>
        <h2 class="font-display font-semibold text-3xl sm:text-4xl text-ink-0 tracking-tight">Manajemen Pengguna</h2>
        <p class="font-sans text-sm sm:text-base text-ink-1 mt-1 leading-relaxed">Kelola hak akses akun, status otentikasi, dan riwayat aktivitas pengguna terdaftar.</p>
      </div>
    </div>

    <!-- Filtering & Header Title inside page -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h3 class="font-display font-semibold text-xl sm:text-2xl text-ink-0 flex items-center gap-2.5 tracking-tight">
        <span>Daftar Pengguna</span>
        <span
          class="px-3 py-0.5 rounded-full bg-dark-900 border border-white/10 text-ink-2 font-mono text-xs font-semibold">{{
            filteredUsers.length }}</span>
      </h3>

      <!-- Search Input -->
      <div class="relative group max-w-sm w-full">
        <div
          class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-ink-3 group-focus-within:text-primary-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input v-model="searchQuery" type="text" placeholder="Cari nama atau email..."
          class="w-full bg-dark-900/80 border border-white/10 hover:border-white/20 text-ink-0 rounded-full pl-11 pr-5 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-ink-3 text-sm font-sans" />
      </div>
    </div>

    <!-- Table Container -->
    <div class="bg-dark-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4"></div>
        <p class="font-sans text-sm text-ink-2">Mengambil data pengguna...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredUsers.length === 0"
        class="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h3 class="font-display font-semibold text-lg text-ink-0 mb-1">Pengguna Tidak Ditemukan</h3>
        <p class="font-sans text-sm text-ink-2 max-w-sm">Tidak ada nama atau email pengguna yang cocok dengan kata kunci pencarian Anda.</p>
      </div>

      <!-- User List Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse font-sans text-sm">
          <thead>
            <tr class="border-b border-white/10 bg-dark-950/40 font-mono text-xs uppercase tracking-wider text-ink-2">
              <th class="py-4 px-6 font-semibold">Nama & Email</th>
              <th class="py-4 px-6 font-semibold">Role / Hak Akses</th>
              <th class="py-4 px-6 font-semibold">Tanggal Daftar</th>
              <th class="py-4 px-6 font-semibold text-center">Latihan Selesai</th>
              <th class="py-4 px-6 font-semibold text-center">Rata-rata Akurasi</th>
              <th class="py-4 px-6 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-ink-0">
            <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-dark-850/40 transition-colors group">
              <!-- Name & Email -->
              <td class="p-6">
                <div class="flex items-center gap-3.5">
                  <div v-if="user.avatar_url" class="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                    <img :src="user.avatar_url" class="w-full h-full object-cover" alt="Avatar">
                  </div>
                  <div v-else
                    class="w-10 h-10 rounded-full bg-dark-850 border border-white/10 flex items-center justify-center text-ink-1 font-mono font-semibold text-sm">
                    {{user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}}
                  </div>
                  <div>
                    <div
                      class="font-semibold text-base text-ink-0 group-hover:text-primary-400 transition-colors flex items-center gap-2">
                      <span>{{ user.name }}</span>
                      <span v-if="user.id === authStore.userId"
                        class="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 font-mono text-[10px] font-bold border border-primary-500/20">Anda</span>
                    </div>
                    <div class="font-mono text-xs sm:text-sm text-ink-2 mt-0.5">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <!-- Role Select -->
              <td class="p-6">
                <div class="relative w-fit">
                  <select :value="user.role" :disabled="user.id === authStore.userId || actionLoading === user.id"
                    @change="handleRoleChange(user.id, ($event.target as HTMLSelectElement).value)"
                    class="bg-dark-950 border border-white/10 text-xs sm:text-sm text-ink-1 rounded-full px-3.5 py-1.5 focus:outline-none focus:border-primary-500 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed font-mono uppercase tracking-wider font-semibold"
                    :class="user.role === 'admin' ? 'text-primary-400 bg-primary-500/10 border-primary-500/30' : ''">
                    <option value="user" class="bg-dark-950 text-white">User</option>
                    <option value="admin" class="bg-dark-950 text-white">Admin</option>
                  </select>

                  <div v-if="actionLoading === user.id" class="absolute -right-6 top-1/2 -translate-y-1/2">
                    <div
                      class="w-3.5 h-3.5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin">
                    </div>
                  </div>
                </div>
              </td>
              <!-- Date -->
              <td class="p-5 font-mono text-xs text-ink-2">
                {{ formatDate(user.created_at) }}
              </td>
              <!-- Total Practice -->
              <td class="p-5 text-center font-mono text-sm font-semibold text-ink-0">
                {{ user.total_evaluations }}
              </td>
              <!-- Avg Accuracy -->
              <td class="p-5 text-center">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-xs font-semibold"
                  :class="user.average_accuracy >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : user.average_accuracy >= 60 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : user.average_accuracy > 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-dark-950 text-ink-3 border border-white/5'">
                  {{ user.average_accuracy > 0 ? `${user.average_accuracy.toFixed(1)}%` : 'Belum Ada' }}
                </div>
              </td>
              <!-- Actions -->
              <td class="p-5 text-right">
                <button v-if="user.id !== authStore.userId" :disabled="actionLoading === user.id"
                  @click="confirmDelete(user.id)"
                  class="p-2 text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-all duration-200 disabled:opacity-50 cursor-pointer"
                  title="Hapus Pengguna">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <span v-else class="font-mono text-[10px] text-ink-3 uppercase italic px-2">Aktif</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-6 py-4 border-t border-white/5">
        <AppPagination v-if="filteredUsers.length > 0" :totalItems="filteredUsers.length" :itemsPerPage="itemsPerPage"
          v-model="currentPage" />
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <Teleport to="body">
      <div v-if="isDeleting" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-md transition-opacity" @click="isDeleting = null">
        </div>
        <div
          class="relative bg-dark-900/95 border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl overflow-hidden font-sans">
          <div class="flex items-center gap-3.5 text-rose-400 mb-4">
            <div
              class="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h4 class="font-display font-semibold text-lg text-ink-0">Hapus Pengguna Permanen?</h4>
          </div>

          <p class="font-sans text-xs text-ink-2 leading-relaxed mb-6">
            Tindakan ini tidak dapat dibatalkan. Semua riwayat latihan pelafalan, evaluasi, dan laporan umpan balik dari pengguna ini akan dihapus secara permanen.
          </p>

          <div class="flex gap-2.5 justify-end">
            <button @click="isDeleting = null"
              class="px-5 py-2 bg-dark-950 hover:bg-dark-850 text-ink-1 border border-white/10 rounded-full font-mono text-xs uppercase tracking-wider cursor-pointer">
              Batal
            </button>
            <button @click="handleDeleteUser"
              class="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-full font-mono text-xs uppercase tracking-wider transition-colors shadow-md shadow-rose-500/25 cursor-pointer">
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
