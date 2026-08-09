<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <header class="flex-between px-4 py-2 bg-white border-b border-gray-200">
      <div class="flex items-center gap-3">
        <NuxtLink to="/docs" class="i-ri-arrow-left-line text-lg" />
        <span class="font-medium text-sm">{{ routeId }}</span>
        <span class="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">迁移中</span>
      </div>
    </header>
    <div class="flex-1 flex-center p-8">
      <div class="card max-w-md w-full space-y-4">
        <h2 class="text-lg font-semibold text-center">低代码编辑器</h2>
        <NuxtLink :to="'/view/' + routeId" class="btn-primary text-sm w-full text-center block">查看此页面</NuxtLink>
        <NuxtLink to="/docs" class="btn-ghost text-sm w-full text-center block">文档站</NuxtLink>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()
const routeId = computed(() => route.params.id as string)
</script>
