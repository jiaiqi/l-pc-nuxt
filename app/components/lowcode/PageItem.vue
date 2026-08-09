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
    <div
      v-if="inEdit && !isView && !isPreview && currentId === id"
      class="page-item-toolbar"
    >
      <span class="text-xs">{{ comName || '组件' }}</span>
      <button class="toolbar-btn" @click.stop="$emit('delete', $props)" title="删除">
        <span class="i-ri-delete-bin-line" />
      </button>
    </div>

    <!-- 根据 com_type 分发到具体 Widget -->
    <CardGroupCell
      v-if="comType === 'cardGroup'"
      :page-item="pageItem"
      @on-click-cell="(cell: any) => emit('executor-complete', cell)"
    />

    <ListWidget
      v-if="comType === 'list'"
      :page-item="pageItem"
      :query-options="queryOptions"
      :page-params-model="pageParamsModel"
      @data-loaded="(d: any) => emit('executor-complete', d)"
    />

    <ChartWidget
      v-else-if="comType === 'chart'"
      :page-item="pageItem"
      :query-options="queryOptions"
      :page-params-model="pageParamsModel"
    />

    <CardGroupCell
      v-else-if="cardGroupConfig"
      :page-item="pageItem"
    />

    <CurrentInfo
      v-else-if="currentInfoConfig"
      :page-item="pageItem"
    />

    <NoticeBar
      v-else-if="noticeBarConfig"
      :page-item="pageItem"
    />

    <VideoCard
      v-else-if="videoCardConfig"
      :page-item="pageItem"
    />

    <QrCodeWidget
      v-else-if="qrCodeConfig"
      :page-item="pageItem"
    />

    <WeatherWidget
      v-else-if="weatherConfig"
    />

    <DescriptionsList
      v-else-if="descListConfig"
      :page-item="pageItem"
    />

    <TabsWidget
      v-else-if="tabsConfig"
      :page-item="pageItem"
    />

    <NavMenuWidget
      v-else-if="navMenuConfig"
      :page-item="pageItem"
    />

    <FormWidget
      v-else-if="formConfig"
      :page-item="pageItem"
    />

    <!-- 通用控件 -->
    <WidgetDispatcher
      v-else-if="widgetType"
      :widget-type="widgetType"
      :page-item="pageItem"
      :page-config="pageConfig"
      :page-no="pageNo"
    />

    <!-- 默认：显示组件信息 -->
    <div v-else class="text-xs text-gray-400 text-center py-4">
      {{ comName || comType || '未配置' }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
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
}>()

const emit = defineEmits<{
  click: [data: any]
  add: [data: any]
  delete: [data: any]
  resize: [data: any]
  'layout-resize': [data: any]
  'executor-complete': [data: any]
}>()

const widgetType = computed(() => {
  const json = props.pageItem?.widget_json as Record<string, unknown> | undefined
  if (!json) return null
  const type = json.widget_type as string
  return type === '系统按钮'
    ? ((json.button_cfg_json as any)?.sys_button_type || type)
    : type
})

const tabsConfig = computed(() => props.pageItem?.tabs_json)
const navMenuConfig = computed(() => props.pageItem?.nav_menu_json)
const cardGroupConfig = computed(() => props.pageItem?.card_group_json)
const currentInfoConfig = computed(() => props.pageItem?.current_info_json)
const noticeBarConfig = computed(() => props.pageItem?.notice_bar_json)
const videoCardConfig = computed(() => props.pageItem?.video_card_json)
const descListConfig = computed(() => props.pageItem?.desc_list_json)
const qrCodeConfig = computed(() => props.pageItem?.qr_code_json)
const weatherConfig = computed(() => props.pageItem?.weather_json)
const formConfig = computed(() => props.pageItem?.form_json)

const pageItemStyle = computed(() => {
  const style: Record<string, string> = { position: 'relative' }
  if (props.contentWidth) style.width = props.contentWidth
  return { ...style, ...(props.style || {}) }
})
</script>

<style scoped>
.page-item { position: relative; transition: outline-color 0.15s; }
.page-item.in-edit { cursor: pointer; min-height: 30px; }
.page-item.is-selected { outline: 2px solid #409eff; outline-offset: -1px; }
.page-item-toolbar { position: absolute; top: -28px; right: 0; z-index: 10; display: flex; align-items: center; gap: 4px; padding: 2px 8px; background: #409eff; color: #fff; border-radius: 4px 4px 0 0; font-size: 12px; }
.toolbar-btn { display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; border: none; background: transparent; color: #fff; cursor: pointer; border-radius: 2px; }
.toolbar-btn:hover { background: rgba(255,255,255,0.2); }
</style>
