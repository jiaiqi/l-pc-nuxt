<template>
  <div class="slide-list overflow-x-auto pb-2">
    <div class="flex gap-3" :style="{ minWidth: items.length * 200 + 'px' }">
      <div v-for="(item, idx) in items" :key="idx" class="flex-shrink-0 w-180px rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow" @click="emit('click', item)">
        <img v-if="item.image" :src="item.image" class="w-full h-24 object-cover" alt="" />
        <div class="p-2"><div class="text-sm font-medium truncate">{{ item.title || item.name }}</div><div class="text-xs text-gray-400 truncate">{{ item.subtitle }}</div></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ items?: Record<string, unknown>[] }>()
const emit = defineEmits<{ click: [item: any] }>()
const items = computed(() => props.items || [])
</script>
