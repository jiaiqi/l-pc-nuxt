<template>
  <div class="qr-code-widget flex flex-col items-center gap-2 p-4">
    <div class="bg-white p-2 rounded-lg shadow-sm"><div class="w-40 h-40 bg-gray-100 flex-center text-xs text-gray-400 rounded">QR: {{ text }}</div></div>
    <p v-if="text" class="text-xs text-gray-500 text-center max-w-200px">{{ text }}</p>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ pageItem?: Record<string, unknown> }>()
const cfg = computed(() => (props.pageItem?.qr_code_json || {}) as Record<string, unknown>)
const text = computed(() => cfg.value?.text as string || cfg.value?.qr_content as string || '')
</script>
