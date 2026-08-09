<template>
  <FloatingEditButton />
  <div ref="pageRoot" class="lowcode-view-page" :style="rootStyle">
    <div v-if="loading" class="flex-center min-h-50vh">
      <span class="i-ri-loader-4-line animate-spin text-2xl text-blue-500" />
      <span class="ml-2 text-gray-400 text-sm">加载页面配置...</span>
    </div>
    <div v-else-if="error" class="flex-center min-h-50vh">
      <div class="card text-center space-y-3 max-w-sm">
        <span class="i-ri-error-warning-line text-3xl text-red-400 mx-auto block" />
        <p class="text-gray-500 text-sm">{{ error }}</p>
        <button class="btn-primary text-sm" @click="doLoad">重试</button>
      </div>
    </div>
    <div v-else-if="!components.length" class="flex-center min-h-50vh">
      <div class="card text-center space-y-2">
        <span class="i-ri-inbox-line text-3xl text-gray-300 mx-auto block" />
        <p class="text-gray-400 text-sm">页面组件为空</p>
        <p class="text-xs text-gray-300">pageNo: {{ routeId }}</p>
      </div>
    </div>
    <PageViewport v-else :design-width="designWidth" :design-height="designHeight" :no-scale="noScale">
      <LcView v-for="comp in components" :key="comp.id || comp.com_no" v-bind="comp"
        :page-item="comp.data || comp" :content-width="contentAreaWidth"
        :query-options="queryOptions" :page-params-model="pageParamsModel"
        :page-no="pageNo" :page-config="pageConfig" :is-preview="false" :is-view="true"
        :page-route="{ query: $route.query, params: $route.params }"
        @executor-complete="onExecutorComplete" />
    </PageViewport>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { cleanup, pageNo, pageConfig, components, queryOptions, pageParamsModel, contentAreaWidth, setStyle, loadPageConfig } = useLowcodePage()

const loading = ref(true)
const error = ref<string | null>(null)
const routeId = computed(() => route.params.id as string)

const styleData = computed(() => (pageConfig.value?.page_style_json_data || {}) as Record<string, unknown>)
const designWidth = computed(() => { const w = styleData.value?.width; return w ? parseFloat(String(w)) : 0 })
const designHeight = computed(() => { const h = styleData.value?.height; return h ? parseFloat(String(h)) : 0 })
const noScale = computed(() => pageConfig.value?.page_options?.includes('不缩放') || false)

const viewportScale = ref(1)
function updateScale() {
  if (!import.meta.client || noScale.value || !designWidth.value) { viewportScale.value = 1; return }
  viewportScale.value = Math.min(document.documentElement.clientWidth / designWidth.value, document.documentElement.clientHeight / designHeight.value)
}

const rootStyle = computed(() => {
  const s: Record<string, string> = { '--content-width': contentAreaWidth.value, '--viewport-scale': String(viewportScale.value), minHeight: '100vh' }
  Object.assign(s, setStyle.value)
  return s
})

async function doLoad() {
  loading.value = true; error.value = null
  console.log('[view] doLoad: routeId=', routeId.value)
  try { await loadPageConfig(routeId.value) } catch (e) { error.value = (e as Error)?.message || '加载失败' }
  finally { loading.value = false; updateScale(); console.log('[view] after load - components:', components.value?.length, 'pageConfig:', !!pageConfig.value) }
}

function onExecutorComplete(_e: any) {}

onMounted(async () => {
    if (routeId.value) await doLoad()
  window.addEventListener('resize', updateScale)
  // Handle anchor from query
  nextTick(() => {
    const anchor = route.query.anchor as string
    if (anchor) document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' })
  })
})

watch(() => route.params.id, async (n, o) => { if (n && n !== o) await doLoad() })
watch(() => route.query, (q) => { queryOptions.value = { ...(q || {}) } }, { deep: true })
onBeforeUnmount(() => { cleanup(); window.removeEventListener('resize', updateScale) })
</script>

<style scoped>
.lowcode-view-page { position: relative; width: 100%; margin: 0 auto; }
</style>
