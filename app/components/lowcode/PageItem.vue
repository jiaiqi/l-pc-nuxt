<template>
  <div
    class="page-item"
    :class="{
      'view-mode': isView,
      'preview-mode': isPreview,
      'in-edit': inEdit && !isView && !isPreview,
      'is-selected': currentId === id,
      'force-login-required': forceLogin,
    }"
    :style="pageItemStyle"
    :id="comName"
    ref="pageItemRef"
  >
    <!-- 编辑态：选中边框 + 操作手柄 -->
    <div
      v-if="inEdit && !isView && !isPreview && currentId === id"
      class="page-item-toolbar"
    >
      <span class="text-xs">{{ comName || '组件' }}</span>
      <div class="flex items-center gap-1">
        <button class="toolbar-btn" @click.stop="$emit('delete', props)" title="删除">
          <span class="i-ri-delete-bin-line" />
        </button>
      </div>
    </div>

    <!-- 组件内容 -->
    <slot>
      <WidgetDispatcher
        v-if="widgetType"
        :widget-type="widgetType"
        :page-item="pageItem"
        :page-config="pageConfig"
        :page-no="pageNo"
        @theme-change="handleThemeChange"
        @resize="emit('resize', $event)"
      />
      <div v-else class="text-xs text-gray-400 text-center py-4">
        {{ comName || '未配置组件类型' }}
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  id?: string
  comName?: string
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

const pageItemRef = ref<HTMLElement | null>(null)

const forceLogin = computed(() => {
  return (props.pageItem?.com_option as string)?.includes('强制登录')
})

// 从 pageItem 中提取 widget 类型
const widgetType = computed(() => {
  const json = props.pageItem?.widget_json as Record<string, unknown> | undefined
  if (!json) return null
  const type = json.widget_type as string
  if (type === '系统按钮') {
    return (json.button_cfg_json as { sys_button_type?: string })?.sys_button_type || type
  }
  return type
})

const pageItemStyle = computed(() => {
  const style: Record<string, string> = { position: 'relative' }
  if (props.contentWidth) {
    style.width = props.contentWidth
  }
  return { ...style, ...(props.style || {}) }
})

function handleThemeChange(value: string) {
  const theme = useThemeStore()
  theme.setCurrentTheme(value)
}
</script>

<style scoped>
.page-item {
  position: relative;
  transition: outline-color 0.15s;
}
.page-item.in-edit {
  cursor: pointer;
  min-height: 30px;
}
.page-item.is-selected {
  outline: 2px solid #409eff;
  outline-offset: -1px;
}
.page-item-toolbar {
  position: absolute;
  top: -28px;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: #409eff;
  color: #fff;
  border-radius: 4px 4px 0 0;
  font-size: 12px;
}
.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  border-radius: 2px;
}
.toolbar-btn:hover { background: rgba(255,255,255,0.2); }
</style>
