<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ErrorBoundary',

  data() {
    return {
      hasError: false as boolean,
      error: null as unknown,
    }
  },

  errorCaptured(err, instance, info) {
    console.error('ErrorBoundary caught:', err, info)
    this.hasError = true
    this.error = err

    // prevent the error from propagating further
    return false
  },
})
</script>

<template>
  <main v-if="hasError" class="p-6">
    <h1 class="text-2xl font-bold">Something went wrong</h1>

    <pre class="mt-4 p-4 bg-red-50 text-red-700 overflow-auto">
{{ String(error) }}
    </pre>

    <button
      class="mt-4 px-3 py-1 bg-gray-800 text-white rounded"
      @click="() => window.location.assign('/')"
    >
      Go home
    </button>
  </main>

  <slot v-else />
</template>
