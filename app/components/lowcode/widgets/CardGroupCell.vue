<template>
  <div
    class="card-group-cell relative flex-1"
    :style="containerStyle"
  >
    <!-- Grid container -->
    <div class="card-grid" :style="gridStyle">
      <template v-for="(cellItemData, index) in cellDataFinal" :key="index">
        <div
          v-for="(cellLayoutJson, i) in cellsLayout"
          :key="i"
          class="bx-card-cell relative h-full"
          :class="getCellClasses(cellLayoutJson, index)"
          :style="getCellStyles(cellLayoutJson)"
          @click="onClickCell(cellItemData, cellLayoutJson)"
          @mouseenter="setActiveCardIndex(index)"
          @mouseleave="activeCardAutoplay"
        >
          <!-- Recursively render parts_json -->
          <CardCellPart
            v-for="(part, n) in (cellLayoutJson?.parts_json || [])"
            :key="part.id || `part-${n}`"
            :cell-item="part"
            :cell-item-data="cellItemData"
            :cell-data="cellDataRun"
            :cell-layout-json="cellLayoutJson"
            :page-item="pageItem"
            :com-col-map="comColMap"
            :read-only="readOnly"
            :query-options="queryOptions"
            :page-params-model="pageParamsModel"
            :active-card-index="activeCardIndex"
            :card-index="index"
            @on-click-part="onClickPart"
            @on-click-cell="onClickCell"
            @refresh-component="$emit('refresh-component')"
          />
        </div>
      </template>
    </div>

    <!-- Empty state -->
    <div
      v-if="!cellDataFinal.length"
      class="text-center text-gray-400 text-sm py-8"
    >
      暂无数据
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatStyleData } from '~/utils/formatStyle'
import CardCellPart from './CardCellPart.vue'

interface PartItem {
  id?: string
  parts_type?: string
  parts_text?: string
  parts_img?: string
  parts_icon?: string
  variable?: string
  opt_value_col?: string
  style_json?: Record<string, unknown>
  active_style_json?: Record<string, unknown>
  sub_card_parts_json?: PartItem[]
  children?: PartItem[]
  jump_json?: Record<string, unknown>
  sys_fun?: string
  background_image?: string
  scale_mode?: string
  img_dpi?: string | number
  img_amount_limit?: string
  date_format_rule?: string
  date_value_format?: string
  video_attribute?: string[]
  video_default_poster?: string
  video_poster_field?: string
  disp_flag?: string
  disp_variable?: string
  disp_compare_value?: string
  para_phone_col?: string
  para_map_lon?: string
  para_map_lat?: string
  more_options?: string[]
  child_use_animation?: string
  child_animation_type?: string
  child_animation_step?: string
  child_animation_direction?: string
  child_animation_interval?: number
  child_animation_delay?: number
  num_option?: string[]
  num_prefix?: string
  num_suffix?: string
  number_precision?: number
  num_decimal?: number
  chart_json?: Record<string, unknown>
  srv_req_json?: Record<string, unknown>
  use_animation?: string
  animation_type?: string
  animation_direction?: string
  animation_duration?: number
  animation_delay?: number
  animation_repeat?: number
  animation_easing?: string
  progress_color?: string
  progress_bg_color?: string
  progress_show_text?: boolean
  progress_show_unit?: boolean
  progress_unit?: string
  progress_max_value?: number
  progress_bar_height?: number
  progress_label?: string
  progress_label_color?: string
  progress_label_font_size?: string
  progress_text_color?: string
  progress_font_size?: string
  prog_stroke_width?: number
  wave_color?: string
  wave_bg_color?: string
  wave_outline_color?: string
  wave_font_size?: string
  enable_date_start?: string
  enable_date_end?: string
  form_srv?: string
  [key: string]: unknown
}

interface CellLayout {
  id?: string
  parts_json?: PartItem[]
  jump_json?: Record<string, unknown>
  style_json?: Record<string, unknown>
  style_json_diy?: Record<string, unknown>
  background_image?: string
  layout_type?: string
  rows_max?: number | string
  cols_num?: number
  child_use_animation?: string
  child_animation_type?: string
  child_animation_step?: string
  child_animation_direction?: string
  child_animation_interval?: number
  child_animation_delay?: number
  [key: string]: unknown
}

interface CardLayout {
  rows_max?: number | string
  cols_num?: number
  layout_type?: string
  style_json?: Record<string, unknown>
  style_json_diy?: Record<string, unknown>
  [key: string]: unknown
}

interface ListConfig {
  use_animation?: string
  animation_type?: string
  child_animation_type?: string
  animation_step?: string
  animation_direction?: string
  animation_interval?: number
  animation_delay?: number
  [key: string]: unknown
}

interface Props {
  pageItem?: Record<string, unknown>
  cellsLayout?: CellLayout[]
  activeCellLayout?: CellLayout | null
  cellData?: Record<string, unknown>[] | Record<string, unknown>
  comColMap?: Record<string, string> | null
  cardLayout?: CardLayout
  rowButtons?: unknown[]
  readOnly?: boolean
  isVerticalScroll?: boolean
  displayRowLimit?: number
  listConfig?: ListConfig | null
  queryOptions?: Record<string, unknown>
  pageParamsModel?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  pageItem: () => ({}),
  cellsLayout: () => [],
  activeCellLayout: null,
  cellData: () => [],
  comColMap: null,
  cardLayout: () => ({}),
  rowButtons: () => [],
  readOnly: false,
  isVerticalScroll: false,
  displayRowLimit: 5,
  listConfig: null,
  queryOptions: () => ({}),
  pageParamsModel: () => ({}),
})

const emit = defineEmits<{
  onClickCell: [data: unknown, layout?: unknown]
  onClickBlock: [data: unknown]
  onRowButtonClick: [btn: unknown, row: unknown]
  setPageParams: [key: string, val: unknown]
  refreshComponent: []
}>()

const { getImagePath } = useHttp()

// --- State ---
const activeCardIndex = ref(0)
let autoplayTimer: ReturnType<typeof setInterval> | null = null

// --- Computed ---
const inList = computed(() => props.pageItem?.com_type === 'list')

const showActiveCard = computed(() => {
  return !!(props.activeCellLayout?.parts_json?.length)
})

const cellDataRun = computed(() => {
  const data = props.cellData
  if (data && !Array.isArray(data)) return [data]
  if (Array.isArray(data) && data.length > 0) return data
  if (props.pageItem?.com_type !== 'list') return [{} as Record<string, unknown>]
  return data || []
})

const totalMaximum = computed(() => {
  const config = props.cardLayout || {}
  const rowsMax = Number(config.rows_max)
  const maxPageRowNumber = (props.pageItem?.srv_req_json as Record<string, unknown>)?.page
    ? ((props.pageItem?.srv_req_json as Record<string, unknown>).page as Record<string, unknown>)?.rownumber as number
    : 9
  let maximum = config?.rows_max && config?.cols_num
    ? rowsMax * (config.cols_num as number)
    : maxPageRowNumber
  if (config.rows_max === '0' || config.rows_max === '全部') {
    maximum = maxPageRowNumber
  }
  return maximum
})

const cellDataFinal = computed(() => {
  if (import.meta.client) console.log("[CardGroupCell] cellDataFinal", { cellsLayoutLength: props.cellsLayout?.length, cellDataLength: Array.isArray(props.cellData) ? props.cellData.length : "non-array", partsCount: props.activeCellLayout?.parts_json?.length || props.cellsLayout?.[0]?.parts_json?.length || 0 })
  
  const res = JSON.parse(JSON.stringify(cellDataRun.value))
  const max = totalMaximum.value
  if (max && Array.isArray(res)) return res.slice(0, max)
  return res
})

const childAnimationType = computed(() => {
  return props.listConfig?.use_animation === '是'
    && (props.listConfig?.animation_type || props.listConfig?.child_animation_type)
})

const childAnimationConfig = computed(() => {
  if (props.listConfig?.use_animation !== '是') return {}
  const type = props.listConfig?.animation_type
    || props.listConfig?.child_animation_type
    || '跑马灯'
  const defaultDirection = type === '纵向滚动' ? '向上' : '由左往右'
  return {
    type,
    step: props.listConfig?.animation_step || '100',
    direction: props.listConfig?.animation_direction || defaultDirection,
    interval: (props.listConfig?.animation_interval || 1) * 1000,
    delay: (props.listConfig?.animation_delay || 0) * 1000,
  }
})

const gridStyle = computed(() => {
  const style: Record<string, string> = {}
  const config = props.cardLayout || { rows_max: 1, cols_num: 1 }
  const height = config.style_json?.height ?? 'auto'
  const configStyle = config.style_json || {}

  if (config.layout_type === '表格') {
    style.display = 'grid'
    if (config.rows_max) {
      style['grid-template-rows'] = `repeat(${config.rows_max}, ${height})`
    }
    style['grid-template-columns'] = `repeat(${config.cols_num || 1}, 1fr)`
  }

  for (const key in configStyle) {
    const val = (configStyle as Record<string, unknown>)[key]
    if (val) style[key.replace(/_/g, '-')] = String(val)
  }

  if (!('gap' in style)) style.gap = '5px'
  const diy = config.style_json_diy || {}
  if ('gap' in diy) style.gap = String(diy.gap)
  if ('column-gap' in diy) style['column-gap'] = String(diy['column-gap'])
  if ('row-gap' in diy) style['row-gap'] = String(diy['row-gap'])
  style.margin = '0'
  return style
})

const containerStyle = computed(() => {
  const style: Record<string, string> = {}
  const cardLayout = props.cardLayout || {}
  const styleJson = (cardLayout.style_json || {}) as Record<string, unknown>
  for (const key in styleJson) {
    const val = styleJson[key]
    if (val) style[key.replace(/_/g, '-')] = String(val)
  }
  return style
})

// --- Methods ---
function setActiveCardIndex(index: number) {
  if (autoplayTimer) clearInterval(autoplayTimer)
  activeCardIndex.value = index
}

function activeCardAutoplay() {
  const direction = childAnimationConfig.value?.direction
  if (autoplayTimer) clearInterval(autoplayTimer)
  if (!childAnimationType.value) return
  autoplayTimer = setInterval(() => {
    const listLength = cellDataFinal.value.length || 0
    if (!listLength) return
    if (direction === '由上至下') {
      activeCardIndex.value = (activeCardIndex.value + 1) % listLength
    } else if (direction === '由下至上') {
      activeCardIndex.value = (activeCardIndex.value - 1 + listLength) % listLength
    }
  }, childAnimationConfig.value?.interval || 3000)
}

function getLayoutJson(layout: CellLayout, index: number): CellLayout {
  if (showActiveCard.value && activeCardIndex.value === index && props.activeCellLayout) {
    return props.activeCellLayout
  }
  return layout
}

function getCellClasses(layout: CellLayout, index: number): Record<string, boolean> {
  const classes: Record<string, boolean> = {
    'is-link': !!layout.jump_json,
    'list-item': inList.value,
  }
  if (showActiveCard.value && activeCardIndex.value === index) {
    classes.checked = true
  }
  return classes
}

function getCellStyles(layout: CellLayout): Record<string, string> {
  const styleJson = layout.style_json || {}
  let style = formatStyleData(styleJson)
  const bgImg = layout.background_image || (styleJson.background_image as string) || ''
  if (bgImg) {
    style['background-image'] = `url(${getImagePath(bgImg)})`
    style['background-size'] = '100% 100%'
    style['background-repeat'] = 'no-repeat'
  }
  if (bgImg && !style['min-height']) {
    style['min-height'] = '60px'
  }
  return style
}

function onClickCell(data: unknown, layout?: unknown) {
  if (props.readOnly) return
  emit('onClickCell', data, layout)
}

function onClickPart(data: unknown, part?: unknown, layout?: unknown) {
  if (props.readOnly) return
  // Bubble up to parent
  emit('onClickCell', data, layout)
}

onMounted(() => {
  if (childAnimationType.value?.includes('焦点') && childAnimationType.value?.includes('轮播')) {
    activeCardIndex.value = 0
    activeCardAutoplay()
  }
})

onBeforeUnmount(() => {
  if (autoplayTimer) clearInterval(autoplayTimer)
})
</script>

<style scoped>
.card-group-cell {
  position: relative;
}
.card-grid {
  display: grid;
}
.bx-card-cell {
  height: 100%;
  position: relative;
  transition: all 0.3s ease;
}
.bx-card-cell.is-link {
  cursor: pointer;
}
.bx-card-cell.is-link:hover {
  transform: scale(0.99);
}
.bx-card-cell.list-item {
  border: 1px solid transparent;
  transition: border-color 0.3s ease;
}
.bx-card-cell.list-item:hover {
  border-color: #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.bx-card-cell.checked {
  border: 2px solid transparent;
  border-color: var(--primary-color, #007aff);
  box-shadow: 0 0 0 1px var(--primary-color, #007aff);
}
</style>
