<template>
  <div
    v-if="text"
    class="notice-bar flex items-center gap-2 px-4 py-2 text-sm overflow-hidden"
    :style="barStyle"
  >
    <span class="i-ri-notification-3-line text-base" />
    <span class="truncate">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  pageItem?: Record<string, unknown>
}>()

const config = computed(() => (props.pageItem?.notice_bar_json || {}) as Record<string, unknown>)
const text = computed(() => config.value?.text as string || config.value?.init_val as string || '')
const barStyle = computed(() => ({
  backgroundColor: (config.value?.bg_color as string) || '#fef3c7',
  color: (config.value?.text_color as string) || '#92400e',
}))
</script>
CFG

# VideoCard - 视频卡片
tee '/Users/jiaqi/Documents/code/l-pc-nuxt/app/components/lowcode/widgets/VideoCard.vue' << 'VID' > /dev/null
<template>
  <div class="video-card rounded-lg overflow-hidden" :style="cardStyle">
    <video
      v-if="src"
      :src="src"
      controls
      class="w-full"
      :poster="poster"
      :style="{ maxHeight: '400px' }"
    />
    <div v-if="title" class="p-3 text-sm font-medium">{{ title }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  pageItem?: Record<string, unknown>
}>()

const config = computed(() => (props.pageItem?.video_card_json || {}) as Record<string, unknown>)
const src = computed(() => config.value?.video_url as string || '')
const poster = computed(() => config.value?.poster_url as string || '')
const title = computed(() => config.value?.title as string || '')
const cardStyle = computed(() => (config.value?.style_json || {}) as Record<string, string>)
</script>
VID

# SlideList - 滑动列表
tee '/Users/jiaqi/Documents/code/l-pc-nuxt/app/components/lowcode/widgets/SlideList.vue' << 'SLD' > /dev/null
<template>
  <div class="slide-list overflow-x-auto pb-2">
    <div class="flex gap-3" :style="{ minWidth: `${items.length * 200}px` }">
      <div
        v-for="(item, idx) in items" :key="idx"
        class="flex-shrink-0 w-180px rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        @click="$emit('click', item)"
      >
        <img
          v-if="item.image"
          :src="item.image"
          class="w-full h-24 object-cover"
          alt=""
        />
        <div class="p-2">
          <div class="text-sm font-medium truncate">{{ item.title || item.name }}</div>
          <div class="text-xs text-gray-400 truncate">{{ item.subtitle }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items?: Record<string, unknown>[] }>()
defineEmits<{ click: [item: any] }>()
</script>
SLD

# QrCode - 二维码组件
tee '/Users/jiaqi/Documents/code/l-pc-nuxt/app/components/lowcode/widgets/QrCodeWidget.vue' << 'QRC' > /dev/null
<template>
  <div class="qr-code-widget flex flex-col items-center gap-2 p-4">
    <div class="bg-white p-2 rounded-lg shadow-sm">
      <div class="w-40 h-40 bg-gray-100 flex-center text-xs text-gray-400 rounded">
        QR Code: {{ text }}
      </div>
    </div>
    <p v-if="text" class="text-xs text-gray-500 text-center max-w-200px">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  pageItem?: Record<string, unknown>
}>()
const config = computed(() => (props.pageItem?.qr_code_json || {}) as Record<string, unknown>)
const text = computed(() => config.value?.text as string || config.value?.qr_content as string || '')
</script>
QRC

# WeatherWidget - 天气组件
tee '/Users/jiaqi/Documents/code/l-pc-nuxt/app/components/lowcode/widgets/WeatherWidget.vue' << 'WTH' > /dev/null
<template>
  <div class="weather-widget flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
    <span class="i-ri-sun-line text-2xl text-amber-500" />
    <div>
      <div class="text-sm text-gray-600">天气组件</div>
      <div class="text-xs text-gray-400">待接入天气 API</div>
    </div>
  </div>
</template>
WTH

# DescriptionsList - 描述列表
tee '/Users/jiaqi/Documents/code/l-pc-nuxt/app/components/lowcode/widgets/DescriptionsList.vue' << 'DLC' > /dev/null
<template>
  <div class="desc-list" :style="listStyle">
    <div v-for="item in items" :key="item.key" class="desc-item flex py-2 border-b border-gray-100 last:border-0">
      <span class="text-sm text-gray-500 min-w-80px">{{ item.label }}</span>
      <span class="text-sm font-medium flex-1">{{ item.value || '-' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  pageItem?: Record<string, unknown>
  items?: { key: string; label: string; value?: string }[]
}>()

const config = computed(() => (props.pageItem?.desc_list_json || {}) as Record<string, unknown>)
const listStyle = computed(() => (config.value?.style_json || {}) as Record<string, string>)
</script>
DLC

echo "7 widgets created"