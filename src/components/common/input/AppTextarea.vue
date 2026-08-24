<script setup lang="ts">
type ValidationRule = (value: unknown) => boolean | string

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
  <label class="block space-y-1"><span v-if="label" class="text-sm font-medium text-slate-700">{{ label }}</span><textarea v-model="model" :placeholder="placeholder" :disabled="disabled" :readonly="readonly" :rows="rows" class="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 disabled:bg-slate-100" v-bind="$attrs" /></label>
</template>
