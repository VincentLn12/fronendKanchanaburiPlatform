<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  addContentFavorite,
  createReport,
  deleteContentReview,
  getContentSchedules,
  getContentFavoriteStatus,
  getContentReviews,
  getMyContentReview,
  getContentShopProducts,
  getPublicContent,
  getPublicContents,
  recordContentView,
  removeContentFavorite,
  saveContentReview,
  type ContentReview,
  type ContentReviews,
  type ContentSchedule,
  type ContentShopProduct,
  type PublicContent,
} from '../../api/contentApi'
import { getShop, getShops } from '@/features/shops/public/api/shopApi'
import type { Shop } from '@/features/shops/shared/types/shop'
import { useSwal } from '@/plugins/sweetalert'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useAuthStore } from '@/features/auth/stores/auth'

import ContentDetailHero from '../components/ContentDetailHero.vue'
import ContentDetailReviews from '../components/ContentDetailReviews.vue'
import ContentDetailSidebar from '../components/ContentDetailSidebar.vue'
import ContentDetailRelated from '../components/ContentDetailRelated.vue'
import ContentReportModal from '../components/ContentReportModal.vue'

const route = useRoute()
const router = useRouter()
const swal = useSwal()
const auth = useAuthStore()

const content = ref<PublicContent | null>(null)
const schedules = ref<ContentSchedule[]>([])
const products = ref<ContentShopProduct[]>([])
const relatedShops = ref<Shop[]>([])
const relatedContents = ref<PublicContent[]>([])
const isFavorite = ref(false)
const changingFavorite = ref(false)

const reviewData = ref<ContentReviews>({ totalCount: 0, reviews: [] })
const myReview = ref<ContentReview | null>(null)
const reviewSaving = ref(false)
const reviewForm = reactive({ comment: '' })

const reportTarget = ref<{ contentId?: string; reviewId?: string; label: string } | null>(null)
const reporting = ref(false)
const reportForm = reactive({ reason: 'ข้อมูลไม่ถูกต้อง', description: '' })

const loading = ref(true)
const id = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))

function formatDate(value?: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(new Date(value))
}

async function load() {
  try {
    content.value = await getPublicContent(id.value)
    const [scheduleItems, productItems, reviews, shops, relatedData] = await Promise.all([
      getContentSchedules(id.value).catch(() => []),
      getContentShopProducts(id.value).catch(() => []),
      getContentReviews(id.value).catch(() => ({ totalCount: 0, reviews: [] })),
      content.value.shopId
        ? getShop(content.value.shopId).then((shop) => [shop]).catch(() => [])
        : getShops({ districtId: content.value.districtId, pageSize: 3 }).catch(() => []),
      getPublicContents({ categoryId: content.value.contentCategoryId, pageSize: 4 }).catch(
        () => ({ items: [] }),
      ),
    ])
    schedules.value = scheduleItems
    products.value = productItems
    reviewData.value = reviews
    relatedShops.value = shops
    relatedContents.value = (relatedData.items || []).filter((item) => item.contentId !== id.value)

    if (auth.isLoggedIn) {
      void recordContentView(id.value)
      void getContentFavoriteStatus(id.value)
        .then((value) => {
          isFavorite.value = value
        })
        .catch(() => undefined)
      void getMyContentReview(id.value)
        .then((review) => {
          if (review) {
            myReview.value = review
            reviewForm.comment = review.comment
          }
        })
        .catch(() => undefined)
    }
  } catch (error) {
    await swal.error('ไม่พบคอนเทนต์', getApiErrorMessage(error, 'คอนเทนต์นี้อาจยังไม่ได้เผยแพร่'))
    await router.replace('/contents')
  } finally {
    loading.value = false
  }
}

async function toggleFavorite() {
  if (!auth.isLoggedIn) {
    await router.push('/login')
    return
  }
  changingFavorite.value = true
  try {
    if (isFavorite.value) await removeContentFavorite(id.value)
    else await addContentFavorite(id.value)
    isFavorite.value = !isFavorite.value
  } catch (error) {
    await swal.error('บันทึกรายการโปรดไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    changingFavorite.value = false
  }
}

async function saveReview() {
  if (!auth.isLoggedIn) {
    await router.push('/login')
    return
  }
  if (!reviewForm.comment.trim()) {
    await swal.warning('กรอกความคิดเห็น', 'กรุณาเขียนความคิดเห็นก่อนส่ง')
    return
  }
  reviewSaving.value = true
  try {
    myReview.value = await saveContentReview(id.value, { comment: reviewForm.comment })
    reviewData.value = await getContentReviews(id.value)
    await swal.success('บันทึกรีวิวแล้ว')
  } catch (error) {
    await swal.error('บันทึกรีวิวไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    reviewSaving.value = false
  }
}

async function removeReview() {
  if (!myReview.value) return
  const result = await swal.confirm('ลบรีวิวนี้หรือไม่?', 'การดำเนินการนี้ไม่สามารถย้อนกลับได้')
  if (!result.isConfirmed) return
  try {
    await deleteContentReview(myReview.value.reviewId)
    myReview.value = null
    reviewForm.comment = ''
    reviewData.value = await getContentReviews(id.value)
    await swal.success('ลบรีวิวแล้ว')
  } catch (error) {
    await swal.error('ลบรีวิวไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

function shareContent(platform?: string) {
  const url = window.location.href
  if (platform === 'fb') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  } else if (platform === 'line') {
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`, '_blank')
  } else {
    navigator.clipboard.writeText(url)
    void swal.success('คัดลอกลิงก์แล้ว', 'นำลิงก์ไปแชร์ให้เพื่อน ๆ ได้เลย')
  }
}

async function openReport(target: { contentId?: string; reviewId?: string; label: string }) {
  if (!auth.isLoggedIn) {
    await router.push('/login')
    return
  }
  reportTarget.value = target
  reportForm.reason = 'ข้อมูลไม่ถูกต้อง'
  reportForm.description = ''
}

async function submitReport() {
  if (!reportTarget.value || !reportForm.reason) return
  reporting.value = true
  try {
    await createReport({
      ...reportTarget.value,
      reason: reportForm.reason,
      description: reportForm.description || undefined,
    })
    reportTarget.value = null
    await swal.success('ส่งรายงานแล้ว', 'ทีมงานจะตรวจสอบรายการนี้ต่อไป')
  } catch (error) {
    await swal.error(
      'ส่งรายงานไม่สำเร็จ',
      getApiErrorMessage(error, 'คุณอาจเคยรายงานรายการนี้แล้ว'),
    )
  } finally {
    reporting.value = false
  }
}

function openDirections() {
  if (content.value?.latitude && content.value?.longitude) {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${content.value.latitude},${content.value.longitude}`,
      '_blank',
    )
  } else {
    const query = encodeURIComponent(
      `${content.value?.title || ''} ${content.value?.districtName || 'กาญจนบุรี'}`,
    )
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }
}

onMounted(load)
</script>

<template>
  <div v-if="content" class="min-h-screen bg-[#F9F7F2] text-slate-800 pb-16">
    <!-- BREADCRUMB BAR -->
    <div class="bg-white border-b border-[#E8E2D5] py-3 shadow-2xs">
      <div
        class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-slate-600 flex items-center gap-2 font-medium"
      >
        <RouterLink to="/" class="hover:text-[#1C4D3E] transition">หน้าแรก</RouterLink>
        <i class="mdi mdi-chevron-right text-slate-400"></i>
        <RouterLink to="/contents" class="hover:text-[#1C4D3E] transition">สำรวจคอนเทนต์</RouterLink>
        <i class="mdi mdi-chevron-right text-slate-400"></i>
        <span class="text-[#1C4D3E] font-bold">{{ content.contentCategoryName || 'ศิลปะการแสดง' }}</span>
        <i class="mdi mdi-chevron-right text-slate-400"></i>
        <span class="text-slate-900 font-extrabold line-clamp-1">{{ content.title }}</span>
      </div>
    </div>

    <!-- MAIN 2-COLUMN LAYOUT WRAPPER (8 Cols Stream + 4 Cols Sticky Sidebar) -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- LEFT MAIN COLUMN -->
        <div class="lg:col-span-8 space-y-8">
          <!-- 1. Video Player & Metadata Card -->
          <ContentDetailHero
            :content="content"
            :isFavorite="isFavorite"
            :changingFavorite="changingFavorite"
            @toggle-favorite="toggleFavorite"
            @share="shareContent"
          />

          <section v-if="content.summary" class="rounded-2xl border border-[#EADBCE] bg-[#FFFDF9] p-6 shadow-sm">
            <h2 class="text-xl font-black text-[#1F4D3A]">เกี่ยวกับวิดีโอนี้</h2>
            <p class="mt-3 text-sm leading-relaxed text-slate-700">{{ content.summary }}</p>
          </section>

          <!-- 3. Schedules & Events (Only if schedule exists) -->
          <section
            v-if="schedules.length"
            class="rounded-3xl bg-white border border-[#E8E2D5] p-6 sm:p-8 shadow-sm space-y-6"
          >
            <div class="flex items-center justify-between border-b border-[#E8E2D5] pb-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-[#1C4D3E] text-amber-300 flex items-center justify-center font-bold">
                  <i class="mdi mdi-calendar-clock-outline text-xl"></i>
                </div>
                <div>
                  <h2 class="text-xl font-black text-[#1C4D3E]">รอบการแสดง / กิจกรรม</h2>
                  <p class="text-xs text-slate-500 font-medium">รอบการแสดงสดและกิจกรรมวัฒนธรรมที่กำลังจะเกิดขึ้น</p>
                </div>
              </div>
              <span class="text-xs font-extrabold text-[#1C4D3E] bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                มี {{ schedules.length }} รอบการแสดง
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="sch in schedules"
                :key="sch.scheduleId"
                class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 shadow-2xs hover:border-[#1C4D3E] transition"
              >
                <span class="font-extrabold text-[#1C4D3E] text-sm block">{{ sch.title }}</span>
                <p class="text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                  <i class="mdi mdi-clock-outline text-[#D99A32]"></i>
                  <span>{{ formatDate(sch.startDateTime) }}</span>
                </p>
                <p v-if="sch.address" class="text-xs text-slate-600 flex items-center gap-1.5">
                  <i class="mdi mdi-map-marker-outline text-[#1C4D3E]"></i>
                  <span>{{ sch.address }}</span>
                </p>
              </div>
            </div>
          </section>

          <!-- 4. Community Discussion & Reviews -->
          <ContentDetailReviews
            v-model:comment="reviewForm.comment"
            :reviewData="reviewData"
            :myReview="myReview"
            :isLoggedIn="auth.isLoggedIn"
            :reviewSaving="reviewSaving"
            @save-review="saveReview"
            @remove-review="removeReview"
          />
        </div>

        <!-- RIGHT STICKY SIDEBAR (4 Cols: Location Map -> Shops/Products Widget) -->
        <div class="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <ContentDetailSidebar
            :content="content"
            :shops="relatedShops"
            :products="products"
            @open-directions="openDirections"
          />
        </div>
      </div>

      <!-- BOTTOM SECTION: Recommended Related Video Cards -->
      <ContentDetailRelated :items="relatedContents" />

      <!-- FOOTER SHARE / REPORT SECTION -->
      <section
        class="flex flex-wrap items-center justify-end gap-4 border-t border-[#E8E2D5] pt-6 text-xs text-slate-500"
      >
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="font-bold text-[#1C4D3E]">แชร์คอนเทนต์</span>
            <button
              type="button"
              class="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-90 transition cursor-pointer shadow-2xs"
              @click="shareContent('fb')"
            >
              <i class="mdi mdi-facebook text-base"></i>
            </button>
            <button
              type="button"
              class="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:opacity-90 transition cursor-pointer shadow-2xs"
              @click="shareContent('line')"
            >
              <i class="mdi mdi-forum-outline text-base"></i>
            </button>
            <button
              type="button"
              class="h-8 w-8 rounded-full bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 transition cursor-pointer border border-[#E8E2D5]"
              @click="shareContent()"
            >
              <i class="mdi mdi-link-variant text-base"></i>
            </button>
          </div>

          <button
            type="button"
            class="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition cursor-pointer"
            @click="openReport({ contentId: content.contentId, label: content.title })"
          >
            <i class="mdi mdi-flag-outline"></i>
            <span>รายงานเนื้อหา</span>
          </button>
        </div>
      </section>
    </main>

    <!-- REPORT MODAL -->
    <ContentReportModal
      v-model:reason="reportForm.reason"
      v-model:description="reportForm.description"
      :target="reportTarget"
      :reporting="reporting"
      @close="reportTarget = null"
      @submit="submitReport"
    />
  </div>
</template>
