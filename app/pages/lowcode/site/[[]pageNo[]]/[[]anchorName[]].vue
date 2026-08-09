<template>
  <!-- 页面切换进度条 -->
  <ClientOnly>
    <Teleport to="body">
      <div v-if="pageSwitching" class="lc-switch-bar" />
    </Teleport>
  </ClientOnly>

  <UiScaler :disabled="isNotScaled" :design-size="designSize">
    <div class="page-wrap" :style="mainStyle">
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
      <template v-else>
        <LcView
          v-for="comp in components"
          :key="comp.id || comp.com_no"
          v-bind="comp"
          :page-item="comp.data || comp"
          :content-width="contentAreaWidth"
          :current-id="undefined"
          :query-options="queryOptions"
          :page-params-model="pageParamsModel"
          :page-no="pageNo"
          :page-config="pageConfig"
          :is-preview="false"
          :is-view="true"
          :page-route="{ query: $route.query, params: $route.params }"
          @click="onComponentClick"
          @add="onComponentAdd"
          @delete="onComponentDelete"
          @executor-complete="onExecutorComplete"
        />
      </template>
    </div>
  </UiScaler>

  <!-- 浮动编辑按钮（Ctrl+点击右上角呼出） -->
  <FloatingEditButton />
</template>

<script setup lang="ts">
const route = useRoute()
const { loadIconify, cleanup, pageSwitching } = useLowcodePage()

const {
  pageNo, pageConfig, components, queryOptions, pageParamsModel,
  contentAreaWidth, setStyle, loadPageConfig,
} = useLowcodePage()

const loading = ref(true)
const error = ref<string | null>(null)

const routePageNo = computed(() => route.params.pageNo as string)

// 设计尺寸与缩放
const designSize = computed(() => {
  const s = pageConfig.value?.page_style_json_data as Record<string, unknown> | undefined
  if (s?.width && s?.height) return { width: s.width as number, height: s.height as number }
  return null
})

const isNotScaled = computed(() =>
  pageConfig.value?.page_options?.includes('不缩放') || !designSize.value
)

const mainStyle = computed(() => ({
  '--content-width': contentAreaWidth.value,
  ...setStyle.value,
}) as any)

// 页面加载
async function doLoad() {
  loading.value = true
  error.value = null
  try {
    await loadPageConfig(routePageNo.value)
  } catch (e) {
    error.value = (e as Error)?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

// 锚点平滑滚动
function handleAnchor() {
  nextTick(() => {
    const anchor = route.query?.anchorName || route.params?.anchorName
    if (anchor) {
      const el = document.getElementById(anchor as string)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

// 事件处理
function onComponentClick(data: any) { /* 查看模式不处理 */ }
function onComponentAdd(data: any) { /* 查看模式不处理 */ }
function onComponentDelete(data: any) { /* 查看模式不处理 */ }
function onExecutorComplete(event: any) { /* 组件执行完成回调 */ }

// 生命周期
onMounted(async () => {
  await loadIconify()
  if (routePageNo.value) await doLoad()
  handleAnchor()
})

// 路由监听
watch(() => route.params.pageNo, async (n, o) => {
  if (n && n !== o) {
    loading.value = false // 切换时不显示全屏 loading，用进度条代替
    await loadPageConfig(n as string)
    handleAnchor()
  }
})

watch(() => route.params.anchorName, handleAnchor)

// query 变化同步
watch(() => route.query, (q) => {
  queryOptions.value = { ...(q || {}) }
}, { deep: true })

onBeforeUnmount(() => cleanup())
</script>

<style>
/* 页面切换进度条（挂在 body 上，不受 transform 影响） */
body::after {
  content: '';
  position: fixed; top: 0; left: 0; right: 0; height: 3px;
  z-index: 99999; pointer-events: none; opacity: 0;
  transition: opacity 0.3s ease;
  background: linear-gradient(90deg, transparent 0%, var(--primary-color, #409eff) 35%, #fff 50%, var(--primary-color, #409eff) 65%, transparent 100%),
              linear-gradient(rgba(255,255,255,0.35), rgba(255,255,255,0.35));
  background-size: 50% 100%, 100% 100%;
  background-repeat: no-repeat;
  background-position: -50% 0, 0 0;
}
</style>

<style scoped>
.page-wrap {
  position: relative;
  min-height: 100%;
  width: var(--content-width, 100%);
  margin: 0 auto;
}
.lc-switch-bar {
  position: fixed; top: 0; left: 0; right: 0; height: 3px;
  z-index: 99998; opacity: 1;
  background: linear-gradient(90deg, transparent 0%, #409eff 35%, #fff 50%, #409eff 65%, transparent 100%),
              linear-gradient(rgba(255,255,255,0.35), rgba(255,255,255,0.35));
  background-size: 50% 100%, 100% 100%;
  background-repeat: no-repeat;
  background-position: -50% 0, 0 0;
  animation: lc-switch-slide 0.9s ease-in-out infinite;
}
@keyframes lc-switch-slide {
  0% { background-position: -50% 0, 0 0; }
  100% { background-position: 150% 0, 0 0; }
}
</style>
