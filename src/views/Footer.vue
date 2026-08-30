<!-- Footer -->
<template>
  <footer class="relative z-10 bg-[#0d3831] text-emerald-100/80 pt-14 pb-8 overflow-hidden">
    <!-- Subtle River Kwai Bridge Silhouette Overlay Background -->
    <div class="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 pb-12 border-b border-emerald-800/40">
        <!-- Col 1: About Project -->
        <div class="lg:col-span-4 space-y-4">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-slate-900 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L9.5 7H14.5L12 2ZM12 7.5L8.5 13H15.5L12 7.5ZM12 13.5L7 20H17L12 13.5ZM5 21H19V22H5V21Z" />
              </svg>
            </div>
            <div class="flex flex-col">
              <span class="text-lg font-bold text-white leading-tight">เกี่ยวกับโครงการ</span>
            </div>
          </div>
          <p class="text-xs sm:text-sm leading-relaxed text-emerald-100/70 max-w-sm">
            แพลตฟอร์มท่องเที่ยวเชิงวัฒนธรรม แหล่งรวมเรื่องราว วัฒนธรรม ร้านค้า และสินค้าท้องถิ่น จากชุมชนสู่ชุมชน เพื่อคนกาญจนบุรี
          </p>
          <!-- Social Icons -->
          <div class="flex items-center gap-2 pt-2">
            <a href="#" class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900/60 text-emerald-200 hover:bg-amber-400 hover:text-slate-900 transition">
              <i class="mdi mdi-facebook text-lg"></i>
            </a>
            <a href="#" class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900/60 text-emerald-200 hover:bg-amber-400 hover:text-slate-900 transition">
              <i class="mdi mdi-instagram text-lg"></i>
            </a>
            <a href="#" class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900/60 text-emerald-200 hover:bg-amber-400 hover:text-slate-900 transition">
              <i class="mdi mdi-youtube text-lg"></i>
            </a>
            <a href="#" class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900/60 text-emerald-200 hover:bg-amber-400 hover:text-slate-900 transition">
              <i class="mdi mdi-web text-lg"></i>
            </a>
          </div>
        </div>

        <!-- Col 2: Quick Links -->
        <div class="lg:col-span-2 space-y-3">
          <h4 class="text-sm font-bold text-white tracking-wide">
            ลิงก์ด่วน
          </h4>
          <ul class="space-y-2 text-xs sm:text-sm">
            <li>
              <RouterLink to="/" class="hover:text-amber-400 transition-colors">หน้าแรก</RouterLink>
            </li>
            <li>
              <RouterLink to="/contents" class="hover:text-amber-400 transition-colors">คอนเทนต์</RouterLink>
            </li>
            <li>
              <RouterLink to="/contents" class="hover:text-amber-400 transition-colors">กิจกรรม</RouterLink>
            </li>
            <li>
              <RouterLink to="/shops" class="hover:text-amber-400 transition-colors">ร้านค้า</RouterLink>
            </li>
            <li>
              <RouterLink to="/shops" class="hover:text-amber-400 transition-colors">สินค้า</RouterLink>
            </li>
          </ul>
        </div>

        <!-- Col 3: Help -->
        <div class="lg:col-span-3 space-y-3">
          <h4 class="text-sm font-bold text-white tracking-wide">
            ช่วยเหลือ
          </h4>
          <ul class="space-y-2 text-xs sm:text-sm">
            <li>
              <a href="#" class="hover:text-amber-400 transition-colors">คำถามที่พบบ่อย</a>
            </li>
            <li>
              <a href="#" class="hover:text-amber-400 transition-colors">วิธีการใช้งาน</a>
            </li>
            <li>
              <a href="#" class="hover:text-amber-400 transition-colors">ติดต่อเรา</a>
            </li>
            <li>
              <a href="#" class="hover:text-amber-400 transition-colors">แจ้งปัญหา</a>
            </li>
          </ul>
        </div>

        <!-- Col 4: Contact Us -->
        <div class="lg:col-span-3 space-y-3">
          <h4 class="text-sm font-bold text-white tracking-wide">
            ติดต่อเรา
          </h4>
          <ul class="space-y-2.5 text-xs sm:text-sm">
            <li class="flex items-center gap-2.5">
              <i class="mdi mdi-phone text-emerald-300"></i>
              <span>034-123-456</span>
            </li>
            <li class="flex items-center gap-2.5">
              <i class="mdi mdi-email-outline text-emerald-300"></i>
              <span>info@kanchanaburi-platform.go.th</span>
            </li>
            <li class="flex items-start gap-2.5">
              <i class="mdi mdi-map-marker-outline text-emerald-300 mt-0.5"></i>
              <span class="leading-snug">ศาลากลางจังหวัดกาญจนบุรี อ.เมืองกาญจนบุรี จ.กาญจนบุรี 71000</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/60 gap-3">
        <p>© 2024 Kanchanaburi Cultural Platform. All rights reserved.</p>
        <div class="flex items-center gap-6">
          <a href="#" class="hover:text-white transition">นโยบายความเป็นส่วนตัว</a>
          <a href="#" class="hover:text-white transition">เงื่อนไขการใช้งาน</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
