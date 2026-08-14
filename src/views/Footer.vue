<!-- Footer -->
<template>
  <footer
    class="bg-slate-900 text-slate-400 py-16 border-t border-slate-800 relative z-10"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid gap-12 md:grid-cols-12">
        <div class="md:col-span-4 space-y-5">
          <RouterLink to="/" class="flex items-center gap-3">
            <span
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-indigo-600/35"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.4em"
                height="1.4em"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                class="text-white"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                />
              </svg>
            </span>
            <span class="text-xl font-black text-white tracking-tight"
              >E-Learning</span
            >
          </RouterLink>
          <p class="text-sm leading-relaxed text-slate-400">
            สร้างเสริมประสบการณ์การเรียนรู้ที่แตกต่าง
            เพื่อพัฒนาทักษะและยกระดับชีวิตการทำงานอย่างยั่งยืน
          </p>
        </div>

        <div class="md:col-span-2 space-y-4">
          <h4 class="text-xs font-bold text-white uppercase tracking-widest">
            เมนูหลัก
          </h4>
          <ul class="space-y-3 text-sm">
            <li>
              <RouterLink
                to="/"
                class="hover:text-white transition-colors duration-200"
                >หน้าแรก</RouterLink
              >
            </li>
            <li>
              <RouterLink
                to="/courses"
                class="hover:text-white transition-colors duration-200"
                >คอร์สทั้งหมด</RouterLink
              >
            </li>
          </ul>
        </div>

        <div class="md:col-span-3 space-y-4">
          <h4 class="text-xs font-bold text-white uppercase tracking-widest">
            เกี่ยวกับเรา
          </h4>
          <p class="text-sm text-slate-400">
            แพลตฟอร์มการเรียนรู้ออนไลน์ที่มุ่งเน้นเนื้อหาคุณภาพสูง อัปเดตตามเทคโนโลยีใหม่ล่าสุด
          </p>
        </div>

        <div class="md:col-span-3 space-y-4">
          <h4 class="text-xs font-bold text-white uppercase tracking-widest">
            ติดต่อผู้ดูแล
          </h4>
          <p class="text-sm text-slate-400">
            อีเมล: support@elearn.com<br />
            เวลาทำการ: จันทร์ - ศุกร์ 09:00 - 18:00 น.
          </p>
        </div>
      </div>

      <div
        class="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4"
      >
        <p>© 2026 E-Learn Platform. All rights reserved.</p>
        <p class="text-slate-400">ออกแบบและพัฒนาด้วย Vue 3 & Tailwind CSS</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
