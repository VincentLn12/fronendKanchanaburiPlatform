<template>
  <section
    id="dashboard-demo"
    class="py-24 bg-gradient-to-b from-slate-50 via-sky-50/40 to-white border-y border-slate-200/80 relative overflow-hidden text-slate-800"
  >
    <!-- Light Soft Background Orbs -->
    <div class="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-sky-300/20 blur-[120px]"></div>
    <div class="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-cyan-300/20 blur-[120px]"></div>

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="grid gap-12 lg:grid-cols-12 lg:items-center">
        <!-- Left Text Column -->
        <div class="lg:col-span-5 space-y-6">
          <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-wider text-sky-700 bg-sky-100/80 border border-sky-200 uppercase shadow-xs">
            <span class="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            การเรียนรู้แบบโต้ตอบ (Interactive)
          </span>
          <h2 class="text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
            ห้องเรียนเสมือนจริง<br />
            <span class="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent">ตอบโจทย์คนรุ่นใหม่</span>
          </h2>
          <p class="text-slate-600 text-base leading-relaxed">
            เปลี่ยนการเรียนรู้แบบเดิมให้เป็นการฝึกฝนที่สนุก ได้ลงมือทำจริง พร้อมระบบตรวจทานโค้ดและคำอธิบายเรียลไทม์
          </p>

          <div class="space-y-4 pt-2">
            <div class="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs backdrop-blur-md">
              <div
                class="h-11 w-11 shrink-0 rounded-xl bg-sky-50 border border-sky-200 text-blue-600 flex items-center justify-center font-black text-lg shadow-xs"
              >
                ✓
              </div>
              <div>
                <h4 class="font-extrabold text-slate-900 text-base">ระบบตรวจสอบโค้ดอัตโนมัติ (Auto-grader)</h4>
                <p class="text-sm text-slate-500 mt-0.5">
                  เขียนโค้ดและทดสอบผลลัพธ์บนเว็บได้ทันที ไม่ต้องติดตั้งโปรแกรมลงในเครื่อง
                </p>
              </div>
            </div>
            <div class="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs backdrop-blur-md">
              <div
                class="h-11 w-11 shrink-0 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-black text-lg shadow-xs"
              >
                ✓
              </div>
              <div>
                <h4 class="font-extrabold text-slate-900 text-base">ชุมชนผู้เรียน & Discord 24 ชม.</h4>
                <p class="text-sm text-slate-500 mt-0.5">
                  ปรึกษาโจทย์ ติดปัญหาโค้ด ถามตอบกับผู้ช่วยสอนและเพื่อนร่วมชั้นได้ตลอดเวลา
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Light IDE Mockup Column -->
        <div class="lg:col-span-7">
          <div
            class="w-full bg-white text-slate-800 rounded-[2.5rem] border border-slate-200/90 overflow-hidden shadow-2xl shadow-sky-900/10 relative group"
          >
            <!-- Window Top Bar -->
            <div
              class="relative z-10 bg-slate-100/90 px-6 py-4 flex items-center justify-between border-b border-slate-200"
            >
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-rose-400"></span>
                <span class="w-3 h-3 rounded-full bg-amber-400"></span>
                <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span class="text-xs text-slate-600 ml-4 font-mono font-bold"
                  >App.vue — KaoRien IDE</span
                >
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="text-[11px] text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-lg font-mono font-bold shadow-xs"
                  >Vue 3 SFC</span
                >
              </div>
            </div>

            <!-- Content of Light Editor -->
            <div
              class="relative z-10 grid grid-cols-12 font-mono text-xs sm:text-sm p-6 gap-4 min-h-[280px] leading-relaxed bg-slate-50/70"
            >
              <!-- Line Numbers -->
              <div
                class="col-span-1 text-slate-400 text-right select-none space-y-1.5 font-medium"
              >
                <div>1</div>
                <div>2</div>
                <div>3</div>
                <div>4</div>
                <div>5</div>
                <div>6</div>
                <div>7</div>
                <div>8</div>
              </div>
              <!-- Code Lines -->
              <div class="col-span-11 space-y-1.5 overflow-x-auto text-slate-700">
                <div><span class="text-blue-600 font-bold">&lt;template&gt;</span></div>
                <div class="pl-4">
                  <span class="text-blue-600 font-bold">&lt;div</span>
                  <span class="text-purple-600"> class=</span><span class="text-emerald-600 font-medium">"kaorien-course"</span><span class="text-blue-600 font-bold">&gt;</span>
                </div>
                <div class="pl-8">
                  <span class="text-slate-400 italic"
                    >&lt;!-- Interactive coding lesson --&gt;</span
                  >
                </div>
                <div class="pl-8">
                  <span class="text-sky-600 font-bold">&lt;CourseCard</span>
                  <span class="text-purple-600"> :data=</span><span class="text-amber-600 font-bold">"activeCourse"</span>
                  <span class="text-purple-600"> @join=</span><span class="text-blue-600 font-bold">"handleJoin"</span>
                  <span class="text-sky-600 font-bold">/&gt;</span>
                </div>
                <div class="pl-4">
                  <span class="text-blue-600 font-bold">&lt;/div&gt;</span>
                </div>
                <div><span class="text-blue-600 font-bold">&lt;/template&gt;</span></div>
                <div class="text-slate-400 italic">
                  // Logic & state compiled successfully
                </div>
                <div>
                  <span class="text-purple-600 font-bold">const</span>
                  <span class="text-slate-900 font-bold"> isUserReady</span> =
                  <span class="text-blue-600 font-bold">ref</span>(<span class="text-emerald-600 font-bold">true</span>)
                </div>
              </div>
            </div>

            <!-- Code Editor Status Bar -->
            <div
              class="relative z-10 bg-slate-100/80 px-6 py-4 flex items-center justify-between border-t border-slate-200"
            >
              <div class="flex items-center gap-2 text-emerald-600 text-xs font-mono font-bold">
                <span class="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>สถานะ: ทำงานปกติ (Auto-check passed)</span>
              </div>
              <button
                class="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-sky-500/20 transition-all duration-200"
              >
                ทดสอบโค้ด
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
