<template>
  <div class="desc-list" :style="listStyle">
    <div v-for="item in items" :key="item.key" class="desc-item flex py-2 border-b border-gray-100 last:border-0">
      <span class="text-sm text-gray-500 min-w-80px">{{ item.label }}</span><span class="text-sm font-medium flex-1">{{ item.value || '-' }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ pageItem?: Record<string, unknown>; items?: { key: string; label: string; value?: string }[] }>()
const cfg = computed(() => (props.pageItem?.desc_list_json || {}) as Record<string, unknown>)
const listStyle = computed(() => (cfg.value?.style_json || {}) as Record<string, string>)
</script>
