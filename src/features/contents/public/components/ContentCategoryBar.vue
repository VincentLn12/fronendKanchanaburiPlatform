<script setup lang="ts">
import type { ContentCategory } from '../api/contentApi'

interface Props {
  categories: ContentCategory[]
  selectedCategoryId: string | null
}

defineProps<Props>()

const emit = defineEmits<{
  select: [categoryId: string | null]
}>()
</script>

<template>
  <section v-if="categories.length" class="border-b border-[#E8E2D5] bg-[#FFFDF9] shadow-2xs">
    <div
      class="mx-auto flex max-w-7xl items-center gap-2.5 overflow-x-auto px-4 py-3.5 sm:px-6 lg:px-8 scrollbar-none"
    >
      <button
        type="button"
        class="shrink-0 rounded-xl border px-4 py-2 text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
        :class="
          selectedCategoryId === null
            ? 'border-[#1C4D3E] bg-[#1C4D3E] text-white'
            : 'border-[#E8E2D5] bg-white text-slate-700 hover:border-[#1C4D3E] hover:text-[#1C4D3E]'
        "
        @click="emit('select', null)"
      >
        <i class="mdi mdi-view-grid-outline text-sm text-[#D99A32]"></i>
        <span>หมวดหมู่ทั้งหมด</span>
      </button>

      <button
        v-for="cat in categories"
        :key="cat.contentCategoryId"
        type="button"
        class="shrink-0 rounded-xl border px-4 py-2 text-xs font-extrabold transition cursor-pointer shadow-2xs active:scale-95"
        :class="
          selectedCategoryId === cat.contentCategoryId
            ? 'border-[#1C4D3E] bg-[#1C4D3E] text-white shadow-xs'
            : 'border-[#E8E2D5] bg-white text-slate-700 hover:border-[#1C4D3E] hover:text-[#1C4D3E]'
        "
        @click="emit('select', cat.contentCategoryId)"
      >
        {{ cat.categoryName }}
      </button>
    </div>
  </section>
</template>
