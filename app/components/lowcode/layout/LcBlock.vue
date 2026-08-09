<template>
  <div class="lc-block" :style="mergedStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { formatStyleData } from '@/app/utils/formatStyle'

const props = defineProps<{
  layoutStyle?: Record<string, string>
  style_json?: Record<string, unknown> | string
  layout_json?: Record<string, unknown>
  childNum?: number
}>()

const mergedStyle = computed(() => {
  const s: Record<string, string> = { position: 'relative' }
  if (props.layout_json) {
    const lj = props.layout_json as Record<string, unknown>
    const layoutStyle = lj.style_json
    if (layoutStyle) Object.assign(s, formatStyleData(layoutStyle))
  }
  if (props.style_json) Object.assign(s, formatStyleData(props.style_json))
  if (props.layoutStyle) Object.assign(s, formatStyleData(props.layoutStyle))
  return s
})
</script>
