<template>
  <div class="swiper-widget relative overflow-hidden" :style="swiperStyle">
    <div class="flex transition-transform duration-500" :style="trackStyle">
      <div v-for="(child, idx) in children" :key="idx" class="flex-shrink-0 w-full">
        <slot :name="'slide-' + idx">
          <!-- 子组件由 LcView 递归渲染 -->
        </slot>
      </div>
    </div>
    <!-- 指示器 -->
    <div v-if="children.length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
      <button v-for="(_, idx) in children" :key="idx"
        class="w-2 h-2 rounded-full transition-colors"
        :class="idx === current ? 'bg-white' : 'bg-white/40'"
        @click="current = idx"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ pageItem?: Record<string, unknown>; children?: any[] }>()
const swiperJson = computed(() => (props.pageItem?.swiper_json || {}) as Record<string, unknown>)
const swiperStyle = computed(() => {
  const s = swiperJson.value as Record<string, unknown>
  return { width: '100%', height: (s?.height as string) || '200px', ...((s?.style_json || {}) as Record<string,string>) }
})
const trackStyle = computed(() => ({ transform: `translateX(-${current.value * 100}%)` }))
const current = ref(0)
const children = computed(() => props.pageItem?.children as any[] || [])
// Auto-play
let timer: any = null
onMounted(() => { if (children.value.length > 1) timer = setInterval(() => { current.value = (current.value + 1) % children.value.length }, 4000) })
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>
