<template>
  <div class="h-screen flex flex-col">
    <header class="flex-between px-4 py-2 bg-white border-b border-gray-200">
      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="i-ri-arrow-left-line text-lg text-gray-500 hover:text-blue-500" />
        <span class="font-medium">{{ pageNo }}</span>
        <span class="text-xs text-gray-400">编辑器 (迁移中...)</span>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-ghost text-sm">
          <span class="i-ri-eye-line mr-1" />预览
        </button>
        <button class="btn-primary text-sm">
          <span class="i-ri-save-line mr-1" />保存
        </button>
      </div>
    </header>
    <div class="flex-1 flex-center bg-gray-100">
      <div class="card text-center space-y-3 max-w-lg">
        <div class="i-carbon-tool-box text-4xl text-blue-400" />
        <h2 class="text-lg font-semibold">低代码编辑器</h2>
        <p class="text-muted">
          编辑器组件正在从 Vue 2 迁移到 Nuxt 4 + Vue 3。
          当前阶段：基础设施已就绪，编辑器 UI 组件待迁移。
        </p>
        <div class="text-left bg-gray-50 rounded-lg p-3 text-xs font-mono space-y-1">
          <div class="text-green-600">✓ useEnv（环境解析）</div>
          <div class="text-green-600">✓ useHttp（HTTP 封装）</div>
          <div class="text-green-600">✓ useLowcodePage（页面配置）</div>
          <div class="text-green-600">✓ Pinia stores（theme + drag）</div>
          <div class="text-orange-500">○ 编辑面板（materials/editor/property）</div>
          <div class="text-orange-500">○ Widget 渲染组件</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const pageNo = computed(() => route.params.pageNo as string)
</script>
