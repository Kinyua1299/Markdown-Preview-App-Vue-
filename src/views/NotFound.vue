<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <main class="p-6">
    <h1 class="text-2xl font-bold">404 — Not Found</h1>

    <p class="mt-2">We couldn't find that page.</p>

    <button
      class="mt-4 px-3 py-1 bg-gray-800 text-white rounded"
      @click="goHome"
    >
      Go home
    </button>
  </main>
</template>
