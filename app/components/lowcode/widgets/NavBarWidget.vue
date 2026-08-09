<template>
  <nav class="nav-bar flex items-center gap-1" :style="barStyle">
    <template v-for="(item, idx) in navItems" :key="idx">
      <a v-if="item.link" :href="item.link" class="nav-bar-item px-3 py-2 text-sm rounded-md transition-colors hover:bg-white/10">
        <span v-if="item.icon" :class="item.icon" class="mr-1" />{{ item.label }}
      </a>
      <span v-else class="nav-bar-item px-3 py-2 text-sm rounded-md">
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>
<script setup lang="ts">
const props = defineProps<{ pageItem?: Record<string, unknown> }>()
const comJson = computed(() => {
  try {
    const s = props.pageItem?.com_json as string
    return s ? JSON.parse(s) : {}
  } catch { return {} }
})
const navItems = computed(() => (comJson.value as any)?.nav_items || [])
const barStyle = computed(() => {
  const s = (props.pageItem?.nav_menu_json || {}) as Record<string, string>
  return { backgroundColor: s?.bg_color || 'transparent', color: s?.text_color || 'inherit', ...s }
})
</script>
