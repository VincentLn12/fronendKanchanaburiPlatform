<template>
  <main class="min-h-screen bg-slate-50 pt-8 pb-16 text-slate-800">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div
        class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="text-slate-500 font-medium">กำลังโหลดข้อมูลคอร์ส...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-4xl mx-auto px-6 mt-8">
      <div class="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
        <p class="text-rose-600 font-semibold mb-4">{{ error }}</p>
        <RouterLink
          to="/courses"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:scale-105 transition-transform shadow-md"
        >
          ← กลับไปหน้าคอร์สทั้งหมด
        </RouterLink>
      </div>
    </div>

    <div v-else-if="CoursesById" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      <!-- Breadcrumb -->
      <nav class="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <RouterLink
          to="/"
          class="hover:text-indigo-600 font-medium transition-colors flex items-center gap-1"
        >
          <i class="mdi mdi-home-outline"></i>
          <span>หน้าแรก</span>
        </RouterLink>
        <span>/</span>
        <RouterLink to="/courses" class="hover:text-indigo-600 font-medium transition-colors"
          >คอร์สทั้งหมด
        </RouterLink>
        <span>/</span>
        <span class="text-slate-900 font-bold line-clamp-1">{{ CoursesById.title }}</span>
      </nav>

      <!-- Enterprise Executive Course Banner Header -->
      <div
        class="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl shadow-indigo-950/20 overflow-hidden space-y-4"
      >
        <div
          class="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"
        ></div>

        <div class="flex flex-wrap items-center gap-3">
          <span
            class="px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/25 flex items-center gap-1.5"
          >
            <i class="mdi mdi-certificate"></i>
            <span>หลักสูตรมาตรฐานวิชาชีพ</span>
          </span>
          <span
            class="px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/25"
          >
            {{ CoursesById.level || 'ระดับพื้นฐาน' }}
          </span>
          <span
            class="px-3 py-1 rounded-lg text-[11px] font-bold text-slate-300 bg-white/5 border border-white/10 flex items-center gap-1"
          >
            <i class="mdi mdi-star text-amber-400"></i>
            <span>5.0 (รีวิวดีเยี่ยม)</span>
          </span>
        </div>

        <h1
          class="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug"
        >
          {{ CoursesById.title }}
        </h1>

        <p class="text-slate-300 text-sm font-medium leading-relaxed max-w-3xl">
          {{ CoursesById.description }}
        </p>
      </div>

      <!-- Main Course Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Video -->
        <VideoCourse
          :course="CoursesById"
          :lessons="lessonsList"
          v-model:isEnrolled="isEnrolled"
          v-model:activeLessonId="activeLessonId"
          v-model:activeVideoId="activeVideoId"
          v-model:activeLessonTitle="activeLessonTitle"
        />

        <!-- Right Sidebar Area -->
        <CourseSidebar
          :course="CoursesById"
          :lessons="lessonsList"
          v-model:isEnrolled="isEnrolled"
          v-model:activeLessonId="activeLessonId"
          v-model:activeVideoId="activeVideoId"
          v-model:activeLessonTitle="activeLessonTitle"
        />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getCoursesById, getLessonsByCourseId } from '@/features/courses/services/courseService'
import type { Course, Lesson } from '@/features/courses/types/course'
import { coursesDetailService } from '@/features/coursesDetail/services/coursesDetail.service'
import VideoCourse from '../components/videoCourse.vue'
import CourseSidebar from '../components/courseSidebar.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

const CoursesById = ref<Course | null>(null)
const lessonsList = ref<Lesson[]>([])
const isLoading = ref<boolean>(true)
const error = ref<string>('')

const isEnrolled = ref<boolean>(false)
const activeLessonId = ref<string | number>('')
const activeVideoId = ref<string>('')
const activeLessonTitle = ref<string>('แนะนำคอร์สเรียน')

async function fetchCoursesByID() {
  const currentCourseId = String(
    Array.isArray(route.params.id) ? route.params.id[0] || '' : route.params.id || '',
  )
  if (!currentCourseId) return

  isLoading.value = true
  error.value = ''
  isEnrolled.value = false

  try {
    const data = await getCoursesById(currentCourseId)
    CoursesById.value = data
    if (data && data.videoId) {
      activeVideoId.value = data.videoId
    }
    try {
      isEnrolled.value = await coursesDetailService.isEnrolled(currentCourseId, auth.user?.id)
    } catch (e) {
      console.warn('Could not check enrollment status:', e)
    }
    try {
      const lessons = await getLessonsByCourseId(currentCourseId)
      lessonsList.value = lessons || []
      if (lessonsList.value.length > 0) {
        const firstLesson = lessonsList.value[0]
        if (firstLesson) {
          activeLessonId.value = firstLesson.id
          if (!activeVideoId.value && firstLesson.videoId) {
            activeVideoId.value = firstLesson.videoId
          }
          if (firstLesson.title) {
            activeLessonTitle.value = firstLesson.title
          }
        }
      }
    } catch (lErr) {
      console.warn('Could not fetch lessons list:', lErr)
    }
  } catch (err) {
    error.value = 'ไม่พบข้อมูลคอร์สเรียนที่คุณต้องการ'
    console.error(err)
  } finally {
    isLoading.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

watch(
  () => route.params.id,
  () => {
    fetchCoursesByID()
  },
)

onMounted(() => {
  fetchCoursesByID()
})
</script>
