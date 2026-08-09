<template>
  <div class="app-root min-h-screen bg-gray-50 text-gray-900">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// 全局主题变量应用（在客户端首次挂载时）
if (import.meta.client) {
  const themeStore = useThemeStore()
  watch(
    () => themeStore.themeVariable,
    (vars) => {
      const styleStr = Object.entries(vars)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ')
      document.body.setAttribute('style', styleStr)
    },
    { deep: true, immediate: true }
  )
}
</script>
