<script setup lang="ts">
import { computed } from 'vue'
import { useField } from 'vee-validate'
import type { ValidationRule } from 'vuetify'

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
  <v-text-field
    v-model="fieldValue"
    :label="label"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :clearable="clearable"
    :rules="rules"
    :maxlength="maxlength"
    :error-messages="displayError"
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    v-bind="$attrs"
  />
</template>
