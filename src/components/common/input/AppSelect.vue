<script setup lang="ts">
type ValidationRule = (value: unknown) => boolean | string

interface Props {
  label?: string
  placeholder?: string
  items?: unknown[]
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  multiple?: boolean
  itemTitle?: string
  itemValue?: string
  rules?: ValidationRule[]
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: '',
  items: () => [],
  disabled: false,
  readonly: false,
  clearable: false,
  multiple: false,
  itemTitle: '',
  itemValue: '',
  rules: () => [],
})

const model = defineModel<unknown>()

function valueOf(item: unknown) {
  if (!props.itemValue || typeof item !== 'object' || item === null) return item
  return (item as Record<string, unknown>)[props.itemValue]
}

function titleOf(item: unknown) {
  if (!props.itemTitle || typeof item !== 'object' || item === null) return String(item)
  return String((item as Record<string, unknown>)[props.itemTitle] ?? '')
}
</script>

<template>
  <label class="block space-y-1"><span v-if="label" class="text-sm font-medium text-slate-700">{{ label }}</span><select v-model="model" :disabled="disabled || readonly" :multiple="multiple" class="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 disabled:bg-slate-100" v-bind="$attrs"><option v-if="clearable || placeholder" :value="null">{{ placeholder || 'เลือกข้อมูล' }}</option><option v-for="item in items" :key="String(valueOf(item))" :value="valueOf(item)">{{ titleOf(item) }}</option></select></label>
</template>
