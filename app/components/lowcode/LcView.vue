<template>
  <!-- 强制登录拦截 -->
  <div
    v-if="forceLogin"
    class="lc-force-login relative w-full h-full overflow-hidden"
  >
    <div class="absolute inset-0 bg-black/10 blur-10px z--1" />
    <div class="flex-center flex-col w-full h-full text-white">
      <p mb-4>请在登录后进行查看</p>
      <button class="px-10 py-2.5 rounded-md bg-blue-500 min-w-200px" @click="toLogin">
        登录
      </button>
    </div>
  </div>

  <!-- 隐藏组件 -->
  <div v-else-if="!isVisible" class="text-xs text-gray-400 p-2 italic">
    组件已隐藏
  </div>

  <!-- 正常渲染 -->
  <component
    v-else
    :is="resolvedComponent"
    v-bind="componentProps"
    @click="handleClick"
    @add="emit('add', $event)"
    @delete="emit('delete', $event)"
    @resize="emit('resize', $event)"
    @layout-resize="emit('layout-resize', $event)"
    @executor-complete="emit('executor-complete', $event)"
  >
    <!-- 递归渲染子组件 -->
    <template v-if="childComponents.length">
      <LcView
        v-for="child in childComponents"
        :key="child.com_no || child.id"
        v-bind="child"
        :page-item="child.data"
        :content-width="contentWidth"
        :current-id="currentId"
        :is-preview="isPreview"
        :is-view="isView"
        :page-no="pageNo"
        :page-config="pageConfig"
        :query-options="queryOptions"
        :page-params-model="pageParamsModel"
        :page-route="pageRoute"
        :in-edit="inEdit"
        @click="emit('click', $event)"
        @add="emit('add', $event)"
        @delete="emit('delete', $event)"
        @resize="emit('resize', $event)"
        @executor-complete="emit('executor-complete', $event)"
      />
    </template>

    <!-- 编辑态占位提示 -->
    <template v-else-if="!isView && !isPreview && type === 'content'">
      <span class="text-gray-400 pointer-events-none select-none">
        {{ name || '可放置组件/布局容器' }}
      </span>
    </template>
  </component>
</template>

<script setup lang="ts">
import type { ComponentConfig } from '~/types/lowcode'
import LcContainer from './layout/LcContainer.vue'
import LcBlock from './layout/LcBlock.vue'
import LcContent from './layout/LcContent.vue'
import PageItem from './PageItem.vue'

const props = withDefaults(defineProps<{
  id?: string | number
  com_no?: string
  component?: string
  name?: string
  type?: string
  children?: ComponentConfig[]
  pageItem?: Record<string, unknown>
  contentWidth?: string
  currentId?: string
  isPreview?: boolean
  isView?: boolean
  pageNo?: string
  pageConfig?: Record<string, unknown> | null
  queryOptions?: Record<string, unknown>
  pageParamsModel?: Record<string, Record<string, unknown>>
  pageRoute?: Record<string, unknown>
  inEdit?: boolean
  visible?: boolean
  hiddenComponentVisible?: boolean
}>(), {
  children: () => [],
  pageItem: () => ({}),
  queryOptions: () => ({}),
  pageParamsModel: () => ({}),
  pageRoute: () => ({}),
  pageConfig: null,
  visible: true,
  hiddenComponentVisible: false,
  isPreview: false,
  isView: false,
  inEdit: false,
})

const emit = defineEmits<{
  click: [data: any]
  add: [data: any]
  delete: [data: any]
  resize: [data: any]
  'layout-resize': [data: any]
  'executor-complete': [data: any]
}>()

// 子组件列表 (shallowRef 避免深度响应导致的性能问题)
const childComponents = shallowRef<ComponentConfig[]>(props.children || [])

watch(() => props.children, (val) => {
  childComponents.value = val || []
}, { immediate: true })

// 可见性
const isVisible = computed(() => {
  if (props.hiddenComponentVisible) return true
  return props.visible !== false
})

// 强制登录
const forceLogin = computed(() => {
  return (props.pageItem?.com_option as string)?.includes('强制登录') && !isLoggedIn()
})

function isLoggedIn(): boolean {
  if (!import.meta.client) return true
  const user = sessionStorage.getItem('current_login_user')
  if (!user) return false
  try {
    const u = JSON.parse(user)
    return u?.login_state !== 'anon_login'
  } catch { return false }
}

function toLogin() {
  if (!import.meta.client) return
  sessionStorage.setItem('login_redirect_url', location.pathname + location.hash)
  location.href = location.origin + '/main/login.html'
}

// 动态组件解析
// Debug: log each component
onMounted(() => { console.log('[LcView] component:', props.component, 'type:', props.type, 'name:', props.com_name || props.name) })

const resolvedComponent = computed(() => {
  const comp = props.component
  if (!comp) return 'div'
  // Must return imported component objects, not strings!
  // Vue 3 :is with strings only works for globally registered components.
  // Nuxt auto-imports are compile-time transforms, not global registrations.
  switch (comp) {
    case 'lc-container': return LcContainer
    case 'lc-block': return LcBlock
    case 'lc-content': return LcContent
    case 'page-item': return PageItem
    default: return 'div'
  }
})

const componentProps = computed(() => {
  // Exclude children and id from v-bind (reserved DOM properties)
  const { children: _c, id: _id, ...rest } = props as any
  const base: Record<string, unknown> = {
    pageItem: props.pageItem,
    contentWidth: props.contentWidth,
    pageNo: props.pageNo,
    pageConfig: props.pageConfig,
    queryOptions: props.queryOptions,
    pageParamsModel: props.pageParamsModel,
    pageRoute: props.pageRoute,
    isPreview: props.isPreview,
    isView: props.isView,
    inEdit: props.inEdit,
  }
  return { ...base, ...rest }
})

function handleClick() {
  emit('click', props)
}
</script>
