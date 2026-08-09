<template>
  <div class="card-group-cell" :style="layoutStyle">
    <div class="card-grid" :style="gridStyle">
      <div
        v-for="(cell, idx) in displayData" :key="idx"
        class="cell-card cursor-pointer rounded-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-md"
        :style="cardStyle"
        @click="onClick(cell)"
      >
        <!-- 图片 -->
        <img
          v-if="imageField && cell[imageField]"
          :src="resolveImage(cell[imageField])"
          class="w-full h-32 object-cover"
          alt=""
        />
        <!-- 内容 -->
        <div class="p-3 space-y-1">
          <div v-if="titleField" class="font-medium text-sm truncate">
            {{ cell[titleField] }}
          </div>
          <div v-if="subtitleField" class="text-xs text-gray-500 truncate">
            {{ cell[subtitleField] }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="!displayData.length" class="text-center text-gray-400 text-sm py-8">
      暂无数据
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  pageItem?: Record<string, unknown>
  cellsLayout?: Record<string, unknown>[]
  activeCellLayout?: Record<string, unknown>[]
  cellData?: Record<string, unknown>[]
  comColMap?: Record<string, unknown>
  cardLayout?: Record<string, unknown>
  rowButtons?: any[]
  isVerticalScroll?: boolean
  displayRowLimit?: number
  listConfig?: Record<string, unknown>
}>()

const emit = defineEmits<{
  'onClickCell': [cell: any]
  'onClickBlock': [cell: any]
  'onRowButtonClick': [btn: any, row: any]
  setPageParams: [key: string, val: any]
}>()

const displayData = computed(() => props.cellData || [])

const cardUnitJson = computed(() =>
  props.pageItem?.card_group_json as Record<string, unknown> | undefined
    || props.cellsLayout?.[0] as Record<string, unknown>
    || {}
)

const imageField = computed(() => cardUnitJson.value?.image_field as string)
const titleField = computed(() => cardUnitJson.value?.title_field as string || 'name')
const subtitleField = computed(() => cardUnitJson.value?.subtitle_field as string)

const gridStyle = computed(() => {
  const s: Record<string, string> = { display: 'grid', gap: '12px' }
  const cols = (cardUnitJson.value?.cols_num as number) || 2
  s.gridTemplateColumns = `repeat(${cols}, 1fr)`
  return s
})

const layoutStyle = computed(() => {
  const s = (props.cardLayout as Record<string, string>) || {}
  return { width: '100%', ...s }
})

const cardStyle = computed(() => {
  const s = (cardUnitJson.value?.style_json as Record<string, string>) || {}
  return s
})

function onClick(cell: any) { emit('onClickCell', cell) }
function resolveImage(val: any): string {
  if (!val) return ''
  const s = String(val)
  if (s.startsWith('http') || s.startsWith('data:')) return s
  return `${useEnv().gateway.value}/file/download?fileNo=${s}`
}
</script>
