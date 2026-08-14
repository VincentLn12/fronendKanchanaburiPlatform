<template>
  <div class="lg:col-span-2 space-y-8">
    <!-- Video Player Card -->
    <div
      class="overflow-hidden rounded-[2.5rem] bg-slate-950 shadow-2xl shadow-sky-950/20 border border-slate-800/90 relative group"
    >
      <div class="relative aspect-video w-full bg-slate-950">
        <!-- Locked overlay if active lesson is locked -->
        <div
          v-if="activeLessonIsLocked"
          class="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-slate-950/92 backdrop-blur-md text-white transition-all duration-300"
        >
          <div
            class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/10"
          >
            <svg
              class="w-8 h-8 text-amber-400 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 class="text-2xl font-black tracking-tight mb-2 text-white">
            บทเรียนนี้เฉพาะผู้สมัครเรียนเท่านั้น
          </h3>
          <p class="text-sm text-slate-300 max-w-md mb-6 font-normal leading-relaxed">
            เนื้อหาบทเรียนนี้สงวนสิทธิ์สำหรับผู้ลงทะเบียนเรียนหลักสูตรนี้
            สมัครเรียนเพื่อปลดล็อกวิดีโอบทเรียนทั้งหมดทันที
          </p>
          <div class="flex items-center gap-3">
            <button
              @click="showCheckoutModal = true"
              class="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm transition-all shadow-xl shadow-indigo-600/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              สมัครเรียนเพื่อปลดล็อกบทเรียน
            </button>
          </div>
        </div>

        <!-- If there is a current video link, show it -->
        <iframe
          v-else-if="activeVideoId"
          :src="youtubeEmbedUrl"
          title="Course Player"
          frameborder="0"
          allow="
            accelerometer;
            autoplay;
            clipboard-write;
            encrypted-media;
            gyroscope;
            picture-in-picture;
            web-share;
          "
          allowfullscreen
          class="absolute inset-0 w-full h-full"
        ></iframe>
        <div
          v-else
          class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400"
        >
          <svg
            class="w-16 h-16 mb-4 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p class="text-lg font-bold text-slate-300">ไม่มีวิดีโอสาธิตสำหรับบทเรียนนี้</p>
        </div>
      </div>

      <!-- Video Control Info Bar -->
      <div
        class="p-6 bg-slate-900 border-t border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider"
              >กำลังเล่น</span
            >
          </div>
          <h2 class="text-lg sm:text-xl font-extrabold text-white leading-snug">
            {{ activeLessonTitle }}
          </h2>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span
            :class="
              activeLessonIsFree
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            "
            class="px-3.5 py-1.5 rounded-xl text-xs font-extrabold backdrop-blur-md"
          >
            {{ activeLessonIsFree ? '🎬 บทเรียนเปิดฟรี (Preview)' : '🔒 เฉพาะสมาชิกหลักสูตร' }}
          </span>
        </div>
      </div>
    </div>

    <CourseTabs
      :course="course"
      :lessons="lessons"
      :is-enrolled="isEnrolled"
      :active-lesson-id="activeLessonId"
      :active-video-id="activeVideoId"
      @play-lesson="playLesson"
    />

    <!-- Checkout Modal Mockup -->
    <CheckoutModal
      v-model="showCheckoutModal"
      :courseId="course?.id"
      :courseTitle="course?.title"
      :courseImage="course?.image"
      :price="course?.price"
      @success="isEnrolled = true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Course, Lesson } from '@/features/courses/types/course'
import CheckoutModal from '@/components/common/CheckoutModal.vue'
import CourseTabs from './CourseTabs.vue'
import { useLearningStore } from '@/stores/learning'

const props = defineProps<{
  course: Course | null | undefined
  lessons: Lesson[]
}>()

const learningStore = useLearningStore()

const isEnrolled = defineModel<boolean>('isEnrolled', { default: false })
const activeLessonId = defineModel<string | number>('activeLessonId', { default: '' })
const activeVideoId = defineModel<string>('activeVideoId', { default: '' })
const activeLessonTitle = defineModel<string>('activeLessonTitle', {
  default: 'วิดีโอแนะนำบทเรียน',
})
const showCheckoutModal = ref(false)

const youtubeEmbedUrl = computed(() => {
  if (!activeVideoId.value) return ''
  let startParam = ''
  if (props.course?.id) {
    const progress = learningStore.getCourseProgress(props.course.id)
    if (progress.lastWatchedLessonId === activeLessonId.value && progress.lastVideoTimestamp) {
      startParam = `&start=${progress.lastVideoTimestamp}`
    }
  }
  return `https://www.youtube.com/embed/${activeVideoId.value}?autoplay=1${startParam}`
})

// Automatically load the first video when lessons are loaded
watch(
  () => props.lessons,
  (newLessons) => {
    if (newLessons && newLessons.length > 0 && !activeVideoId.value) {
      const firstLesson = newLessons[0]
      if (firstLesson) {
        activeLessonId.value = firstLesson.id
        activeVideoId.value = firstLesson.videoId
        activeLessonTitle.value = firstLesson.title
      }
    }
  },
  { immediate: true },
)

// Currently active lesson object
const activeLesson = computed(() => {
  if (activeLessonId.value !== undefined && activeLessonId.value !== '') {
    const match = props.lessons.find((l) => String(l.id) === String(activeLessonId.value))
    if (match) return match
  }
  return props.lessons.find((l) => l.videoId === activeVideoId.value) || props.lessons[0] || null
})

// Check if currently active lesson is free
const activeLessonIsFree = computed(() => {
  return activeLesson.value ? activeLesson.value.isFree : true
})

// Check if currently active lesson is locked for current user
const activeLessonIsLocked = computed(() => {
  if (!activeLesson.value) return false
  return !activeLesson.value.isFree && !isEnrolled.value
})

// Select lesson to play in iframe
function playLesson(lesson: Lesson) {
  activeLessonId.value = lesson.id
  activeVideoId.value = lesson.videoId
  activeLessonTitle.value = lesson.title
}
</script>
