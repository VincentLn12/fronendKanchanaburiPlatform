<script setup lang="ts">
import { ref } from 'vue'
import AppTextField from './input/AppTextField.vue'

interface Props {
  placeholder?: string
  count?: number
  countLabel?: string
  clearable?: boolean
}

withDefaults(defineProps<Props>(), {
  placeholder: 'ค้นหา...',
  count: undefined,
  countLabel: 'รายการ',
  clearable: true,
})

const model = defineModel<string>({
  default: '',
})

const isFocused = ref(false)

function clearSearch() {
  model.value = ''
}
</script>

<template>
  <div
    class="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border transition-all duration-300"
    :class="[
      isFocused
        ? 'border-indigo-500/80 shadow-md shadow-indigo-500/10 ring-4 ring-indigo-500/10'
        : 'border-slate-200/80 shadow-sm hover:border-slate-300',
    ]"
  >
    <!-- Search Input Group -->
    <div class="relative flex-1 flex items-center">
      <!-- Search Icon (Perfectly Centered) -->
      <div
        class="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center text-slate-400 transition-colors duration-200"
        :class="{ '!text-indigo-600': isFocused || model }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <AppTextField
        v-model="model"
        :placeholder="placeholder"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <!-- Clear Button (Perfectly Centered) -->
      <button
        v-if="clearable && model"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-all duration-150 flex items-center justify-center"
        title="ล้างคำค้นหา"
        @click="clearSearch"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Right Side: Count Badge -->
    <div v-if="count !== undefined" class="flex items-center justify-between sm:justify-end gap-2">
      <div
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-200/80 shadow-2xs"
      >
        <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        <span>ทั้งหมด</span>
        <span class="font-extrabold text-indigo-600 text-sm">{{ count }}</span>
        <span>{{ countLabel }}</span>
      </div>
    </div>
  </div>
</template>
