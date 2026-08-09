<template>
  <div class="flex-center min-h-screen bg-gray-50">
    <div class="card max-w-md w-full text-center space-y-4">
      <span class="i-ri-vuejs-line text-4xl text-green-500 mx-auto block" />
      <h1 class="text-xl font-bold">L-PC Nuxt 4</h1>
      <p class="text-sm text-gray-500">
        低代码平台迁移项目 · 
        <span class="font-mono text-blue-500">{{ env }}</span>
        <span class="text-gray-300 mx-1">|</span>
        <span class="text-xs text-gray-400">{{ envName }}</span>
      </p>
      <div class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded inline-block">
        {{ gateway }}
      </div>

      <div class="pt-4 flex flex-col gap-2">
        <NuxtLink
          v-if="homePageNo"
          :to="'/view/' + homePageNo"
          class="btn-primary text-sm w-full text-center block"
        >
          <span class="i-ri-eye-line mr-1" />预览首页
        </NuxtLink>
        <span v-else class="text-xs text-orange-500">当前环境未配置首页</span>

        <NuxtLink to="/docs" class="btn-ghost text-sm w-full text-center block">
          文档站
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { resolvedEnv, gateway, envConfig, homePageNo } = useEnv()
const env = resolvedEnv
const envName = computed(() => envConfig.value?.name || '')
</script>
