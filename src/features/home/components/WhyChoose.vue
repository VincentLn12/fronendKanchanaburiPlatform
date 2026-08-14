<template>
  <section class="relative py-24 bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-50 border-t border-slate-200/80 overflow-hidden">
    <!-- Ambient Blur -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-400/10 blur-[140px] pointer-events-none rounded-full"></div>

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="text-center space-y-4 mb-16">
        <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-wider text-sky-700 bg-sky-50 border border-sky-200/80 uppercase shadow-xs">
          ✨ ทำไมต้องเลือกเรา
        </span>
        <h2 class="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          จุดเด่นที่ทำให้การเรียนเห็นผลจริง
        </h2>
        <p class="text-slate-600 max-w-xl mx-auto text-base">
          ออกแบบประสบการณ์เรียนรู้ให้ตอบโจทย์ผู้เรียนทุกคนด้วยเทคโนโลยี และผู้เชี่ยวชาญ
        </p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="group relative p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow-2xl hover:shadow-sky-500/10 hover:border-sky-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
        >
          <div class="space-y-5">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100/80 text-blue-600 flex items-center justify-center text-2xl font-bold group-hover:scale-110 group-hover:from-blue-600 group-hover:to-cyan-500 group-hover:text-white transition-all duration-300 shadow-sm">
              {{ feature.icon }}
            </div>
            <h3 class="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
              {{ feature.title }}
            </h3>
            <p class="text-slate-600 text-sm leading-relaxed">
              {{ feature.description }}
            </p>
          </div>
          <div class="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-sky-600 group-hover:text-blue-600">
            <span>{{ feature.highlight }}</span>
            <span class="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const features = [
  {
    icon: '⚡',
    title: 'เนื้อหาอัปเดตทันสมัย',
    description: 'ทุกบทเรียนถูกออกแบบและอัปเดตตามเทรนด์การพัฒนาซอฟต์แวร์ปัจจุบัน พร้อมใช้งานได้ทันที',
    highlight: 'อัปเดตล่าสุด 2026'
  },
  {
    icon: '🎯',
    title: 'เน้นลงมือทำจริง',
    description: 'ไม่จำเจแค่วิดีโอ แต่มีโจทย์ฝึกทำ โปรเจกต์จริง และการประเมินผลที่จะช่วยพัฒนาทักษะติดตัว',
    highlight: 'Hands-on Projects'
  },
  {
    icon: '🤝',
    title: 'ทีมผู้ช่วยดูแลใกล้ชิด',
    description: 'ไม่ติดปัญหาคนเดียวอีกต่อไป ทีมงานผู้เชี่ยวชาญพร้อมช่วยเหลือและตอบคำถามผ่าน Discord ชุมชน',
    highlight: 'Discord 24/7'
  },
  {
    icon: '🏆',
    title: 'วุฒิบัตรรับรองมาตรฐาน',
    description: 'เมื่อเรียนจบจะได้รับ Certificate แบบดิจิทัล นำไปแนบ Portfolio หรือ LinkedIn ได้ทันที',
    highlight: 'Digital Certificate'
  }
]
</script>
