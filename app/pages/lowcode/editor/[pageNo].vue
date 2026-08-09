<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <header class="flex-between px-4 py-2 bg-white border-b border-gray-200">
      <div class="flex items-center gap-3">
        <NuxtLink to="/docs" class="i-ri-arrow-left-line text-lg text-gray-500 hover:text-blue-500" />
        <span class="font-medium text-sm">{{ pageNo }}</span>
        <span class="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">迁移中</span>
      </div>
    </header>
    <div class="flex-1 flex-center p-8">
      <div class="card max-w-md w-full space-y-4">
        <span class="i-carbon-tool-box text-3xl text-blue-400 mx-auto block" />
        <h2 class="text-lg font-semibold text-center">低代码编辑器</h2>
        
        <div class="text-sm space-y-2">
          <p class="text-gray-500">迁移进度：</p>
          <div class="space-y-1.5">
            <div class="flex items-center gap-2 text-green-600"><span class="i-ri-checkbox-circle-fill text-sm" /> 环境解析 useEnv</div>
            <div class="flex items-center gap-2 text-green-600"><span class="i-ri-checkbox-circle-fill text-sm" /> HTTP 封装 useHttp</div>
            <div class="flex items-center gap-2 text-green-600"><span class="i-ri-checkbox-circle-fill text-sm" /> 页面配置 useLowcodePage</div>
            <div class="flex items-center gap-2 text-green-600"><span class="i-ri-checkbox-circle-fill text-sm" /> 渲染引擎 (LcView/UiScaler)</div>
            <div class="flex items-center gap-2 text-green-600"><span class="i-ri-checkbox-circle-fill text-sm" /> 通用 Widget 分发器</div>
            <div class="flex items-center gap-2 text-green-600"><span class="i-ri-checkbox-circle-fill text-sm" /> Pinia stores (theme + drag)</div>
            <div class="flex items-center gap-2 text-orange-500"><span class="i-ri-time-line text-sm" /> Widget 组件族 (list/chart/card...)</div>
            <div class="flex items-center gap-2 text-gray-300"><span class="i-ri-checkbox-blank-circle-line text-sm" /> 三栏编辑器面板</div>
          </div>
        </div>

        <NuxtLink to="/docs" class="btn-primary text-sm w-full text-center block">
          查看文档站
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const pageNo = computed(() => route.params.pageNo as string)
</script>
