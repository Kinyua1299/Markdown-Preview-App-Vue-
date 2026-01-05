<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { Codemirror } from "vue-codemirror";
import { markdown } from '@codemirror/lang-markdown'
import { markdown as markdownLang } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { Sun, Moon } from 'lucide-vue-next'

/* ------------------ constants ------------------ */
const DEFAULT_MARKDOWN = `# Welcome to Markdown Preview

Type your markdown on the left — the preview updates live on the right.

## Features
- Live preview
- Save / Load .md files
- Auto-save (localStorage)
- Auto-scroll syncing (toggle)
- Dark/Light Theme Toggle 🌙🌞
`

/* ------------------ state ------------------ */
const markdownText = ref<string>(
  localStorage.getItem('md_content') || DEFAULT_MARKDOWN
)

const isDark = ref<boolean>(
  localStorage.getItem('md_theme')
    ? localStorage.getItem('md_theme') === 'dark'
    : true
)

const isPreviewing = ref(true)
const autoScroll = ref<boolean>(localStorage.getItem('md_auto_scroll') === 'true')
const loadingFile = ref(false)
const isSmallScreen = ref<boolean>(window.innerWidth < 768)

/* ------------------ refs ------------------ */
const editorContainerRef = ref<HTMLElement | null>(null)
const previewRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const scrollState = { rafId: null as number | null, lastRatio: 0 }
let detachScroller: (() => void) | null = null

/* ------------------ CodeMirror extensions ------------------ */
const extensions = [
  markdown(),
  oneDark
];

const cmExtensions = computed(() => [markdownLang()])

/* ------------------ helpers ------------------ */
function saveToFile(content: string, filename = 'document.md') {
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function readFileAsText(file: File) {
  return await file.text()
}

function findCodeMirrorScroller(root: HTMLElement | null): HTMLElement | null {
  if (!root) return null
  return (
    root.querySelector('.cm-scroller') ||
    root.querySelector('.cm-editor') ||
    root.querySelector('.cm-content') ||
    root.querySelector('.CodeMirror-scroll')
  ) as HTMLElement | null
}

/* ------------------ responsive ------------------ */
const mediaQuery = window.matchMedia('(max-width: 767.98px)')
const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
  isSmallScreen.value = e.matches
}

onMounted(() => {
  handleResize(mediaQuery)
  mediaQuery.addEventListener('change', handleResize)
})

onBeforeUnmount(() => mediaQuery.removeEventListener('change', handleResize))

/* ------------------ autosave ------------------ */
watch(markdownText, (val) => localStorage.setItem('md_content', val))
watch(autoScroll, (val) =>
  localStorage.setItem('md_auto_scroll', val ? 'true' : 'false')
)
watch(isDark, (val) =>
  localStorage.setItem('md_theme', val ? 'dark' : 'light')
)

/* ------------------ file load ------------------ */
async function handleFileLoad(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  loadingFile.value = true
  try {
    markdownText.value = await readFileAsText(file)
    scrollState.lastRatio = 0
    await nextTick()
    if (previewRef.value) previewRef.value.scrollTop = 0
    const sc = findCodeMirrorScroller(editorContainerRef.value)
    if (sc) sc.scrollTop = 0
  } catch (err) {
    alert('Failed to read file: ' + String(err))
  } finally {
    loadingFile.value = false
    ;(e.target as HTMLInputElement).value = ''
  }
}

/* ------------------ scroll sync ------------------ */
watch(autoScroll, async (enabled) => {
  if (detachScroller) {
    detachScroller()
    detachScroller = null
  }
  if (!enabled && scrollState.rafId) cancelAnimationFrame(scrollState.rafId)
  if (!enabled) return

  await nextTick()
  const sc = findCodeMirrorScroller(editorContainerRef.value)
  const pr = previewRef.value
  if (!sc || !pr) return

  const syncScroll = () => {
    if (scrollState.rafId) cancelAnimationFrame(scrollState.rafId)
    scrollState.rafId = requestAnimationFrame(() => {
      const ratio =
        sc.scrollHeight - sc.clientHeight > 0
          ? sc.scrollTop / (sc.scrollHeight - sc.clientHeight)
          : 0
      scrollState.lastRatio = ratio
      pr.scrollTop = (pr.scrollHeight - pr.clientHeight) * ratio
    })
  }

  sc.addEventListener('scroll', syncScroll, { passive: true })
  detachScroller = () => sc.removeEventListener('scroll', syncScroll)
  syncScroll()
})

watch([markdownText, autoScroll], async () => {
  if (!autoScroll.value || !previewRef.value) return
  await nextTick()
  previewRef.value.scrollTop =
    (previewRef.value.scrollHeight - previewRef.value.clientHeight) * scrollState.lastRatio
})

/* ------------------ computed ------------------ */
const renderedHTML = computed(() =>
  DOMPurify.sanitize(marked.parse(markdownText.value, { mangle: false, headerIds: false }))
)
const previewVisible = computed(() => isSmallScreen.value || isPreviewing.value)

/* ------------------ keyboard shortcuts ------------------ */
const keyHandler = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault()
    saveToFile(markdownText.value)
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
    e.preventDefault()
    markdownText.value += ' **bold text**'
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
    e.preventDefault()
    markdownText.value += ' *italic text*'
  }
}

onMounted(() => window.addEventListener('keydown', keyHandler))
onBeforeUnmount(() => window.removeEventListener('keydown', keyHandler))

/* ------------------ overflow fix ------------------ */
onMounted(() => {
  const prev = document.documentElement.style.overflowX
  document.documentElement.style.overflowX = 'hidden'
  onBeforeUnmount(() => (document.documentElement.style.overflowX = prev))
})
</script>

<template>
  <main
    class="min-h-screen flex flex-col"
    :class="isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'"
  >
    <div class="mx-auto w-full max-w-7xl flex-grow flex flex-col overflow-hidden">
      <nav class="flex flex-col sm:flex-row justify-between gap-2 p-4 border-b">
        <h1 class="text-xl font-semibold">Markdown Preview App</h1>

        <div class="flex flex-wrap gap-2 items-center">
          <input
            ref="fileInputRef"
            type="file"
            accept=".md,.markdown,text/plain"
            class="hidden"
            @change="handleFileLoad"
          />

<button class="btn" @click="fileInputRef?.click()">Load .md</button>
<button class="btn" @click="saveToFile(markdownText, 'markdown.md')">Save .md</button>
<button class="btn" @click="markdownText = DEFAULT_MARKDOWN">Reset</button>

<button
  class="btn"
  :disabled="isSmallScreen"
  @click="!isSmallScreen && (isPreviewing = !isPreviewing)"
>
  Toggle Preview
</button>

<button
  class="btn"
  :class="autoScroll ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'"
  @click="autoScroll = !autoScroll"
>
  {{ autoScroll ? 'Auto Scroll: ON' : 'Auto Scroll: OFF' }}
</button>
          <button
            class="btn"
            :class="autoScroll ? 'bg-blue-600 text-white' : ''"
            @click="autoScroll = !autoScroll"
          >
            Auto Scroll
          </button>

          <button class="p-2 rounded-full" @click="isDark = !isDark">
            <Sun v-if="isDark" :size="18" />
            <Moon v-else :size="18" />
          </button>
        </div>
      </nav>

      <div class="flex flex-col md:flex-row flex-1 overflow-hidden p-4 gap-4">
        <div class="md:w-1/2 h-[50vh] md:h-full flex flex-col border rounded overflow-hidden">
          <div ref="editorContainerRef" class="flex-1 min-h-0">
            <Codemirror
              v-model="markdownText"
              height="100%"
              :autofocus="true"
              :ident-with-tab="true"
              :extensions="cmExtensions"
              :theme="isDark ? oneDark : 'light'"
              class="flex-1"
            />
          </div>
        </div>

        <div
          v-if="previewVisible"
          ref="previewRef"
          class="md:w-1/2 h-[50vh] md:h-full overflow-auto rounded border p-4 prose max-w-none"
          :class="isDark ? 'prose-invert bg-gray-900' : 'bg-white'"
          v-html="renderedHTML"
        />
      </div>
    </div>
  </main>
</template>
<style scoped>
.btn {
  @apply px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium;
  @apply bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

button.p-2 {
  @apply hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors;
}
</style>
