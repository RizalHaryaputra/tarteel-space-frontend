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

/* ── Modern Custom Scrollbar (Theme Aligned) ── */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.16) #0b0d11;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #0b0d11;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.16);
  border-radius: 9999px;
  border: 2px solid #0b0d11;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(37, 99, 235, 0.7);
}

::-webkit-scrollbar-thumb:active {
  background: #2563eb;
}

::-webkit-scrollbar-corner {
  background: #0b0d11;
}
</style>
