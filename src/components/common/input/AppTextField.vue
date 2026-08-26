<script setup lang="ts">
import { computed } from 'vue'
import { useField } from 'vee-validate'
type ValidationRule = (value: unknown) => boolean | string

interface Props {
  name?: string
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  rules?: ValidationRule[]
  maxlength?: number
  errorMessages?: string | string[]
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
  label: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  clearable: false,
  rules: () => [],
})

const model = defineModel<string | number | null>()

// ถ้ามีการระบุ name prop ให้ใช้ useField จาก VeeValidate โดยอัตโนมัติ
const field = props.name ? useField<string | number | null>(() => props.name) : null

const fieldValue = computed({
  get() {
    return field ? (field.value.value ?? '') : (model.value ?? '')
  },
  set(val) {
    if (field) {
      field.value.value = val ?? ''
    } else {
      model.value = val
    }
  },
})

const displayError = computed(() => {
  if (props.errorMessages) return props.errorMessages
  return field ? field.errorMessage.value : undefined
})
</script>

<template>
  <label class="block space-y-1">
    <span v-if="label" class="text-sm font-medium text-slate-700">{{ label }}</span>
    <input
      v-model="fieldValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      class="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 disabled:bg-slate-100"
      v-bind="$attrs"
    />
    <span v-if="displayError" class="text-sm text-red-600">{{ displayError }}</span>
  </label>
</template>
