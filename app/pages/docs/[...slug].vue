<template>
  <div class="docs-layout">
    <!-- 侧边栏 -->
    <aside class="docs-sidebar">
      <div class="docs-sidebar-header">
        <NuxtLink to="/docs" class="docs-logo">
          <span class="i-ri-book-open-line text-lg text-blue-500" />
          <span class="font-semibold">L-PC 文档</span>
        </NuxtLink>
      </div>
      <nav class="docs-nav">
        <ContentNavigation v-slot="{ navigation }">
          <DocsNavTree :links="navigation" />
        </ContentNavigation>
      </nav>
    </aside>

    <!-- 主内容 -->
    <main class="docs-main">
      <div class="docs-content prose">
        <div v-if="pending" class="flex-center py-20">
          <div class="i-ri-loader-4-line animate-spin text-2xl text-blue-500" />
        </div>
        <div v-else-if="error" class="py-20 text-center">
          <div class="i-ri-error-warning-line text-3xl text-red-400 mx-auto" />
          <p class="mt-2 text-gray-500">文档加载失败</p>
        </div>
        <ContentRenderer v-else :value="data" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = computed(() => (route.params.slug as string[]) || [])

const { data, pending, error } = await useAsyncData(
  `docs-${slug.value.join('/')}`,
  () => queryContent(slug.value.join('/') || 'index').findOne()
)
</script>

<style scoped>
.docs-layout { display: flex; min-height: 100vh; }
.docs-sidebar {
  width: 260px; min-width: 260px; height: 100vh; position: sticky; top: 0;
  border-right: 1px solid #e5e7eb; background: #f9fafb; overflow-y: auto; padding: 16px;
}
.docs-sidebar-header { margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
.docs-logo { display: flex; align-items: center; gap: 8px; font-size: 15px; color: #111827; text-decoration: none; }
.docs-main { flex: 1; display: flex; min-width: 0; }
.docs-content { flex: 1; min-width: 0; padding: 32px 48px; max-width: 800px; }
:deep(.prose) { max-width: none; color: #374151; }
:deep(.prose h1) { font-size: 2rem; font-weight: 700; margin-top: 0; }
:deep(.prose h2) { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; padding-bottom: 0.25rem; border-bottom: 1px solid #e5e7eb; }
:deep(.prose h3) { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; }
:deep(.prose pre) { background: #1e1e1e; color: #d4d4d4; border-radius: 8px; padding: 16px; font-size: 13px; overflow-x: auto; }
:deep(.prose code) { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.875em; }
:deep(.prose pre code) { background: none; padding: 0; }
:deep(.prose table) { width: 100%; border-collapse: collapse; font-size: 14px; }
:deep(.prose th) { background: #f9fafb; font-weight: 600; text-align: left; padding: 8px 12px; border: 1px solid #e5e7eb; }
:deep(.prose td) { padding: 8px 12px; border: 1px solid #e5e7eb; }
:deep(.prose blockquote) { border-left: 3px solid #3b82f6; padding-left: 16px; color: #6b7280; }
</style>
