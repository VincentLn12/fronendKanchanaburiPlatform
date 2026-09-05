<script setup lang="ts">
interface Props {
  total: number
  shippingFee: number
  grandTotal: number
  checkingOut: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'checkout': []
}>()
</script>

<template>
  <div class="space-y-4">
    <!-- Cost Calculation Rows -->
    <div class="space-y-3 border-b-2 border-[#E8D9C9] pb-4 text-sm font-semibold">
      <div class="flex justify-between text-[#786B62]">
        <span>ยอดรวมสินค้า</span>
        <span class="font-black text-[#332820]">
          ฿ {{ total.toLocaleString('th-TH') }}
        </span>
      </div>
      <div class="flex justify-between text-[#786B62]">
        <span>ค่าจัดส่ง</span>
        <span class="font-black text-[#332820]">
          {{ shippingFee > 0 ? `฿ ${shippingFee.toLocaleString('th-TH')}` : 'ฟรี' }}
        </span>
      </div>
      <div class="flex justify-between border-t-2 border-[#E8D9C9] pt-3 text-base font-black">
        <span class="text-[#332820]">ยอดรวมทั้งสิ้น</span>
        <span class="text-2xl text-[#D96C2C]">
          ฿ {{ grandTotal.toLocaleString('th-TH') }}
        </span>
      </div>
    </div>

    <!-- Checkout CTA Button -->
    <button
      type="button"
      class="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-6 py-4 text-sm sm:text-base font-black text-white shadow-xl transition active:scale-95 disabled:opacity-50 cursor-pointer border border-[#D96C2C]"
      :disabled="checkingOut"
      @click="emit('checkout')"
    >
      <i v-if="checkingOut" class="mdi mdi-loading mdi-spin text-xl text-white"></i>
      <template v-else>
        <i class="mdi mdi-check-circle-outline text-xl text-white"></i>
        <span class="!text-white font-black">ดำเนินการสั่งซื้อสินค้า</span>
      </template>
    </button>

    <!-- Trust Badges -->
    <div class="pt-2 text-center text-[11px] text-[#786B62] space-y-1 font-semibold">
      <p class="flex items-center justify-center gap-1">
        <i class="mdi mdi-shield-check text-emerald-600 text-sm"></i>
        <span>การชำระเงินปลอดภัย 100% ผ่านระบบมาตรฐาน</span>
      </p>
      <p class="text-[10px] text-[#786B62]">สนับสนุนสินค้าเกษตรและสินค้าชุมชนเมืองกาญจน์</p>
    </div>
  </div>
</template>
