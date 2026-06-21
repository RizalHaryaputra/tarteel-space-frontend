<script setup>
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* Background gelap di root agar tidak ada white flash */
html,
body {
  background-color: #020617;
  margin: 0;
  padding: 0;
}

/* Custom Scrollbar Global (Webkit) */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #020617; /* Sesuai dengan warna background */
}

::-webkit-scrollbar-thumb {
  background: #1e293b; /* Warna thumb gelap (mirip Tailwind slate-800) */
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #334155; /* Saat di-hover (mirip Tailwind slate-700) */
}

/* Custom Scrollbar Global (Firefox) */
* {
  scrollbar-width: thin;
  scrollbar-color: #1e293b #020617;
}
</style>
