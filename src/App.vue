<script setup lang="ts">
import { RouterView } from 'vue-router'
import ErrorBoundary from './components/ErrorBoundary.vue'
/*
  App.vue acts as the root layout.
  Routing is injected via <RouterView />
*/
</script>

<template>
  <ErrorBoundary>
    <RouterView />
  </ErrorBoundary>
</template>

<style scoped>
/* optional */
</style>
