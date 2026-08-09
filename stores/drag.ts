/**
 * 编辑器拖拽状态 Store（Pinia）
 * 迁移自原项目 src/pages/lowcode/store/dragStore.js
 */
import { defineStore } from 'pinia'

export const useDragStore = defineStore('drag', () => {
  // ===== State =====
  const currentDragType = ref<string | null>(null)
  const isResizing = ref(false)
  const editorMode = ref<'pc' | 'mobile'>('pc')
  const mobileCanvasWidth = ref(375)
  const mobileCanvasHeight = ref(667)
  const swappedComponents = ref<Set<string>>(new Set())
  const positionChangedComponents = ref<Set<string>>(new Set())

  // ===== Getters =====
  const isMobileMode = computed(() => editorMode.value === 'mobile')

  // ===== Actions =====
  function setDragType(type: string | null) {
    currentDragType.value = type
  }

  function clearDragType() {
    currentDragType.value = null
  }

  function startResize() {
    isResizing.value = true
  }

  function stopResize() {
    isResizing.value = false
  }

  function setEditorMode(mode: 'pc' | 'mobile') {
    editorMode.value = mode
  }

  function addSwappedComponent(id: string) {
    swappedComponents.value.add(id)
  }

  function getSwappedComponents() {
    return [...swappedComponents.value]
  }

  function clearSwappedComponents() {
    swappedComponents.value.clear()
  }

  function addPositionChangedComponent(id: string) {
    positionChangedComponents.value.add(id)
  }

  function clearAllRecords() {
    swappedComponents.value.clear()
    positionChangedComponents.value.clear()
  }

  return {
    currentDragType,
    isResizing,
    editorMode,
    mobileCanvasWidth,
    mobileCanvasHeight,
    swappedComponents,
    positionChangedComponents,
    isMobileMode,
    setDragType,
    clearDragType,
    startResize,
    stopResize,
    setEditorMode,
    addSwappedComponent,
    getSwappedComponents,
    clearSwappedComponents,
    addPositionChangedComponent,
    clearAllRecords,
  }
})
