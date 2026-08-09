<template>
  <div class="ui-scaler" :style="containerStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  disabled?: boolean
  designSize?: { width?: string | number; height?: string | number } | null
  keepOriginalSizeClasses?: string[]
}>(), { disabled: false, designSize: null, keepOriginalSizeClasses: () => [] })

const containerStyle = ref<Record<string, string>>({})
let dynamicStyle: HTMLStyleElement | null = null

function handleResize() {
  if (props.disabled || !props.designSize) {
    containerStyle.value = { height: 'inherit', width: 'inherit' }
    return
  }
  const w = typeof props.designSize.width === 'string' ? parseFloat(props.designSize.width) : (props.designSize.width || 0)
  const h = typeof props.designSize.height === 'string' ? parseFloat(props.designSize.height) : (props.designSize.height || 0)
  if (!w || !h || !import.meta.client) return

  const scaleX = document.documentElement.clientWidth / w
  const scaleY = document.documentElement.clientHeight / h
  const min = Math.min(scaleX, scaleY)

  containerStyle.value = {
    transform: `scale(${min})`,
    transformOrigin: 'top left',
    width: `${w}px`,
    height: `${h}px`,
    overflow: 'hidden',
  }
}

function setup() {
  if (!import.meta.client) return
  window.addEventListener('resize', handleResize)
  dynamicStyle = document.createElement('style')
  dynamicStyle.id = 'lc-scaler-fix'
  document.head.appendChild(dynamicStyle)
}

function cleanup() {
  window.removeEventListener('resize', handleResize)
  if (dynamicStyle) { document.head.removeChild(dynamicStyle); dynamicStyle = null }
}

watch(() => props.designSize, () => { if (!dynamicStyle) setup(); handleResize() }, { immediate: true })
onBeforeUnmount(() => cleanup())
</script>
