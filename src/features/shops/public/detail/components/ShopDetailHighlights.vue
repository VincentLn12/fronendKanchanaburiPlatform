<script setup lang="ts">
import type { Shop } from '@/features/shops/api'

defineProps<{
  shop: Shop
}>()
</script>

<template>
  <div class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 shadow-xs space-y-4">
    <div class="border-b-2 border-[#E8D9C9] pb-3">
      <h3 class="font-black text-[#332820] text-base flex items-center gap-2">
        <i class="mdi mdi-[#D96C2C] mdi-star-circle-outline text-xl text-[#D96C2C]"></i>
        <span>จุดเด่นของร้านค้า</span>
      </h3>
    </div>

    <ul class="space-y-2.5 text-xs font-extrabold text-[#332820]">
      <li class="flex items-center gap-2">
        <i class="mdi mdi-check-circle text-[#D96C2C] text-base"></i>
        <span>สินค้าและผลผลิตชุมชนแท้ 100%</span>
      </li>
      <li class="flex items-center gap-2">
        <i class="mdi mdi-check-circle text-[#D96C2C] text-base"></i>
        <span>สนับสนุนเศรษฐกิจชุมชนกาญจนบุรี</span>
      </li>
      <li class="flex items-center gap-2">
        <i class="mdi mdi-check-circle text-[#D96C2C] text-base"></i>
        <span>จัดส่งพัสดุด่วนปลอดภัยถึงบ้าน</span>
      </li>
      <li class="flex items-center gap-2">
        <i class="mdi mdi-check-circle text-[#D96C2C] text-base"></i>
        <span>ผ่านการยืนยันตัวตนร้านค้าอย่างถูกต้อง</span>
      </li>
    </ul>
  </div>
</template>
