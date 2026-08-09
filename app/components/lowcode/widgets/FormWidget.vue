<template>
  <div class="form-widget p-4 border border-gray-200 rounded-lg">
    <div v-if="formTitle" class="text-lg font-semibold mb-4">{{ formTitle }}</div>
    <div class="space-y-3">
      <div v-for="field in fields" :key="field.key" class="flex flex-col gap-1">
        <label class="text-sm text-gray-600">{{ field.label }}</label>
        <input
          v-model="formData[field.key]"
          :type="field.type || 'text'"
          class="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-400"
          :placeholder="field.placeholder || ''"
        />
      </div>
    </div>
    <div class="flex gap-2 mt-4">
      <button class="btn-primary text-sm" @click="handleSubmit">{{ submitLabel }}</button>
      <button class="btn-ghost text-sm" @click="handleReset">重置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  pageItem?: Record<string, unknown>
}>()

const formConfig = computed(() => (props.pageItem?.form_json || {}) as Record<string, unknown>)
const formTitle = computed(() => formConfig.value.form_title as string || '')
const submitLabel = computed(() => (formConfig.value.submit_label as string) || '提交')

const fields = ref<{ key: string; label: string; type?: string; placeholder?: string }[]>([])
const formData = ref<Record<string, unknown>>({})

function handleSubmit() {
  // TODO: implement form submission
  console.log('[FormWidget] submit:', formData.value)
}

function handleReset() {
  for (const key of Object.keys(formData.value)) {
    formData.value[key] = ''
  }
}
</script>
