<template>
  <div class="floating-edit-container" @click="handleContainerClick">
    <Transition name="fall-down">
      <div
        v-if="showEditButton"
        class="floating-edit-button"
        @click.stop="handleEditClick"
        @mouseenter="clearHideCountdown"
        @mouseleave="startHideCountdown"
      >
        <span class="i-ri-edit-line text-base" />
        <span>编辑</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const showEditButton = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | null = null

function startHideCountdown() {
  clearHideCountdown()
  hideTimer = setTimeout(() => { showEditButton.value = false }, 3000)
}

function clearHideCountdown() {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
}

function handleGlobalClick(event: MouseEvent) {
  if (!import.meta.client) return
  const isCtrl = event.ctrlKey || event.metaKey
  const topRight = { left: window.innerWidth - 100, right: window.innerWidth, top: 0, bottom: 100 }
  const inTopRight = event.clientX >= topRight.left && event.clientX <= topRight.right &&
    event.clientY >= topRight.top && event.clientY <= topRight.bottom
  if (isCtrl && inTopRight) { showEditButton.value = true; startHideCountdown() }
}

function handleContainerClick() {
  if (showEditButton.value) { clearHideCountdown(); showEditButton.value = false }
}

function handleEditClick() {
  let url = location.href
  if (url.includes('site')) url = url.replace('site', 'edit')
  else if (url.includes('lowcode/view')) url = url.replace('lowcode/view', 'edit')
  window.open(url, '_blank')
  clearHideCountdown()
  showEditButton.value = false
}

onMounted(() => document.addEventListener('click', handleGlobalClick))
onBeforeUnmount(() => { document.removeEventListener('click', handleGlobalClick); clearHideCountdown() })
</script>

<style scoped>
.floating-edit-container { position: fixed; top: 0; right: 0; width: 0; height: 0; z-index: 9999; }
.floating-edit-button { position: absolute; top: 20px; right: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 25px; padding: 12px; width: 80px; box-shadow: 0 4px 15px rgba(102,126,234,0.4); cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; transition: all 0.3s; }
.floating-edit-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102,126,234,0.6); }
.fall-down-enter-active { animation: fallDown 0.6s ease-out; }
.fall-down-leave-active { animation: fadeOut 0.3s ease-in; }
@keyframes fallDown { 0% { opacity: 0; transform: translateY(-50px) scale(0.8); } 50% { opacity: 0.8; transform: translateY(-10px) scale(1.05); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes fadeOut { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-20px) scale(0.9); } }
</style>
