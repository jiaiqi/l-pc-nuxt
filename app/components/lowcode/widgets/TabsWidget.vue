<template>
  <div class="tabs-widget">
    <div class="flex border-b border-gray-200 mb-3">
      <button
        v-for="tab in tabs" :key="tab.key"
        class="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px"
        :class="activeTab === tab.key
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="tab-content">
      <slot :name="activeTab" :active="activeTab">
        <div class="text-gray-400 text-sm text-center py-8">
          暂无内容
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  tabs?: { key: string; label: string }[]
  pageItem?: Record<string, unknown>
}>()

const tabConfig = computed(() => (props.pageItem?.tabs_json || {}) as Record<string, unknown>)

const tabs = computed(() => {
  const list = (tabConfig.value.tab_list as any[]) || props.tabs || []
  return list.map((t: any, i: number) => ({
    key: t.key || String(i),
    label: t.label || t.name || `标签 ${i + 1}`,
  }))
})

const activeTab = ref(tabs.value[0]?.key || '')
watch(tabs, (v) => { if (v.length && !activeTab.value) activeTab.value = v[0].key })
</script>
