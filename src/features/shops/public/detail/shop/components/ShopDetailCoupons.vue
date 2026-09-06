<script setup lang="ts">
import { ref } from 'vue'
import { push } from 'notivue'

const collected = ref<Record<number, boolean>>({})

const coupons = [
  {
    id: 1,
    title: 'ลด ฿150',
    desc: 'เมื่อซื้อครบ ฿1,500',
    type: 'discount',
    color: 'border-emerald-500 bg-emerald-50 text-emerald-800',
    badge: 'สิทธิพิเศษ',
  },
  {
    id: 2,
    title: 'ส่งฟรีทั้งร้าน',
    desc: 'เมื่อซื้อครบ ฿500',
    type: 'shipping',
    color: 'border-blue-500 bg-blue-50 text-blue-800',
    badge: 'ส่งฟรีทั่วไทย',
  },
  {
    id: 3,
    title: 'คืน 10% คอยน์',
    desc: 'สูงสุด 200 คอยน์',
    type: 'coin',
    color: 'border-amber-500 bg-amber-50 text-amber-800',
    badge: 'คืนคอยน์',
  },
  {
    id: 4,
    title: 'ลดทันที 15%',
    desc: 'สำหรับลูกค้าใหม่',
    type: 'new',
    color: 'border-amber-600 bg-amber-50 text-amber-800',
    badge: 'ลูกค้าใหม่',
  },
]

function collectCoupon(c: (typeof coupons)[0]) {
  collected.value[c.id] = true
  push.success({
    title: `เก็บคูปอง "${c.title}" สำเร็จ!`,
    message: `${c.desc} โค้ดจะถูกนำไปใช้ในหน้าชำระเงินอัตโนมัติ`,
  })
}
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="font-black text-[#332820] text-sm sm:text-base flex items-center gap-2">
        <i class="mdi mdi-ticket-percent-outline text-xl text-emerald-700"></i>
        <span>คูปองส่วนลดพิเศษของร้าน</span>
      </h3>
      <span class="text-xs font-semibold text-[#786B62]">เก็บแล้วใช้ได้ทันทีเมื่อสั่งซื้อ</span>
    </div>

    <!-- Coupons Row Grid (Mobile Touch Swipe Carousel + Desktop 4 Cols) -->
    <div class="flex overflow-x-auto pb-2 gap-3 snap-x snap-mandatory scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
      <div
        v-for="c in coupons"
        :key="c.id"
        class="min-w-[260px] sm:min-w-0 snap-center relative rounded-2xl border-2 p-3.5 flex items-center justify-between gap-3 shadow-xs transition hover:shadow-md shrink-0 sm:shrink"
        :class="c.color"
      >
        <div class="min-w-0 space-y-0.5">
          <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/90 border border-current shadow-2xs">
            {{ c.badge }}
          </span>
          <h4 class="font-black text-base sm:text-lg leading-tight mt-1">{{ c.title }}</h4>
          <p class="text-[11px] font-semibold opacity-90 truncate">{{ c.desc }}</p>
        </div>

        <button
          type="button"
          class="shrink-0 px-3.5 py-2 rounded-xl text-xs font-black shadow-xs transition active:scale-95 cursor-pointer"
          :class="
            collected[c.id]
              ? 'bg-slate-200 text-slate-600 cursor-default'
              : 'bg-[#332820] hover:bg-black text-white'
          "
          :disabled="collected[c.id]"
          @click="collectCoupon(c)"
        >
          {{ collected[c.id] ? 'เก็บแล้ว' : 'เก็บโค้ด' }}
        </button>
      </div>
    </div>
  </section>
</template>
