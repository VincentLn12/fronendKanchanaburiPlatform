<script setup lang="ts">
import type { ContentCategory } from '../../api/contentApi'

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
  <section class="border-b-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-2xs">
    <div
      class="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8 scrollbar-none"
    >
      <button
        type="button"
        class="shrink-0 rounded-2xl border-2 px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-xs active:scale-95"
        :class="
          selectedCategoryId === null
            ? 'border-[#D96C2C] bg-[#D96C2C] text-white shadow-md'
            : 'border-[#E8D9C9] bg-white text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C]'
        "
        @click="emit('select', null)"
      >
        <div
          class="h-6 w-6 rounded-xl flex items-center justify-center text-sm"
          :class="
            selectedCategoryId === null
              ? 'bg-white text-[#D96C2C] font-bold'
              : 'bg-[#D96C2C]/10 text-[#D96C2C]'
          "
        >
          <i class="mdi mdi-compass-outline"></i>
        </div>
        <span>คอนเทนต์ทั้งหมด</span>
      </button>

      <button
        v-for="cat in categories"
        :key="cat.contentCategoryId"
        type="button"
        class="shrink-0 rounded-2xl border-2 px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-2"
        :class="
          selectedCategoryId === cat.contentCategoryId
            ? 'border-[#D96C2C] bg-[#D96C2C] text-white shadow-md'
            : 'border-[#E8D9C9] bg-white text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C]'
        "
        @click="emit('select', cat.contentCategoryId)"
      >
        <div
          class="h-6 w-6 rounded-xl flex items-center justify-center text-sm"
          :class="
            selectedCategoryId === cat.contentCategoryId
              ? 'bg-white text-[#D96C2C] font-bold'
              : 'bg-[#D96C2C]/10 text-[#D96C2C]'
          "
        >
          <i class="mdi mdi-shape-outline"></i>
        </div>
        <span>{{ cat.categoryName }}</span>
      </button>
    </div>
  </section>
</template>
