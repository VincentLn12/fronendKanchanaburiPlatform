<script setup lang="ts">
import type { ValidationRule } from 'vuetify'

interface Props {
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  rules?: ValidationRule[]
  maxlength?: number
}

withDefaults(defineProps<Props>(), {
  label: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  clearable: false,
  rules: () => [],
})

const model = defineModel<string | number | null>()
</script>

<template>
  <v-text-field
    v-model="model"
    :label="label"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :clearable="clearable"
    :rules="rules"
    :maxlength="maxlength"
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    v-bind="$attrs"
  />
</template>
