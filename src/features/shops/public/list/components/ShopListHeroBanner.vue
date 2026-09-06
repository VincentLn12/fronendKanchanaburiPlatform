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
  <section class="relative bg-slate-900 text-white border-b border-slate-800 overflow-hidden">
    <!-- Authentic Kanchanaburi Landmark Background Cover -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <img
        :src="heroCoverImage"
        alt="ทิวทัศน์เมืองกาญจนบุรี"
        class="w-full h-full object-cover object-center scale-105 contrast-105 brightness-95"
      />
      <!-- Deep Cinematic Multi-layer Gradient Overlays for High Legibility and Dignified Tone -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-teal-950/90 to-slate-900/70"
      ></div>
      <div
        class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/50"
      ></div>
      <!-- Subtle Emerald Nature Tint Overlay -->
      <div class="absolute inset-0 bg-emerald-600/10 mix-blend-multiply"></div>
    </div>

    <div class="relative mx-auto w-full max-w-[1800px] px-3 sm:px-6 lg:px-10 py-5 sm:py-7 space-y-4">
      <!-- Top Provincial Identity Badge & Mode Switcher -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <!-- Serious Official Provincial Tag -->
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/40 backdrop-blur-md border border-emerald-400/30 text-[11px] sm:text-xs font-bold text-emerald-200 shadow-sm self-start sm:self-auto"
        >
          <i class="mdi mdi-seal-variant text-emerald-400 text-sm"></i>
          <span>ศูนย์รวมร้านค้าและสินค้าชุมชนจังหวัดกาญจนบุรี</span>
          <span class="text-white/40">•</span>
          <span class="text-white/90">จังหวัดกาญจนบุรี</span>
        </div>

        <!-- Mode Switcher: Shops / Map -->
        <div class="inline-flex shrink-0 self-start sm:self-auto border border-white/20 bg-slate-950/80 backdrop-blur-md p-1 rounded-xl shadow-md">
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer"
            :class="viewMode === 'shops' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'"
            @click="emit('update:viewMode', 'shops')"
          >
            <i class="mdi mdi-storefront-outline text-sm"></i>
            <span>ร้านค้า</span>
          </button>
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer"
            :class="viewMode === 'map' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'"
            @click="emit('update:viewMode', 'map')"
          >
            <i class="mdi mdi-map-marker-radius text-sm"></i>
            <span>แผนที่</span>
          </button>
        </div>
      </div>

      <div class="space-y-2.5 text-center sm:text-left max-w-3xl">
        <div class="space-y-1.5">
          <h1
            class="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md"
          >
            ศูนย์รวมร้านค้าและของดีเมืองกาญจน์
          </h1>
          <p
            class="text-xs sm:text-sm text-slate-200/90 font-medium leading-relaxed drop-shadow-sm max-w-2xl"
          >
            แพลตฟอร์มรวบรวมร้านค้า วิสาหกิจชุมชน และผู้ประกอบการท้องถิ่นทั้ง 13
            อำเภอในจังหวัดกาญจนบุรี ส่งเสริมเศรษฐกิจสร้างสรรค์ และงานหัตถกรรมคุณภาพ
          </p>
        </div>

        <!-- Official Quality Credential Indicators (Compact Single Line) -->
        <div class="flex flex-wrap items-center gap-2.5 pt-1 justify-center sm:justify-start">
          <div
            class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/15 shadow-sm"
          >
            <div
              class="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 shrink-0 shadow-2xs"
            >
              <i class="mdi mdi-store-check text-base"></i>
            </div>
            <div class="text-left">
              <span class="font-bold text-white text-xs block leading-none"
                >ผู้ประกอบการรับรอง</span
              >
              <span class="text-[10px] text-amber-200 font-semibold">13 อำเภอ</span>
            </div>
          </div>

          <div
            class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/15 shadow-sm"
          >
            <div
              class="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-2xs"
            >
              <i class="mdi mdi-shield-check text-base text-white"></i>
            </div>
            <div class="text-left">
              <span class="font-bold text-white text-xs block leading-none"
                >ของแท้จากแหล่งผลิต</span
              >
              <span class="text-[10px] text-emerald-300 font-semibold">การันตีคุณภาพ</span>
            </div>
          </div>

          <div
            class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/15 shadow-sm"
          >
            <div
              class="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 shrink-0 shadow-2xs"
            >
              <i class="mdi mdi-star text-base text-slate-950"></i>
            </div>
            <div class="text-left">
              <span class="font-bold text-white text-xs block leading-none"
                >4.8 / 5.0 เรตติ้ง</span
              >
              <span class="text-[10px] text-amber-200 font-semibold"
                >จากผู้ซื้อจริง</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Category Navigation Pill Tabs -->
      <div class="pt-2.5 border-t border-white/15 space-y-1.5">
        <div class="flex items-center justify-between text-xs font-bold text-amber-200/90">
          <span class="flex items-center gap-1.5">
            <i class="mdi mdi-tag-multiple-outline text-amber-400"></i>
            เลือกชมตามประเภทผลิตภัณฑ์ชุมชน:
          </span>
        </div>

        <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer border shadow-sm"
            :class="
              selectedCategoryId === null
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-102 font-black'
                : 'bg-slate-900/80 hover:bg-white/20 text-white border-white/20 backdrop-blur-md'
            "
            @click="emit('select-category', null)"
          >
            <i class="mdi mdi-view-grid text-sm"></i>
            <span>ทั้งหมดทุกประเภท</span>
          </button>

          <button
            v-for="cat in categories"
            :key="cat.shopCategoryId"
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer border"
            :class="
              selectedCategoryId === cat.shopCategoryId
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-102 font-black'
                : 'bg-slate-900/80 hover:bg-white/20 text-white border-white/20 backdrop-blur-md'
            "
            @click="emit('select-category', cat.shopCategoryId)"
          >
            <i class="mdi mdi-storefront-outline text-sm text-amber-300"></i>
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
