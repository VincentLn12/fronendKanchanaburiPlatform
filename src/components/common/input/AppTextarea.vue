<script setup lang="ts">
import type { ValidationRule } from 'vuetify'

interface Props {
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  rows?: number | string
  autoGrow?: boolean
  rules?: ValidationRule[]
}

withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  clearable: false,
  rows: 3,
  autoGrow: false,
  rules: () => [],
})

const model = defineModel<string | null>()
</script>

<template>
  <v-textarea
    v-model="model"
    :label="label"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :clearable="clearable"
    :rows="rows"
    :auto-grow="autoGrow"
    :rules="rules"
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    v-bind="$attrs"
  />
</template>
