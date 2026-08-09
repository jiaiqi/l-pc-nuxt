<template>
  <template v-if="partsShow">
    <!-- Text / String / Number / Amount / DateTime -->
    <div
      v-if="textPartTypes.includes(cellItem.parts_type || '')"
      class="bx-cell-string overflow-hidden text-ellipsis break-all"
      :class="{ 'cursor-pointer': isLink }"
      :style="partStyle"
      @click.stop="onClickPart"
    >
      {{ displayValue }}
    </div>

    <!-- Variable -->
    <div
      v-else-if="['variable', '变量'].includes(cellItem.parts_type || '')"
      class="bx-cell-variable"
      :class="{ 'cursor-pointer': isLink }"
      :style="partStyle"
      @click.stop="onClickPart"
    >
      {{ displayValue || '' }}
    </div>

    <!-- Image / iconImg -->
    <img
      v-else-if="['图片', 'iconImg'].includes(cellItem.parts_type || '')"
      :src="resolveImage(displayValue)"
      class="bx-text-cell w-full h-full"
      :class="{ 'cursor-pointer': isLink }"
      :style="[partStyle, { objectFit: scaleMode }]"
      decoding="async"
      @click.stop="onClickPart"
    />

    <!-- Icon (empty) -->
    <div
      v-else-if="iconPartTypes.includes(cellItem.parts_type || '') && !displayValue"
      :style="partStyle"
    />

    <!-- Icon (el-icon-* legacy) -->
    <i
      v-else-if="iconPartTypes.includes(cellItem.parts_type || '') && displayValue && String(displayValue).startsWith('el-icon-')"
      :class="[displayValue, { 'cursor-pointer': isLink }]"
      :style="partStyle"
      @click.stop="onClickPart"
    />

    <!-- Icon (UnoCSS iconify class) -->
    <i
      v-else-if="iconPartTypes.includes(cellItem.parts_type || '') && iconName"
      :class="[iconName, 'bx-cell-icon inline-block', { 'cursor-pointer': isLink }]"
      :style="partStyle"
      @click.stop="onClickPart"
    />

    <!-- Rich text -->
    <div
      v-else-if="cellItem.parts_type === '富文本'"
      class="bx-cell-rich-text"
      :style="partStyle"
      v-html="displayValue || ''"
    />

    <!-- Video -->
    <video
      v-else-if="cellItem.parts_type === '视频'"
      class="bx-cell-video w-full h-full bg-gray-300 object-cover"
      :controls="videoAttributes.controls"
      :muted="videoAttributes.muted"
      :loop="videoAttributes.loop"
      :autoplay="videoAttributes.autoplay"
      :poster="videoPoster"
      :src="resolveImage(displayValue)"
      :style="partStyle"
    />

    <!-- Progress bar -->
    <div
      v-else-if="['progress', '进度条'].includes(cellItem.parts_type || '')"
      class="progress-bar-container w-full flex items-center p-2.5"
      :style="partStyle"
    >
      <div class="progress-bar-wrapper w-full flex items-center gap-2">
        <div
          class="progress-bar-bg flex-1 rounded-full overflow-hidden"
          :style="{ height: `${cellItem.progress_bar_height || 12}px`, backgroundColor: cellItem.progress_bg_color || '#e4e7ed' }"
        >
          <div
            class="progress-bar-fill h-full rounded-full transition-all duration-300"
            :style="{ width: `${Math.min(100, Math.max(0, Number(displayValue) || 0))}%`, backgroundColor: cellItem.progress_color || '#409eff' }"
          />
        </div>
        <span v-if="cellItem.progress_show_text !== false" class="text-sm text-gray-600 whitespace-nowrap">
          {{ Math.round(Number(displayValue) || 0) }}{{ cellItem.progress_show_unit !== false ? (cellItem.progress_unit || '%') : '' }}
        </span>
      </div>
    </div>

    <!-- Rate / 星级评分 -->
    <div
      v-else-if="['rate', '星级评分'].includes(cellItem.parts_type || '')"
      class="bx-cell-rate inline-flex items-center gap-0.5"
      :style="partStyle"
    >
      <span
        v-for="n in 5"
        :key="n"
        class="text-lg"
        :class="n <= (Number(displayValue) || 0) ? 'text-yellow-400' : 'text-gray-300'"
      >★</span>
    </div>

    <!-- Countdown -->
    <div
      v-else-if="cellItem.parts_type === '倒计时'"
      :style="partStyle"
    >
      {{ countdownDisplay }}
    </div>

    <!-- Container types: row / block / 块容器 / 行容器 -->
    <div
      v-else-if="containerPartTypes.includes(cellItem.parts_type || '')"
      :class="['bx-cell-' + cellItem.parts_type, { 'cursor-pointer': isLink }]"
      :style="partStyle"
      @click.stop="onClickPart"
    >
      <!-- Recursively render sub_card_parts_json -->
      <template v-if="subJson.length > 0">
        <CardCellPart
          v-for="(subPart, subIdx) in subJson"
          :key="subPart.id || `sub-${subIdx}`"
          :cell-item="subPart"
          :cell-item-data="cellItemData"
          :cell-data="cellData"
          :cell-layout-json="subPart"
          :page-item="pageItem"
          :com-col-map="resolvedComColMap"
          :read-only="readOnly"
          :query-options="queryOptions"
          :page-params-model="pageParamsModel"
          @on-click-part="onClickPart"
          @on-click-cell="(d, l) => emit('onClickCell', d, l)"
          @refresh-component="emit('refresh-component')"
        />
      </template>
    </div>

    <!-- Fallback: render text if unknown type -->
    <div
      v-else
      :style="partStyle"
      class="bx-cell-unknown"
    >
      {{ displayValue || '' }}
    </div>
  </template>
</template>

<script setup lang="ts">
import { formatStyleData } from '~/utils/formatStyle'

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
  num_option?: string[]
  num_prefix?: string
  num_suffix?: string
  number_precision?: number
  num_decimal?: number
  progress_color?: string
  progress_bg_color?: string
  progress_show_text?: boolean
  progress_show_unit?: boolean
  progress_unit?: string
  progress_max_value?: number
  progress_bar_height?: number
  use_animation?: string
  animation_type?: string
  animation_direction?: string
  animation_duration?: number
  animation_delay?: number
  [key: string]: unknown
}

interface Props {
  cellItem: PartItem
  cellItemData: Record<string, unknown> | string
  cellData: Record<string, unknown>[]
  cellLayoutJson: PartItem | PartItem[]
  pageItem?: Record<string, unknown>
  comColMap?: Record<string, string> | null
  readOnly?: boolean
  queryOptions?: Record<string, unknown>
  pageParamsModel?: Record<string, unknown>
  activeCardIndex?: number
  cardIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  pageItem: () => ({}),
  comColMap: null,
  readOnly: false,
  queryOptions: () => ({}),
  pageParamsModel: () => ({}),
  activeCardIndex: 0,
  cardIndex: 0,
})

const emit = defineEmits<{
  onClickPart: [data?: unknown, part?: unknown, layout?: unknown]
  onClickCell: [data: unknown, layout?: unknown]
  refreshComponent: []
}>()

const { getImagePath } = useHttp()

// --- Constants ---
const textPartTypes = ['文本', '字符串', 'string', '数字', '金额', '时间日期']
const iconPartTypes = ['icon', '字体图标', '图标']
const containerPartTypes = ['块容器', '行容器', 'block', 'row']

// --- Computed ---
const resolvedComColMap = computed(() => {
  let map = props.comColMap || {}
  if (Object.keys(map).length === 0 && props.cellItemData && typeof props.cellItemData === 'object') {
    const itemData = props.cellItemData as Record<string, unknown>
    map = Object.keys(itemData).reduce((acc, key) => {
      acc[key] = key
      return acc
    }, {} as Record<string, string>)
  }
  return Object.keys(map).length > 0 ? map : null
})

const isLink = computed(() => {
  if (props.cellItem.sys_fun) {
    if (['拨打电话', '地图导航', '登录', '退出登录'].includes(props.cellItem.sys_fun)) return true
  }
  return !!props.cellItem.jump_json
})

const subJson = computed<PartItem[]>(() => {
  if (Array.isArray(props.cellItem.sub_card_parts_json)) return props.cellItem.sub_card_parts_json
  if (Array.isArray(props.cellItem.children)) return props.cellItem.children
  return []
})

const partStyle = computed(() => {
  const styleJson = props.cellItem.style_json || {}
  return formatStyleData(styleJson)
})

const scaleMode = computed(() => {
  const mode = props.cellItem.scale_mode
  const modeMap: Record<string, string> = {
    scaleToFill: 'fill',
    aspectFit: 'contain',
    aspectFill: 'cover',
    widthFix: 'scale-down',
  }
  return (mode && modeMap[mode]) || 'cover'
})

const videoAttributes = computed(() => {
  const attrs = props.cellItem.video_attribute || []
  return {
    autoplay: attrs.includes('自动播放'),
    controls: attrs.includes('控制面板') || attrs.includes('不允许下载') || attrs.includes('不允许全屏'),
    muted: attrs.includes('默认静音'),
    loop: attrs.includes('自动循环播放'),
    controlslist: [
      attrs.includes('不允许下载') ? 'nodownload' : '',
      attrs.includes('不允许全屏') ? 'nofullscreen' : '',
    ].filter(Boolean).join(',') || undefined,
  }
})

const videoPoster = computed(() => {
  let poster = props.cellItem.video_default_poster || ''
  if (props.cellItem.video_poster_field && props.cellItemData && typeof props.cellItemData === 'object') {
    poster = (props.cellItemData as Record<string, unknown>)[props.cellItem.video_poster_field] as string || poster
  }
  return poster ? getImagePath(poster) : ''
})

const iconName = computed(() => {
  if (!iconPartTypes.includes(props.cellItem.parts_type || '')) return ''
  const icon = String(displayValue.value || '')
  if (!icon) return ''
  // Convert various icon formats to UnoCSS iconify class names
  // e.g. "ri-home" → "i-ri-home", "ep:home" → "i-ep-home", "i-ri-home" stays
  if (icon.startsWith('i-')) return icon
  if (icon.startsWith('el-icon-')) return `i-ep-${icon.replace('el-icon-', '')}`
  if (icon.startsWith('ri-')) return `i-ri-${icon.replace('ri-', '')}`
  if (icon.includes(':')) return `i-${icon.replace(':', '-')}`
  return `i-${icon}`
})

const displayValue = computed(() => {
  return getPartModelData()
})

const partsShow = computed(() => {
  const item = props.cellItem
  const itemData = (props.cellItemData || {}) as Record<string, unknown>
  const map = resolvedComColMap.value || {}

  // 手风琴模式
  if (item.disp_flag === '显示' && item.disp_variable?.includes('手风琴')) {
    return props.cardIndex === props.activeCardIndex
  }

  // 登录状态显示/隐藏 — default to visible in new project
  if (item.disp_flag && item.disp_variable?.toLowerCase() === 'islogin') {
    return true
  }

  let show = true
  if (item.disp_flag === '显示' && item.disp_variable && item.disp_variable in map) {
    show = false
    const val = itemData[map[item.disp_variable]] || props.queryOptions[map[item.disp_variable]] || null
    let dispValue = item.disp_compare_value || null
    if (dispValue === 'notnull') {
      show = !!val
    } else if (dispValue && val) {
      const dispArr = dispValue.split(',')
      if (dispArr.includes(String(val))) show = true
    }
  } else if (item.disp_flag === '隐藏' && item.disp_variable && item.disp_variable in map) {
    show = true
    const val = itemData[map[item.disp_variable]] || props.queryOptions[map[item.disp_variable]] || null
    let dispValue = item.disp_compare_value || null
    if (['null', 'false'].includes(dispValue || '')) {
      show = !!val
    } else if (dispValue && val) {
      const dispArr = dispValue.split(',')
      if (dispArr.includes(String(val))) show = false
    }
  }
  return show
})

// --- Countdown ---
const countdownDisplay = ref('00日00时00分00秒')
let countdownTimer: ReturnType<typeof setInterval> | null = null
let countdownTarget = 0

function computeCountdownMs(rawVal: unknown): number {
  if (!rawVal) return 0
  const raw = String(rawVal).trim()
  const target = new Date(raw)
  if (isNaN(target.getTime())) return 0
  return target.getTime() - Date.now()
}

function updateCountdown() {
  const ms = Math.max(0, countdownTarget - Date.now())
  const total = ms
  const day = Math.floor(total / (24 * 60 * 60 * 1000))
  const hour = Math.floor((total % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minute = Math.floor((total % (60 * 60 * 1000)) / (60 * 1000))
  const second = Math.floor((total % (60 * 1000)) / 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  countdownDisplay.value = `${pad(day)}日${pad(hour)}时${pad(minute)}分${pad(second)}秒`
  if (ms <= 0 && countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function startCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  const ms = computeCountdownMs(displayValue.value)
  if (ms <= 0) {
    countdownDisplay.value = '00日00时00分00秒'
    return
  }
  countdownTarget = Date.now() + ms
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
}

// --- Methods ---
function getPartModelData(): unknown {
  const item = props.cellItem
  const itemData = (props.cellItemData || {}) as Record<string, unknown>
  const map = resolvedComColMap.value || {}
  const type = item.parts_type || ''
  let key = item.variable || null
  let val: unknown = item.parts_text

  // Handle row[col=val].field expressions
  if (key && key.includes('row[')) {
    const match = key.match(/row\[(.*?)=(.*?)\]\.(.*)/)
    if (match) {
      const [, col1, val1, col2] = match
      if (Array.isArray(props.cellData)) {
        const found = props.cellData.find((row) => row[col1] === val1)
        if (found) val = found[col2]
      }
    }
  }

  // Type-specific defaults
  if (type === 'iconImg' || type === '图片') {
    val = item.parts_img
  } else if (type === 'icon' || type === '字体图标') {
    val = item.parts_icon || val
  }

  // User field mapping (user.xxx)
  if (key && key.startsWith('user.')) {
    key = key.replace('user.', '')
  }

  // Data mapping with comColMap
  if (key && itemData && map) {
    const optionsType = item.sys_fun || ''

    if (optionsType === '下载' || optionsType === '预览') {
      if (key in map && itemData[map[key]]) {
        val = itemData[map[key]]
      } else if (itemData[key]) {
        val = itemData[key]
      } else {
        val = undefined
      }
    } else if (optionsType === '拨打电话') {
      const phoneKey = item.para_phone_col || item.variable || ''
      if (phoneKey && phoneKey in map && itemData[map[phoneKey]]) {
        val = itemData[map[phoneKey]]
      } else if (phoneKey && itemData[phoneKey]) {
        val = itemData[phoneKey]
      }
    } else if (optionsType === '地图导航') {
      const lgtKey = item.para_map_lon
      const latKey = item.para_map_lat
      const lgt = (lgtKey && lgtKey in map && itemData[map[lgtKey]]) || (lgtKey && itemData[lgtKey])
      const lat = (latKey && latKey in map && itemData[map[latKey]]) || (latKey && itemData[latKey])
      val = (lgt && lat) ? { lgt, lat } : null
    } else {
      // Default: comColMap → itemData → queryOptions → template string
      if (item.variable && key && key in map && itemData[map[key]]) {
        val = itemData[map[key]] || ''
      } else if (item.variable && key && itemData[key]) {
        val = itemData[key] || ''
      } else if (item.variable && key && props.queryOptions[key]) {
        val = props.queryOptions[key] || ''
      } else if (['string', '时间日期'].includes(type) && item.parts_text) {
        val = renderTemplate(item.parts_text, itemData)
      }
    }
  } else if (key && itemData && !map) {
    if (item.variable && key && itemData[key]) {
      val = itemData[key] || ''
    } else if (item.variable && key && props.queryOptions[key]) {
      val = props.queryOptions[key] || ''
    } else if (['string', '时间日期'].includes(type) && item.parts_text) {
      val = renderTemplate(item.parts_text, itemData)
    }
  }

  // Date formatting
  if (type === '时间日期' && item.date_format_rule && val) {
    const d = new Date(String(val))
    if (!isNaN(d.getTime())) {
      val = formatDate(d, item.date_format_rule)
    }
  }

  // Desensitization
  if (val && typeof val === 'string' && item.more_options?.includes('中间4位脱敏')) {
    val = desensitize(val)
  }

  return val
}

function renderTemplate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\$\{(\w+)\}/g, (_, key) => {
    return String(data[key] ?? '')
  })
}

function formatDate(date: Date, format: string): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const map: Record<string, string> = {
    'YYYY': String(date.getFullYear()),
    'MM': pad(date.getMonth() + 1),
    'DD': pad(date.getDate()),
    'HH': pad(date.getHours()),
    'mm': pad(date.getMinutes()),
    'ss': pad(date.getSeconds()),
  }
  let result = format
  for (const [token, val] of Object.entries(map)) {
    result = result.replace(new RegExp(token, 'g'), val)
  }
  return result
}

function desensitize(val: string): string {
  const digits = val.match(/\d/g)
  if (!digits || digits.length < 4) return val
  const total = digits.length
  if (total === 11) {
    return val.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  } else if (total > 6) {
    const prefix = Math.ceil(total / 3)
    const suffix = Math.ceil(total / 3)
    let idx = 0
    return val.replace(/\d/g, (match) => {
      const pos = idx++
      if (pos >= prefix && pos < total - suffix) return '*'
      return match
    })
  } else {
    let idx = 0
    return val.replace(/\d/g, (match) => {
      const pos = idx++
      if (pos > 0 && pos < total - 1) return '*'
      return match
    })
  }
}

function resolveImage(val: unknown): string {
  if (!val) return ''
  const s = String(val)
  if (s.startsWith('http') || s.startsWith('data:image')) return s
  return getImagePath(s)
}

function onClickPart() {
  const itemData = props.cellItemData
  const subCol = props.cellItem

  if (props.readOnly) return

  // Close popup
  if (subCol.sys_fun === '关闭弹窗') {
    emit('onClickPart', itemData, subCol, props.cellLayoutJson)
    return
  }

  // Login/logout
  if (subCol.sys_fun === '登录' || subCol.sys_fun === '退出登录') {
    emit('onClickPart', itemData, subCol, props.cellLayoutJson)
    return
  }

  // No sys_fun and no jump_json → bubble up
  if ((!subCol.sys_fun || subCol.sys_fun === '无') && !subCol.jump_json) {
    emit('onClickPart', itemData, subCol, props.cellLayoutJson)
    return
  }

  // Jump handling
  if (subCol.jump_json) {
    const jumpJson = subCol.jump_json as Record<string, unknown>
    const clickType = jumpJson.click_type as string

    if (clickType === '弹框') {
      emit('onClickCell', itemData, props.cellLayoutJson)
    } else {
      // Navigate
      const tmplPageJson = jumpJson.tmpl_page_json as Record<string, unknown> | undefined
      const filePath = tmplPageJson?.file_path as string
      if (filePath) {
        let path = filePath
        const destPageNo = jumpJson.dest_page_no as string
        if (destPageNo) {
          path = path.replace(':pageNo', destPageNo)
        }
        // Handle cols_map for URL params
        const colsMap = jumpJson.cols_map_json as Record<string, unknown> | undefined
        const colsMapDetail = colsMap?.cols_map_detail_json as Array<Record<string, unknown>> | undefined
        if (Array.isArray(colsMapDetail) && itemData && typeof itemData === 'object') {
          colsMapDetail.forEach((cm) => {
            if (cm.to_type === 'URL' && ['当前数据', '业务', '模型'].includes(cm.from_type as string)) {
              const colFrom = cm.col_from as string
              const colTo = cm.col_to as string
              const data = itemData as Record<string, unknown>
              if (data[colFrom]) {
                path += path.includes('?') ? `&${colTo}=${data[colFrom]}` : `?${colTo}=${data[colFrom]}`
              }
            }
          })
        }
        if (import.meta.client) {
          window.open(path)
        }
      }
    }
    return
  }

  // sys_fun handling
  const optionsType = subCol.sys_fun || ''
  if (optionsType === '拨打电话') {
    const phoneVal = itemData && typeof itemData === 'object'
      ? (itemData as Record<string, unknown>)[subCol.para_phone_col || '']
      : ''
    if (phoneVal && import.meta.client) {
      window.location.href = `tel:${phoneVal}`
    }
  } else if (optionsType === '发短信') {
    const phoneVal = displayValue.value
    if (phoneVal && import.meta.client) {
      window.location.href = `sms:${phoneVal}`
    }
  } else if (optionsType?.includes('刷新组件请求')) {
    emit('refresh-component')
  }
}

// --- Lifecycle ---
onMounted(() => {
  if (props.cellItem.parts_type === '倒计时') {
    startCountdown()
  }
})

onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})

// Watch for countdown value changes
watch(displayValue, () => {
  if (props.cellItem.parts_type === '倒计时') {
    startCountdown()
  }
})
</script>

<style scoped>
.bx-cell-string {
  text-align: justify;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}
.bx-cell-string.cursor-pointer:hover,
.bx-cell-variable.cursor-pointer:hover,
.bx-cell-icon.cursor-pointer:hover {
  color: var(--primary-color, #409eff);
}
.bx-cell-rich-text :deep(img),
.bx-cell-rich-text :deep(svg),
.bx-cell-rich-text :deep(video),
.bx-cell-rich-text :deep(canvas),
.bx-cell-rich-text :deep(audio),
.bx-cell-rich-text :deep(iframe),
.bx-cell-rich-text :deep(embed),
.bx-cell-rich-text :deep(object) {
  display: inline-block;
}
.bx-cell-video {
  background-color: #ccc;
  object-fit: cover;
}
</style>
