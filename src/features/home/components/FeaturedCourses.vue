<template>
  <section id="featured-courses" class="relative py-20 sm:py-24 bg-gradient-to-b from-white via-sky-50/20 to-white">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mb-12 flex flex-col gap-5 sm:mb-16 md:flex-row md:items-end md:justify-between">
        <div class="max-w-2xl space-y-3">
          <span class="inline-flex items-center gap-2 rounded-full bg-sky-50 border border-sky-200/80 px-4 py-1.5 text-xs font-black tracking-wider text-sky-700 uppercase shadow-xs">
            <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            🔥 คอร์สเรียนแนะนำสำหรับคุณ
          </span>
          <h2 class="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">คอร์สเรียนยอดนิยมสูงสุด</h2>
          <p class="text-base leading-relaxed text-slate-600">เลือกเรียนจากหลักสูตรคุณภาพที่กระชับ เข้าใจง่าย และออกแบบโดยผู้เชี่ยวชาญในอุตสาหกรรม</p>
        </div>
        <RouterLink to="/courses" class="group inline-flex w-fit items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-extrabold text-slate-800 transition shadow-sm hover:border-sky-300 hover:bg-sky-50/60 hover:text-blue-600 hover:shadow-md">
          ดูหลักสูตรทั้งหมด
          <span class="transition-transform group-hover:translate-x-1 font-extrabold text-blue-600" aria-hidden="true">→</span>
        </RouterLink>
      </div>
      <Card :limit="6" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Card from '@/shared/components/Card.vue'
</script>
