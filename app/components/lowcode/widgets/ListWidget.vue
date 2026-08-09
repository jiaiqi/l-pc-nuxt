<template>
  <div class="list-widget relative w-full">
    <!-- 加载态 -->
    <div v-if="loading" class="absolute inset-0 z-10 flex-center bg-white/80">
      <span class="i-ri-loader-4-line animate-spin text-2xl text-blue-500" />
    </div>

    <!-- 统计卡片 -->
    <div v-if="statisticData.length" class="flex gap-4 mb-4 overflow-x-auto">
      <div
        v-for="(item, idx) in statisticData" :key="idx"
        class="flex-1 min-w-120px p-3 rounded-lg text-white cursor-pointer"
        :style="{ backgroundColor: '#1e2750' }"
      >
        <div class="text-xs text-blue-300 mb-1">{{ item.label }}</div>
        <div class="text-lg font-semibold">{{ item.value || '0' }}</div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div v-if="showSearch" class="flex items-center gap-2 mb-4">
      <input
        v-model="searchKey"
        type="text"
        placeholder="搜索..."
        class="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
        @keyup.enter="doSearch"
      />
      <button class="btn-primary text-sm" @click="doSearch">搜索</button>
      <button v-if="addConfig" class="btn-ghost text-sm" @click="$emit('add')">
        {{ addConfig.button_name || '添加' }}
      </button>
    </div>

    <!-- 表格 -->
    <BxTable
      v-if="listType === '表格'"
      :columns="displayColumns"
      :rows="tableData"
      :striped="isStriped"
      :show-row-buttons="!!displayRowButtons.length"
      :row-buttons="displayRowButtons"
      :list-config="listConfig"
      :empty-text="loaded ? '暂无数据' : ''"
      @row-button-click="onRowButtonClick"
    />

    <!-- 卡片模式（简化为宫格占位） -->
    <div v-else-if="listType === '卡片'" class="grid grid-cols-2 gap-4">
      <div v-for="(row, idx) in tableData" :key="idx" class="card cursor-pointer" @click="onClickCell(row)">
        <div v-for="col in displayColumns" :key="col.key" class="text-sm">
          <span class="text-gray-400">{{ col.label }}: </span>
          <span class="font-medium">{{ row[col.key] }}</span>
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
const props = defineProps<{
  pageItem?: Record<string, unknown>
  queryOptions?: Record<string, unknown>
  pageParamsModel?: Record<string, Record<string, unknown>>
  readOnly?: boolean
}>()

const emit = defineEmits<{
  add: []
  'rowButtonClick': [btn: any, row: any]
  'cellClick': [row: any]
  'dataLoaded': [data: { count: number }]
}>()

const { selectOne, apiFetch } = useHttp()

const loading = ref(false)
const loaded = ref(false)
const tableData = ref<Record<string, unknown>[]>([])
const searchKey = ref('')
const pageNo = ref(1)
const pageSize = ref(10)
const pageTotal = ref(0)
const statisticData = ref<{ label: string; value: string }[]>([])

// 配置解析
const listConfig = computed(() => (props.pageItem?.list_json || {}) as Record<string, unknown>)
const listType = computed(() => (listConfig.value.list_type as string) || '表格')
const listOptions = computed(() => (listConfig.value.list_options as string) || '')
const showPagination = computed(() => listOptions.value.includes('分页'))
const showSearch = computed(() => listOptions.value.includes('快捷筛选') && !!listConfig.value.filter_cols)
const isStriped = computed(() => listOptions.value.includes('斑马纹'))
const addConfig = computed(() => {
  if (!listOptions.value.includes('添加')) return null
  return { button_name: '添加' } // simplified
})

// 列配置
const displayColumns = computed(() => {
  const customHead = listConfig.value.custom_table_head_cols as string
  const customLabel = listConfig.value.custom_table_head_label as string
  if (customHead && customLabel) {
    const keys = customHead.split(',')
    const labels = customLabel.split(',')
    return keys.map((k, i) => ({ key: k.trim(), label: labels[i]?.trim() || k.trim() }))
  }
  // Fallback: extract keys from first row
  if (tableData.value.length) {
    return Object.keys(tableData.value[0]).slice(0, 6).map(k => ({ key: k, label: k }))
  }
  return []
})

const displayRowButtons = computed(() => {
  // simplified: extract from v2 data
  return []
})

// 构建请求参数（简化版，处理 ${var} 变量替换）
function buildRequestParams(reqJson: Record<string, unknown>): Record<string, unknown> {
  const req = JSON.parse(JSON.stringify(reqJson))
  if (!Array.isArray(req.condition)) return req

  const paramsData: Record<string, unknown> = {}
  if (props.pageParamsModel) {
    for (const key of Object.keys(props.pageParamsModel)) {
      paramsData[key] = props.pageParamsModel[key]?.value
    }
  }
  paramsData.userInfo = null
  if (import.meta.client) {
    try {
      paramsData.userInfo = JSON.parse(sessionStorage.getItem('current_login_user') || 'null')
    } catch {}
  }

  req.condition = req.condition.map((cond: any) => {
    const val = String(cond.value || '')
    const match = val.match(/^\$\{(.+)\}$/)
    if (match && paramsData[match[1]] !== undefined) {
      return { ...cond, value: paramsData[match[1]] }
    }
    return cond
  })

  req.page = { pageNo: pageNo.value, rownumber: pageSize.value }
  return req
}

async function fetchData() {
  loading.value = true
  try {
    const srvReq = props.pageItem?.srv_req_json as Record<string, unknown>
    if (!srvReq) {
      // mock data
      tableData.value = (props.pageItem?.mock_srv_data_json as any[]) || []
      pageTotal.value = tableData.value.length
      loaded.value = true
      return
    }
    const req = buildRequestParams(srvReq)
    const app = (req.mapp as string) || 'config'
    const url = `/${app}/select/${req.serviceName}`

    const res = await apiFetch(url, { method: 'POST', body: req }) as any
    if (res.state === 'SUCCESS') {
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

function onRowButtonClick(btn: any, row: any) {
  if (btn?.button_type === 'detail' && btn.service_name && row?.id) {
    window.open(`${location.origin}/#/detail/${btn.service_name}/${row.id}`)
  }
  emit('rowButtonClick', btn, row)
}

function onClickCell(row: any) {
  emit('cellClick', row)
}

onMounted(() => fetchData())
</script>
LIST
echo "ListWidget done"