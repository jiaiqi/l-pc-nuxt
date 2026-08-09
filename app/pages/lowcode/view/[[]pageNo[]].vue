<template>
  <UiScaler
    :disabled="isNotScaled"
    :design-size="designSize"
  >
    <div class="page-wrap" :style="[setStyle, { '--content-width': contentAreaWidth }]">
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
          <button class="btn-primary text-sm" @click="loadPage">重试</button>
        </div>
      </div>

      <!-- 空态 -->
      <div v-else-if="!components.length" class="flex-center min-h-50vh">
        <p class="text-gray-400 text-sm">页面组件为空</p>
      </div>

      <!-- 正常渲染 -->
      <template v-else>
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
      </template>
    </div>
  </UiScaler>
</template>

<script setup lang="ts">
const route = useRoute()
const {
  getPageConfig,
  pageConfig,
  components,
  queryOptions,
  pageParamsModel,
  contentAreaWidth,
  setStyle,
} = useLowcodePage()

const loading = ref(true)
const error = ref<string | null>(null)

const pageNo = computed(() => route.params.pageNo as string)

const designSize = computed(() => {
  const style = pageConfig.value?.page_style_json_data as Record<string, unknown> | undefined
  if (style?.width && style?.height) return { width: style.width as number, height: style.height as number }
  return null
})

const isNotScaled = computed(() => {
  return pageConfig.value?.page_options?.includes('不缩放') || !designSize.value
})

const loadPage = async () => {
  loading.value = true
  error.value = null
  try {
    const ok = await getPageConfig(pageNo.value)
    if (!ok) error.value = `未找到页面配置: ${pageNo.value}`
  } catch (e) {
    error.value = (e as Error)?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => { if (pageNo.value) loadPage() })
watch(pageNo, (n, o) => { if (n && n !== o) loadPage() })

function onExecutorComplete(event: any) {
  // 处理组件执行完成事件
}
</script>

<style scoped>
.page-wrap {
  position: relative;
  min-height: 100%;
  width: var(--content-width, 100%);
  margin: 0 auto;
}
</style>
