<template>
  <div class="swiper-widget" :style="containerStyle">
    <!-- 加载态 -->
    <div v-if="loading" class="flex-center h-full">
      <span class="i-ri-loader-4-line animate-spin text-2xl text-blue-500" />
    </div>

    <!-- 空态 -->
    <div v-else-if="!swiperList.length" class="flex-center h-full text-gray-400 text-sm">
      <span class="i-ri-image-line text-2xl mr-2" />暂无轮播图
    </div>

    <!-- 单张图片 -->
    <div v-else-if="swiperList.length === 1" class="swiper-single" :style="containerStyle">
      <img :src="swiperList[0].url" class="w-full h-full object-cover" alt="" />
      <div v-if="swiperList[0]._title" class="swiper-title">{{ swiperList[0]._title }}</div>
    </div>

    <!-- 多张轮播 -->
    <div v-else class="swiper-container relative overflow-hidden" :style="containerStyle">
      <div class="swiper-track flex transition-transform duration-500 ease-out" :style="trackStyle">
        <div v-for="(item, idx) in swiperList" :key="idx" class="swiper-slide flex-shrink-0 w-full h-full relative">
          <img :src="item.url" class="w-full h-full object-cover" alt="" />
          <div v-if="item._title" class="swiper-title">{{ item._title }}</div>
        </div>
      </div>

      <!-- 左右箭头 -->
      <button class="swiper-arrow swiper-arrow-left" @click="prev" type="button">
        <span class="i-ri-arrow-left-s-line text-2xl" />
      </button>
      <button class="swiper-arrow swiper-arrow-right" @click="next" type="button">
        <span class="i-ri-arrow-right-s-line text-2xl" />
      </button>

      <!-- 指示器 -->
      <div class="swiper-dots absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        <button v-for="(item, idx) in swiperList" :key="idx"
          class="w-2 h-2 rounded-full transition-colors"
          :class="idx === current ? 'bg-white' : 'bg-white/40'"
          @click="current = idx" type="button" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatStyleData } from '@/utils/formatStyle'

const props = defineProps<{
  pageItem?: Record<string, unknown>
  queryOptions?: Record<string, unknown>
}>()

const { apiFetch, getImagePath } = useHttp()

const loading = ref(true)
const swiperList = ref<{ url: string; _title?: string; [key: string]: unknown }[]>([])
const current = ref(0)
let autoplayTimer: ReturnType<typeof setInterval> | null = null

// Config
const swiperJson = computed(() => (props.pageItem?.swiper_json || {}) as Record<string, unknown>)
const srvReqJson = computed(() => {
  const srj = swiperJson.value?.srv_req_json || props.pageItem?.srv_req_json
  return srj as Record<string, unknown> | undefined
})
const srvColImage = computed(() => swiperJson.value?.srv_col_image as string || 'carousel_img')
const srvColTitle = computed(() => swiperJson.value?.srv_col_title as string | undefined)
const imageOrigin = computed(() => swiperJson.value?.image_origin as string)

// Styles
const containerStyle = computed(() => {
  const s: Record<string, string> = { width: '100%', height: '100%' }
  const styleJson = swiperJson.value?.style_json
  if (styleJson) Object.assign(s, formatStyleData(styleJson))
  const compStyle = props.pageItem?.style_json
  if (compStyle) Object.assign(s, formatStyleData(compStyle))
  // Default height if not set
  if (!s.height) s.height = '400px'
  return s
})

const trackStyle = computed(() => ({
  transform: `translateX(-${current.value * 100}%)`,
}))

// Fetch data
async function fetchSwiperList() {
  loading.value = true
  try {
    if (imageOrigin.value === '接口请求' && srvReqJson.value) {
      const req = { ...srvReqJson.value } as Record<string, unknown>
      const app = (req.mapp as string) || 'daq'
      const url = `/${app}/select/${req.serviceName}`
      const res = await apiFetch<{ state: string; data?: any[] }>(url, { method: 'POST', body: req })
      if (res?.state === 'SUCCESS' && Array.isArray(res.data)) {
        swiperList.value = res.data.map(item => ({
          ...item,
          url: getImagePath(String(item[srvColImage.value] || '')),
          _title: srvColTitle.value ? String(item[srvColTitle.value] || '') : '',
        })).filter(item => item.url)
      }
    } else if (swiperJson.value?.image) {
      // Static image
      swiperList.value = [{ url: getImagePath(String(swiperJson.value.image)) }]
    }
  } catch (e) {
    console.error('[SwiperWidget] fetch error:', e)
  } finally {
    loading.value = false
  }
}

// Navigation
function next() {
  if (swiperList.value.length === 0) return
  current.value = (current.value + 1) % swiperList.value.length
}

function prev() {
  if (swiperList.value.length === 0) return
  current.value = (current.value - 1 + swiperList.value.length) % swiperList.value.length
}

// Autoplay
onMounted(() => {
  fetchSwiperList()
  autoplayTimer = setInterval(next, 5000)
})

onBeforeUnmount(() => {
  if (autoplayTimer) clearInterval(autoplayTimer)
})

// Reset when pageItem changes
watch(() => props.pageItem, () => fetchSwiperList(), { deep: true })
</script>

<style scoped>
.swiper-widget { position: relative; overflow: hidden; }
.swiper-single { position: relative; overflow: hidden; }
.swiper-title {
  position: absolute; bottom: 0; left: 0; width: 100%;
  background: rgba(0,0,0,0.5); color: #fff; padding: 10px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.swiper-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(0,0,0,0.3); color: #fff; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.2s; z-index: 10;
}
.swiper-arrow:hover { background: rgba(0,0,0,0.6); }
.swiper-arrow-left { left: 10px; }
.swiper-arrow-right { right: 10px; }
</style>
