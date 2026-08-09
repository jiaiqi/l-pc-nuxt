<template>
  <div
    class="page-item"
    :class="{
      'view-mode': isView,
      'preview-mode': isPreview,
      'in-edit': inEdit && !isView && !isPreview,
      'is-selected': currentId === id,
    }"
    :style="pageItemStyle"
    :id="comName"
  >
    <!-- 编辑态工具栏 -->
    <div
      v-if="inEdit && !isView && !isPreview && currentId === id"
      class="page-item-toolbar"
    >
      <span class="text-xs">{{ comName || '组件' }}</span>
      <button class="toolbar-btn" @click.stop="emit('delete', $props)" title="删除">
        <span class="i-ri-delete-bin-line" />
      </button>
    </div>

    <!-- 组件标题 -->
    <div
      v-if="showLabel"
      class="page-item__label"
      :style="titleStyle"
    >
      <span class="page-item__label-text">{{ resolvedLabel }}</span>
      <button
        v-if="showMoreBtn"
        class="more-btn"
        @click="toMore"
      >
        {{ (pageItem as any)?.more_label || '更多' }} →
      </button>
    </div>

    <!-- 组件内容区 -->
    <div class="page-item__content" :style="innerCompStyle">
      <!-- cardGroup 类型 -->
      <CardGroupCell
        v-if="resolvedComType === 'cardGroup'"
        :page-item="pageItem"
        :cells-layout="cardGroupCellsLayout"
        :cell-data="cardGroupCellData"
        :com-col-map="comColMapRun"
        :card-layout="cardGroupLayoutJson"
        :query-options="queryOptions"
        :page-params-model="pageParamsModel"
        @on-click-cell="onCardGroupCellClick"
        @data-loaded="onDataLoaded"
      />

      <!-- swiper 类型：SwiperWidget 自己调 API -->
      <SwiperWidget
        v-else-if="resolvedComType === 'swiper'"
        :page-item="pageItem"
        :query-options="queryOptions"
      />

      <!-- list 类型：ListWidget 自己调 API -->
      <ListWidget
        v-else-if="resolvedComType === 'list'"
        :page-item="pageItem"
        :query-options="queryOptions"
        :page-params-model="pageParamsModel"
        @data-loaded="onDataLoaded"
      />

      <!-- navBar 类型 -->
      <NavBarWidget
        v-else-if="resolvedComType === 'navBar'"
        :page-item="pageItem"
        :page-config="pageConfig"
      />

      <!-- noticeBar 类型 -->
      <NoticeBar
        v-else-if="resolvedComType === 'noticeBar'"
        :page-item="pageItem"
      />

      <!-- currentInfo 类型 -->
      <CurrentInfo
        v-else-if="resolvedComType === 'currentInfo'"
        :page-item="pageItem"
        :query-options="queryOptions"
        :page-params-model="pageParamsModel"
      />

      <!-- chart 类型 -->
      <ChartWidget
        v-else-if="resolvedComType === 'chart'"
        :page-item="pageItem"
        :query-options="queryOptions"
        :page-params-model="pageParamsModel"
      />

      <!-- tabs 类型 -->
      <TabsWidget
        v-else-if="resolvedComType === 'tabs'"
        :page-item="pageItem"
        :query-options="queryOptions"
        :page-params-model="pageParamsModel"
      />

      <!-- grid 类型 -->
      <CardGroupCell
        v-else-if="resolvedComType === 'grid'"
        :page-item="pageItem"
        :cells-layout="cardGroupCellsLayout"
        :cell-data="cardGroupCellData"
        :com-col-map="comColMapRun"
        :card-layout="cardGroupLayoutJson"
        :query-options="queryOptions"
        :page-params-model="pageParamsModel"
        @on-click-cell="onCardGroupCellClick"
        @data-loaded="onDataLoaded"
      />

      <!-- 卡片部件 (com_type === '卡片部件') -->
      <CardGroupCell
        v-else-if="resolvedComType === '卡片部件'"
        :page-item="pageItem"
        :cells-layout="cardPartCellsLayout"
        :cell-data="cardPartCellData"
        :com-col-map="comColMapRun"
        :card-layout="cardGroupLayoutJson"
        :query-options="queryOptions"
        :page-params-model="pageParamsModel"
        @on-click-cell="onCardGroupCellClick"
        @data-loaded="onDataLoaded"
      />

      <!-- form 类型 -->
      <FormWidget
        v-else-if="resolvedComType === 'form' && formConfig"
        :page-item="pageItem"
        :query-options="queryOptions"
        :page-params-model="pageParamsModel"
      />

      <!-- detail 类型 -->
      <DescriptionsList
        v-else-if="resolvedComType === 'detail'"
        :page-item="pageItem"
        :query-options="queryOptions"
        :page-params-model="pageParamsModel"
      />

      <!-- videoCard 类型 -->
      <VideoCard
        v-else-if="resolvedComType === 'videoCard'"
        :page-item="pageItem"
        :query-options="queryOptions"
        :page-params-model="pageParamsModel"
      />

      <!-- extPage 类型 -->
      <iframe
        v-else-if="resolvedComType === 'extPage' && extPageUrl"
        :src="extPageUrl"
        frameborder="0"
        style="width: 100%; height: 100%; border: none"
      />

      <!-- 控件 类型 → WidgetDispatcher -->
      <WidgetDispatcher
        v-else-if="widgetType"
        :widget-type="widgetType"
        :page-item="pageItem"
        :page-config="pageConfig"
        :page-no="pageNo"
        :query-options="queryOptions"
        :page-params-model="pageParamsModel"
      />

      <!-- 默认：显示组件信息 -->
      <div v-else class="text-xs text-gray-400 text-center py-4">
        {{ comName || resolvedComType || '未配置' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatStyleData } from '~/utils/formatStyle'
import SwiperWidget from './widgets/SwiperWidget.vue'
import NavBarWidget from './widgets/NavBarWidget.vue'
import NoticeBar from './widgets/NoticeBar.vue'
import CurrentInfo from './widgets/CurrentInfo.vue'
import CardGroupCell from './widgets/CardGroupCell.vue'
import ListWidget from './widgets/ListWidget.vue'
import ChartWidget from './widgets/ChartWidget.vue'
import TabsWidget from './widgets/TabsWidget.vue'
import FormWidget from './widgets/FormWidget.vue'
import DescriptionsList from './widgets/DescriptionsList.vue'
import VideoCard from './widgets/VideoCard.vue'
import WidgetDispatcher from './WidgetDispatcher.vue'

const props = defineProps<{
  com_type?: string
  id?: string
  comName?: string
  comType?: string
  pageItem?: Record<string, unknown>
  pageConfig?: Record<string, unknown> | null
  pageNo?: string
  currentId?: string
  isPreview?: boolean
  isView?: boolean
  inEdit?: boolean
  contentWidth?: string
  queryOptions?: Record<string, unknown>
  pageParamsModel?: Record<string, Record<string, unknown>>
  pageRoute?: Record<string, unknown>
  style?: Record<string, string>
  style_json?: Record<string, unknown> | string
}>()

const emit = defineEmits<{
  click: [data: any]
  add: [data: any]
  delete: [data: any]
  resize: [data: any]
  'layout-resize': [data: any]
  'executor-complete': [data: any]
}>()

// ============================================================
// com_type 解析
// ============================================================
const resolvedComType = computed(() => (props.comType || props.com_type || (props.pageItem as any)?.com_type) as string)

// ============================================================
// 控件类型 (widget_json.widget_type)
// ============================================================
const widgetType = computed(() => {
  const json = props.pageItem?.widget_json as Record<string, unknown> | undefined
  if (!json) return null
  const type = json.widget_type as string
  return type === '系统按钮'
    ? ((json.button_cfg_json as any)?.sys_button_type || type)
    : type
})

// ============================================================
// 各类型配置检测
// ============================================================
const formConfig = computed(() => props.pageItem?.form_json)

// ============================================================
// 标题/标签显示
// ============================================================
const showLabel = computed(() => {
  const item = props.pageItem as any
  return item?.show_label === '是' && item?.com_label && !props.inEdit
})

const resolvedLabel = computed(() => (props.pageItem as any)?.com_label || '')

const titleStyle = computed(() => {
  const item = props.pageItem as any
  const cfg = props.pageConfig as any
  let style: Record<string, unknown> = {}
  if (item?.com_title_style_json) {
    style = item.com_title_style_json
  } else if (cfg?.dv_com_title_style_json_data && !item?.com_option?.includes('不使用公共标题样式')) {
    style = { ...cfg.dv_com_title_style_json_data }
  }
  return formatStyleData(style)
})

const showMoreBtn = computed(() => {
  const item = props.pageItem as any
  return item?.com_option?.includes('更多') && item?.more_jump_json
})

function toMore() {
  const jumpJson = (props.pageItem as any)?.more_jump_json
  if (jumpJson?.dest_page_no) {
    navigateTo(`/view/${jumpJson.dest_page_no}`)
  }
}

// ============================================================
// 样式计算
// ============================================================
const pageItemStyle = computed(() => {
  const s: Record<string, string> = { position: 'relative' }
  const item = props.pageItem as any
  const cfg = props.pageConfig as any

  // 组件级样式
  let styleJson: Record<string, unknown> = {}
  if (item?.style_json) {
    styleJson = item.style_json
  } else if (item?.com_style_json) {
    styleJson = item.com_style_json
  } else if (cfg?.dv_com_style_json_data && !item?.com_option?.includes('不使用公共组件样式')) {
    styleJson = { ...cfg.dv_com_style_json_data }
  }
  Object.assign(s, formatStyleData(styleJson))

  if (props.contentWidth) s.width = props.contentWidth
  if (props.style_json) Object.assign(s, formatStyleData(props.style_json))
  if (props.style) Object.assign(s, props.style)
  return s
})

const innerCompStyle = computed(() => {
  const cfg = props.pageConfig as any
  const item = props.pageItem as any
  let style: Record<string, string> = {}
  if (cfg?.dv_com_in_style_json) {
    style = formatStyleData(cfg.dv_com_in_style_json)
  }
  if (item?.com_in_style_json) {
    style = { ...style, ...formatStyleData(item.com_in_style_json) }
  }
  return style
})

// ============================================================
// extPage URL
// ============================================================
const extPageUrl = computed(() => {
  const item = props.pageItem as any
  let url = ''
  if (item?.ext_page_json?.ext_page_url) {
    url = item.ext_page_json.ext_page_url
  } else if (item?.com_case_json?.ext_page_url) {
    url = item.com_case_json.ext_page_url
  } else if (item?.ext_page_url) {
    url = item.ext_page_url
  }
  if (url && typeof props.queryOptions === 'object' && Object.keys(props.queryOptions).length) {
    const qs = new URLSearchParams(
      Object.entries(props.queryOptions).reduce((acc, [k, v]) => {
        acc[k] = String(v)
        return acc
      }, {} as Record<string, string>)
    ).toString()
    url += (url.includes('?') ? '&' : '?') + qs
  }
  return url
})

// ============================================================
// srv_req_json 变量替换（迁移自 pageItemComponentMixin.srvReq）
// ============================================================

/**
 * 替换字符串中的 ${var} 变量
 */
function renderStr(str: string, params: Record<string, any>): string {
  return str.replace(/\$\{([^}]+)\}/g, (_, key) => {
    const val = params[key]
    if (val?.value !== undefined) return String(val.value)
    if (val !== undefined) return String(val)
    return ''
  })
}

/**
 * 日期关键词列表
 */
const DATE_KEYS = [
  '今天', '昨天', '前天', '明天', '后天', '大后天', '大前天',
  '本周', '上周', '上上周', '下周', '下下周',
  '过去一周', '过去两周', '未来一周', '未来两周',
  '本月', '上月', '下月', '过去一月', '过去两月', '未来一月', '未来两月',
  '本季度', '上季度', '上上季度', '下季度',
  '今年', '去年', '前年', '大前年', '明年', '后年', '大后年',
]

/**
 * 将日期关键词转换为日期值（使用原生 Date，不依赖 dayjs）
 */
function getDateByKey(key: string): string | string[] {
  const now = new Date()
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const startOfDay = (d: Date) => { const r = new Date(d); r.setHours(0, 0, 0, 0); return r }
  const endOfDay = (d: Date) => { const r = new Date(d); r.setHours(23, 59, 59, 0); return r }
  const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
  const startOfWeek = (d: Date) => { const r = new Date(d); const day = r.getDay() || 7; r.setDate(r.getDate() - day + 1); r.setHours(0, 0, 0, 0); return r }
  const endOfWeek = (d: Date) => { const r = startOfWeek(d); r.setDate(r.getDate() + 6); r.setHours(23, 59, 59, 0); return r }
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
  const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
  const startOfQuarter = (d: Date) => { const q = Math.floor(d.getMonth() / 3); return new Date(d.getFullYear(), q * 3, 1) }
  const endOfQuarter = (d: Date) => { const q = Math.floor(d.getMonth() / 3); return new Date(d.getFullYear(), q * 3 + 3, 0, 23, 59, 59) }
  const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1)
  const endOfYear = (d: Date) => new Date(d.getFullYear(), 11, 31, 23, 59, 59)

  const map: Record<string, () => { start: Date; end: Date }> = {
    '今天': () => ({ start: startOfDay(now), end: endOfDay(now) }),
    '昨天': () => ({ start: startOfDay(addDays(now, -1)), end: endOfDay(addDays(now, -1)) }),
    '前天': () => ({ start: startOfDay(addDays(now, -2)), end: endOfDay(addDays(now, -2)) }),
    '大前天': () => ({ start: startOfDay(addDays(now, -3)), end: endOfDay(addDays(now, -3)) }),
    '明天': () => ({ start: startOfDay(addDays(now, 1)), end: endOfDay(addDays(now, 1)) }),
    '后天': () => ({ start: startOfDay(addDays(now, 2)), end: endOfDay(addDays(now, 2)) }),
    '大后天': () => ({ start: startOfDay(addDays(now, 3)), end: endOfDay(addDays(now, 3)) }),
    '本周': () => ({ start: startOfWeek(now), end: endOfWeek(now) }),
    '上周': () => ({ start: startOfWeek(addDays(now, -7)), end: endOfWeek(addDays(now, -7)) }),
    '上上周': () => ({ start: startOfWeek(addDays(now, -14)), end: endOfWeek(addDays(now, -14)) }),
    '下周': () => ({ start: startOfWeek(addDays(now, 7)), end: endOfWeek(addDays(now, 7)) }),
    '下下周': () => ({ start: startOfWeek(addDays(now, 14)), end: endOfWeek(addDays(now, 14)) }),
    '过去一周': () => ({ start: startOfDay(addDays(now, -7)), end: endOfDay(now) }),
    '过去两周': () => ({ start: startOfDay(addDays(now, -14)), end: endOfDay(now) }),
    '未来一周': () => ({ start: startOfDay(now), end: endOfDay(addDays(now, 7)) }),
    '未来两周': () => ({ start: startOfDay(now), end: endOfDay(addDays(now, 14)) }),
    '本月': () => ({ start: startOfMonth(now), end: endOfMonth(now) }),
    '上月': () => { const d = new Date(now.getFullYear(), now.getMonth() - 1, 1); return { start: startOfMonth(d), end: endOfMonth(d) } },
    '下月': () => { const d = new Date(now.getFullYear(), now.getMonth() + 1, 1); return { start: startOfMonth(d), end: endOfMonth(d) } },
    '过去一月': () => ({ start: startOfDay(addDays(now, -30)), end: endOfDay(now) }),
    '过去两月': () => ({ start: startOfDay(addDays(now, -60)), end: endOfDay(now) }),
    '未来一月': () => ({ start: startOfDay(now), end: endOfDay(addDays(now, 30)) }),
    '未来两月': () => ({ start: startOfDay(now), end: endOfDay(addDays(now, 60)) }),
    '本季度': () => ({ start: startOfQuarter(now), end: endOfQuarter(now) }),
    '上季度': () => { const d = new Date(now.getFullYear(), now.getMonth() - 3, 1); return { start: startOfQuarter(d), end: endOfQuarter(d) } },
    '上上季度': () => { const d = new Date(now.getFullYear(), now.getMonth() - 6, 1); return { start: startOfQuarter(d), end: endOfQuarter(d) } },
    '下季度': () => { const d = new Date(now.getFullYear(), now.getMonth() + 3, 1); return { start: startOfQuarter(d), end: endOfQuarter(d) } },
    '今年': () => ({ start: startOfYear(now), end: endOfYear(now) }),
    '去年': () => { const d = new Date(now.getFullYear() - 1, 0, 1); return { start: startOfYear(d), end: endOfYear(d) } },
    '前年': () => { const d = new Date(now.getFullYear() - 2, 0, 1); return { start: startOfYear(d), end: endOfYear(d) } },
    '大前年': () => { const d = new Date(now.getFullYear() - 3, 0, 1); return { start: startOfYear(d), end: endOfYear(d) } },
    '明年': () => { const d = new Date(now.getFullYear() + 1, 0, 1); return { start: startOfYear(d), end: endOfYear(d) } },
    '后年': () => { const d = new Date(now.getFullYear() + 2, 0, 1); return { start: startOfYear(d), end: endOfYear(d) } },
    '大后年': () => { const d = new Date(now.getFullYear() + 3, 0, 1); return { start: startOfYear(d), end: endOfYear(d) } },
  }

  const fn = map[key]
  if (!fn) return key
  const { start, end } = fn()
  return [`${fmt(start)} 00:00:00`, `${fmt(end)} 23:59:59`]
}

/**
 * 获取用户信息（从 sessionStorage）
 */
function getUserInfo(): Record<string, any> | null {
  if (!import.meta.client) return null
  const raw = sessionStorage.getItem('login_user_info') || sessionStorage.getItem('current_login_user')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

/**
 * 计算 srvReq：从 pageItem.srv_req_json 出发，替换变量、处理日期关键词
 * 这是 pageItemComponentMixin.srvReq 的迁移版本
 */
const srvReq = computed(() => {
  const item = props.pageItem as any
  if (!item?.srv_req_json) return {}

  // 收集参数
  const params: Record<string, any> = {}
  if (props.pageParamsModel && typeof props.pageParamsModel === 'object') {
    Object.assign(params, JSON.parse(JSON.stringify(props.pageParamsModel)))
  }
  if (props.queryOptions && typeof props.queryOptions === 'object') {
    Object.assign(params, props.queryOptions)
  }

  const userInfo = getUserInfo()
  const globalParams: Record<string, any> = {
    ...params,
    user: userInfo,
    user_no: userInfo?.user_no || '',
    userInfo: userInfo || '',
  }

  const req = JSON.parse(JSON.stringify(item.srv_req_json))
  const conds: any[] = []

  if (Array.isArray(req.condition) && req.condition.length > 0) {
    for (const cond of req.condition) {
      try {
        const condModel = JSON.parse(JSON.stringify(cond))

        if (cond.var_src === '页面接口参数') {
          // 从 pageParamsModel 取值
          condModel.value_key = cond.value
          delete condModel.var_src
          delete condModel.value
          const ppm = props.pageParamsModel
          if (ppm && typeof ppm === 'object' && cond.value_key && (ppm as any)[cond.value_key]?.value) {
            condModel.value = (ppm as any)[cond.value_key].value
          }
        } else if (condModel.value && typeof condModel.value === 'string' &&
                   condModel.value.includes('${') && condModel.value.includes('}')) {
          // 变量替换
          try {
            const rendered = renderStr(condModel.value, globalParams)
            if (rendered && !rendered.includes('[object')) {
              condModel.value = rendered
            } else {
              // 简单 key 提取
              const key = condModel.value.replace(/\$\{/g, '').replace(/\}/g, '')
              const val = params[key]
              condModel.value = val?.value !== undefined ? val.value : (val || '')
            }
          } catch (e) {
            console.warn('[PageItem] renderStr error:', e)
          }
        }

        // 日期关键词转换
        if (typeof condModel.value === 'string' && DATE_KEYS.includes(condModel.value)) {
          condModel.value = getDateByKey(condModel.value)
        }

        // 范围查询
        if (Array.isArray(condModel.value) && condModel.value.length === 2) {
          condModel.ruleType = 'between'
        }

        conds.push(condModel)
      } catch (e) {
        console.warn('[PageItem] condition processing error:', e)
        conds.push(JSON.parse(JSON.stringify(cond)))
      }
    }
    req.condition = conds
  }

  return req
})

// ============================================================
// comColMapRun: 字段映射（迁移自 pageItemComponentMixin）
// ============================================================
const comColMapRun = computed<Record<string, string>>(() => {
  const item = props.pageItem as any
  let jsons = item?.com_para_with_map_json || item?.cols_map_json
  if (!jsons && item?.cols_map_json?.cols_map_detail_json?.length) {
    jsons = item.cols_map_json
  }

  const maps: Record<string, string> = {}

  if (Array.isArray(jsons) && jsons.length > 0) {
    for (const p of jsons) {
      const src = p.src_map
      maps[p.para] = p.para
      if (Array.isArray(src)) {
        for (const s of src) {
          maps[p.para] = s.col_from
        }
      }
    }
  } else if (jsons && typeof jsons === 'object' && jsons?.cols_map_detail_json) {
    for (const p of jsons.cols_map_detail_json) {
      maps[p.col_to] = p.col_from
    }
  }

  return maps
})

// ============================================================
// cardGroup: cellsLayout 计算（迁移自 card-group.vue）
// ============================================================
const cardGroupLayoutJson = computed(() => {
  const item = props.pageItem as any
  return item?.card_group_json?.card_layout_json || {}
})

const cardGroupCellsLayout2 = computed(() => {
  const result = getCardGroupCellsLayout()
  if (import.meta.client && result?.length) console.log("[PageItem] cardGroupCellsLayout", result.length, "cells, first parts_json:", result[0]?.parts_json?.length || 0)
  return result
})
const cardGroupCellsLayout = computed(() => {
  const item = props.pageItem as any
  const cfgfrom = item?.card_unit_cfg_from
  let cells: any[] = []

  switch (cfgfrom) {
    case '静态配置':
    case '静态自有配置':
      cells = item?.card_unit_merge_json ||
        (item?.card_group_json?.card_unit_json
          ? [item.card_group_json.card_unit_json]
          : [])
      break
    case '模板动态加载':
      cells = item?.card_group_json?.card_unit_json
        ? [item.card_group_json.card_unit_json]
        : []
      break
    default:
      cells = item?.card_unit_merge_json ||
        (item?.card_group_json?.card_unit_json
          ? [item.card_group_json.card_unit_json]
          : [])
      break
  }
  return cells
})

// ============================================================
// cardGroup: cellData 获取（迁移自 card-group.vue getDatas）
// ============================================================
const cardGroupCellData = ref<Record<string, any>[]>([])
const cardGroupLoading = ref(false)

const cardGroupDatasfromType = computed(() => {
  const item = props.pageItem as any
  return item?.srv_req_type || ''
})

async function fetchCardGroupData() {
  const item = props.pageItem as any
  const req = srvReq.value
  const datasfromType = cardGroupDatasfromType.value

  try {
    if (datasfromType === '模拟数据') {
      const mock = item?.mock_srv_data_json || []
      cardGroupCellData.value = mock.map((x: any) => x)
      return
    }

    if ((req as any)?.serviceName) {
      cardGroupLoading.value = true
      const { select } = useHttp()
      const res = await select(req as any)
      cardGroupLoading.value = false

      if (res.ok && res.data && res.data.length > 0) {
        cardGroupCellData.value = res.data
      } else {
        cardGroupCellData.value = []
      }
    } else {
      cardGroupCellData.value = []
    }
  } catch (e) {
    console.error('[PageItem] cardGroup fetch error:', e)
    cardGroupCellData.value = []
    cardGroupLoading.value = false
  }
}

// ============================================================
// 卡片部件 (com_type === '卡片部件') 的 cellsLayout
// 使用 card_parts_json 作为单 cell 布局
// ============================================================
const cardPartCellsLayout = computed(() => {
  const item = props.pageItem as any
  const parts = item?.card_parts_json || item?.card_group_json?.card_unit_json
  return parts ? [{ parts_json: Array.isArray(parts) ? parts : [parts] }] : []
})

const cardPartCellData = computed(() => {
  // 卡片部件通常展示单条数据，若无 API 则用空对象占位
  return cardGroupCellData.value.length ? cardGroupCellData.value : [{}]
})

// ============================================================
// 数据加载回调
// ============================================================
function onDataLoaded(data: { count: number }) {
  emit('executor-complete', data)
}

function onCardGroupCellClick(data: unknown) {
  emit('executor-complete', data)
}

// ============================================================
// 生命周期：cardGroup/grid/卡片部件 类型需要拉取数据
// ============================================================
const needFetchData = computed(() => {
  return ['cardGroup', 'grid', '卡片部件'].includes(resolvedComType.value)
})

watch(() => srvReq.value, () => {
  if (needFetchData.value) fetchCardGroupData()
}, { deep: true })

onMounted(() => {
  if (needFetchData.value) fetchCardGroupData()
})
</script>

<style scoped>
.page-item {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: outline-color 0.15s;
}
.page-item.in-edit { cursor: pointer; min-height: 30px; }
.page-item.is-selected { outline: 2px solid #409eff; outline-offset: -1px; }
.page-item-toolbar {
  position: absolute; top: -28px; right: 0; z-index: 10;
  display: flex; align-items: center; gap: 4px;
  padding: 2px 8px; background: #409eff; color: #fff;
  border-radius: 4px 4px 0 0; font-size: 12px;
}
.toolbar-btn {
  display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border: none; background: transparent;
  color: #fff; cursor: pointer; border-radius: 2px;
}
.toolbar-btn:hover { background: rgba(255,255,255,0.2); }

.page-item__label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}
.page-item__label-text {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.more-btn {
  cursor: pointer;
  font-size: 12px;
  color: #999;
}
.more-btn:hover { color: var(--primary-color, #409eff); }

.page-item__content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
