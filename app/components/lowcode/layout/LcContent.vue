<template>
  <div class="lc-content" :style="mergedStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { formatStyleData } from '@/utils/formatStyle'

const props = defineProps<{
  layoutStyle?: Record<string, string>
  style_json?: Record<string, unknown> | string
}>()

const mergedStyle = computed(() => {
  const s: Record<string, string> = { position: 'relative', minHeight: '40px' }
  if (props.style_json) Object.assign(s, formatStyleData(props.style_json))
  if (props.layoutStyle) Object.assign(s, formatStyleData(props.layoutStyle))
  return s
})
</script>
