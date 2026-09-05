<script setup lang="ts">
export interface OrderItem {
  orderItemId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Props {
  items: OrderItem[]
  totalItems: number
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-4">
    <h2
      class="flex items-center gap-2 text-base font-black text-[#332820] border-b-2 border-[#E8D9C9] pb-3"
    >
      <i class="mdi mdi-package-variant-closed text-[#D96C2C] text-xl"></i>
      รายการสินค้าในออเดอร์ ({{ totalItems }} ชิ้น)
    </h2>

    <div class="space-y-3">
      <div
        v-for="item in items"
        :key="item.orderItemId"
        class="flex items-center justify-between gap-4 rounded-2xl bg-[#F7F0E6] p-4 border-2 border-[#E8D9C9]"
      >
        <div>
          <h3 class="font-black text-[#332820] text-sm sm:text-base">
            {{ item.productName }}
          </h3>
          <p class="mt-1 text-xs text-[#786B62] font-semibold">
            ฿ {{ Number(item.unitPrice).toLocaleString('th-TH') }} ×
            {{ item.quantity }} ชิ้น
          </p>
        </div>
        <div class="text-right font-black text-[#D96C2C] text-base">
          ฿ {{ Number(item.totalPrice).toLocaleString('th-TH') }}
        </div>
      </div>
    </div>
  </div>
</template>
