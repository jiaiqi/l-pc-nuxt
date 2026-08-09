<template>
  <div class="flex justify-between gap-4">
    <NuxtLink v-if="prev" :to="prev._path" class="docs-prevnext-link">
      <span class="text-xs text-gray-400">上一页</span>
      <span class="text-sm font-medium">{{ prev.title }}</span>
    </NuxtLink>
    <div v-else />
    <NuxtLink v-if="next" :to="next._path" class="docs-prevnext-link text-right">
      <span class="text-xs text-gray-400">下一页</span>
      <span class="text-sm font-medium">{{ next.title }}</span>
    </NuxtLink>
    <div v-else />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ links: any[]; current: any }>()

const flattened = computed(() => {
  const result: any[] = []
  function walk(nodes: any[]) {
    for (const n of nodes) {
      if (n._path) result.push(n)
      if (n.children) walk(n.children)
    }
  }
  walk(props.links)
  return result
})

const idx = computed(() => flattened.value.findIndex((n: any) => n._path === props.current._path))
const prev = computed(() => (idx.value > 0 ? flattened.value[idx.value - 1] : null))
const next = computed(() => (idx.value < flattened.value.length - 1 ? flattened.value[idx.value + 1] : null))
</script>

<style scoped>
.docs-prevnext-link {
  display: flex; flex-direction: column; padding: 12px 16px;
  border: 1px solid #e5e7eb; border-radius: 8px; text-decoration: none;
  transition: border-color 0.15s; max-width: 48%;
}
.docs-prevnext-link:hover { border-color: #3b82f6; }
</style>
