<script setup lang="ts">
import type { Shop, ShopReviews } from '@/features/shops/api'

defineProps<{
  shop: Shop
  reviewData: ShopReviews
  formatReviewDate: (val: string) => string
  reviewerInitial: (name: string) => string
}>()
</script>

<template>
  <div class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 shadow-xs space-y-4">
    <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-3">
      <div>
        <h3 class="font-black text-[#332820] text-base">รีวิวจากลูกค้า</h3>
        <span
          v-if="reviewData.totalCount"
          class="text-xs font-black text-[#D96C2C] flex items-center gap-1 mt-0.5"
        >
          <i class="mdi mdi-star"></i>
          {{ reviewData.averageRating.toFixed(1) }}
          <span class="text-[#786B62] font-normal">จาก {{ reviewData.totalCount }} รีวิว</span>
        </span>
        <span v-else class="mt-0.5 block text-xs text-[#786B62]">ยังไม่มีรีวิวจากผู้ซื้อ</span>
      </div>
    </div>

    <div
      v-if="reviewData.reviews.length"
      class="space-y-4 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin"
    >
      <div
        v-for="rev in reviewData.reviews"
        :key="rev.reviewId"
        class="border-b border-[#E8D9C9] pb-3.5 text-xs space-y-2 last:border-0 last:pb-0"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span
              class="flex h-7 w-7 items-center justify-center rounded-full bg-[#D96C2C] font-black text-white text-xs shadow-2xs"
            >
              {{ reviewerInitial(rev.userName || rev.reviewerName || 'ผู้ใช้งาน') }}
            </span>
            <span class="font-bold text-[#332820]">{{
              rev.userName || rev.reviewerName || 'ผู้ใช้งาน'
            }}</span>
          </div>
          <span class="text-[10px] text-[#786B62]">{{ formatReviewDate(rev.createdAt) }}</span>
        </div>

        <div v-if="rev.rating > 0" class="flex text-[#D96C2C] text-xs">
          <i v-for="s in rev.rating" :key="s" class="mdi mdi-star"></i>
        </div>
        <p class="text-[#786B62] leading-relaxed font-medium">{{ rev.comment }}</p>

        <!-- Shop Reply Box -->
        <div
          v-if="rev.reply"
          class="rounded-xl bg-[#F7F0E6] p-3 text-[11px] text-[#786B62] border border-[#E8D9C9]"
        >
          <div class="font-bold text-[#D96C2C] mb-1 flex items-center gap-1">
            <i class="mdi mdi-reply text-[#D96C2C]"></i>
            <span>ร้านค้าตอบกลับ</span>
          </div>
          <p>{{ rev.reply }}</p>
        </div>
      </div>
    </div>

    <p v-else class="rounded-2xl bg-[#F7F0E6]/60 px-4 py-6 text-center text-xs text-[#786B62]">
      ยังไม่มีรีวิวสำหรับร้านค้านี้
    </p>
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 5px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #e8d9c9;
  border-radius: 9999px;
}
</style>
