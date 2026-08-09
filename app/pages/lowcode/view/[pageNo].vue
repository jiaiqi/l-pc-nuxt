<template>
  <div class="page-wrap" :style="setStyle">
    <div v-if="loading" class="flex-center min-h-50vh">
      <div class="i-ri-loader-4-line animate-spin text-2xl text-blue-500" />
      <span class="ml-2 text-muted">加载页面配置...</span>
    </div>

    <div v-else-if="error" class="flex-center min-h-50vh">
      <div class="card text-center space-y-2">
        <div class="i-ri-error-warning-line text-3xl text-red-400" />
        <p class="text-gray-600">{{ error }}</p>
        <button class="btn-primary text-sm" @click="loadPage">重试</button>
      </div>
    </div>

    <div v-else>
      <!-- 渲染组件列表 -->
      <template v-for="comp in components" :key="comp.id || comp.com_no">
        <div class="lc-component" :style="{
          '--content-width': contentAreaWidth,
        }">
          <pre class="text-xs text-gray-400 p-2 border border-dashed border-gray-200 rounded overflow-auto">
            {{ JSON.stringify(comp, null, 2) }}
          </pre>
        </div>
      </template>

      <div v-if="!components.length" class="flex-center min-h-50vh">
        <p class="text-muted">页面组件为空</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { getPageConfig, pageConfig, components, contentAreaWidth, setStyle } = useLowcodePage()

const loading = ref(true)
const error = ref<string | null>(null)

const pageNo = computed(() => route.params.pageNo as string)

const loadPage = async () => {
  loading.value = true
  error.value = null
  try {
    const ok = await getPageConfig(pageNo.value)
    if (!ok) {
      error.value = `未找到页面 ${pageNo.value}`
    }
  } catch (e) {
    error.value = (e as Error)?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (pageNo.value) loadPage()
})

watch(pageNo, (n, o) => {
  if (n && n !== o) loadPage()
})
</script>
