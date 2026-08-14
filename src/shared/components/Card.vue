<template>
  <!-- Course Cards Grid -->
  <div v-if="displayCourses.length > 0" class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
    <article
      v-for="course in displayCourses"
      :key="course.id"
      class="group relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:shadow-indigo-950/5 transition-all duration-300 flex flex-col hover:-translate-y-1"
    >
      <!-- Course Image Container -->
      <div class="relative overflow-hidden aspect-video bg-slate-900 group">
        <img
          :src="course.image"
          :alt="course.title"
          class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-95 group-hover:opacity-100"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <!-- Level Badge -->
        <span
          class="absolute top-3.5 left-3.5 rounded-xl px-3 py-1 text-xs font-black uppercase tracking-wider shadow-md backdrop-blur-md transition-transform"
          :class="getLevelBadgeStyle(course.level)"
        >
          {{ course.level || 'ทั่วไป' }}
        </span>

        <!-- Rating Badge -->
        <div class="absolute top-3.5 right-3.5 flex items-center gap-1 rounded-xl bg-slate-900/85 px-2.5 py-1 text-xs font-extrabold text-amber-400 backdrop-blur-md border border-white/10 shadow-sm">
          <span>⭐</span>
          <span>{{ getCourseRatingScore(course.id) }}</span>
        </div>
      </div>

      <!-- Content Container -->
      <div class="p-6 sm:p-7 flex flex-col flex-grow space-y-4">
        <!-- Title & Category/Instructor -->
        <div class="space-y-1.5">
          <div v-if="course.instructor" class="flex items-center gap-2 text-xs font-bold text-slate-500">
            <img
              :src="course.instructor.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'"
              :alt="course.instructor.name"
              class="w-5 h-5 rounded-full object-cover border border-slate-200"
            />
            <span class="truncate">{{ course.instructor.name }}</span>
          </div>

          <h3
            class="text-lg sm:text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-1 leading-snug"
          >
            {{ course.title }}
          </h3>
        </div>

        <p
          class="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 flex-grow font-normal"
        >
          {{ course.description }}
        </p>

        <!-- Course Highlights Badges -->
        <div
          class="flex items-center gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-semibold flex-wrap"
        >
          <span class="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70">
            ⏱️ 40 ชม.
          </span>
          <span class="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70">
            💻 มีโปรเจกต์
          </span>
          <span class="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70">
            📜 ประกาศนียบัตร
          </span>
        </div>

        <!-- Price & Action CTA -->
        <div class="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">ราคาหลักสูตร</span>
            <span class="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              ฿{{ formatPrice(course.price) }}
            </span>
          </div>
          <RouterLink
            :to="`/courses/${course.id}`"
            class="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all duration-200"
          >
            <span>ดูรายละเอียด</span>
            <span class="transition-transform group-hover:translate-x-0.5">→</span>
          </RouterLink>
        </div>
      </div>
    </article>
  </div>

  <!-- Empty State Card -->
  <div v-else class="py-16 px-6 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-lg mx-auto">
    <div class="w-16 h-16 mx-auto rounded-2xl bg-sky-50 text-blue-600 border border-sky-100 flex items-center justify-center font-black text-3xl shadow-xs">
      🔍
    </div>
    <div class="space-y-1">
      <h3 class="text-xl font-extrabold text-slate-900">ไม่พบคอร์สเรียนที่ตรงกับเงื่อนไข</h3>
      <p class="text-sm text-slate-500">ลองเปลี่ยนคำค้นหาหรือเลือกสลับระดับคอร์สเรียนใหม่อีกครั้ง</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getCourses } from '@/features/courses/services/courseService'
import type { Course } from '@/features/courses/types/course'

const props = defineProps<{
  courses?: Course[]
  limit?: number
}>()

const fetchedCourses = ref<Course[]>([])
const reviewsMap = ref<Record<string, { avg: number; count: number }>>({})

const displayCourses = computed(() => {
  const list = (props.courses && Array.isArray(props.courses)) ? props.courses : fetchedCourses.value
  if (props.limit && props.limit > 0) {
    return list.slice(0, props.limit)
  }
  return list
})

function formatPrice(price: number) {
  return price ? price.toLocaleString('th-TH') : '0'
}

function getCourseRatingScore(courseId: string | number) {
  const info = reviewsMap.value[String(courseId)]
  if (info && info.count > 0) {
    return `${info.avg}`
  }
  return '4.9'
}

function getLevelBadgeStyle(level?: string) {
  if (level === 'ระดับพื้นฐาน') {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  }
  if (level === 'ระดับกลาง') {
    return 'bg-sky-50 text-sky-700 border border-sky-200'
  }
  if (level === 'ระดับขั้นสูง') {
    return 'bg-amber-50 text-amber-700 border border-amber-200'
  }
  return 'bg-slate-100 text-slate-700 border border-slate-200'
}

async function fetchReviews() {
  try {
    const res = await fetch('http://localhost:3000/reviews')
    if (res.ok) {
      const data = await res.json()
      const map: Record<string, { total: number; count: number }> = {}
      if (Array.isArray(data)) {
        data.forEach((r: any) => {
          const cid = String(r.courseId)
          const curr = map[cid] || { total: 0, count: 0 }
          curr.total += r.rating || 5
          curr.count += 1
          map[cid] = curr
        })
      }
      const resMap: Record<string, { avg: number; count: number }> = {}
      Object.entries(map).forEach(([cid, item]) => {
        if (item && item.count > 0) {
          resMap[cid] = {
            avg: Number((item.total / item.count).toFixed(1)),
            count: item.count
          }
        }
      })
      reviewsMap.value = resMap
    }
  } catch (err) {
    console.error('Could not fetch reviews map:', err)
  }
}

onMounted(async () => {
  fetchReviews()
  if (!props.courses) {
    try {
      const list = await getCourses()
      fetchedCourses.value = list
    } catch (err) {
      console.error(err)
    }
  }
})
</script>
