<script setup lang="ts">
withDefaults(defineProps<{ label?: string; multiple?: boolean; accept?: string; disabled?: boolean }>(), { label: '', multiple: false, accept: 'image/jpeg,image/png,image/webp', disabled: false })
const emit = defineEmits<{ change: [files: File[]] }>()
function selectFiles(event: Event) {
  emit('change', Array.from((event.target as HTMLInputElement).files ?? []))
}
</script>

<template>
  <label class="block space-y-1"><span v-if="label" class="text-sm font-medium text-slate-700">{{ label }}</span><input type="file" :multiple="multiple" :accept="accept" :disabled="disabled" class="block w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 disabled:bg-slate-100" @change="selectFiles" /></label>
</template>
