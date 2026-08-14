<template>
  <div class="lg:col-span-1">
    <div class="sticky top-24 space-y-6">
      <!-- Pricing & Checkout Card (if not enrolled) -->
      <div
        v-if="!isEnrolled"
        class="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xl shadow-indigo-950/5"
      >
        <!-- Thumbnail Image -->
        <div class="relative aspect-video overflow-hidden bg-slate-950 group">
          <img
            v-if="course?.image"
            :src="course.image"
            :alt="course.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5"
          >
            <span
              class="rounded-xl px-3.5 py-1 text-xs font-black uppercase tracking-wider bg-white/95 text-slate-900 backdrop-blur-md shadow-md"
            >
              {{ course?.level }}
            </span>
          </div>
        </div>

        <!-- Pricing and details actions -->
        <div class="p-6 sm:p-7 space-y-6">
          <div class="flex items-baseline justify-between">
            <span class="text-xs font-extrabold text-slate-400 uppercase tracking-wider"
              >ราคาหลักสูตร</span
            >
            <div class="text-right">
              <span class="text-3xl font-black text-slate-900 leading-tight">
                ฿{{ formatPrice(course?.price || 0) }}
              </span>
              <span class="text-xs text-slate-400 line-through block font-medium"
                >฿{{ formatPrice((course?.price || 0) * 1.5) }}</span
              >
            </div>
          </div>

          <!-- Perks -->
          <div class="space-y-3.5 pt-4 border-t border-slate-100 text-sm">
            <div class="flex items-center gap-3">
              <span
                class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-100"
              >
                <i class="mdi mdi-clock-fast text-base"></i>
              </span>
              <span class="text-slate-700 font-semibold text-xs sm:text-sm"
                >เข้าเรียนได้ตลอดชีพ ไม่มีวันหมดอายุ</span
              >
            </div>
            <div class="flex items-center gap-3">
              <span
                class="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0 border border-purple-100"
              >
                <i class="mdi mdi-laptop-code text-base"></i>
              </span>
              <span class="text-slate-700 font-semibold text-xs sm:text-sm"
                >โจทย์ฝึกปฏิบัติ และโปรเจกต์จริง</span
              >
            </div>
            <div class="flex items-center gap-3">
              <span
                class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-100"
              >
                <i class="mdi mdi-certificate-outline text-base"></i>
              </span>
              <span class="text-slate-700 font-semibold text-xs sm:text-sm"
                >ได้รับใบประกาศนียบัตรเมื่อเรียนจบ</span
              >
            </div>
            <div class="flex items-center gap-3">
              <span
                class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-100"
              >
                <i class="mdi mdi-forum-outline text-base"></i>
              </span>
              <span class="text-slate-700 font-semibold text-xs sm:text-sm"
                >ห้องแชท Discord ปรึกษาผู้สอน 24 ชม.</span
              >
            </div>
          </div>

          <!-- Action buttons -->
          <div class="space-y-3 pt-2">
            <button
              @click="showCheckoutModal = true"
              class="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm text-center transition-all duration-300 shadow-xl shadow-indigo-600/25 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <i class="mdi mdi-account-plus-outline text-lg"></i>
              <span>สมัครเข้าเรียนตอนนี้</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Enrolled Status Banner -->
      <div
        v-else
        class="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 shadow-sm"
      >
        <div class="flex items-center gap-3.5">
          <div
            class="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-sm"
          >
            ✓
          </div>
          <div>
            <h4 class="font-black text-base">คุณเป็นสมาชิกคอร์สนี้แล้ว</h4>
            <p class="text-xs text-emerald-700 font-medium">
              เข้าชมบทเรียนได้ทุกวิดีโอตลอด 24 ชั่วโมง
            </p>
          </div>
        </div>
      </div>

      <!-- Course Playlist Navigation Card -->
      <div class="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
        <h3
          class="font-black text-slate-900 text-base flex items-center justify-between border-b border-slate-100 pb-3"
        >
          <span>เนื้อหาบทเรียนทั้งหมด</span>
          <span
            class="text-xs text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full font-bold border border-indigo-100"
            >{{ lessons.length }} บทเรียน</span
          >
        </h3>

        <div v-if="lessons.length === 0" class="py-6 text-center text-xs text-slate-400 font-bold">
          ยังไม่มีบทเรียนย่อยในขณะนี้
        </div>

        <div v-else class="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          <button
            v-for="(lesson, idx) in lessons"
            :key="lesson.id"
            @click="selectLesson(lesson)"
            class="w-full text-left p-3.5 rounded-2xl border transition-all text-xs flex items-center justify-between gap-2"
            :class="[
              (activeLessonId ? activeLessonId === lesson.id : activeVideoId === lesson.videoId)
                ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 font-extrabold shadow-xs'
                : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100 text-slate-700',
            ]"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <span
                v-if="course?.id && learningStore.isLessonCompleted(course.id, lesson.id)"
                class="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black shrink-0"
                title="เรียนจบแล้ว"
              >
                ✓
              </span>
              <span v-else class="text-slate-400 font-mono font-bold text-[11px]">#{{ idx + 1 }}</span>
              <span class="truncate font-semibold">{{ lesson.title }}</span>
            </div>
            <span
              v-if="lesson.isFree || isEnrolled"
              class="px-2.5 py-1 rounded-xl text-[10px] font-black bg-emerald-100 text-emerald-800 shrink-0"
            >
              เล่นได้
            </span>
            <span
              v-else
              class="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-slate-200 text-slate-600 shrink-0"
            >
              🔒 ล็อก
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Checkout Payment Modal -->
    <CheckoutModal
      v-model="showCheckoutModal"
      :courseId="course?.id"
      :courseTitle="course?.title"
      :courseImage="course?.image"
      :price="course?.price"
      @success="emit('update:isEnrolled', true)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Course, Lesson } from '@/features/courses/types/course'
import CheckoutModal from '@/components/common/CheckoutModal.vue'
import { useLearningStore } from '@/stores/learning'

const props = defineProps<{
  course: Course | null
  lessons: Lesson[]
  isEnrolled: boolean
  activeLessonId?: string | number
  activeVideoId: string
  activeLessonTitle: string
}>()

const emit = defineEmits<{
  'update:isEnrolled': [val: boolean]
  'update:activeLessonId': [val: string | number]
  'update:activeVideoId': [val: string]
  'update:activeLessonTitle': [val: string]
}>()

const learningStore = useLearningStore()
const showCheckoutModal = ref(false)

function formatPrice(price: number) {
  return price ? price.toLocaleString('th-TH') : '0'
}

function selectLesson(lesson: Lesson) {
  emit('update:activeLessonId', lesson.id)
  emit('update:activeVideoId', lesson.videoId || '')
  emit('update:activeLessonTitle', lesson.title || '')

  if (props.course?.id) {
    learningStore.setLastWatched(props.course.id, lesson.id)
    learningStore.markLessonCompleted(props.course.id, lesson.id)
  }
}
</script>
