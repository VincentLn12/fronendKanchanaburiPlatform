<template>
  <main class="min-h-screen bg-slate-50 pb-24 text-slate-800">
    <!-- Hero Header Banner -->
    <section class="relative bg-gradient-to-b from-white via-indigo-50/40 to-slate-50 border-b border-slate-200/80 py-12 sm:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div class="max-w-3xl space-y-4">
          <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-wider text-indigo-700 bg-indigo-100/80 border border-indigo-200 uppercase shadow-xs">
            <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            คลังคอร์สเรียนทั้งหมด
          </span>
          <h1 class="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
            สำรวจคอร์สเรียน<br />
            <span class="text-indigo-600">เพื่อพัฒนาศักยภาพของคุณ</span>
          </h1>
          <p class="text-base text-slate-600 leading-relaxed font-medium">
            เลือกเรียนรู้จากหลักสูตรเทคโนโลยี วิทยาการคอมพิวเตอร์ และการออกแบบซอฟต์แวร์ที่ได้มาตรฐานสากล
          </p>
        </div>

        <!-- Integrated Search Bar -->
        <div class="relative max-w-2xl">
          <div class="relative flex items-center">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 text-lg">
              🔍
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหาชื่อคอร์สเรียน เนื้อหา หรือทักษะที่ต้องการ..."
              class="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border border-slate-200 shadow-md focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-800 font-medium placeholder:text-slate-400 outline-none transition-all text-sm sm:text-base"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors font-bold text-sm"
              title="ล้างคำค้นหา"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content & Filters -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
      <!-- FILTER & CONTROLS BAR -->
      <div
        class="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs"
      >
        <!-- Level Filters -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <span
            class="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-2 hidden sm:inline shrink-0"
            >ระดับคอร์ส:</span
          >
          <button
            v-for="level in levelOptions"
            :key="level"
            @click="selectedLevel = level"
            class="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap shrink-0"
            :class="[
              selectedLevel === level
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900',
            ]"
          >
            {{ level }}
          </button>
        </div>

        <!-- Sort & Filter Readout -->
        <div
          class="flex items-center justify-between lg:justify-end gap-4 text-xs font-bold text-slate-600 pt-2 lg:pt-0 border-t border-slate-100 lg:border-t-0"
        >
          <!-- Sort Dropdown -->
          <div class="flex items-center gap-2">
            <span class="text-slate-400 font-extrabold hidden sm:inline">จัดเรียง:</span>
            <select
              v-model="sortBy"
              class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="default">แนะนำสำหรับคุณ</option>
              <option value="price-low">ราคาต่ำสุด - สูงสุด</option>
              <option value="price-high">ราคาสูงสุด - ต่ำสุด</option>
            </select>
          </div>

          <div class="flex items-center gap-3">
            <span>แสดงผล <strong class="text-indigo-600 font-black text-sm">{{ filteredCourses.length }}</strong> คอร์ส</span>
            <button
              v-if="searchQuery || selectedLevel !== 'ทั้งหมด' || sortBy !== 'default'"
              @click="resetFilters"
              class="text-rose-600 hover:text-rose-700 font-extrabold underline transition-colors"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>
      </div>

      <!-- LOADING STATE -->
      <div v-if="isLoading" class="py-20 text-center space-y-4">
        <div
          class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"
        ></div>
        <p class="text-slate-500 font-extrabold">กำลังโหลดข้อมูลคอร์สเรียนทั้งหมด...</p>
      </div>

      <!-- ERROR STATE -->
      <div
        v-else-if="error"
        class="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4 max-w-xl mx-auto shadow-sm"
      >
        <p class="text-rose-600 font-extrabold">{{ error }}</p>
        <button
          @click="fetchCourses(true)"
          class="px-6 py-3 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-colors shadow-md"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>

      <!-- COURSE CARDS GRID -->
      <Card v-else :courses="filteredCourses"></Card>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCourseStore } from '@/stores/course'
import Card from '@/shared/components/Card.vue'

const courseStore = useCourseStore()
const {
  isLoading,
  error,
  searchQuery,
  selectedLevel,
  sortBy,
  filteredCourses,
} = storeToRefs(courseStore)

const { resetFilters, fetchCourses } = courseStore

const levelOptions = ['ทั้งหมด', 'ระดับพื้นฐาน', 'ระดับกลาง', 'ระดับขั้นสูง']

onMounted(() => {
  fetchCourses()
})
</script>
