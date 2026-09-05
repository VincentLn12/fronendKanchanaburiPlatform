<script setup lang="ts">
interface Props {
  subtotal: number
  shippingFee: number
  totalAmount: number
  orderId: string
  canPay: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-4">
    <div class="border-t-2 border-[#E8D9C9] pt-6 space-y-3 text-sm font-semibold">
      <div class="flex justify-between text-[#786B62]">
        <span>ราคาสินค้ารวม</span>
        <span class="font-black text-[#332820]"
          >฿ {{ Number(subtotal).toLocaleString('th-TH') }}</span
        >
      </div>
      <div class="flex justify-between text-[#786B62]">
        <span>ค่าจัดส่ง</span>
        <span class="font-black text-[#332820]"
          >฿ {{ Number(shippingFee).toLocaleString('th-TH') }}</span
        >
      </div>
      <div
        class="flex justify-between border-t-2 border-[#E8D9C9] pt-4 text-base font-black"
      >
        <span class="text-[#332820]">ยอดรวมสุทธิ</span>
        <span class="text-2xl text-[#D96C2C]"
          >฿ {{ Number(totalAmount).toLocaleString('th-TH') }}</span
        >
      </div>
    </div>

    <!-- Pay CTA if not paid -->
    <div v-if="canPay" class="pt-4 flex justify-end">
      <RouterLink
        :to="`/orders/${orderId}/pay`"
        class="inline-flex items-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-7 py-3.5 text-xs sm:text-sm font-black text-white shadow-lg transition border border-[#D96C2C] active:scale-95 cursor-pointer"
      >
        <i class="mdi mdi-credit-card-outline text-lg text-white"></i>
        <span class="!text-white font-black">ไปที่หน้าชำระเงิน</span>
      </RouterLink>
    </div>
  </div>
</template>
