<template>
  <div class="lc-container" :style="containerStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  layoutStyle?: Record<string, string>
  contentWidth?: string
}>()

const containerStyle = computed(() => ({
  width: props.contentWidth || '100%',
  margin: '0 auto',
  position: 'relative' as const,
  ...props.layoutStyle,
}))
</script>
