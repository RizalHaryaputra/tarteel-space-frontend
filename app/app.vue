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
  background-color: #0b0d11;
  margin: 0;
  padding: 0;
}

/* Smooth global page transitions (Clean fade without document flow disruption) */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.18s ease-in-out;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
