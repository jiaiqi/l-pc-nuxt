<template>
  <div class="current-info p-4 rounded-lg border border-gray-200" :style="infoStyle">
    <div v-if="title" class="text-lg font-semibold mb-2">{{ title }}</div>
    <div class="space-y-2">
      <div v-for="item in infoItems" :key="item.key" class="flex items-center gap-2 text-sm">
        <span class="text-gray-500 min-w-60px">{{ item.label }}</span>
        <span class="font-medium">{{ item.value || '-' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  pageItem?: Record<string, unknown>
}>()

const config = computed(() => (props.pageItem?.current_info_json || {}) as Record<string, unknown>)
const title = computed(() => config.value?.title as string)
const infoStyle = computed(() => (config.value?.style_json || {}) as Record<string, string>)

const infoItems = computed(() => {
  const fields = (config.value?.fields as any[]) || []
  return fields.map((f: any) => ({
    key: f.key || f.field,
    label: f.label || f.key || f.field,
    value: f.value || f.default_val || '',
  }))
})
</script>
