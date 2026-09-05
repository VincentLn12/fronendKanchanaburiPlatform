<script setup lang="ts">
import heroCoverImage from '@/assets/รูปปก.png'
import type { ShopCategory } from '@/features/shops/api'

defineProps<{
  categories: ShopCategory[]
  selectedCategoryId: string | null
  viewMode?: 'shops' | 'map'
}>()

const emit = defineEmits<{
  (e: 'select-category', id: string | null): void
  (e: 'update:viewMode', mode: 'shops' | 'map'): void
}>()
</script>

<template>
  <section class="relative bg-[#171412] text-white border-b-2 border-[#E8D9C9] overflow-hidden">
    <!-- Authentic Kanchanaburi Landmark Background Cover -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <img
        :src="heroCoverImage"
        alt="ทิวทัศน์เมืองกาญจนบุรี"
        class="w-full h-full object-cover object-center scale-105 contrast-105 brightness-95"
      />
      <!-- Deep Cinematic Multi-layer Gradient Overlays for High Legibility and Dignified Tone -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-[#171412]/95 via-[#171412]/85 to-[#171412]/60"
      ></div>
      <div
        class="absolute inset-0 bg-gradient-to-t from-[#171412] via-transparent to-black/50"
      ></div>
      <!-- Subtle Brand Tint Overlay -->
      <div class="absolute inset-0 bg-[#D96C2C]/10 mix-blend-multiply"></div>
    </div>

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-6 sm:space-y-8">
      <!-- Top Provincial Identity Badge & Mode Switcher -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <!-- Serious Official Provincial Tag -->
        <div
          class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black text-amber-200 shadow-md self-start sm:self-auto"
        >
          <i class="mdi mdi-seal-variant text-amber-400 text-sm"></i>
          <span>KANCHANABURI COMMUNITY COMMERCE PLATFORM</span>
          <span class="text-white/40">•</span>
          <span class="text-white/90">จังหวัดกาญจนบุรี</span>
        </div>

        <!-- Mode Switcher: Shops / Map -->
        <div class="inline-flex shrink-0 self-start sm:self-auto border-2 border-white/25 bg-[#171412]/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl">
          <button
            type="button"
            class="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer"
            :class="viewMode === 'shops' ? 'bg-[#D96C2C] text-white shadow-md' : 'text-amber-100/75 hover:text-white'"
            @click="emit('update:viewMode', 'shops')"
          >
            <i class="mdi mdi-storefront-outline text-base"></i>
            <span>ร้านค้า</span>
          </button>
          <button
            type="button"
            class="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer"
            :class="viewMode === 'map' ? 'bg-[#D96C2C] text-white shadow-md' : 'text-amber-100/75 hover:text-white'"
            @click="emit('update:viewMode', 'map')"
          >
            <i class="mdi mdi-map-marker-radius text-base"></i>
            <span>แผนที่</span>
          </button>
        </div>
      </div>

      <div class="space-y-4 text-center sm:text-left max-w-4xl">

        <div class="space-y-3">
          <h1
            class="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg"
          >
            ศูนย์รวมร้านค้าและของดีเมืองกาญจน์
          </h1>
          <p
            class="text-sm sm:text-base text-amber-100/90 font-medium leading-relaxed drop-shadow-sm max-w-3xl"
          >
            แพลตฟอร์มรวบรวมร้านค้า วิสาหกิจชุมชน และผู้ประกอบการท้องถิ่นทั้ง 13
            อำเภอในจังหวัดกาญจนบุรี ส่งเสริมเศรษฐกิจสร้างสรรค์ ผลิตภัณฑ์อัตลักษณ์พื้นถิ่น
            และงานหัตถกรรมคุณภาพสู่ระดับสากล
          </p>
        </div>

        <!-- Official Quality Credential Indicators -->
        <div class="flex flex-wrap items-center gap-4 pt-2 justify-center sm:justify-start">
          <div
            class="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#171412]/80 backdrop-blur-md border border-white/20 shadow-md"
          >
            <div
              class="h-9 w-9 rounded-xl bg-[#D96C2C] flex items-center justify-center text-white shrink-0 shadow-sm"
            >
              <i class="mdi mdi-store-check text-xl"></i>
            </div>
            <div class="text-left">
              <span class="font-black text-white text-sm block leading-none"
                >ผู้ประกอบการรับรอง</span
              >
              <span class="text-[11px] text-amber-200/90 font-bold">13 อำเภอเมืองกาญจน์</span>
            </div>
          </div>

          <div
            class="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#171412]/80 backdrop-blur-md border border-white/20 shadow-md"
          >
            <div
              class="h-9 w-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shrink-0 shadow-sm"
            >
              <i class="mdi mdi-shield-check text-xl text-white"></i>
            </div>
            <div class="text-left">
              <span class="font-black text-white text-sm block leading-none"
                >ของแท้จากแหล่งผลิต</span
              >
              <span class="text-[11px] text-emerald-300 font-bold">การันตีคุณภาพชุมชน</span>
            </div>
          </div>

          <div
            class="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#171412]/80 backdrop-blur-md border border-white/20 shadow-md"
          >
            <div
              class="h-9 w-9 rounded-xl bg-amber-600 flex items-center justify-center text-white shrink-0 shadow-sm"
            >
              <i class="mdi mdi-star text-xl text-white"></i>
            </div>
            <div class="text-left">
              <span class="font-black text-white text-sm block leading-none"
                >4.8 / 5.0 เรตติ้ง</span
              >
              <span class="text-[11px] text-amber-200/90 font-bold"
                >จากผู้ซื้อและนักท่องเที่ยวจริง</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Category Navigation Pill Tabs -->
      <div class="pt-4 border-t border-white/15">
        <div class="flex items-center justify-between pb-2 text-xs font-bold text-amber-200/80">
          <span class="flex items-center gap-1.5">
            <i class="mdi mdi-tag-multiple-outline text-[#F2A65A]"></i>
            เลือกชมตามประเภทผลิตภัณฑ์ชุมชน:
          </span>
        </div>

        <div class="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            class="px-5 py-2.5 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-2 cursor-pointer border-2 shadow-md"
            :class="
              selectedCategoryId === null
                ? 'bg-[#D96C2C] text-white border-[#D96C2C] shadow-lg scale-102'
                : 'bg-[#171412]/80 hover:bg-white/20 text-white border-white/20 backdrop-blur-md'
            "
            @click="emit('select-category', null)"
          >
            <i class="mdi mdi-view-grid text-base"></i>
            <span>ทั้งหมดทุกประเภท</span>
          </button>

          <button
            v-for="cat in categories"
            :key="cat.shopCategoryId"
            type="button"
            class="px-5 py-2.5 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-2 cursor-pointer border-2"
            :class="
              selectedCategoryId === cat.shopCategoryId
                ? 'bg-[#D96C2C] text-white border-[#D96C2C] shadow-lg scale-102'
                : 'bg-[#171412]/80 hover:bg-white/20 text-white border-white/20 backdrop-blur-md'
            "
            @click="emit('select-category', cat.shopCategoryId)"
          >
            <i class="mdi mdi-storefront-outline text-base text-amber-300"></i>
            <span>{{ cat.categoryName }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
