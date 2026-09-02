<script setup lang="ts">
import type { ContentReview, ContentReviews } from '../../api/contentApi'

interface Props {
  reviewData: ContentReviews
  myReview: ContentReview | null
  isLoggedIn: boolean
  reviewSaving: boolean
  comment: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:comment': [value: string]
  'save-review': []
  'remove-review': []
}>()

function formatDate(value?: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(new Date(value))
}

function getUserInitials(name?: string) {
  if (!name) return 'U'
  return name.trim().charAt(0).toUpperCase()
}
</script>

<template>
  <section class="rounded-2xl bg-[#FFFDF9] border border-[#EADBCE] p-6 sm:p-8 shadow-sm space-y-6">
    <!-- Section Header -->
    <div class="flex items-center justify-between border-b border-[#EADBCE] pb-4">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-xl bg-[#1F4D3A] text-amber-300 flex items-center justify-center font-bold">
          <i class="mdi mdi-forum-outline text-xl"></i>
        </div>
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-[#1F4D3A]">ความคิดเห็นและรีวิว</h2>
          <p class="text-xs text-slate-500 font-medium">ร่วมแบ่งปันประสบการณ์จริงจากนักท่องเที่ยว</p>
        </div>
      </div>
      <span class="text-xs font-black text-[#1F4D3A] bg-amber-100/80 border border-amber-200 px-3.5 py-1 rounded-full">
        {{ reviewData.totalCount }} ความคิดเห็น
      </span>
    </div>

    <!-- Review Submission Form -->
    <form
      v-if="isLoggedIn"
      class="rounded-xl bg-[#F6F1E7]/70 p-4 sm:p-5 border border-[#EADBCE] shadow-2xs space-y-3"
      @submit.prevent="emit('save-review')"
    >
      <div class="flex items-center justify-between">
        <p class="font-extrabold text-[#1F4D3A] text-xs sm:text-sm flex items-center gap-1.5">
          <i class="mdi mdi-pencil-outline text-[#D99A32]"></i>
          {{ myReview ? 'แก้ไขความคิดเห็นของคุณ' : 'เขียนความคิดเห็นใหม่' }}
        </p>
        <span v-if="myReview" class="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          คุณเคยแสดงความคิดเห็นแล้ว
        </span>
      </div>

      <textarea
        :value="comment"
        @input="(e) => emit('update:comment', (e.target as HTMLTextAreaElement).value)"
        rows="3"
        maxlength="2000"
        class="w-full resize-y rounded-xl border border-[#EADBCE] bg-[#FFFDF9] px-3.5 py-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#1F4D3A] focus:ring-3 focus:ring-[#1F4D3A]/10 transition shadow-inner placeholder-slate-400"
        placeholder="บอกเล่าความประทับใจ การเดินทาง หรือข้อแนะนำสำหรับสถานที่นี้..."
      />

      <div class="flex items-center justify-between pt-1">
        <button
          v-if="myReview"
          type="button"
          class="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
          @click="emit('remove-review')"
        >
          <i class="mdi mdi-trash-can-outline"></i>
          <span>ลบรีวิว</span>
        </button>
        <div v-else></div>

        <button
          type="submit"
          class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1F4D3A] to-[#14392E] hover:brightness-105 text-white font-extrabold text-xs shadow-md shadow-[#1F4D3A]/20 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
          :disabled="reviewSaving"
        >
          <i class="mdi mdi-send text-amber-300"></i>
          <span>{{ reviewSaving ? 'กำลังบันทึก...' : myReview ? 'บันทึกการแก้ไข' : 'ส่งความคิดเห็น' }}</span>
        </button>
      </div>
    </form>

    <!-- Login CTA Card -->
    <div
      v-else
      class="rounded-xl bg-[#F6F1E7] p-4 sm:p-5 border border-[#EADBCE] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#1F4D3A]"
    >
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-full bg-[#1F4D3A] text-amber-300 flex items-center justify-center font-bold text-base shrink-0">
          <i class="mdi mdi-account-lock-outline"></i>
        </div>
        <div>
          <h4 class="font-extrabold text-sm text-[#1F4D3A]">ร่วมแสดงความคิดเห็น</h4>
          <p class="text-xs text-slate-600">เข้าสู่ระบบเพื่อเขียนรีวิวและแบ่งปันประสบการณ์กับนักท่องเที่ยวคนอื่น</p>
        </div>
      </div>
      <RouterLink
        to="/login"
        class="px-5 py-2.5 rounded-xl bg-[#1F4D3A] hover:bg-[#14392E] text-white font-extrabold text-xs shadow-md transition shrink-0"
      >
        เข้าสู่ระบบเลย
      </RouterLink>
    </div>

    <!-- Reviews List -->
    <div v-if="reviewData.reviews.length" class="space-y-4 pt-2 divide-y divide-[#EADBCE]">
      <article
        v-for="rev in reviewData.reviews"
        :key="rev.reviewId"
        class="pt-4 first:pt-0 space-y-2.5"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="h-9 w-9 rounded-full bg-[#1F4D3A] text-amber-300 font-black text-xs flex items-center justify-center shadow-xs border border-white">
              {{ getUserInitials(rev.userName) }}
            </div>
            <div>
              <h4 class="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight">{{ rev.userName }}</h4>
              <p class="text-[10px] text-slate-400 font-medium">{{ formatDate(rev.createdAt) }}</p>
            </div>
          </div>

          <span class="text-[10px] font-extrabold text-[#1F4D3A] bg-amber-100/80 px-2.5 py-0.5 rounded border border-amber-200">
            นักท่องเที่ยว
          </span>
        </div>

        <div class="pl-11">
          <p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-[#F6F1E7]/70 p-3 rounded-xl border border-[#EADBCE]">
            {{ rev.comment }}
          </p>
        </div>
      </article>
    </div>

    <!-- Empty State -->
    <div v-else class="py-8 text-center text-xs text-slate-500 space-y-2">
      <i class="mdi mdi-message-text-outline text-3xl text-slate-300"></i>
      <p class="font-medium">ยังไม่มีความคิดเห็นสำหรับสถานที่นี้ เป็นคนแรกที่เริ่มรีวิวได้เลย!</p>
    </div>
  </section>
</template>
