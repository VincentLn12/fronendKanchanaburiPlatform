<script setup lang="ts">
// Empty Cart State Component
</script>

<template>
  <div
    class="my-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#E8D9C9] bg-[#FFF9F2] py-20 px-6 text-center shadow-sm"
  >
    <div
      class="flex h-20 w-20 items-center justify-center rounded-full bg-[#D96C2C]/15 text-[#D96C2C] mb-4 border border-[#D96C2C]/30"
    >
      <i class="mdi mdi-cart-off text-4xl"></i>
    </div>
    <h2 class="text-2xl font-black text-[#332820]">ตะกร้าสินค้าของคุณยังว่างอยู่</h2>
    <p class="mt-2 max-w-md text-xs sm:text-sm text-[#786B62] font-semibold">
      คุณยังไม่มีสินค้าในตะกร้า สามารถเลือกดูสินค้าขึ้นชื่อและของฝากจากร้านค้าต่างๆ
      ในกาญจนบุรีได้ทันที
    </p>
    <RouterLink
      to="/shops"
      class="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-6 py-3 text-xs sm:text-sm font-black text-white shadow-lg transition active:scale-95 border border-[#D96C2C]"
    >
      <i class="mdi mdi-storefront text-white"></i>
      <span class="!text-white font-black">สำรวจร้านค้าเมืองกาญจน์</span>
    </RouterLink>
  </div>
</template>
