<template>
  <!-- 浮动编辑按钮（在缩放容器外，不受 scale 影响） -->
  <FloatingEditButton />

  <div ref="pageRoot" class="lowcode-view-page" :style="rootStyle">
    <!-- 加载态 -->
    <div v-if="loading" class="flex-center min-h-50vh">
      <span class="i-ri-loader-4-line animate-spin text-2xl text-blue-500" />
      <span class="ml-2 text-gray-400 text-sm">加载页面配置...</span>
    </div>

    <!-- 错误态 -->
    <div v-else-if="error" class="flex-center min-h-50vh">
      <div class="card text-center space-y-3 max-w-sm">
        <span class="i-ri-error-warning-line text-3xl text-red-400 mx-auto block" />
        <p class="text-gray-500 text-sm">{{ error }}</p>
        <button class="btn-primary text-sm" @click="doLoad">重试</button>
      </div>
    </div>

    <!-- 空态 -->
    <div v-else-if="!components.length" class="flex-center min-h-50vh">
      <div class="card text-center space-y-2">
        <span class="i-ri-inbox-line text-3xl text-gray-300 mx-auto block" />
        <p class="text-gray-400 text-sm">页面组件为空</p>
        <p class="text-xs text-gray-300">pageNo: {{ routePageNo }}</p>
      </div>
    </div>

    <!-- 正常渲染 -->
    <PageViewport
      v-else
      :design-width="designWidth"
      :design-height="designHeight"
      :no-scale="noScale"
    >
      <LcView
        v-for="comp in components"
        :key="comp.id || comp.com_no"
        v-bind="comp"
        :page-item="comp.data || comp"
        :content-width="contentAreaWidth"
        :query-options="queryOptions"
        :page-params-model="pageParamsModel"
        :page-no="pageNo"
        :page-config="pageConfig"
        :is-preview="false"
        :is-view="true"
        :page-route="{ query: $route.query, params: $route.params }"
        @executor-complete="onExecutorComplete"
      />
    </PageViewport>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { loadIconify, cleanup, pageSwitching } = useLowcodePage()
const { pageNo, pageConfig, components, queryOptions, pageParamsModel, contentAreaWidth, setStyle, loadPageConfig } = useLowcodePage()

const loading = ref(true)
const error = ref<string | null>(null)
const routePageNo = computed(() => route.params.pageNo as string)
const pageRoot = ref<HTMLElement | null>(null)

// 设计尺寸与缩放控制
const styleData = computed(() => (pageConfig.value?.page_style_json_data || {}) as Record<string, unknown>)
const designWidth = computed(() => {
  const w = styleData.value?.width
  return w ? (typeof w === 'string' ? parseFloat(w) : Number(w)) : 0
})
const designHeight = computed(() => {
  const h = styleData.value?.height
  return h ? (typeof h === 'string' ? parseFloat(h) : Number(h)) : 0
})
const noScale = computed(() => pageConfig.value?.page_options?.includes('不缩放') || false)

// 响应式缩放比例
const viewportScale = ref(1)

function updateScale() {
  if (!import.meta.client || noScale.value || !designWidth.value || !designHeight.value) {
    viewportScale.value = 1
    return
  }
  const vw = document.documentElement.clientWidth
  const vh = document.documentElement.clientHeight
  viewportScale.value = Math.min(vw / designWidth.value, vh / designHeight.value)
}

const rootStyle = computed(() => {
  const styles: Record<string, string> = {
    '--content-width': contentAreaWidth.value,
    '--viewport-scale': String(viewportScale.value),
    minHeight: '100vh',
  }
  // 合并页面样式（已通过 formatStyleData 处理）
  Object.assign(styles, setStyle.value)
  return styles
})

async function doLoad() {
  loading.value = true; error.value = null
  try { await loadPageConfig(routePageNo.value) } catch (e) {
    error.value = (e as Error)?.message || '加载失败'
  } finally { loading.value = false; updateScale() }
}

function handleAnchor() {
  nextTick(() => {
    const anchor = route.query?.anchorName || route.params?.anchorName
    if (anchor) document.getElementById(anchor as string)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function onExecutorComplete(_event: any) {}

onMounted(async () => {
  await loadIconify()
  if (routePageNo.value) await doLoad()
  handleAnchor()
  window.addEventListener('resize', updateScale)
})

watch(() => route.params.pageNo, async (n, o) => {
  if (n && n !== o) { await loadPageConfig(n as string); handleAnchor() }
})

watch(() => route.params.anchorName, handleAnchor)

watch(() => route.query, (q) => { queryOptions.value = { ...(q || {}) } }, { deep: true })

onBeforeUnmount(() => {
  cleanup()
  window.removeEventListener('resize', updateScale)
})
</script>

<style scoped>
.lowcode-view-page {
  position: relative;
  width: 100%;
  margin: 0 auto;
}
</style>
