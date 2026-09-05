<script setup lang="ts">
import type { District, ShopCategory } from '@/features/shops/api'

defineProps<{
  categories: ShopCategory[]
  districts: District[]
  activeFilterCount: number
}>()

const search = defineModel<string>('search', { default: '' })
const categoryId = defineModel<string | null>('categoryId', { default: null })
const districtId = defineModel<string | null>('districtId', { default: null })
const verifiedOnly = defineModel<boolean>('verifiedOnly', { default: false })
const topRatedOnly = defineModel<boolean>('topRatedOnly', { default: false })

const emit = defineEmits<{
  (e: 'clear-filters'): void
  (e: 'filter-change'): void
}>()
</script>

<template>
  <aside class="space-y-6">
    <!-- SIDEBAR CONTAINER CARD -->
    <div class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-5 sm:p-6 shadow-xs space-y-6">
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
        <h3 class="font-black text-[#332820] text-base flex items-center gap-2">
          <i class="mdi mdi-tune-variant text-[#D96C2C] text-lg"></i>
          <span>ตัวกรองร้านค้า</span>
        </h3>
        <button
          v-if="activeFilterCount || verifiedOnly || topRatedOnly"
          type="button"
          class="text-xs font-bold text-[#D96C2C] hover:underline cursor-pointer"
          @click="emit('clear-filters')"
        >
          ล้างตัวกรอง
        </button>
      </div>

      <!-- 1. Search Box -->
      <div class="space-y-2">
        <label class="text-xs font-black text-[#332820] uppercase tracking-wider block">
          ค้นหาชื่อร้านค้า / คำสำคัญ
        </label>
        <div class="relative">
          <input
            v-model="search"
            type="text"
            placeholder="เช่น ร้านกาแฟ, หัตถกรรม..."
            class="w-full rounded-2xl border-2 border-[#E8D9C9] bg-white pl-9 pr-8 py-2.5 text-xs font-bold text-[#332820] outline-none focus:border-[#D96C2C] transition"
            @keyup.enter="emit('filter-change')"
          />
          <i class="mdi mdi-magnify absolute left-3 top-1/2 -translate-y-1/2 text-[#D96C2C] text-base"></i>
          <button
            v-if="search"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#786B62] hover:text-[#332820] cursor-pointer"
            @click="search = ''"
          >
            <i class="mdi mdi-close-circle text-base"></i>
          </button>
        </div>
      </div>

      <!-- 2. Store Categories Radio Options -->
      <div class="space-y-3 border-t-2 border-[#E8D9C9] pt-4">
        <label class="text-xs font-black text-[#332820] uppercase tracking-wider block">
          หมวดหมู่ร้านค้า
        </label>
        <div class="space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
          <label
            class="flex items-center justify-between p-2 rounded-xl border border-[#E8D9C9] bg-white hover:border-[#D96C2C] transition cursor-pointer text-xs font-bold text-[#332820]"
            :class="categoryId === null ? 'bg-[#D96C2C]/10 border-[#D96C2C] text-[#D96C2C]' : ''"
          >
            <div class="flex items-center gap-2">
              <input
                type="radio"
                name="category_filter"
                :checked="categoryId === null"
                class="accent-[#D96C2C]"
                @change="categoryId = null"
              />
              <span>ทั้งหมด (All)</span>
            </div>
          </label>

          <label
            v-for="cat in categories"
            :key="cat.shopCategoryId"
            class="flex items-center justify-between p-2 rounded-xl border border-[#E8D9C9] bg-white hover:border-[#D96C2C] transition cursor-pointer text-xs font-bold text-[#332820]"
            :class="categoryId === cat.shopCategoryId ? 'bg-[#D96C2C]/10 border-[#D96C2C] text-[#D96C2C]' : ''"
          >
            <div class="flex items-center gap-2 truncate">
              <input
                type="radio"
                name="category_filter"
                :checked="categoryId === cat.shopCategoryId"
                class="accent-[#D96C2C]"
                @change="categoryId = cat.shopCategoryId"
              />
              <span class="truncate">{{ cat.categoryName }}</span>
            </div>
          </label>
        </div>
      </div>

      <!-- 3. Kanchanaburi Districts Filter Options -->
      <div class="space-y-3 border-t-2 border-[#E8D9C9] pt-4">
        <label class="text-xs font-black text-[#332820] uppercase tracking-wider block">
          พื้นที่อำเภอในกาญจนบุรี
        </label>
        <div class="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
          <label
            class="flex items-center gap-2 p-2 rounded-xl border border-[#E8D9C9] bg-white hover:border-[#D96C2C] transition cursor-pointer text-xs font-bold text-[#332820]"
            :class="districtId === null ? 'bg-[#D96C2C]/10 border-[#D96C2C] text-[#D96C2C]' : ''"
          >
            <input
              type="radio"
              name="district_filter"
              :checked="districtId === null"
              class="accent-[#D96C2C]"
              @change="districtId = null"
            />
            <span>ทุกอำเภอ</span>
          </label>

          <label
            v-for="dist in districts"
            :key="dist.districtId"
            class="flex items-center gap-2 p-2 rounded-xl border border-[#E8D9C9] bg-white hover:border-[#D96C2C] transition cursor-pointer text-xs font-bold text-[#332820]"
            :class="districtId === dist.districtId ? 'bg-[#D96C2C]/10 border-[#D96C2C] text-[#D96C2C]' : ''"
          >
            <input
              type="radio"
              name="district_filter"
              :checked="districtId === dist.districtId"
              class="accent-[#D96C2C]"
              @change="districtId = dist.districtId"
            />
            <span>อ.{{ dist.districtName }}</span>
          </label>
        </div>
      </div>

      <!-- 4. Shop Status & Tier Filters -->
      <div class="space-y-3 border-t-2 border-[#E8D9C9] pt-4">
        <label class="text-xs font-black text-[#332820] uppercase tracking-wider block">
          มาตรฐานและสถานะร้านค้า
        </label>

        <label class="flex items-center gap-2.5 text-xs font-bold text-[#332820] cursor-pointer">
          <input v-model="verifiedOnly" type="checkbox" class="h-4 w-4 rounded accent-[#D96C2C]" />
          <span class="flex items-center gap-1">
            <i class="mdi mdi-shield-check text-[#D96C2C]"></i>
            ร้านค้าลงทะเบียนแล้ว (Verified)
          </span>
        </label>

        <label class="flex items-center gap-2.5 text-xs font-bold text-[#332820] cursor-pointer">
          <input v-model="topRatedOnly" type="checkbox" class="h-4 w-4 rounded accent-[#D96C2C]" />
          <span class="flex items-center gap-1">
            <i class="mdi mdi-star text-amber-500"></i>
            คะแนน 4.5 ดาวขึ้นไป
          </span>
        </label>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #e8d9c9;
  border-radius: 9999px;
}
</style>
