<template>
  <div class="chart-widget relative" ref="chartRef" :style="{ width: '100%', height: chartHeight }">
    <div v-if="loading" class="absolute inset-0 flex-center bg-white/80 z-10">
      <span class="i-ri-loader-4-line animate-spin text-xl text-blue-500" />
    </div>
    <div v-if="!chartReady" class="flex-center h-full text-gray-400 text-sm">
      图表数据加载中...
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  pageItem?: Record<string, unknown>
  queryOptions?: Record<string, unknown>
  pageParamsModel?: Record<string, Record<string, unknown>>
}>()

const { apiFetch } = useHttp()
const chartRef = ref<HTMLElement | null>(null)
const loading = ref(false)
const chartReady = ref(false)
let chartInstance: any = null

const chartJson = computed(() => (props.pageItem?.chart_json || {}) as Record<string, unknown>)
const chartHeight = computed(() => (chartJson.value.height as string) || '300px')
const chartType = computed(() => chartJson.value.chart_type || 'bar')

async function loadECharts() {
  if (typeof window !== 'undefined' && !(window as any).echarts) {
    const echarts = await import('echarts')
    ;(window as any).echarts = echarts
  }
  return (window as any).echarts
}

async function fetchChartData() {
  loading.value = true
  try {
    const srvReq = (chartJson.value.srv_req_json || props.pageItem?.srv_req_json) as Record<string, unknown>
    if (!srvReq) {
      // Use mock data
      const mock = chartJson.value.mock_data_json || props.pageItem?.mock_srv_data_json
      const data = Array.isArray(mock) ? mock : []
      await renderChart(data)
      return
    }

    const app = (srvReq.mapp as string) || 'config'
    const url = `/${app}/select/${srvReq.serviceName}`
    const res = await apiFetch(url, { method: 'POST', body: srvReq }) as any
    if (res.state === 'SUCCESS') {
      await renderChart(res.data || [])
    }
  } catch (e) {
    console.error('[ChartWidget] fetch error:', e)
  } finally {
    loading.value = false
  }
}

async function renderChart(data: Record<string, unknown>[]) {
  if (!chartRef.value || !data.length) return
  const echarts = await loadECharts()
  if (!echarts) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  // Simple chart rendering based on chart_type
  const titleCol = (chartJson.value.title_col as string) || Object.keys(data[0])[0] || 'name'
  const valueCol = (chartJson.value.value_col as string) || Object.keys(data[0])[1] || 'value'

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: chartType.value === 'bar' || chartType.value === 'line'
      ? { type: 'category', data: data.map(d => d[titleCol]) }
      : undefined,
    yAxis: { type: 'value' },
    series: [{
      type: chartType.value,
      data: data.map(d => Number(d[valueCol]) || 0),
      smooth: true,
    }],
  }

  chartInstance.setOption(option)
  chartReady.value = true
}

function handleResize() {
  chartInstance?.resize()
}

onMounted(() => {
  fetchChartData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>
