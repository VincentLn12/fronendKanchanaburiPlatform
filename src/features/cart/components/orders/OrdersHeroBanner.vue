<script setup lang="ts">
// Top decorative header banner for Orders list
</script>

<template>
  <section class="relative overflow-hidden bg-[#171412] pt-12 pb-16 text-white shadow-md">
    <!-- Ambient Decorative Glows -->
    <div class="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#D96C2C]/20 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#F2A65A]/15 blur-3xl pointer-events-none"></div>

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div class="space-y-2">
          <div class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#D96C2C]/30 px-3.5 py-1 text-xs font-black text-[#F2A65A] backdrop-blur-md">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F2A65A] opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-[#F2A65A]"></span>
            </span>
            <span>ศูนย์รวมการสั่งซื้อสินค้ากาญจนบุรี</span>
          </div>
          <h1 class="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            การซื้อของฉัน
          </h1>
          <p class="text-xs sm:text-sm text-[#F7F0E6]/80 max-w-lg font-semibold">
            ติดตามสถานะ ตรวจสอบประวัติ และจัดการคำสั่งซื้อสินค้าเมืองกาญจน์ได้ครบในที่เดียว
          </p>
        </div>

        <RouterLink
          to="/shops"
          class="inline-flex items-center gap-2 rounded-2xl border-2 border-white/20 bg-white/10 px-5 py-3 text-xs font-black text-white backdrop-blur-md shadow-lg transition duration-200 hover:bg-white/20 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <i class="mdi mdi-storefront-outline text-base text-[#F2A65A]"></i>
          <span class="text-white font-black">เลือกซื้อสินค้าเพิ่ม</span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
