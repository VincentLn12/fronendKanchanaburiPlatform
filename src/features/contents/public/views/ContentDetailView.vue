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
  recordContentView,
  removeContentFavorite,
  saveContentReview,
  type ContentReview,
  type ContentReviews,
  type ContentSchedule,
  type ContentShopProduct,
  type PublicContent,
} from '../api/contentApi'
import ContentLocationMap from '../components/ContentLocationMap.vue'
import { getShop, getShops } from '@/features/shops/public/api/shopApi'
import type { Shop } from '@/features/shops/shared/types/shop'
import { useSwal } from '@/plugins/sweetalert'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useAuthStore } from '@/features/auth/stores/auth'

const route = useRoute()
const router = useRouter()
const swal = useSwal()
const auth = useAuthStore()

const content = ref<PublicContent | null>(null)
const schedules = ref<ContentSchedule[]>([])
const products = ref<ContentShopProduct[]>([])
const relatedShops = ref<Shop[]>([])
const isFavorite = ref(false)
const changingFavorite = ref(false)

const reviewData = ref<ContentReviews>({ totalCount: 0, reviews: [] })
const myReview = ref<ContentReview | null>(null)
const reviewSaving = ref(false)
const reviewForm = reactive({ comment: '' })

const reportTarget = ref<{ contentId?: string; reviewId?: string; label: string } | null>(null)
const reporting = ref(false)
const reportForm = reactive({ reason: 'ข้อมูลไม่ถูกต้อง', description: '' })

const activeTab = ref<'details' | 'schedules' | 'location' | 'shops' | 'products'>('details')

const loading = ref(true)
const id = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))

function youtubeEmbedUrl(url?: string) {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    const videoId = parsed.hostname.includes('youtu.be')
      ? parsed.pathname.slice(1)
      : (parsed.searchParams.get('v') ?? (parsed.pathname.startsWith('/embed/') ? parsed.pathname.split('/')[2] : ''))
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&rel=0` : ''
  } catch {
    return ''
  }
}

function formatDate(value?: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(new Date(value))
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

const shopSectionTitle = computed(() =>
  content.value?.shopId ? 'ร้านค้าที่เชื่อมกับคอนเทนต์' : 'ร้านค้าในพื้นที่',
)

async function load() {
  try {
    content.value = await getPublicContent(id.value)
    const [scheduleItems, productItems, reviews, shops] = await Promise.all([
      getContentSchedules(id.value).catch(() => []),
      getContentShopProducts(id.value).catch(() => []),
      getContentReviews(id.value).catch(() => ({ totalCount: 0, reviews: [] })),
      content.value.shopId
        ? getShop(content.value.shopId).then((shop) => [shop]).catch(() => [])
        : getShops({ districtId: content.value.districtId, pageSize: 3 }).catch(() => []),
    ])
    schedules.value = scheduleItems
    products.value = productItems
    reviewData.value = reviews
    relatedShops.value = shops

    if (auth.isLoggedIn) {
      void recordContentView(id.value)
      void getContentFavoriteStatus(id.value)
        .then((value) => {
          isFavorite.value = value
        })
        .catch(() => undefined)
      void getMyContentReview(id.value)
        .then((review) => {
          myReview.value = review
          reviewForm.comment = review.comment
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
    const query = encodeURIComponent(`${content.value?.title || ''} ${content.value?.districtName || 'กาญจนบุรี'}`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }
}

onMounted(load)
</script>

<template>
  <div v-if="content" class="min-h-screen bg-[#f8faf9] text-slate-800 pb-16">
    <!-- BREADCRUMB BAR -->
    <div class="bg-white border-b border-slate-200/80 py-3">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex items-center gap-2">
        <RouterLink to="/" class="hover:text-[#1c4d3e]">หน้าแรก</RouterLink>
        <i class="mdi mdi-chevron-right text-slate-300"></i>
        <RouterLink to="/contents" class="hover:text-[#1c4d3e]">สำรวจคอนเทนต์</RouterLink>
        <i class="mdi mdi-chevron-right text-slate-300"></i>
        <span class="text-slate-800 font-semibold line-clamp-1">{{ content.title }}</span>
      </div>
    </div>

    <!-- TOP HERO HEADER SECTION (MEDIA & SUMMARY) -->
    <section class="bg-white border-b border-slate-200/80 py-8">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <section v-if="content.youtubeUrl" class="overflow-hidden border border-slate-200 bg-slate-950 shadow-sm lg:col-span-6">
            <iframe
              v-if="youtubeEmbedUrl(content.youtubeUrl)"
              :src="youtubeEmbedUrl(content.youtubeUrl)"
              :title="content.title"
              class="aspect-[16/10] w-full border-0"
              allowfullscreen
            />
            <a
              v-else
              :href="content.youtubeUrl"
              target="_blank"
              rel="noopener"
              class="flex aspect-[16/10] flex-col items-center justify-center gap-3 bg-[#0d3831] text-center text-sm font-bold text-white hover:bg-[#1c4d3e]"
            >
              <i class="mdi mdi-play-circle-outline text-5xl" />
              ดูวิดีโอบน YouTube
            </a>
          </section>
          <div class="space-y-4" :class="content.youtubeUrl ? 'lg:col-span-6' : 'lg:col-span-9'">
            <div>
              <span class="inline-block px-3 py-1 rounded-md text-xs font-bold bg-[#1c4d3e] text-white shadow-xs">
                {{ content.contentCategoryName || 'คอนเทนต์' }}
              </span>
            </div>

            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
              {{ content.title }}
            </h1>

            <p class="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
              <i class="mdi mdi-map-marker text-[#1c4d3e] text-lg"></i>
              <span>{{ [content.subDistrictName, content.districtName].filter(Boolean).join(' ') || 'กาญจนบุรี' }}</span>
            </p>

            <div class="flex flex-wrap gap-2 pt-1">
              <span
                v-for="tag in content.tags"
                :key="tag.tagId"
                class="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-600"
              >
                # {{ tag.tagName }}
              </span>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-100 text-xs text-slate-500">
              <div class="flex items-center gap-4">
                <span class="flex items-center gap-1.5"><i class="mdi mdi-calendar-month-outline text-slate-400"></i>เผยแพร่ {{ formatDate(content.publishedAt || content.createdAt) }}</span>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
                  @click="shareContent()"
                >
                  <i class="mdi mdi-share-variant-outline text-base"></i>
                  <span>แชร์</span>
                </button>

                <button
                  type="button"
                  class="flex items-center gap-1 px-3 py-1.5 rounded-xl border transition font-bold"
                  :class="isFavorite ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-700 hover:bg-slate-50'"
                  :disabled="changingFavorite"
                  @click="toggleFavorite"
                >
                  <i class="mdi text-base" :class="isFavorite ? 'mdi-heart text-rose-600' : 'mdi-heart-outline'"></i>
                  <span>{{ isFavorite ? 'บันทึกแล้ว' : 'บันทึก' }}</span>
                </button>
              </div>
            </div>

            <!-- เรื่องย่อ (Summary Box) -->
            <div class="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-1.5">
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wide">เรื่องย่อ</h3>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {{ content.summary || 'ยังไม่มีรายละเอียดเพิ่มเติมสำหรับคอนเทนต์นี้' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB NAVIGATION SUB-BAR -->
    <section class="sticky top-20 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-6 overflow-x-auto text-xs sm:text-sm font-bold scrollbar-none">
          <button
            type="button"
            class="py-4 border-b-2 transition shrink-0"
            :class="activeTab === 'details' ? 'border-[#1c4d3e] text-[#1c4d3e]' : 'border-transparent text-slate-600 hover:text-slate-900'"
            @click="activeTab = 'details'"
          >
            รายละเอียด
          </button>
          <button
            v-if="schedules.length"
            type="button"
            class="py-4 border-b-2 transition shrink-0"
            :class="activeTab === 'schedules' ? 'border-[#1c4d3e] text-[#1c4d3e]' : 'border-transparent text-slate-600 hover:text-slate-900'"
            @click="activeTab = 'schedules'"
          >
            รอบการแสดง
          </button>
          <button
            v-if="content.latitude != null && content.longitude != null"
            type="button"
            class="py-4 border-b-2 transition shrink-0"
            :class="activeTab === 'location' ? 'border-[#1c4d3e] text-[#1c4d3e]' : 'border-transparent text-slate-600 hover:text-slate-900'"
            @click="activeTab = 'location'"
          >
            สถานที่
          </button>
          <button
            v-if="relatedShops.length"
            type="button"
            class="py-4 border-b-2 transition shrink-0"
            :class="activeTab === 'shops' ? 'border-[#1c4d3e] text-[#1c4d3e]' : 'border-transparent text-slate-600 hover:text-slate-900'"
            @click="activeTab = 'shops'"
          >
            ร้านค้าที่เกี่ยวข้อง
          </button>
          <button
            v-if="products.length"
            type="button"
            class="py-4 border-b-2 transition shrink-0"
            :class="activeTab === 'products' ? 'border-[#1c4d3e] text-[#1c4d3e]' : 'border-transparent text-slate-600 hover:text-slate-900'"
            @click="activeTab = 'products'"
          >
            สินค้าที่เกี่ยวข้อง
          </button>
        </div>
      </div>
    </section>

    <!-- MAIN DYNAMIC TAB CONTENT AREA -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">

      <!-- TAB 1: รายละเอียด (DETAILS - INCLUDES MAP CARD IN SIDEBAR MATCHING MOCKUP) -->
      <div v-if="activeTab === 'details'" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div class="lg:col-span-7 space-y-8">
          <!-- ความคิดเห็นและรีวิว (Reviews) -->
          <div class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <div class="flex items-center gap-2">
                <i class="mdi mdi-comment-text-outline text-2xl text-[#1c4d3e]"></i>
                <h2 class="text-xl font-bold text-slate-900">ความคิดเห็น</h2>
              </div>
              <span class="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {{ reviewData.totalCount }} ความคิดเห็น
              </span>
            </div>

            <form v-if="auth.isLoggedIn" class="rounded-2xl bg-slate-50 p-4 border border-slate-200/60" @submit.prevent="saveReview">
              <p class="font-bold text-slate-800 text-xs sm:text-sm">{{ myReview ? 'แก้ไขความคิดเห็นของคุณ' : 'แสดงความคิดเห็น' }}</p>
              <textarea
                v-model="reviewForm.comment"
                rows="3"
                maxlength="2000"
                class="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-700 outline-none focus:border-[#1c4d3e]"
                placeholder="แบ่งปันประสบการณ์หรือความคิดเห็นของคุณ..."
              />
              <div class="mt-3 flex justify-end gap-3">
                <button v-if="myReview" type="button" class="text-xs font-bold text-rose-600 hover:underline" @click="removeReview">ลบรีวิว</button>
                <button type="submit" class="px-4 py-2 rounded-xl bg-[#1c4d3e] text-white font-bold text-xs hover:bg-[#14392e] transition" :disabled="reviewSaving">
                  {{ reviewSaving ? 'กำลังบันทึก...' : myReview ? 'บันทึกการแก้ไข' : 'ส่งรีวิว' }}
                </button>
              </div>
            </form>
            <div v-else class="rounded-2xl bg-emerald-50 p-4 flex items-center justify-between text-xs text-[#1c4d3e]">
              <span>เข้าสู่ระบบเพื่อแสดงความคิดเห็น</span>
              <RouterLink to="/login" class="px-4 py-2 rounded-xl bg-[#1c4d3e] text-white font-bold">เข้าสู่ระบบ</RouterLink>
            </div>

            <div v-if="reviewData.reviews.length" class="space-y-3 pt-2">
              <article v-for="rev in reviewData.reviews" :key="rev.reviewId" class="border-b border-slate-100 pb-3 text-xs sm:text-sm">
                <div class="flex items-center justify-between font-bold text-slate-800">
                  <span>{{ rev.userName }}</span>
                  <span class="text-xs text-slate-400 font-normal">{{ formatDate(rev.createdAt) }}</span>
                </div>
                <p class="mt-1 text-slate-600 leading-relaxed">{{ rev.comment }}</p>
              </article>
            </div>
          </div>
        </div>

        <!-- Right Column: Sidebar Cards (Map Card & General Info Card) -->
        <div class="lg:col-span-5 space-y-6">

          <!-- Card 1: 📍 สถานที่พร้อมแผนที่ (Map Card) -->
          <div class="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div class="flex items-center gap-2">
              <i class="mdi mdi-map-marker-radius-outline text-xl text-[#1c4d3e]"></i>
              <h3 class="font-bold text-slate-900 text-base">สถานที่</h3>
            </div>

            <div>
              <h4 class="font-bold text-slate-900 text-sm">{{ content.title }}</h4>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ [content.subDistrictName, content.districtName].filter(Boolean).join(' ') || 'กาญจนบุรี' }}
              </p>
            </div>

            <!-- Embedded Location Map -->
            <div class="rounded-2xl overflow-hidden border border-slate-200">
              <ContentLocationMap
                v-if="content.latitude && content.longitude"
                :latitude="content.latitude"
                :longitude="content.longitude"
                :title="content.title"
              />
            </div>

            <div class="flex items-center justify-between pt-1">
              <span class="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <i class="mdi mdi-compass-outline text-slate-400"></i>
                {{ content.latitude }}, {{ content.longitude }}
              </span>

              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-[#1c4d3e] hover:bg-[#14392e] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                @click="openDirections"
              >
                <i class="mdi mdi-navigation-variant"></i>
                <span>นำทาง</span>
              </button>
            </div>
          </div>

          <!-- Card 2: 📋 ข้อมูลทั่วไป -->
          <div class="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 class="font-bold text-slate-900 text-base">ข้อมูลทั่วไป</h3>
            <dl class="space-y-2.5 text-xs sm:text-sm">
              <div class="flex justify-between py-1 border-b border-slate-100">
                <dt class="text-slate-400">ประเภทคอนเทนต์</dt>
                <dd class="font-bold text-slate-800">{{ content.contentCategoryName || '-' }}</dd>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <dt class="text-slate-400">เผยแพร่เมื่อ</dt>
                <dd class="font-bold text-slate-800">{{ formatDate(content.publishedAt || content.createdAt) }}</dd>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <dt class="text-slate-400">อัปเดตล่าสุด</dt>
                <dd class="font-bold text-slate-800">{{ formatDate(content.updatedAt || content.createdAt) }}</dd>
              </div>
              <div v-if="content.shopName" class="flex justify-between py-1">
                <dt class="text-slate-400">ผู้เผยแพร่</dt>
                <dd class="font-bold text-slate-800">{{ content.shopName }}</dd>
              </div>
            </dl>
          </div>

        </div>
      </div>

      <!-- TAB 2: รอบการแสดง (SCHEDULES) -->
      <div v-else-if="activeTab === 'schedules' && schedules.length" class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div class="flex items-center gap-2">
          <i class="mdi mdi-calendar-month-outline text-2xl text-[#1c4d3e]"></i>
          <h2 class="text-xl font-bold text-slate-900">รอบการแสดง ({{ schedules.length }} รอบ)</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div v-for="sch in schedules" :key="sch.scheduleId" class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5">
              <span class="font-bold text-slate-900 text-base block">{{ sch.title }}</span>
              <p class="text-xs text-slate-600 flex items-center gap-1.5">
                <i class="mdi mdi-clock-outline text-[#1c4d3e]"></i>
                <span>{{ formatDate(sch.startDateTime) }}</span>
              </p>
              <p v-if="sch.address" class="text-xs text-slate-600 flex items-center gap-1.5">
                <i class="mdi mdi-map-marker-outline text-[#1c4d3e]"></i>
                <span>{{ sch.address }}</span>
              </p>
            </div>
        </div>
      </div>

      <!-- TAB 3: สถานที่ (LOCATION TAB - FULL PAGE MAP & DETAILS) -->
      <div v-else-if="activeTab === 'location'" class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div class="flex items-center gap-2">
          <i class="mdi mdi-map-marker-radius-outline text-2xl text-[#1c4d3e]"></i>
          <h2 class="text-xl font-bold text-slate-900">สถานที่และแผนที่</h2>
        </div>

        <div class="space-y-4">
          <div>
            <h3 class="font-bold text-slate-900 text-lg">{{ content.title }}</h3>
            <p class="text-sm text-slate-600 mt-1">
              {{ [content.subDistrictName, content.districtName].filter(Boolean).join(' ') || 'กาญจนบุรี' }}
            </p>
          </div>

          <div class="rounded-2xl overflow-hidden border border-slate-200 min-h-[380px]">
            <ContentLocationMap
              v-if="content.latitude && content.longitude"
              :latitude="content.latitude"
              :longitude="content.longitude"
              :title="content.title"
            />
          </div>

          <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
            <span class="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
              <i class="mdi mdi-compass-outline text-slate-400"></i>
              พิกัด GPS: {{ content.latitude }}, {{ content.longitude }}
            </span>

            <button
              type="button"
              class="px-6 py-2.5 rounded-xl bg-[#1c4d3e] hover:bg-[#14392e] text-white text-sm font-bold transition flex items-center gap-2 shadow-sm"
              @click="openDirections"
            >
              <i class="mdi mdi-navigation-variant"></i>
              <span>นำทางบน Google Maps</span>
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 4: ร้านค้าที่เกี่ยวข้อง (SHOPS ONLY) -->
      <div v-else-if="activeTab === 'shops'" class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="mdi mdi-storefront-outline text-2xl text-[#1c4d3e]"></i>
            <h2 class="text-xl font-bold text-slate-900">ร้านค้าที่เกี่ยวข้อง</h2>
          </div>
          <RouterLink :to="content.districtId ? { path: '/shops', query: { districtId: content.districtId } } : '/shops'" class="text-sm font-semibold text-[#1c4d3e] hover:underline">ดูร้านค้าทั้งหมด</RouterLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <RouterLink v-for="shop in relatedShops" :key="shop.shopId" :to="`/shops/${shop.shopId}`" class="rounded-2xl border border-slate-200 p-4 space-y-3 bg-white shadow-xs transition hover:border-emerald-500">
            <div>
              <h4 class="font-bold text-slate-900 text-base">{{ shop.shopName }}</h4>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">{{ shop.description || 'ร้านค้าในพื้นที่กาญจนบุรี' }}</p>
              <div class="mt-3 flex items-center justify-between text-xs">
                <span class="text-slate-500"><i class="mdi mdi-map-marker text-[#1c4d3e]"></i> {{ shop.districtName || 'กาญจนบุรี' }}</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- TAB 5: สินค้าที่เกี่ยวข้อง (PRODUCTS ONLY) -->
      <div v-else-if="activeTab === 'products'" class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="mdi mdi-shopping-outline text-2xl text-[#1c4d3e]"></i>
            <h2 class="text-xl font-bold text-slate-900">สินค้าที่เกี่ยวข้อง</h2>
          </div>
          <RouterLink to="/shops" class="text-sm font-semibold text-[#1c4d3e] hover:underline">ดูสินค้าทั้งหมด</RouterLink>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            <RouterLink
              v-for="prod in products"
              :key="prod.productId"
              :to="`/products/${prod.productId}`"
              class="group bg-white rounded-2xl overflow-hidden border border-slate-200 p-3 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <h4 class="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-[#1c4d3e]">{{ prod.productName }}</h4>
              <p class="font-black text-[#1c4d3e] text-sm mt-2">{{ formatPrice(prod.price) }}</p>
            </RouterLink>
        </div>
      </div>

      <section class="flex flex-wrap items-center justify-end gap-4 border-t border-slate-200 pt-6 text-xs sm:text-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-700">แชร์คอนเทนต์</span>
            <button type="button" class="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-90 transition" @click="shareContent('fb')">
              <i class="mdi mdi-facebook text-base"></i>
            </button>
            <button type="button" class="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:opacity-90 transition" @click="shareContent('line')">
              <i class="mdi mdi-forum-outline text-base"></i>
            </button>
            <button type="button" class="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition" @click="shareContent()">
              <i class="mdi mdi-link-variant text-base"></i>
            </button>
          </div>

          <button
            type="button"
            class="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition"
            @click="openReport({ contentId: content.contentId, label: content.title })"
          >
            <i class="mdi mdi-flag-outline"></i>
            <span>รายงานเนื้อหา</span>
          </button>
        </div>
      </section>

    </main>

    <!-- REPORT MODAL TELEPORT -->
    <Teleport to="body">
      <div
        v-if="reportTarget"
        class="fixed inset-0 z-[100] flex items-end bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center sm:justify-center"
        @click.self="reportTarget = null"
      >
        <form class="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" @submit.prevent="submitReport">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-bold text-rose-600"><i class="mdi mdi-flag-outline mr-1"></i>รายงานรายการ</p>
              <h2 class="mt-1 text-xl font-black text-slate-900">{{ reportTarget.label }}</h2>
            </div>
            <button type="button" class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" @click="reportTarget = null">
              <i class="mdi mdi-close text-2xl"></i>
            </button>
          </div>
          <label class="mt-6 block text-sm font-bold text-slate-700">เหตุผล</label>
          <select v-model="reportForm.reason" class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10">
            <option>ข้อมูลไม่ถูกต้อง</option>
            <option>เนื้อหาไม่เหมาะสม</option>
            <option>สแปมหรือโฆษณา</option>
            <option>ละเมิดลิขสิทธิ์</option>
            <option>อื่น ๆ</option>
          </select>
          <label class="mt-4 block text-sm font-bold text-slate-700">รายละเอียดเพิ่มเติม (ถ้ามี)</label>
          <textarea v-model="reportForm.description" rows="3" maxlength="2000" class="mt-2 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10" placeholder="อธิบายสิ่งที่พบเพื่อช่วยให้ทีมงานตรวจสอบ" />
          <div class="mt-6 flex justify-end gap-3">
            <button type="button" class="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100" @click="reportTarget = null">ยกเลิก</button>
            <button type="submit" class="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50" :disabled="reporting">
              {{ reporting ? 'กำลังส่ง...' : 'ส่งรายงาน' }}
            </button>
          </div>
        </form>
      </div>
    </Teleport>
  </div>
</template>
