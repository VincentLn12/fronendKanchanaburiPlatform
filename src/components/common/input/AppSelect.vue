<script setup lang="ts">
import type { ValidationRule } from 'vuetify'

interface Props {
  label?: string
  placeholder?: string
  items?: unknown[]
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  multiple?: boolean
  rules?: ValidationRule[]
}

withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: '',
  items: () => [],
  disabled: false,
  readonly: false,
  clearable: false,
  multiple: false,
  rules: () => [],
})

const model = defineModel<unknown>()
</script>

<template>
  <v-select
    v-model="model"
    :label="label"
    :placeholder="placeholder"
    :items="items"
    :disabled="disabled"
    :readonly="readonly"
    :clearable="clearable"
    :multiple="multiple"
    :rules="rules"
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    v-bind="$attrs"
  />
</template>
