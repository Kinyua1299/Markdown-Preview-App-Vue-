<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="p-6">
    <h1 class="text-2xl font-bold">Markdown Preview App</h1>

    <p class="mt-2">
      Open the editor to start writing
      <RouterLink
        to="/app"
        class="text-blue-600 underline ml-1"
      >
        Open editor
      </RouterLink>
    </p>
  </main>
</template>
