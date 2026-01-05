<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="p-6 text-center">
    <h1 class="text-3xl font-bold text-purple-600">
      Markdown Preview App
    </h1>

    <p class="mt-4 text-gray-600">
      Vue 3 + Vite + Tailwind
    </p>

    <RouterLink
      to="/app"
      class="inline-block mt-6 px-5 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
    >
      Open Editor
    </RouterLink>
  </main>
</template>

