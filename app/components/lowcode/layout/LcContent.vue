<template>
  <div class="lc-content" :style="contentStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  layoutStyle?: Record<string, string>
}>()

const contentStyle = computed(() => ({
  position: 'relative' as const,
  minHeight: '40px',
  ...props.layoutStyle,
}))
</script>
