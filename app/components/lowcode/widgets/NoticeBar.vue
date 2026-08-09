<template>
  <div
    v-if="text"
    class="notice-bar flex items-center gap-2 px-4 py-2 text-sm overflow-hidden"
    :style="barStyle"
  >
    <span class="i-ri-notification-3-line text-base" />
    <span class="truncate">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  pageItem?: Record<string, unknown>
}>()

const config = computed(() => (props.pageItem?.notice_bar_json || {}) as Record<string, unknown>)
const text = computed(() => config.value?.text as string || config.value?.init_val as string || '')
const barStyle = computed(() => ({
  backgroundColor: (config.value?.bg_color as string) || '#fef3c7',
  color: (config.value?.text_color as string) || '#92400e',
}))
</script>
