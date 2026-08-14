<template>
  <div class="space-y-8">
    <!-- Average Score Banner -->
    <div
      class="p-6 sm:p-8 bg-amber-50/60 border border-amber-200/80 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs"
    >
      <div class="flex items-center gap-4">
        <div class="text-4xl sm:text-5xl font-black text-amber-500 flex items-center gap-2">
          <span>⭐</span>
          <span>{{ averageRatingScore }}</span>
        </div>
        <div>
          <h4 class="font-black text-slate-900 text-base sm:text-lg">
            คะแนนรีวิวเฉลี่ยจากผู้เรียน
          </h4>
          <p class="text-xs text-slate-500 font-medium">
            ประเมินจากทั้งหมด {{ reviewsList.length }} ความคิดเห็นจริง
          </p>
        </div>
      </div>
      <div class="flex items-center gap-1.5">
        <svg
          v-for="star in 5"
          :key="star"
          class="w-6 h-6"
          :class="
            star <= Math.round(Number(averageRatingScore))
              ? 'text-amber-400 fill-amber-400 drop-shadow'
              : 'text-slate-300 fill-slate-200'
          "
          viewBox="0 0 24 24"
        >
          <path
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      </div>
    </div>

    <!-- User Existing Review Banner -->
    <div
      v-if="userExistingReview"
      class="p-6 bg-indigo-50/80 border border-indigo-200/80 rounded-3xl space-y-3"
    >
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3 text-indigo-900 font-extrabold text-sm">
          <span
            class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm"
            >✓</span
          >
          <div>
            <p>คุณได้ส่งรีวิวความคิดเห็นสำหรับคอร์สนี้แล้ว</p>
            <p class="text-xs text-indigo-700 font-medium">
              สามารถลบรีวิวเดิมหากต้องการส่งรีวิวใหม่ (จำกัด 1 รีวิว ต่อ 1 คอร์ส)
            </p>
          </div>
        </div>
        <button
          @click="deleteReview(userExistingReview.id)"
          :disabled="isDeletingReview"
          class="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
        >
          <span>🗑️</span>
          <span>ลบรีวิวของคุณ</span>
        </button>
      </div>
    </div>

    <!-- Write Review Form -->
    <div
      v-else-if="isEnrolled"
      class="p-6 sm:p-7 bg-slate-50 border border-slate-200/90 rounded-3xl space-y-5 shadow-xs"
    >
      <h4 class="font-black text-slate-900 text-base flex items-center gap-2">
        <span>✍️</span>
        <span>เขียนรีวิวและความคิดเห็นของคุณ</span>
      </h4>

      <div class="space-y-4">
        <!-- Interactive SVG Star Selection -->
        <div class="space-y-2">
          <label class="block text-xs font-extrabold text-slate-700">เลือกคะแนนความพึงพอใจ</label>
          <div class="flex flex-wrap items-center gap-3">
            <div
              class="flex items-center gap-1 p-2 bg-white rounded-2xl border border-slate-200 shadow-xs"
            >
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
                @click="newRating = star"
                class="p-1 focus:outline-none transition-all duration-200 transform hover:scale-125 active:scale-95"
              >
                <svg
                  class="w-8 h-8 transition-all duration-200"
                  :class="[
                    star <= (hoverRating || newRating)
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)] scale-110'
                      : 'text-slate-300 fill-slate-200 hover:text-amber-200',
                  ]"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              </button>
            </div>

            <span
              class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-200 shadow-xs"
              :class="getRatingBadgeClass(hoverRating || newRating)"
            >
              {{ getRatingLabel(hoverRating || newRating) }}
            </span>
          </div>
        </div>

        <!-- Comment Input -->
        <div>
          <label class="block text-xs font-extrabold text-slate-700 mb-1.5"
            >ความคิดเห็นเกี่ยวกับคอร์สเรียนนี้</label
          >
          <textarea
            v-model="newComment"
            rows="3"
            placeholder="แบ่งปันความรู้สึกหลังเรียนจบ หรือความประทับใจเกี่ยวกับคอร์สนี้..."
            class="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <button
          @click="submitReview"
          :disabled="isSubmittingReview || !newComment.trim()"
          class="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <div
            v-if="isSubmittingReview"
            class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></div>
          <span>{{ isSubmittingReview ? 'กำลังส่งรีวิว...' : 'ส่งรีวิวความคิดเห็น' }}</span>
        </button>
      </div>
    </div>

    <div
      v-else
      class="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 font-extrabold"
    >
      🔒 เฉพาะผู้ที่สมัครเรียนคอร์สนี้แล้วเท่านั้นที่สามารถเขียนรีวิวได้
    </div>

    <!-- Real Reviews List -->
    <div class="space-y-4">
      <h4 class="font-black text-slate-900 text-base">
        รีวิวจากผู้เรียนทั้งหมด ({{ reviewsList.length }})
      </h4>

      <div
        v-if="reviewsList.length === 0"
        class="py-10 text-center text-slate-400 text-xs font-bold"
      >
        ยังไม่มีรีวิวสำหรับคอร์สนี้ ร่วมเป็นคนแรกที่เขียนรีวิว!
      </div>

      <div
        v-else
        v-for="rev in reviewsList"
        :key="rev.id"
        class="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-xs space-y-3"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img
              :src="
                rev.userAvatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
              "
              class="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
            />
            <div>
              <h5 class="font-extrabold text-sm text-slate-900">{{ rev.userName }}</h5>
              <p class="text-[11px] text-slate-400 font-mono">{{ formatDate(rev.createdAt) }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- Rating Stars -->
            <div class="flex items-center gap-1">
              <svg
                v-for="star in 5"
                :key="star"
                class="w-4 h-4"
                :class="
                  star <= (rev.rating || 5)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-200 fill-slate-200'
                "
                viewBox="0 0 24 24"
              >
                <path
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            </div>

            <button
              v-if="auth.user?.id === rev.userId || auth.user?.role === 'admin'"
              @click="deleteReview(rev.id)"
              :disabled="isDeletingReview"
              class="text-rose-600 hover:text-rose-700 text-xs font-bold hover:underline transition-colors ml-2"
            >
              ลบ 🗑️
            </button>
          </div>
        </div>

        <p class="text-sm text-slate-700 leading-relaxed font-normal">
          {{ rev.comment }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  coursesDetailService,
  type Review,
} from '@/features/coursesDetail/services/coursesDetail.service'
import { formatDate } from '@/shared/composables/formatDate'

const props = defineProps<{
  courseId: string | number | undefined
  isEnrolled: boolean
}>()

const auth = useAuthStore()
const reviewsList = ref<Review[]>([])
const hoverRating = ref(0)
const newRating = ref(5)
const newComment = ref('')
const isSubmittingReview = ref(false)
const isDeletingReview = ref(false)

const userExistingReview = computed(() => {
  if (!auth.user?.id) return null
  return reviewsList.value.find((r) => r.userId === auth.user?.id)
})

function getRatingLabel(rating: number) {
  switch (rating) {
    case 1:
      return '😞 ต้องปรับปรุง (1 ดาว)'
    case 2:
      return '😐 พอใช้ (2 ดาว)'
    case 3:
      return '🙂 ดี (3 ดาว)'
    case 4:
      return '😊 ดีมาก! (4 ดาว)'
    case 5:
      return '🤩 ยอดเยี่ยมที่สุด! (5 ดาว)'
    default:
      return '🤩 ยอดเยี่ยมที่สุด! (5 ดาว)'
  }
}

function getRatingBadgeClass(rating: number) {
  switch (rating) {
    case 1:
      return 'bg-rose-100 text-rose-800 border border-rose-200'
    case 2:
      return 'bg-amber-100 text-amber-800 border border-amber-200'
    case 3:
      return 'bg-sky-100 text-sky-800 border border-sky-200'
    case 4:
      return 'bg-indigo-100 text-indigo-800 border border-indigo-200'
    case 5:
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    default:
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
  }
}

const averageRatingScore = computed(() => {
  if (reviewsList.value.length === 0) return '5.0'
  const total = reviewsList.value.reduce((sum, r) => sum + (r.rating || 5), 0)
  return (total / reviewsList.value.length).toFixed(1)
})

async function fetchCourseReviews() {
  if (!props.courseId) return
  try {
    const reviews = await coursesDetailService.getReviews(props.courseId)
    reviewsList.value = reviews.reverse()
  } catch (err) {
    console.error('Could not fetch course reviews:', err)
  }
}

async function submitReview() {
  if (!newComment.value.trim() || !props.courseId) return
  if (userExistingReview.value) {
    alert('คุณได้ส่งรีวิวสำหรับคอร์สนี้ไปแล้ว สามารถลบรีวิวเดิมเพื่อส่งรีวิวใหม่ได้ครับ')
    return
  }

  isSubmittingReview.value = true

  const reviewRecord = {
    id: 'rev_' + Date.now(),
    courseId: String(props.courseId),
    userId: auth.user?.id || 'c61b',
    userName: auth.user?.name || 'ผู้เรียนบทเรียนนี้',
    userAvatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    rating: newRating.value,
    comment: newComment.value.trim(),
    createdAt: new Date().toISOString(),
  }

  try {
    await coursesDetailService.createReview(reviewRecord)
    newComment.value = ''
    newRating.value = 5
    await fetchCourseReviews()
  } catch (err) {
    console.error('Error submitting review:', err)
  } finally {
    isSubmittingReview.value = false
  }
}

async function deleteReview(reviewId: string | number) {
  if (!confirm('คุณต้องการลบรีวิวนี้ใช่หรือไม่?')) return
  isDeletingReview.value = true

  try {
    await coursesDetailService.deleteReview(reviewId)
    await fetchCourseReviews()
  } catch (err) {
    console.error('Error deleting review:', err)
  } finally {
    isDeletingReview.value = false
  }
}

watch(
  () => props.courseId,
  () => {
    fetchCourseReviews()
  },
  { immediate: true },
)
</script>
