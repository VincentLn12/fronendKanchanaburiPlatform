<script setup lang="ts">
import { useAuthStore } from '@/features/auth/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <section class="rounded-3xl bg-gradient-to-br from-[#171412] via-[#2A1D15] to-[#D96C2C] text-white p-8 sm:p-12 border-2 border-[#E8D9C9] shadow-2xl overflow-hidden relative">
    <!-- Background Glow Rings -->
    <div class="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-[#D96C2C]/30 filter blur-3xl pointer-events-none"></div>
    <div class="absolute top-0 left-1/3 w-64 h-64 rounded-full bg-[#F2A65A]/10 filter blur-2xl pointer-events-none"></div>

    <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
      <div class="space-y-4 text-center lg:text-left max-w-2xl">
        <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-[#D96C2C] text-white shadow-md border border-white/20">
          <i class="mdi mdi-store-plus text-sm"></i>
          สำหรับผู้ประกอบการ & ร้านค้าชุมชน
        </span>

        <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          เป็นเจ้าของธุรกิจ? เปิดร้านค้ากับเราวันนี้ (ฟรี)
        </h2>

        <p class="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-medium">
          เข้าถึงลูกค้าคุณภาพกว่า 5 ตำบลในกาญจนบุรี รับฟรีเครื่องมือจัดการร้านค้าระดับมืออาชีพ ฟรีค่าธรรมเนียม พร้อมทีมสนับสนุนตลอด 24 ชม.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-bold text-amber-200">
          <div class="flex items-center justify-center lg:justify-start gap-2">
            <i class="mdi mdi-check-circle text-emerald-400 text-base"></i>
            <span>ค่าธรรมเนียม 0% เดือนแรก</span>
          </div>
          <div class="flex items-center justify-center lg:justify-start gap-2">
            <i class="mdi mdi-check-circle text-emerald-400 text-base"></i>
            <span>อนุมัติเปิดร้านใน 24 ชม.</span>
          </div>
          <div class="flex items-center justify-center lg:justify-start gap-2">
            <i class="mdi mdi-check-circle text-emerald-400 text-base"></i>
            <span>รองรับระบบชำระเงินหลากช่องทาง</span>
          </div>
          <div class="flex items-center justify-center lg:justify-start gap-2">
            <i class="mdi mdi-check-circle text-emerald-400 text-base"></i>
            <span>เชื่อมต่อระบบขนส่งพัสดุอัตโนมัติ</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
        <RouterLink
          :to="auth.isLoggedIn ? '/register-shop' : '/login'"
          class="w-full sm:w-auto text-center px-8 py-4 rounded-2xl bg-white hover:bg-amber-50 text-[#332820] font-black text-sm sm:text-base shadow-2xl transition active:scale-95 border-2 border-white cursor-pointer"
        >
          สมัครเปิดร้านค้าชุมชน (ฟรี)
        </RouterLink>

        <RouterLink
          to="/about"
          class="w-full sm:w-auto text-center px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-sm backdrop-blur-md border border-white/20 transition cursor-pointer"
        >
          ดูสิทธิประโยชน์ผู้ขาย
        </RouterLink>
      </div>
    </div>
  </section>
</template>
