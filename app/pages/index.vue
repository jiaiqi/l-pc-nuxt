<template>
  <div class="flex-center min-h-screen bg-gray-50">
    <div class="card max-w-md w-full text-center space-y-4">
      <div class="i-ri-vuejs-line text-4xl text-green-500" />
      <h1 class="text-xl font-bold">L-PC Nuxt 4</h1>
      <p class="text-muted">
        低代码平台迁移项目 · 当前环境：
        <span class="font-mono text-blue-500">{{ env }}</span>
      </p>
      <div class="flex-center gap-2">
        <span class="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded">
          {{ gateway }}
        </span>
      </div>
      <div class="pt-4 flex flex-wrap gap-2 justify-center">
        <NuxtLink to="/docs" class="btn-primary text-sm">
          延安园区首页
        </NuxtLink>
        <NuxtLink to="/lowcode/editor/demo" class="btn-ghost text-sm">
          编辑器
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { resolvedEnv, gateway } = useEnv()
const env = resolvedEnv
</script>
