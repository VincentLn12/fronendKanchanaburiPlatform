<script setup lang="ts">
import type { ContentCategory, District, SubDistrict, Tag } from '../api/contentApi'
import AppSelect from '@/components/common/input/AppSelect.vue'

interface Props {
  categories: ContentCategory[]
  districts: District[]
  subDistricts: SubDistrict[]
  tags: Tag[]
  sortOptions: { id: string; title: string }[]
  activeFilterCount: number
  categoryId: string | null
  districtId: string | null
  subDistrictId: string | null
  tagId: string | null
  sortBy: 'latest' | 'popular' | 'title'
  filtersOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:categoryId': [val: string | null]
  'update:districtId': [val: string | null]
  'update:subDistrictId': [val: string | null]
  'update:tagId': [val: string | null]
  'update:sortBy': [val: 'latest' | 'popular' | 'title']
  'update:filtersOpen': [val: boolean]
  'change-district': []
  'select-tag': [tagId: string]
  'clear-filters': []
  'filter-change': []
}>()
</script>

<template>
  <section class="rounded-3xl border border-[#E8E2D5] bg-white shadow-sm overflow-hidden text-slate-800">
    <button
      type="button"
      class="flex w-full items-center justify-between px-6 py-4 text-left cursor-pointer bg-[#FFFDF9]"
      :aria-expanded="filtersOpen"
      @click="emit('update:filtersOpen', !filtersOpen)"
    >
      <span class="flex items-center gap-2.5 text-base font-extrabold text-[#1C4D3E]">
        <div class="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1C4D3E]">
          <i class="mdi mdi-tune-variant text-lg" />
        </div>
        <span>ค้นหาและกรองคอนเทนต์</span>
        <span
          v-if="activeFilterCount"
          class="bg-amber-100 border border-amber-300 px-2 py-0.5 text-xs text-[#D99A32] rounded-full font-black shadow-2xs"
        >
          {{ activeFilterCount }} ตัวกรอง
        </span>
      </span>
      <i
        class="mdi text-xl text-slate-500 transition-transform"
        :class="filtersOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
      />
    </button>

    <div v-show="filtersOpen" class="space-y-5 border-t border-[#E8E2D5] px-6 py-6 bg-white">
      <!-- Dropdowns Row -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1.5">หมวดหมู่</label>
          <AppSelect
            :model-value="categoryId"
            @update:model-value="
              (val: any) => {
                emit('update:categoryId', (val as string | null) ?? null)
                emit('filter-change')
              }
            "
            :items="categories"
            item-title="categoryName"
            item-value="contentCategoryId"
            placeholder="ทุกหมวดหมู่"
            clearable
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1.5">อำเภอ</label>
          <AppSelect
            :model-value="districtId"
            @update:model-value="
              (val: any) => {
                emit('update:districtId', (val as string | null) ?? null)
                emit('change-district')
              }
            "
            :items="districts"
            item-title="districtName"
            item-value="districtId"
            placeholder="ทุกอำเภอ"
            clearable
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1.5">ตำบล</label>
          <AppSelect
            :model-value="subDistrictId"
            @update:model-value="
              (val: any) => {
                emit('update:subDistrictId', (val as string | null) ?? null)
                emit('filter-change')
              }
            "
            :items="subDistricts"
            item-title="subDistrictName"
            item-value="subDistrictId"
            placeholder="ทุกตำบล"
            :disabled="!districtId"
            clearable
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1.5">แท็กคำค้น</label>
          <AppSelect
            :model-value="tagId"
            @update:model-value="
              (val: any) => {
                emit('update:tagId', (val as string | null) ?? null)
                emit('filter-change')
              }
            "
            :items="tags"
            item-title="tagName"
            item-value="tagId"
            placeholder="เลือกแท็ก"
            clearable
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1.5">เรียงตาม</label>
          <AppSelect
            :model-value="sortBy"
            @update:model-value="(val: any) => emit('update:sortBy', (val as 'latest' | 'popular' | 'title') ?? 'latest')"
            :items="sortOptions"
            item-title="title"
            item-value="id"
            placeholder="ล่าสุด"
          />
        </div>
      </div>

      <!-- Tag Pills Filter -->
      <div
        v-if="tags.length"
        class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-bold text-slate-500">แท็กนิยม:</span>
          <button
            v-for="tg in tags"
            :key="tg.tagId"
            type="button"
            class="px-3.5 py-1 rounded-full border text-xs font-bold transition cursor-pointer active:scale-95 shadow-2xs"
            :class="
              tagId === tg.tagId
                ? 'bg-[#1C4D3E] text-amber-300 border-[#1C4D3E]'
                : 'bg-[#F9F7F2] border-[#E8E2D5] text-slate-700 hover:border-[#1C4D3E] hover:text-[#1C4D3E]'
            "
            @click="emit('select-tag', tg.tagId)"
          >
            # {{ tg.tagName }}
          </button>
        </div>

        <button
          v-if="activeFilterCount"
          type="button"
          class="text-xs font-bold text-[#D99A32] hover:underline flex items-center gap-1 transition cursor-pointer"
          @click="emit('clear-filters')"
        >
          <i class="mdi mdi-refresh"></i>
          <span>ล้างตัวกรองทั้งหมด ({{ activeFilterCount }})</span>
        </button>
      </div>
    </div>
  </section>
</template>
