<template>
  <!-- Navigation Tabs & Course Content Card -->
    <div class="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
      <div class="flex border-b border-slate-200 mb-8 overflow-x-auto gap-6">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="pb-4 font-extrabold text-sm tracking-wide transition-all border-b-2 whitespace-nowrap"
          :class="
            activeTab === tab.id
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          "
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- Tab Content: Overview -->
      <div v-if="activeTab === 'overview'" class="space-y-8">
        <div>
          <h3 class="text-xl font-black text-slate-900 mb-3">คำอธิบายรายวิชา</h3>
          <p class="text-slate-600 leading-relaxed font-normal text-base whitespace-pre-line">
            {{ course?.description || 'รายละเอียดเนื้อหายังไม่ระบุในระบบ' }}
          </p>
        </div>

        <!-- Learning Outcomes -->
        <div class="pt-6 border-t border-slate-100 space-y-4">
          <h4 class="text-lg font-extrabold text-slate-900">สิ่งที่คุณจะได้เรียนรู้จากคอร์สนี้</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(item, i) in learningOutcomes"
              :key="i"
              class="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100"
            >
              <span
                class="flex-shrink-0 w-6 h-6 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black"
                >✓</span
              >
              <p class="text-sm text-slate-700 font-medium leading-relaxed">{{ item }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content: Syllabus -->
      <div v-if="activeTab === 'syllabus'" class="space-y-4">
        <div class="flex items-center justify-between mb-2">
          <div>
            <h3 class="text-xl font-black text-slate-900">รายการบทเรียนทั้งหมด</h3>
            <p class="text-sm text-slate-500">เลือกบทเรียนเพื่อสลับเล่นวิดีโอด้านบน</p>
          </div>
          <span
            class="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100"
          >
            {{ lessons.length }} บทเรียน
          </span>
        </div>

        <div class="space-y-3 pt-2">
          <div
            v-for="(lesson, index) in lessons"
            :key="lesson.id"
            @click="playLesson(lesson)"
            class="flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer"
            :class="
              (activeLessonId ? activeLessonId === lesson.id : activeVideoId === lesson.videoId)
                ? 'border-indigo-500 bg-indigo-50/70 text-indigo-900 font-bold shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-100/80 text-slate-800'
            "
          >
            <div class="flex items-center gap-4">
              <span
                class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-black shadow-xs"
              >
                {{ index + 1 }}
              </span>
              <div>
                <h4
                  class="font-extrabold text-sm"
                  :class="activeVideoId === lesson.videoId ? 'text-indigo-600' : 'text-slate-900'"
                >
                  {{ lesson.title }}
                </h4>
                <p class="text-xs text-slate-500 mt-0.5">⏱️ {{ lesson.duration }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="text-xs font-extrabold px-3 py-1 rounded-xl"
                :class="
                  lesson.isFree ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                "
              >
                {{ lesson.isFree ? 'เข้าชมได้ฟรี' : 'เฉพาะสมาชิก' }}
              </span>
              <button
                class="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors"
              >
                <svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content: Instructor -->
      <div v-if="activeTab === 'instructor'" class="space-y-6">
        <div
          v-if="course?.instructor"
          class="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100"
        >
          <img
            :src="course.instructor.image"
            :alt="course.instructor.name"
            class="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-md shrink-0"
          />
          <div class="space-y-2 text-center sm:text-left">
            <h3 class="text-2xl font-black text-slate-900">{{ course.instructor.name }}</h3>
            <p
              class="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 inline-block"
            >
              {{ course.instructor.role }}
            </p>
            <p class="text-sm text-slate-600 leading-relaxed font-medium pt-1">
              {{ course.instructor.bio }}
            </p>
          </div>
        </div>
        <div v-else class="text-center p-8 text-slate-500 font-extrabold bg-slate-50 rounded-2xl">
          ไม่มีข้อมูลผู้สอนสำหรับหลักสูตรนี้
        </div>
      </div>

      <CourseReviews
        v-if="activeTab === 'reviews'"
        :course-id="course?.id"
        :is-enrolled="isEnrolled"
      />
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Course, Lesson } from '@/features/courses/types/course'
import CourseReviews from './CourseReviews.vue'

const props = defineProps<{ course: Course | null | undefined; lessons: Lesson[]; isEnrolled: boolean; activeLessonId: string | number; activeVideoId: string }>()
const emit = defineEmits<{ playLesson: [lesson: Lesson] }>()
const activeTab = ref('overview')
const tabs = computed(() => {
  const all = [
    { id: 'overview', name: 'รายละเอียดรายวิชา' }, { id: 'syllabus', name: 'เนื้อหาหลักสูตร' },
    { id: 'instructor', name: 'ข้อมูลผู้สอน' }, { id: 'reviews', name: 'รีวิวและความคิดเห็น' },
  ]
  return props.isEnrolled ? all.filter((tab) => tab.id !== 'syllabus') : all
})
const learningOutcomes = computed(() => props.course?.learningOutcomes || [])
function playLesson(lesson: Lesson) { emit('playLesson', lesson) }
</script>

