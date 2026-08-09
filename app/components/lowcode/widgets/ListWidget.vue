<template>
  <div class="list-widget" :style="widgetStyle">
    <!-- 加载态 -->
    <div v-if="loading" class="flex-center py-12">
      <span class="i-ri-loader-4-line animate-spin text-2xl text-blue-500" />
    </div>

    <!-- 统计卡片 -->
    <div v-if="statisticData.length" class="flex gap-4 mb-4 overflow-x-auto">
      <div v-for="(item, idx) in statisticData" :key="idx"
        class="flex-1 min-w-120px p-3 rounded-lg text-white cursor-pointer"
        style="background-color: #1e2750">
        <div class="text-xs text-blue-300 mb-1">{{ item.label }}</div>
        <div class="text-lg font-semibold">{{ item.value || '0' }}</div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div v-if="showSearch" class="flex items-center gap-2 mb-4">
      <input v-model="searchKey" type="text" placeholder="搜索..."
        class="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
        @keyup.enter="doSearch" />
      <button class="btn-primary text-sm" @click="doSearch">搜索</button>
    </div>

    <!-- 表格模式 -->
    <BxTable v-if="listType === '表格' && !loading"
      :columns="displayColumns"
      :rows="tableData"
      :striped="isStriped"
      :empty-text="loaded ? '暂无数据' : ''"
    />

    <!-- 卡片模式 -->
    <div v-else-if="listType === '卡片' && !loading" class="grid gap-4" :style="cardGridStyle">
      <div v-for="(row, idx) in tableData" :key="idx"
        class="card cursor-pointer" @click="onCardClick(row)">
        <img v-if="imageField && row[imageField]"
          :src="resolveImage(row[imageField])"
          class="w-full h-32 object-cover rounded-t-lg" alt="" />
        <div class="p-3 space-y-1">
          <div v-if="titleField" class="font-medium text-sm truncate">{{ row[titleField] }}</div>
          <div v-if="subtitleField" class="text-xs text-gray-500 truncate">{{ row[subtitleField] }}</div>
        </div>
      </div>
    </div>

    <!-- 空态 -->
    <div v-if="loaded && !tableData.length && !loading" class="flex-center py-12 text-gray-400 text-sm">
      暂无数据
    </div>

    <!-- 分页 -->
    <div v-if="showPagination && pageTotal > pageSize" class="flex-center gap-2 mt-4">
      <button class="btn-ghost text-xs" :disabled="pageNo <= 1" @click="goPage(pageNo - 1)">上一页</button>
      <span class="text-sm text-gray-500">{{ pageNo }} / {{ Math.ceil(pageTotal / pageSize) }}</span>
      <button class="btn-ghost text-xs" :disabled="pageNo >= Math.ceil(pageTotal / pageSize)" @click="goPage(pageNo + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatStyleData } from '@/utils/formatStyle'

const props = defineProps<{
  pageItem?: Record<string, unknown>
  queryOptions?: Record<string, unknown>
  pageParamsModel?: Record<string, Record<string, unknown>>
  readOnly?: boolean
}>()

const emit = defineEmits<{
  add: []
  rowButtonClick: [btn: any, row: any]
  cellClick: [row: any]
  dataLoaded: [data: { count: number }]
}>()

const { apiFetch, getImagePath } = useHttp()

const loading = ref(false)
const loaded = ref(false)
const tableData = ref<Record<string, unknown>[]>([])
const pageNo = ref(1)
const pageSize = ref(10)
const pageTotal = ref(0)
const searchKey = ref('')
const statisticData = ref<{ label: string; value: string }[]>([])

// Config
const listConfig = computed(() => (props.pageItem?.list_json || {}) as Record<string, unknown>)
const listType = computed(() => (listConfig.value.list_type as string) || '表格')
const listOptions = computed(() => (listConfig.value.list_options as string) || '')
const showPagination = computed(() => listOptions.value.includes('分页'))
const showSearch = computed(() => listOptions.value.includes('快捷筛选') && !!listConfig.value.filter_cols)
const isStriped = computed(() => listOptions.value.includes('斑马纹'))

// Card layout config
const cardUnitJson = computed(() => listConfig.value.card_unit_json as Record<string, unknown> | undefined)
const layoutJson = computed(() => listConfig.value.layout_json as Record<string, unknown> | undefined)
const imageField = computed(() => {
  const parts = cardUnitJson.value?.parts_json as any[]
  if (!parts) return undefined
  const imgPart = parts.find(p => p.parts_type === 'iconImg' || p.parts_type === '图片')
  return imgPart?.variable as string | undefined
})
const titleField = computed(() => {
  const parts = cardUnitJson.value?.parts_json as any[]
  if (!parts) return undefined
  const titlePart = parts.find(p => p.parts_type === 'string' || p.parts_type === '文本')
  return titlePart?.variable as string | undefined
})
const subtitleField = computed(() => undefined)

// Styles
const widgetStyle = computed(() => {
  const s: Record<string, string> = {}
  const compStyle = props.pageItem?.style_json
  if (compStyle) Object.assign(s, formatStyleData(compStyle))
  return s
})

const cardGridStyle = computed(() => {
  const lj = layoutJson.value || {}
  const cols = (lj.cols_num as number) || 2
  const gap = (lj.style_json_diy as Record<string, string>)?.gap || '12px'
  return { display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }
})

// Columns for table mode
const displayColumns = computed(() => {
  const customHead = listConfig.value.custom_table_head_cols as string
  const customLabel = listConfig.value.custom_table_head_label as string
  if (customHead && customLabel) {
    const keys = customHead.split(',')
    const labels = customLabel.split(',')
    return keys.map((k, i) => ({ key: k.trim(), label: labels[i]?.trim() || k.trim() }))
  }
  if (tableData.value.length) {
    return Object.keys(tableData.value[0]).slice(0, 6).map(k => ({ key: k, label: k }))
  }
  return []
})

// Data fetching
async function fetchData() {
  const srvReq = props.pageItem?.srv_req_json as Record<string, unknown> | undefined
  if (!srvReq) {
    // Mock data
    tableData.value = (props.pageItem?.mock_srv_data_json as any[]) || []
    pageTotal.value = tableData.value.length
    loaded.value = true
    return
  }

  loading.value = true
  try {
    const req = { ...srvReq } as Record<string, unknown>
    // Handle search
    if (searchKey.value && listConfig.value.filter_cols) {
      req.condition = (req.condition as any[]) || []
      ;(req.condition as any[]).push({
        colName: listConfig.value.filter_cols,
        ruleType: 'like',
        value: searchKey.value,
      })
    }
    // Handle pagination
    req.page = { pageNo: pageNo.value, rownumber: pageSize.value }

    const app = (req.mapp as string) || 'config'
    const url = `/${app}/select/${req.serviceName}`
    const res = await apiFetch<{ state: string; data?: any[]; page?: any }>(url, { method: 'POST', body: req })
    if (res?.state === 'SUCCESS') {
      tableData.value = Array.isArray(res.data) ? res.data : []
      if (res.page) {
        pageTotal.value = res.page.total || 0
        pageNo.value = res.page.pageNo || 1
      }
      emit('dataLoaded', { count: tableData.value.length })
    }
  } catch (e) {
    console.error('[ListWidget] fetch error:', e)
  } finally {
    loading.value = false
    loaded.value = true
  }
}

function doSearch() {
  pageNo.value = 1
  fetchData()
}

function goPage(p: number) {
  pageNo.value = p
  fetchData()
}

function onCardClick(row: any) {
  emit('cellClick', row)
  // Handle jump_json
  const jumpJson = cardUnitJson.value?.jump_json as Record<string, unknown> | undefined
  if (jumpJson?.dest_page_no) {
    navigateTo(`/view/${jumpJson.dest_page_no}`)
  }
}

function resolveImage(val: any): string {
  if (!val) return ''
  const s = String(val)
  if (s.startsWith('http') || s.startsWith('data:')) return s
  return getImagePath(s)
}

onMounted(() => fetchData())
</script>
