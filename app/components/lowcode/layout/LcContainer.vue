<template>
  <div class="lc-container" :style="mergedStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { formatStyleData } from '@/utils/formatStyle'

const props = defineProps<{
  layoutStyle?: Record<string, string>
  contentWidth?: string
  style_json?: Record<string, unknown> | string
  layout_json?: Record<string, unknown>
}>()

const mergedStyle = computed(() => {
  const s: Record<string, string> = {
    width: props.contentWidth || '100%',
    margin: '0 auto',
    position: 'relative',
  }
  if (props.layout_json) {
    const lj = props.layout_json as Record<string, unknown>
    const ls = lj.style_json
    if (ls) Object.assign(s, formatStyleData(ls))
  }
  if (props.style_json) Object.assign(s, formatStyleData(props.style_json))
  if (props.layoutStyle) Object.assign(s, formatStyleData(props.layoutStyle))
  return s
})
</script>
