<script setup lang="ts">
import type { Shop } from '@/features/shops/api'

defineProps<{
  shop: Shop
  businessHours: string
  isOpenNow: boolean
  shopAddress: string
  hasShopLocation: boolean
}>()

defineEmits<{
  (e: 'open-map'): void
}>()
</script>

<template>
  <section class="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
    <div class="rounded-3xl bg-[#FFF9F2] p-5 sm:p-6 shadow-xl border-2 border-[#E8D9C9]">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Contact Phone -->
        <div class="flex items-center gap-3.5 p-2">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D96C2C]/10 text-[#D96C2C] shrink-0 border border-[#D96C2C]/20">
            <i class="mdi mdi-phone text-xl"></i>
          </div>
          <div>
            <span class="block text-[10px] font-black uppercase text-[#786B62]">เบอร์โทรศัพท์</span>
            <a :href="`tel:${shop.phone || '0823456789'}`" class="text-xs sm:text-sm font-black text-[#332820] hover:text-[#D96C2C] transition">
              {{ shop.phone || '082-345-6789' }}
            </a>
          </div>
        </div>

        <!-- Business Hours & Status -->
        <div class="flex items-center gap-3.5 p-2">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D96C2C]/10 text-[#D96C2C] shrink-0 border border-[#D96C2C]/20">
            <i class="mdi mdi-clock-outline text-xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="block text-[10px] font-black uppercase text-[#786B62]">เวลาทำการ</span>
              <span
                class="px-2 py-0.5 rounded-md text-[10px] font-black"
                :class="isOpenNow ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'"
              >
                {{ isOpenNow ? 'เปิดอยู่' : 'ปิดทำการ' }}
              </span>
            </div>
            <span class="text-xs font-black text-[#332820]">{{ businessHours }}</span>
          </div>
        </div>

        <!-- Shop Location Address -->
        <div class="flex items-center gap-3.5 p-2 lg:col-span-2">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D96C2C]/10 text-[#D96C2C] shrink-0 border border-[#D96C2C]/20">
            <i class="mdi mdi-map-marker-radius text-xl"></i>
          </div>
          <div class="flex-1 min-w-0">
            <span class="block text-[10px] font-black uppercase text-[#786B62]">ที่ตั้งร้านค้า</span>
            <p class="text-xs font-black text-[#332820] truncate">{{ shopAddress }}</p>
          </div>
          <button
            v-if="hasShopLocation"
            type="button"
            class="px-3 py-1.5 rounded-xl bg-[#D96C2C] text-white text-xs font-black hover:bg-[#BF5720] transition shrink-0 border border-[#D96C2C]"
            @click="$emit('open-map')"
          >
            แผนที่
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
