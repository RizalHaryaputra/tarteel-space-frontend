<script setup lang="ts">
import { useRoute } from 'vue-router'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const api = useApi()
const authStore = useAuthStore()

// State
const searchQuery = ref('')
const isDeleting = ref<string | null>(null) // holds userId being deleted
const actionLoading = ref<string | null>(null) // holds userId being updated
const successToast = ref('')
const errorToast = ref('')

// Fetch Users List
const { data: users, pending: isLoading, error, refresh } = useAsyncData(
  'adminUsersList',
  () => api.getAdminUsers(200, 0), // Fetch up to 200 users for local management
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

// Format Date Helper
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="h-full space-y-8 relative">
    
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

    <!-- Sub-navigation & Header -->
    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-dark-800 pb-5">
      <div>
        <h2 class="text-3xl font-extrabold text-white tracking-tight">Manajemen Pengguna</h2>
        <p class="text-slate-400 mt-1 text-sm">Kelola akses dan periksa riwayat serta statistik pengguna terdaftar.</p>
      </div>
    </div>

    <!-- Filtering & Header Title inside page -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h3 class="text-xl font-bold text-white flex items-center gap-2">
        <span>Daftar Pengguna</span>
        <span class="px-2.5 py-0.5 rounded-full bg-dark-800 border border-dark-700 text-slate-400 text-xs font-medium">{{ filteredUsers.length }}</span>
      </h3>
      
      <!-- Search Input -->
      <div class="relative group max-w-sm w-full">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input v-model="searchQuery" type="text" placeholder="Cari nama atau email..."
          class="w-full bg-dark-900/50 border border-dark-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-slate-600 text-sm" />
      </div>
    </div>

    <!-- Table Container -->
    <div class="bg-dark-900/40 backdrop-blur-xl border border-dark-800 rounded-3xl overflow-hidden shadow-2xl">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4"></div>
        <p class="text-slate-400 text-sm">Mengambil data pengguna...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredUsers.length === 0" class="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div class="w-16 h-16 rounded-full bg-dark-800/60 flex items-center justify-center mb-4 border border-dark-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white mb-1">Pengguna Tidak Ditemukan</h3>
        <p class="text-slate-500 text-sm max-w-sm">Tidak ada nama atau email pengguna yang cocok dengan kata kunci pencarian Anda.</p>
      </div>

      <!-- User List Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-dark-800 bg-dark-950/40">
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nama & Email</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role / Hak Akses</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal Terdaftar</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Total Latihan</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Rata-rata Akurasi</th>
              <th class="p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark-800/50">
            <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-dark-950/20 transition-colors group">
              <!-- Name & Email -->
              <td class="p-5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-dark-800 to-dark-750 flex items-center justify-center text-slate-300 font-bold border border-dark-700">
                    {{ user.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() }}
                  </div>
                  <div>
                    <div class="font-bold text-white group-hover:text-primary-400 transition-colors flex items-center gap-1.5">
                      <span>{{ user.name }}</span>
                      <span v-if="user.id === authStore.userId" class="px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-400 text-[10px] font-bold border border-primary-500/20">Anda</span>
                    </div>
                    <div class="text-xs text-slate-500 mt-0.5">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <!-- Role Select -->
              <td class="p-5">
                <div class="relative w-fit">
                  <select 
                    :value="user.role"
                    :disabled="user.id === authStore.userId || actionLoading === user.id"
                    @change="handleRoleChange(user.id, ($event.target as HTMLSelectElement).value)"
                    class="bg-dark-950 border border-dark-800 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed font-medium"
                    :class="user.role === 'admin' ? 'text-primary-400 bg-primary-950/20 border-primary-500/30' : ''"
                  >
                    <option value="user" class="bg-dark-950 text-white">User</option>
                    <option value="admin" class="bg-dark-950 text-white">Admin</option>
                  </select>
                  
                  <div v-if="actionLoading === user.id" class="absolute -right-6 top-1/2 -translate-y-1/2">
                    <div class="w-3.5 h-3.5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                  </div>
                </div>
              </td>
              <!-- Date -->
              <td class="p-5 text-sm text-slate-400">
                {{ formatDate(user.created_at) }}
              </td>
              <!-- Total Practice -->
              <td class="p-5 text-center text-sm font-semibold text-slate-200">
                {{ user.total_evaluations }}
              </td>
              <!-- Avg Accuracy -->
              <td class="p-5 text-center">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="user.average_accuracy >= 80 ? 'bg-green-500/10 text-green-400' : user.average_accuracy >= 60 ? 'bg-yellow-500/10 text-yellow-400' : user.average_accuracy > 0 ? 'bg-red-500/10 text-red-400' : 'bg-slate-800/40 text-slate-500'"
                >
                  {{ user.average_accuracy > 0 ? `${user.average_accuracy.toFixed(1)}%` : 'Belum Latihan' }}
                </div>
              </td>
              <!-- Actions -->
              <td class="p-5 text-right">
                <button
                  v-if="user.id !== authStore.userId"
                  :disabled="actionLoading === user.id"
                  @click="confirmDelete(user.id)"
                  class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 disabled:opacity-50"
                  title="Hapus Pengguna"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <span v-else class="text-xs text-slate-500 italic px-2">Akun Aktif</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-6 pb-6">
        <AppPagination 
          v-if="filteredUsers.length > 0"
          :totalItems="filteredUsers.length" 
          :itemsPerPage="itemsPerPage" 
          v-model="currentPage" 
        />
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <Teleport to="body">
      <div v-if="isDeleting" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-dark-950/80 backdrop-blur-sm transition-opacity" @click="isDeleting = null"></div>
        <div class="relative bg-dark-900 border border-dark-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-fade-in overflow-hidden">
          <div class="absolute -right-20 -top-20 w-48 h-48 bg-red-500/5 rounded-full blur-2xl"></div>
        
        <div class="flex items-center gap-4 text-red-400 mb-4">
          <div class="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h4 class="text-lg font-bold text-white">Hapus Pengguna Permanen?</h4>
        </div>
        
        <p class="text-slate-400 text-sm leading-relaxed mb-6">
          Tindakan ini <strong>tidak dapat dibatalkan</strong>. Semua riwayat latihan pelafalan, sesi belajar, dan feedback yang diajukan oleh pengguna ini akan dihapus secara permanen dari database.
        </p>
        
        <div class="flex gap-3 justify-end mt-2">
          <button @click="isDeleting = null" class="px-6 py-2.5 bg-dark-950/50 hover:bg-dark-900 text-slate-300 hover:text-white border border-dark-800 rounded-xl text-sm font-bold transition-colors">
            Batal
          </button>
          <button @click="handleDeleteUser" class="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-red-500/20">
            Ya, Hapus Permanen
          </button>
        </div>
      </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
