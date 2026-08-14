<template>
  <section
    class="relative pt-5 pb-5 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-white via-indigo-50/30 to-white"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="grid gap-12 lg:grid-cols-12 lg:items-center">
        <!-- Hero Text -->
        <div class="lg:col-span-6 space-y-8 text-center lg:text-left">
          <div
            class="inline-flex items-center gap-2.5 rounded-full bg-indigo-50 border border-indigo-200/80 px-4 py-1.5 text-xs font-black text-indigo-700 uppercase tracking-wider shadow-xs"
          >
            <span class="relative flex h-2.5 w-2.5">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"
              ></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            สถาบันพัฒนาทักษะซอฟต์แวร์ระดับมืออาชีพ
          </div>

          <h1
            class="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl leading-[1.12] text-slate-900"
          >
            ยกระดับศักยภาพวิชาชีพ<br />
            <span class="text-indigo-600">ก้าวสู่นักพัฒนามืออาชีพ</span>
          </h1>

          <p
            class="mx-auto lg:mx-0 max-w-lg text-slate-600 text-base sm:text-lg leading-relaxed font-medium"
          >
            เจาะลึกทักษะวิทยาการคอมพิวเตอร์ เทคโนโลยีสารสนเทศ และการออกแบบซอฟต์แวร์
            ด้วยหลักสูตรเข้มข้นที่ถ่ายทอดโดยผู้เชี่ยวชาญในอุตสาหกรรม
          </p>

          <!-- CTA Buttons -->
          <div
            class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
          >
            <RouterLink
              to="/courses"
              class="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-indigo-600/25 hover:bg-indigo-700 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              เริ่มต้นสำรวจหลักสูตร
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="ml-2.5 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </RouterLink>
            <a
              href="#dashboard-demo"
              class="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-8 py-4 text-base font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 shadow-xs"
            >
              สาธิตระบบการเรียนรู้
            </a>
          </div>

          <!-- Stats Bar -->
          <div
            class="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200/80 max-w-md mx-auto lg:mx-0"
          >
            <div class="space-y-1 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p class="text-2xl sm:text-3xl font-black text-slate-900">15K+</p>
              <p
                class="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-extrabold"
              >
                ผู้ลงทะเบียน
              </p>
            </div>
            <div
              class="space-y-1 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 shadow-xs"
            >
              <p class="text-2xl sm:text-3xl font-black text-indigo-600">120+</p>
              <p
                class="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-extrabold"
              >
                หลักสูตรมาตรฐาน
              </p>
            </div>
            <div
              class="space-y-1 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 shadow-xs"
            >
              <p class="text-2xl sm:text-3xl font-black text-emerald-600">4.9/5</p>
              <p
                class="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-extrabold"
              >
                คะแนนรีวิว
              </p>
            </div>
          </div>
        </div>

        <!-- Hero Card Mockup -->
        <div class="lg:col-span-6 relative">
          <div class="relative mx-auto max-w-md lg:max-w-none">
            <!-- Backlight Glow -->
            <div
              class="absolute -inset-2 bg-indigo-500/20 rounded-[3rem] blur-2xl opacity-60 pointer-events-none"
            ></div>

            <div
              class="relative rounded-3xl bg-white border border-slate-200/90 p-4 shadow-2xl shadow-indigo-950/10"
            >
              <div
                class="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-inner group"
              >
                <img
                  src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern Coding Workspace"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"
                ></div>

                <!-- Live Tag Overlay -->
                <div
                  class="absolute top-3.5 right-3.5 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/15 text-white text-xs font-extrabold shadow-sm"
                >
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>พร้อมใช้งานตลอด 24 ชม.</span>
                </div>
              </div>

              <!-- Floating Card Badge Left -->
              <div
                class="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-3.5 hidden sm:flex"
              >
                <div
                  class="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-500/20"
                >
                  ✓
                </div>
                <div>
                  <p class="text-xs font-extrabold text-slate-900">วุฒิบัตรรับรองการศึกษา</p>
                  <p class="text-[11px] text-slate-500 font-medium">
                    รับรองโดยสถาบันเทคโนโลยีชั้นนำ
                  </p>
                </div>
              </div>

              <!-- Floating Card Badge Right -->
              <div
                class="absolute -top-6 -right-6 bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-3 hidden sm:flex"
              >
                <div class="flex -space-x-2">
                  <img
                    class="w-8 h-8 rounded-full border-2 border-white object-cover shadow-xs"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  />
                  <img
                    class="w-8 h-8 rounded-full border-2 border-white object-cover shadow-xs"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                  />
                  <img
                    class="w-8 h-8 rounded-full border-2 border-white object-cover shadow-xs"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                  />
                </div>
                <div>
                  <p class="text-xs font-extrabold text-slate-900">ผู้เรียนสำเร็จแล้ว</p>
                  <p class="text-[10px] text-amber-600 font-black">⭐ 4.9/5 (1,200+ รีวิว)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
