<template>
  <NuxtPage />
</template>

<script setup lang="ts">
// 主题变量客户端初始化
if (import.meta.client) {
  const themeStore = useThemeStore()
  watch(() => themeStore.themeVariable, (vars) => {
    const styleStr = Object.entries(vars)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ')
    document.documentElement.setAttribute('style', styleStr)
  }, { deep: true, immediate: true })
}
</script>
