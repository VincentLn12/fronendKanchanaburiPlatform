<script setup lang="ts">
import type { Shop } from '@/features/shops/api'

defineProps<{
  shop: Shop
  hasShopLocation: boolean
}>()

const isFollowing = defineModel<boolean>('isFollowing', { default: false })

const emit = defineEmits<{
  (e: 'copy-link'): void
  (e: 'open-directions'): void
}>()
</script>

<template>
  <div
    class="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-[#FFF9F2]/95 backdrop-blur-md border-t-2 border-[#E8D9C9] px-4 py-3 shadow-2xl flex items-center gap-2"
  >
    <!-- Follow Button -->
    <button
      type="button"
      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 transition active:scale-95 cursor-pointer"
      :class="
        isFollowing
          ? 'bg-slate-800 border-slate-800 text-white'
          : 'bg-[#FFF9F2] border-[#E8D9C9] text-[#D96C2C]'
      "
      :aria-pressed="isFollowing"
      aria-label="ติดตามร้านค้า"
      @click="isFollowing = !isFollowing"
    >
      <i :class="['mdi text-lg', isFollowing ? 'mdi-check' : 'mdi-heart-outline']"></i>
    </button>

    <!-- Share Button -->
    <button
      type="button"
      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-[#E8D9C9] bg-[#FFF9F2] text-[#D96C2C] cursor-pointer"
      aria-label="แชร์ร้านค้านี้"
      @click="emit('copy-link')"
    >
      <i class="mdi mdi-share-variant-outline text-lg"></i>
    </button>

    <!-- Call Button -->
    <a
      v-if="shop.phone"
      :href="`tel:${shop.phone}`"
      class="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-[#FFF9F2] border-2 border-[#D96C2C] text-[#D96C2C] font-extrabold text-xs active:scale-95 transition"
    >
      <i class="mdi mdi-phone-outline text-base text-[#D96C2C]"></i>
      <span>โทรติดต่อ</span>
    </a>

    <!-- Directions Button -->
    <button
      v-if="hasShopLocation"
      type="button"
      class="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-[#D96C2C] text-white font-extrabold text-xs shadow-md active:scale-95 transition cursor-pointer border border-[#D96C2C]"
      @click="emit('open-directions')"
    >
      <i class="mdi mdi-navigation-variant text-base text-white"></i>
      <span class="text-white">นำทาง</span>
    </button>
  </div>
</template>
