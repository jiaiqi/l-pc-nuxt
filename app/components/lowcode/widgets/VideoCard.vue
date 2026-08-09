<template>
  <div class="video-card rounded-lg overflow-hidden" :style="cardStyle">
    <video v-if="src" :src="src" controls class="w-full" :poster="poster" :style="{ maxHeight: '400px' }" />
    <div v-if="title" class="p-3 text-sm font-medium">{{ title }}</div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ pageItem?: Record<string, unknown> }>()
const cfg = computed(() => (props.pageItem?.video_card_json || {}) as Record<string, unknown>)
const src = computed(() => cfg.value?.video_url as string || '')
const poster = computed(() => cfg.value?.poster_url as string || '')
const title = computed(() => cfg.value?.title as string || '')
const cardStyle = computed(() => (cfg.value?.style_json || {}) as Record<string, string>)
</script>
