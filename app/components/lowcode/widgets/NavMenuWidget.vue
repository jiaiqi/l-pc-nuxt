<template>
  <nav class="nav-menu flex flex-wrap items-center gap-1" :style="menuStyle">
    <template v-for="item in menuItems" :key="item.key">
      <a
        v-if="item.link"
        :href="item.link"
        class="nav-item px-3 py-2 text-sm rounded-md transition-colors"
        :class="item.active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'"
      >
        {{ item.label }}
      </a>
      <span
        v-else
        class="nav-item px-3 py-2 text-sm rounded-md cursor-pointer transition-colors"
        :class="item.active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'"
        @click="item.active = !item.active"
      >
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>

<script setup lang="ts">
const props = defineProps<{
  pageItem?: Record<string, unknown>
  menuItems?: { key: string; label: string; link?: string; active?: boolean }[]
}>()

const menuConfig = computed(() => (props.pageItem?.nav_menu_json || {}) as Record<string, unknown>)
const menuStyle = computed(() => {
  const s = menuConfig.value.style_json as Record<string, string> | undefined
  return s || {}
})
</script>
