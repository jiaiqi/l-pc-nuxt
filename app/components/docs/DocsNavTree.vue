<template>
  <ul class="docs-nav-tree">
    <li v-for="link in links" :key="link._path">
      <NuxtLink
        :to="link._path"
        class="docs-nav-link"
        :class="{ 'router-link-active': isActive(link._path) }"
      >
        {{ link.title }}
      </NuxtLink>
      <DocsNavTree
        v-if="link.children?.length"
        :links="link.children"
        class="pl-3"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{ links: any[] }>()
const route = useRoute()
function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<style scoped>
.docs-nav-tree { list-style: none; padding: 0; margin: 0; }
.docs-nav-link {
  display: block; padding: 4px 8px; border-radius: 4px;
  font-size: 14px; color: #4b5563; text-decoration: none; transition: all 0.15s;
}
.docs-nav-link:hover { background: #e5e7eb; color: #111827; }
.docs-nav-link.router-link-active { background: #dbeafe; color: #2563eb; font-weight: 500; }
</style>
