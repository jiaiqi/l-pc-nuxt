<template>
  <!-- 视频 -->
  <video
    v-if="widgetType === '视频'"
    :src="fileUrl"
    :controls="videoAttr.controls"
    :muted="videoAttr.muted"
    :loop="videoAttr.loop"
    :autoplay="videoAttr.autoplay"
    :poster="videoPoster"
    :controlslist="videoAttr.controlslist"
    class="max-w-full"
    :style="widgetStyle"
  />

  <!-- 文本 -->
  <div v-else-if="widgetType === '文本'" :style="widgetStyle">
    {{ widgetJson?.init_val || '' }}
  </div>

  <!-- 富文本 -->
  <div
    v-else-if="widgetType === '富文本'"
    class="rich-text"
    :style="widgetStyle"
    v-html="initRichText"
  />

  <!-- 导航按钮 -->
  <div
    v-else-if="widgetType === 'navigate'"
    class="flex-center cursor-pointer bg-blue-500 text-white rounded-lg min-h-30px transition hover:scale-105 active:scale-110"
    :style="widgetStyle"
    @click="handleNavigate"
  >
    {{ buttonLabel }}
  </div>

  <!-- 时间日期 -->
  <div v-else-if="widgetType === '时间日期'" :style="widgetStyle" class="text-lg font-mono">
    {{ currentTime }}
  </div>

  <!-- 全屏切换 -->
  <div
    v-else-if="widgetType === 'fullscreen'"
    class="cursor-pointer text-3xl"
    :style="widgetStyle"
    @click="toggleFullscreen"
  >
    <span v-if="isFullscreen" class="i-ri-fullscreen-exit-line" title="退出全屏" />
    <span v-else class="i-ri-fullscreen-line" title="全屏" />
  </div>

  <!-- 天气 -->
  <div v-else-if="widgetType === '天气'" class="text-sm text-gray-500">
    天气组件 (待迁移)
  </div>

  <WeatherWidget v-else-if="widgetType === '天气'" />
  <div v-else class="text-xs text-gray-400 p-2">未知控件: {{ widgetType }}</div>
</template>

<script setup lang="ts">
const props = defineProps<{
  widgetType?: string | null
  pageItem?: Record<string, unknown>
  pageConfig?: Record<string, unknown> | null
  pageNo?: string
}>()

const emit = defineEmits<{
  'theme-change': [value: string]
  resize: []
}>()

// 时间显示
const currentTime = ref('')
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (props.widgetType === '时间日期') {
    updateTime()
    timer = setInterval(updateTime, 1000)
  }
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

function updateTime() {
  currentTime.value = new Date().toLocaleString('zh-CN')
}

// widget JSON
const widgetJson = computed(() => props.pageItem?.widget_json as Record<string, unknown> | undefined)
const widgetStyle = computed(() => ({})) // 后续迁移 formatStyleData

const initRichText = computed(() =>
  (widgetJson.value?.init_mtext as string) || (widgetJson.value?.init_val as string) || ''
)

const buttonLabel = computed(() =>
  ((widgetJson.value?.button_cfg_json as { btn_label?: string })?.btn_label) || '按钮'
)

// 视频
const fileUrl = computed(() => {
  const attachment = widgetJson.value?.attachment as string
  const initVal = widgetJson.value?.init_val as string
  if (attachment) return resolveFileUrl(attachment)
  if (initVal) return resolveFileUrl(initVal)
  return ''
})

const videoPoster = computed(() => {
  const thumbnail = widgetJson.value?.thumbnail as string
  return thumbnail ? resolveFileUrl(thumbnail) : ''
})

const videoAttr = computed(() => {
  const attr = (widgetJson.value?.video_attribute as string) || ''
  return {
    autoplay: attr.includes('自动播放'),
    controls: attr.includes('控制面板') || attr.includes('不允许下载') || attr.includes('不允许全屏'),
    muted: attr.includes('默认静音'),
    loop: attr.includes('自动循环播放'),
    controlslist: [
      attr.includes('不允许下载') ? 'nodownload' : '',
      attr.includes('不允许全屏') ? 'nofullscreen' : '',
    ].filter(Boolean).join(','),
  }
})

function resolveFileUrl(no: string): string {
  if (!no) return ''
  if (no.startsWith('http')) return no
  if (no.startsWith('data:')) return no
  return `${useEnv().gateway.value}/file/download?fileNo=${no}`
}

// 全屏
const isFullscreen = ref(false)

function toggleFullscreen() {
  if (!import.meta.client) return
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

function handleNavigate() {
  const json = widgetJson.value
  const jumpJson = (json?.jump_json || (json?.button_cfg_json as Record<string, unknown>)?.jump_json) as {
    dest_page_no?: string
    obj_type?: string
  } | undefined
  if (jumpJson?.dest_page_no && props.pageNo) {
    window.open(location.href.replace(props.pageNo, jumpJson.dest_page_no))
  }
}

// 监听全屏变化
if (import.meta.client) {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
}
</script>
