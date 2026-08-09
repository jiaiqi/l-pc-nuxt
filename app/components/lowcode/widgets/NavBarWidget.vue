<template>
  <nav class="nav-bar flex items-center gap-1" :style="navStyle">
    <template v-for="(item, idx) in navItems" :key="idx">
      <a
        v-if="item.page_no"
        href="javascript:void(0)"
        class="nav-item px-4 py-2 text-sm cursor-pointer transition-all"
        :style="idx === activeIndex ? activeStyle : itemStyle"
        @click="onNavClick(item, idx)"
        @mouseenter="activeIndex = idx"
        @mouseleave="activeIndex = -1"
      >
        {{ item.label }}
      </a>
      <span
        v-else
        class="nav-item px-4 py-2 text-sm"
        :style="itemStyle"
      >
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { formatStyleData } from '@/utils/formatStyle'

const props = defineProps<{
  pageItem?: Record<string, unknown>
  pageConfig?: Record<string, unknown> | null
}>()

const activeIndex = ref(-1)
const route = useRoute()

// Parse com_case_json
const caseJson = computed(() => {
  const raw = props.pageItem?.com_case_json as Record<string, unknown> | undefined
  if (!raw) return {} as Record<string, unknown>
  return raw
})

// Parse nav items from sub_json (string → array)
const navItems = computed(() => {
  const sub = caseJson.value?.sub_json
  if (!sub) return []
  if (Array.isArray(sub)) return sub
  if (typeof sub === 'string') {
    try { return JSON.parse(sub) } catch { return [] }
  }
  return []
})

// Parse styles
const navStyle = computed(() => {
  const s: Record<string, string> = { display: 'flex', alignItems: 'center' }
  // Nav style
  const navStyleJson = caseJson.value?.nav_style_json
  if (navStyleJson) {
    if (typeof navStyleJson === 'string') {
      try { Object.assign(s, formatStyleData(JSON.parse(navStyleJson))) } catch {}
    } else {
      Object.assign(s, formatStyleData(navStyleJson))
    }
  }
  // Component style_json
  const compStyle = props.pageItem?.style_json
  if (compStyle) Object.assign(s, formatStyleData(compStyle))
  return s
})

const itemStyle = computed(() => {
  const navStyleJson = caseJson.value?.nav_style_json
  if (navStyleJson) {
    if (typeof navStyleJson === 'string') {
      try { return formatStyleData(JSON.parse(navStyleJson)) } catch {}
    } else {
      return formatStyleData(navStyleJson)
    }
  }
  return {}
})

const activeStyle = computed(() => {
  const selStyle = caseJson.value?.seleted_style_json
  if (selStyle) {
    if (typeof selStyle === 'string') {
      try { return formatStyleData(JSON.parse(selStyle)) } catch {}
    } else {
      return formatStyleData(selStyle)
    }
  }
  return { fontWeight: 'bold', borderBottom: '2px solid #fff' }
})

// Navigation click - navigate to page_no
function onNavClick(item: Record<string, unknown>, idx: number) {
  const pageNo = item.page_no as string
  if (!pageNo) return

  // Check if it's the current page
  const currentpageNo = route.params.id as string
  if (pageNo === currentpageNo) return

  // Navigate to the page
  navigateTo(`/view/${pageNo}`)
}

// Set active based on current route
onMounted(() => {
  const currentpageNo = route.params.id as string
  const idx = navItems.value.findIndex((item: any) => item.page_no === currentpageNo)
  if (idx >= 0) activeIndex.value = idx
})
</script>

<style scoped>
.nav-item {
  white-space: nowrap;
  text-decoration: none;
}
</style>
