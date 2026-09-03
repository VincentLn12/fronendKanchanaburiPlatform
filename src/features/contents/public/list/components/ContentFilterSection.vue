<script setup lang="ts">
import type { ContentCategory, District, SubDistrict, Tag } from '../../api/contentApi'
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
  <section
    class="relative z-30 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] shadow-sm text-[#332820]"
  >
    <button
      type="button"
      class="flex w-full items-center justify-between px-6 py-4 text-left cursor-pointer bg-[#FFF9F2]"
      :class="filtersOpen ? 'rounded-t-3xl' : 'rounded-3xl'"
      :aria-expanded="filtersOpen"
      @click="emit('update:filtersOpen', !filtersOpen)"
    >
      <span class="flex items-center gap-2.5 text-base font-black text-[#D96C2C]">
        <div
          class="h-8 w-8 rounded-xl bg-[#D96C2C]/15 border border-[#D96C2C]/30 flex items-center justify-center text-[#D96C2C]"
        >
          <i class="mdi mdi-tune-variant text-lg" />
        </div>
        <span>ค้นหาและกรองคอนเทนต์</span>
        <span
          v-if="activeFilterCount"
          class="bg-[#D96C2C]/20 border border-[#D96C2C]/40 px-2.5 py-0.5 text-xs text-[#D96C2C] rounded-full font-black shadow-2xs"
        >
          {{ activeFilterCount }} ตัวกรอง
        </span>
      </span>
      <i
        class="mdi text-xl text-[#786B62] transition-transform"
        :class="filtersOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
      />
    </button>

    <div v-show="filtersOpen" class="space-y-5 border-t-2 border-[#E8D9C9] px-6 py-6 bg-[#FFF9F2]">
      <!-- Dropdowns Row -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
        <div>
          <label class="block text-xs font-bold text-[#786B62] mb-1.5">หมวดหมู่</label>
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
          <label class="block text-xs font-bold text-[#786B62] mb-1.5">อำเภอ</label>
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
          <label class="block text-xs font-bold text-[#786B62] mb-1.5">ตำบล</label>
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
          <label class="block text-xs font-bold text-[#786B62] mb-1.5">แท็กคำค้น</label>
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
          <label class="block text-xs font-bold text-[#786B62] mb-1.5">เรียงตาม</label>
          <AppSelect
            :model-value="sortBy"
            @update:model-value="
              (val: any) =>
                emit('update:sortBy', (val as 'latest' | 'popular' | 'title') ?? 'latest')
            "
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
        class="flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#E8D9C9] pt-4"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-extrabold text-[#786B62]">แท็กนิยม:</span>
          <button
            v-for="tg in tags"
            :key="tg.tagId"
            type="button"
            class="px-3.5 py-1 rounded-full border-2 text-xs font-black transition cursor-pointer active:scale-95 shadow-2xs"
            :class="
              tagId === tg.tagId
                ? 'bg-[#D96C2C] text-white border-[#D96C2C]'
                : 'bg-white border-[#E8D9C9] text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C]'
            "
            @click="emit('select-tag', tg.tagId)"
          >
            # {{ tg.tagName }}
          </button>
        </div>

        <button
          v-if="activeFilterCount"
          type="button"
          class="text-xs font-black text-[#D96C2C] hover:underline flex items-center gap-1 transition cursor-pointer"
          @click="emit('clear-filters')"
        >
          <i class="mdi mdi-refresh"></i>
          <span>ล้างตัวกรองทั้งหมด ({{ activeFilterCount }})</span>
        </button>
      </div>
    </div>
  </section>
</template>
