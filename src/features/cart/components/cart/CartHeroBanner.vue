<script setup lang="ts">
// Top decorative header banner for Shopping Cart
</script>

<template>
  <section class="bg-[#171412] py-12 text-white shadow-sm relative overflow-hidden">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div
            class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#D96C2C]/30 px-3.5 py-1 text-xs font-black text-[#F2A65A] backdrop-blur-md mb-2"
          >
            <i class="mdi mdi-cart-outline text-[#F2A65A]"></i>
            <span>ตระกร้าสินค้าเมืองกาญจน์</span>
          </div>
          <h1 class="text-3xl font-black tracking-tight text-white sm:text-4xl">
            ตะกร้าสินค้าของคุณ
          </h1>
        </div>

        <div class="flex items-center gap-3">
          <RouterLink
            to="/shops"
            class="inline-flex items-center gap-2 rounded-2xl border-2 border-white/20 bg-white/10 px-4 py-2.5 text-xs font-black text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <i class="mdi mdi-storefront-outline text-base text-[#F2A65A]"></i>
            <span class="text-white font-black">เลือกซื้อสินค้าเพิ่ม</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
