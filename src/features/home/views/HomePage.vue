<template>
  <div
    class="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-cyan-500 selection:text-white overflow-hidden relative"
  >
    <!-- Modern Ambient Background Glows & Grid Pattern -->
    <div
      class="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none"
    ></div>

    <div
      class="absolute top-[-10%] left-[-5%] w-[45%] aspect-square rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none"
    ></div>
    <div
      class="absolute top-[25%] right-[-10%] w-[40%] aspect-square rounded-full bg-blue-500/10 blur-[140px] pointer-events-none"
    ></div>
    <div
      class="absolute bottom-[10%] left-[10%] w-[35%] aspect-square rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"
    ></div>

    <HeroSection />
    <FeaturedCourses />
    <Interactive />
    <WhyChoose />
  </div>
</template>

<script setup lang="ts">
import HeroSection from '../components/HeroSection.vue'
import Interactive from '../components/Interactive.vue'
import WhyChoose from '../components/WhyChoose.vue'
import FeaturedCourses from '../components/FeaturedCourses.vue'
</script>
