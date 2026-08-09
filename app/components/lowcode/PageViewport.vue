<template>
  <div ref="viewportRef" class="lc-viewport" :class="{ 'is-scaled': shouldScale }" :style="viewportStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  designWidth?: number
  designHeight?: number
  /** 是否禁用缩放（对应旧配置 page_options 中的"不缩放"） */
  noScale?: boolean
}>(), {
  designWidth: 0,
  designHeight: 0,
  noScale: false,
})

const shouldScale = computed(() => {
  return !props.noScale && props.designWidth > 0 && props.designHeight > 0
})

const viewportStyle = computed(() => {
  if (!shouldScale.value) {
    return {
      width: '100%',
      height: '100%',
    }
  }

  // 使用 CSS 变量传递缩放比例，组件内部可通过 calc() 使用
  return {
    width: `${props.designWidth}px`,
    height: `${props.designHeight}px`,
    minWidth: `${props.designWidth}px`,
    // CSS 自定义属性供子组件使用
    '--viewport-width': `${props.designWidth}px`,
    '--viewport-height': `${props.designHeight}px`,
  }
})
</script>

<style scoped>
.lc-viewport {
  position: relative;
  margin: 0 auto;
  transform-origin: top center;
}

.lc-viewport.is-scaled {
  /* 等比例缩放，保持宽高比 */
  transform: scale(var(--viewport-scale, 1));
}
</style>
