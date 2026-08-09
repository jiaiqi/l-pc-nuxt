<template>
  <div class="lc-block" :style="blockStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  layoutStyle?: Record<string, string>
  childNum?: number
}>()

const blockStyle = computed(() => {
  const style: Record<string, string> = { position: 'relative' }
  if (props.childNum === 2) {
    style.display = 'flex'
    style.gap = '16px'
  }
  return { ...style, ...props.layoutStyle }
})
</script>
