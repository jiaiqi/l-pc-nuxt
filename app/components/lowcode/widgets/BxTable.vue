<template>
  <div class="bx-table" :style="tableVars" ref="tableRoot">
    <div class="table-scroll" ref="scrollRef">
      <table class="w-full border-collapse">
        <colgroup>
          <col v-for="col in columns" :key="col.key" :style="{ width: col.width || 'auto' }" />
          <col v-if="showRowButtons" style="width:120px" />
        </colgroup>
        <thead>
          <tr>
            <th
              v-for="col in columns" :key="col.key"
              class="table-th"
              :style="colStyle"
            >
              {{ col.label }}
            </th>
            <th v-if="showRowButtons" class="table-th">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!rows.length" class="table-row">
            <td :colspan="columns.length + (showRowButtons ? 1 : 0)" class="table-td text-center text-gray-400 py-8">
              {{ emptyText }}
            </td>
          </tr>
          <tr
            v-for="(row, idx) in rows" :key="idx"
            class="table-row"
            :class="{ 'stripe-row': striped && idx % 2 === 1 }"
          >
            <td v-for="col in columns" :key="col.key" class="table-td" :style="colStyle" :title="formatCell(row, col)">
              <img
                v-if="col.colType === 'Image' && formatCell(row, col)"
                :src="getImagePath(formatCell(row, col))"
                class="table-img"
                alt=""
              />
              <span v-else class="truncate block">{{ formatCell(row, col) }}</span>
            </td>
            <td v-if="showRowButtons" class="table-td">
              <div class="flex flex-wrap gap-1">
                <button
                  v-for="btn in rowButtons" :key="btn.button_type"
                  class="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                  @click="$emit('rowButtonClick', btn, row)"
                >
                  {{ btn.button_name }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  columns?: { key: string; label: string; width?: string; colType?: string }[]
  rows?: Record<string, unknown>[]
  striped?: boolean
  showRowButtons?: boolean
  rowButtons?: { button_type: string; button_name: string }[]
  listConfig?: Record<string, unknown>
  emptyText?: string
}>(), {
  columns: () => [],
  rows: () => [],
  rowButtons: () => [],
  emptyText: '暂无数据',
})

defineEmits<{ rowButtonClick: [btn: any, row: any] }>()

const tableVars = computed(() => {
  const c = props.listConfig || {}
  return {
    '--tbl-border-color': (c.tbl_border_color as string) || '#e5e7eb',
    '--tbl-head-bg': (c.tbl_head_bg as string) || '#f9fafb',
    '--tbl-head-color': (c.tbl_head_color as string) || '#374151',
    '--cell-bg': (c.cell_bg as string) || '#fff',
  } as any
})

const colStyle = { fontSize: '14px' }

function formatCell(row: Record<string, unknown>, col: { key: string }): string {
  const val = row[col.key]
  return val === null || val === undefined ? '' : String(val)
}

function getImagePath(path: string): string {
  if (!path || path.startsWith('http') || path.startsWith('data:')) return path
  return `${useEnv().gateway.value}/file/download?fileNo=${path}`
}
</script>

<style scoped>
.bx-table { width: 100%; overflow: hidden; border: 1px solid var(--tbl-border-color); border-radius: 6px; }
.table-scroll { overflow-x: auto; }
.table-th { padding: 10px 12px; text-align: left; font-weight: 500; font-size: 13px; color: var(--tbl-head-color); background: var(--tbl-head-bg); border-bottom: 1px solid var(--tbl-border-color); white-space: nowrap; }
.table-td { padding: 8px 12px; border-bottom: 1px solid var(--tbl-border-color); font-size: 14px; vertical-align: middle; }
.table-row:last-child .table-td { border-bottom: none; }
.stripe-row { background: #f9fafb; }
.table-img { width: 60px; height: 40px; object-fit: cover; border-radius: 4px; }
</style>
