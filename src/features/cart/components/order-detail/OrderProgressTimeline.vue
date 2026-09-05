<script setup lang="ts">
interface Props {
  currentStepIndex: number
}

defineProps<Props>()
</script>

<template>
  <div class="px-6 sm:px-8 pt-2 pb-4 border-b-2 border-[#E8D9C9]">
    <div
      class="text-xs font-black text-[#D96C2C] uppercase tracking-wider mb-4 flex items-center gap-1.5"
    >
      <i class="mdi mdi-truck-fast-outline text-base"></i>
      <span>สถานะการดำเนินการคำสั่งซื้อ</span>
    </div>

    <div class="grid grid-cols-4 gap-2 text-center relative">
      <!-- Step 1: สั่งซื้อสำเร็จ -->
      <div class="flex flex-col items-center space-y-1.5 relative z-10">
        <div
          class="h-9 w-9 rounded-full flex items-center justify-center text-xs font-black transition-all"
          :class="
            currentStepIndex >= 1
              ? 'bg-[#D96C2C] text-white shadow-md'
              : 'bg-slate-200 text-slate-500'
          "
        >
          <i class="mdi mdi-file-document-check text-base"></i>
        </div>
        <span
          class="text-[11px] font-black"
          :class="currentStepIndex >= 1 ? 'text-[#D96C2C]' : 'text-[#786B62]'"
          >สั่งซื้อสินค้า</span
        >
      </div>

      <!-- Step 2: ชำระเงิน -->
      <div class="flex flex-col items-center space-y-1.5 relative z-10">
        <div
          class="h-9 w-9 rounded-full flex items-center justify-center text-xs font-black transition-all"
          :class="
            currentStepIndex >= 2
              ? 'bg-[#D96C2C] text-white shadow-md'
              : 'bg-[#F7F0E6] text-[#786B62] border border-[#E8D9C9]'
          "
        >
          <i class="mdi mdi-credit-card-check text-base"></i>
        </div>
        <span
          class="text-[11px] font-black"
          :class="currentStepIndex >= 2 ? 'text-[#D96C2C]' : 'text-[#786B62]'"
          >ชำระเงินแล้ว</span
        >
      </div>

      <!-- Step 3: กำลังจัดส่ง -->
      <div class="flex flex-col items-center space-y-1.5 relative z-10">
        <div
          class="h-9 w-9 rounded-full flex items-center justify-center text-xs font-black transition-all"
          :class="
            currentStepIndex >= 3
              ? 'bg-[#D96C2C] text-white shadow-md'
              : 'bg-[#F7F0E6] text-[#786B62] border border-[#E8D9C9]'
          "
        >
          <i class="mdi mdi-truck-fast text-base"></i>
        </div>
        <span
          class="text-[11px] font-black"
          :class="currentStepIndex >= 3 ? 'text-[#D96C2C]' : 'text-[#786B62]'"
          >จัดส่งสินค้า</span
        >
      </div>

      <!-- Step 4: สำเร็จ -->
      <div class="flex flex-col items-center space-y-1.5 relative z-10">
        <div
          class="h-9 w-9 rounded-full flex items-center justify-center text-xs font-black transition-all"
          :class="
            currentStepIndex >= 4
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-[#F7F0E6] text-[#786B62] border border-[#E8D9C9]'
          "
        >
          <i class="mdi mdi-check-circle text-base"></i>
        </div>
        <span
          class="text-[11px] font-black"
          :class="currentStepIndex >= 4 ? 'text-emerald-700' : 'text-[#786B62]'"
          >สำเร็จสมบูรณ์</span
        >
      </div>
    </div>
  </div>
</template>
