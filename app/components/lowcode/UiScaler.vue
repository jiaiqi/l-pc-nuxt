<template>
  <div class="ui-scaler" :style="containerStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface DesignSize {
  width?: string | number
  height?: string | number
}

const props = withDefaults(defineProps<{
  disabled?: boolean
  designSize?: DesignSize | null
  keepOriginalSizeClasses?: string[]
}>(), {
  disabled: false,
  designSize: null,
  keepOriginalSizeClasses: () => [],
})

const containerStyle = ref<Record<string, string>>({})
const dynamicStylesheet = ref<HTMLStyleElement | null>(null)

function handleResize() {
  if (props.disabled || !import.meta.client) return
  const { width, height } = props.designSize || {}
  const w = typeof width === 'string' ? parseFloat(width) : width
  const h = typeof height === 'string' ? parseFloat(height) : height

  if (w && h) {
    const scaleX = document.documentElement.clientWidth / w
    const scaleY = document.documentElement.clientHeight / h

    containerStyle.value = {
      transform: `scale(${scaleX}, ${scaleY})`,
      transformOrigin: 'top left',
      width: `${w}px`,
      height: `${h}px`,
      overflow: 'hidden',
      '--originalX': String(1 / scaleX * Math.min(scaleX, scaleY)),
      '--originalY': String(1 / scaleY * Math.min(scaleX, scaleY)),
      '--scaleX': String(scaleX),
      '--scaleY': String(scaleY),
    } as any
  } else {
    containerStyle.value = { height: 'inherit', width: 'inherit' }
  }
}

function createStylesheet() {
  if (!import.meta.client) return
  const style = document.createElement('style')
  style.id = 'ui-scaler-dynamic-styles'
  document.head.appendChild(style)
  dynamicStylesheet.value = style
  window.addEventListener('resize', handleResize)
}

function cleanup() {
  if (dynamicStylesheet.value) {
    document.head.removeChild(dynamicStylesheet.value)
    dynamicStylesheet.value = null
  }
  window.removeEventListener('resize', handleResize)
}

watch(() => props.designSize, () => {
  if (!dynamicStylesheet.value) createStylesheet()
  handleResize()
}, { immediate: true })

onBeforeUnmount(() => cleanup())
</script>

<style scoped>
.ui-scaler { position: relative; }
</style>
