<script setup lang="ts">
import type { UserAddress } from '@/features/cart/api/userAddressApi'

interface Props {
  addresses: UserAddress[]
}

defineProps<Props>()
</script>

<template>
  <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 sm:p-8 shadow-xs space-y-6">
    <!-- Header -->
    <div class="border-b-2 border-[#E8D9C9] pb-4">
      <h2 class="text-xl sm:text-2xl font-black text-[#332820]">
        ที่อยู่จัดส่งของฉัน (Delivery Addresses)
      </h2>
      <p class="text-xs sm:text-sm text-[#786B62] font-semibold mt-1">
        สมุดที่อยู่สำหรับจัดส่งสินค้าที่คุณใช้ในการสั่งซื้อสินค้าผ่านแพลตฟอร์ม
      </p>
    </div>

    <!-- Empty State -->
    <div
      v-if="!addresses.length"
      class="text-center py-16 px-4 rounded-2xl bg-[#F7F0E6] border-2 border-dashed border-[#E8D9C9] space-y-3"
    >
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D96C2C]/15 text-[#D96C2C]">
        <i class="mdi mdi-map-marker-plus-outline text-3xl"></i>
      </div>
      <h3 class="text-base font-black text-[#332820]">ยังไม่มีที่อยู่จัดส่งที่บันทึกไว้</h3>
      <p class="text-xs text-[#786B62] max-w-sm mx-auto font-semibold">
        คุณสามารถบันทึกที่อยู่จัดส่งได้โดยอัตโนมัติเมื่อทำการสั่งซื้อสินค้าในหน้าตะกร้า
      </p>
      <div class="pt-2">
        <RouterLink
          to="/shops"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D96C2C] text-white font-black text-xs shadow-md transition hover:bg-[#BF5720]"
        >
          <i class="mdi mdi-storefront text-sm"></i>
          <span>เลือกซื้อสินค้าและระบุที่อยู่</span>
        </RouterLink>
      </div>
    </div>

    <!-- Address Cards -->
    <div v-else class="space-y-4">
      <div
        v-for="addr in addresses"
        :key="addr.userAddressId"
        class="rounded-2xl border-2 border-[#E8D9C9] bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div class="space-y-1.5">
          <div class="flex items-center gap-2">
            <span class="font-black text-[#332820] text-sm sm:text-base">
              {{ addr.recipientName }}
            </span>
            <span class="text-xs text-[#786B62] font-semibold">
              · {{ addr.recipientPhone }}
            </span>
            <span
              v-if="addr.isDefault"
              class="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300"
            >
              ค่าเริ่มต้น
            </span>
          </div>

          <p class="text-xs text-[#786B62] font-semibold leading-relaxed">
            {{ [addr.addressLine, addr.subDistrict, addr.district, addr.province, addr.postalCode].filter(Boolean).join(' ') }}
          </p>
        </div>

        <div class="shrink-0 flex items-center gap-2">
          <span class="text-xs font-black text-[#D96C2C] bg-[#D96C2C]/10 px-3 py-1 rounded-xl border border-[#D96C2C]/20 flex items-center gap-1">
            <i class="mdi mdi-check-circle text-xs"></i>
            พร้อมใช้งาน
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
