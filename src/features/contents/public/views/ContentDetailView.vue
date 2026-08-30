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
const isFavorite = ref(false)
const changingFavorite = ref(false)

const reviewData = ref<ContentReviews>({ totalCount: 0, reviews: [] })
const myReview = ref<ContentReview | null>(null)
const reviewSaving = ref(false)
const reviewForm = reactive({ comment: '' })

const reportTarget = ref<{ contentId?: string; reviewId?: string; label: string } | null>(null)
const reporting = ref(false)
const reportForm = reactive({ reason: 'ข้อมูลไม่ถูกต้อง', description: '' })

const activeTab = ref<'details' | 'schedules' | 'location' | 'shops' | 'products' | 'related'>('details')
const selectedImageIndex = ref(0)

const usefulCount = ref(128)
const notUsefulCount = ref(3)
const userVoted = ref<'useful' | 'notUseful' | null>(null)
const subscribeEmail = ref('')

const loading = ref(true)
const id = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))

function youtubeEmbedUrl(url?: string) {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    const videoId = parsed.hostname.includes('youtu.be')
      ? parsed.pathname.slice(1)
      : (parsed.searchParams.get('v') ??
        (parsed.pathname.startsWith('/embed/') ? parsed.pathname.split('/')[2] : ''))
    return videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&rel=0`
      : ''
  } catch {
    return ''
  }
}

function youtubeThumbnail(url?: string) {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    const videoId = parsed.hostname.includes('youtu.be')
      ? parsed.pathname.slice(1)
      : (parsed.searchParams.get('v') ?? parsed.pathname.split('/').filter(Boolean).pop())
    return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : ''
  } catch {
    return ''
  }
}

function formatDate(value?: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(new Date(value))
}

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function imageUrl(url?: string) {
  return url?.startsWith('/') ? `${apiOrigin}${url}` : url
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

// Gallery Images Array
const galleryImages = computed(() => {
  const list: string[] = []
  if (content.value?.youtubeUrl && youtubeThumbnail(content.value.youtubeUrl)) {
    list.push(youtubeThumbnail(content.value.youtubeUrl))
  }
  const defaults = [
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',
  ]
  return list.concat(defaults).slice(0, 5)
})

// Related contents mockup items
const relatedContents = [
  {
    id: 'rel-1',
    title: 'วิถีชีวิตชาวมอญ บ้านวังก์กะ',
    location: 'อ.สังขละบุรี',
    views: '1.1K ครั้ง',
    image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'rel-2',
    title: 'อาหารมอญ สังขละบุรี',
    location: 'อ.สังขละบุรี',
    views: '890 ครั้ง',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'rel-3',
    title: 'ประเพณีสงกรานต์มอญ',
    location: 'อ.สังขละบุรี',
    views: '1.3K ครั้ง',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
  },
]

async function load() {
  try {
    content.value = await getPublicContent(id.value)
    const [scheduleItems, productItems, reviews] = await Promise.all([
      getContentSchedules(id.value).catch(() => []),
      getContentShopProducts(id.value).catch(() => []),
      getContentReviews(id.value).catch(() => ({ totalCount: 0, reviews: [] })),
    ])
    schedules.value = scheduleItems
    products.value = productItems
    reviewData.value = reviews

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

function vote(type: 'useful' | 'notUseful') {
  if (userVoted.value === type) return
  if (userVoted.value === 'useful') usefulCount.value--
  if (userVoted.value === 'notUseful') notUsefulCount.value--

  if (type === 'useful') usefulCount.value++
  if (type === 'notUseful') notUsefulCount.value++
  userVoted.value = type
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

function handleSubscribe() {
  if (!subscribeEmail.value.trim()) return
  void swal.success('ติดตามข่าวสารแล้ว', 'ขอบคุณที่สนใจกิจกรรมและเรื่องราวของกาญจนบุรี')
  subscribeEmail.value = ''
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
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <!-- Left: Main Media & Gallery Strip -->
          <div class="lg:col-span-6 space-y-3">
            <div class="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-950 shadow-md border border-slate-200">
              <iframe
                v-if="content.youtubeUrl && youtubeEmbedUrl(content.youtubeUrl)"
                :src="youtubeEmbedUrl(content.youtubeUrl)"
                :title="content.title"
                class="w-full h-full border-0"
                allowfullscreen
              />
              <img
                v-else
                :src="galleryImages[selectedImageIndex] || galleryImages[0]"
                :alt="content.title"
                class="w-full h-full object-cover"
              />

              <div v-if="content.youtubeUrl && !youtubeEmbedUrl(content.youtubeUrl)" class="absolute inset-0 flex items-center justify-center bg-slate-950/40">
                <a
                  :href="content.youtubeUrl"
                  target="_blank"
                  rel="noopener"
                  class="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#1c4d3e] shadow-2xl hover:scale-110 transition"
                >
                  <i class="mdi mdi-play text-4xl ml-1"></i>
                </a>
              </div>
            </div>

            <!-- Thumbnail Strip -->
            <div class="grid grid-cols-5 gap-2.5">
              <button
                v-for="(img, idx) in galleryImages"
                :key="idx"
                type="button"
                class="relative aspect-4/3 rounded-xl overflow-hidden border-2 transition"
                :class="selectedImageIndex === idx ? 'border-[#1c4d3e] ring-2 ring-[#1c4d3e]/20' : 'border-slate-200 hover:border-slate-300 opacity-80'"
                @click="selectedImageIndex = idx"
              >
                <img :src="img" :alt="`ภาพที่ ${idx + 1}`" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- Right: Title, Metadata, Actions & Summary Box -->
          <div class="lg:col-span-6 space-y-4">
            <div>
              <span class="inline-block px-3 py-1 rounded-md text-xs font-bold bg-[#1c4d3e] text-white shadow-xs">
                {{ content.contentCategoryName || 'ศิลปะการแสดง' }}
              </span>
            </div>

            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
              {{ content.title }}
            </h1>

            <p class="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
              <i class="mdi mdi-map-marker text-[#1c4d3e] text-lg"></i>
              <span>{{ [content.subDistrictName, content.districtName, 'จ.กาญจนบุรี'].filter(Boolean).join(' ') }}</span>
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
                <span class="flex items-center gap-1.5"><i class="mdi mdi-eye-outline text-slate-400"></i>1,250 ครั้ง</span>
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
                {{ content.summary || 'รำมอญเป็นศิลปะการแสดงพื้นบ้านของชาวมอญในสังขละบุรี ที่สืบทอดกันมาอย่างยาวนาน เป็นการแสดงที่อ่อนช้อย งดงาม และสะท้อนถึงวิถีชีวิต ความเชื่อ และวัฒนธรรมของชาวมอญได้เป็นอย่างดี' }}
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
            type="button"
            class="py-4 border-b-2 transition shrink-0"
            :class="activeTab === 'schedules' ? 'border-[#1c4d3e] text-[#1c4d3e]' : 'border-transparent text-slate-600 hover:text-slate-900'"
            @click="activeTab = 'schedules'"
          >
            รอบการแสดง
          </button>
          <button
            type="button"
            class="py-4 border-b-2 transition shrink-0"
            :class="activeTab === 'location' ? 'border-[#1c4d3e] text-[#1c4d3e]' : 'border-transparent text-slate-600 hover:text-slate-900'"
            @click="activeTab = 'location'"
          >
            สถานที่
          </button>
          <button
            type="button"
            class="py-4 border-b-2 transition shrink-0"
            :class="activeTab === 'shops' ? 'border-[#1c4d3e] text-[#1c4d3e]' : 'border-transparent text-slate-600 hover:text-slate-900'"
            @click="activeTab = 'shops'"
          >
            ร้านค้าที่เกี่ยวข้อง
          </button>
          <button
            type="button"
            class="py-4 border-b-2 transition shrink-0"
            :class="activeTab === 'products' ? 'border-[#1c4d3e] text-[#1c4d3e]' : 'border-transparent text-slate-600 hover:text-slate-900'"
            @click="activeTab = 'products'"
          >
            สินค้าที่เกี่ยวข้อง
          </button>
          <button
            type="button"
            class="py-4 border-b-2 transition shrink-0"
            :class="activeTab === 'related' ? 'border-[#1c4d3e] text-[#1c4d3e]' : 'border-transparent text-slate-600 hover:text-slate-900'"
            @click="activeTab = 'related'"
          >
            คอนเทนต์ที่เกี่ยวข้อง
          </button>
        </div>
      </div>
    </section>

    <!-- MAIN DYNAMIC TAB CONTENT AREA -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">

      <!-- TAB 1: รายละเอียด (DETAILS - INCLUDES MAP CARD IN SIDEBAR MATCHING MOCKUP) -->
      <div v-if="activeTab === 'details'" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div class="lg:col-span-7 space-y-8">
          <!-- เรื่องราวและความเป็นมา -->
          <div class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div class="flex items-center gap-2">
              <i class="mdi mdi-book-open-page-variant-outline text-2xl text-[#1c4d3e]"></i>
              <h2 class="text-xl font-bold text-slate-900">เรื่องราวและความเป็นมา</h2>
            </div>
            <p class="text-sm text-slate-600 leading-relaxed">
              รำมอญเป็นศิลปะการแสดงที่มีรากฐานมาจากวัฒนธรรมมอญโบราณ นิยมแสดงในงานบุญ ประเพณีสำคัญ เช่น งานสงกรานต์ งานบวช และงานท่านต่าง ๆ การแต่งกายที่สวยงาม เครื่องประดับเงิน และท่ารำที่อ่อนช้อย เป็นเอกลักษณ์ที่ได้รับการสืบทอดจากรุ่นสู่รุ่น ปัจจุบันรำมอญยังคงเป็นศิลปะที่สร้างความภาคภูมิใจให้กับชุมชน และเป็นมรดกทางวัฒนธรรมที่น่าคุณค่าของอำเภอสังขละบุรี
            </p>
            <div class="rounded-2xl overflow-hidden aspect-16/9 bg-slate-100 border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80"
                alt="การแสดงรำมอญ"
                class="w-full h-full object-cover"
              />
            </div>
          </div>

          <!-- รายละเอียดเพิ่มเติม -->
          <div class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div class="flex items-center gap-2">
              <i class="mdi mdi-text-box-search-outline text-2xl text-[#1c4d3e]"></i>
              <h2 class="text-xl font-bold text-slate-900">รายละเอียดเพิ่มเติม</h2>
            </div>
            <ul class="space-y-2.5 text-sm text-slate-700">
              <li class="flex items-start gap-2">
                <span class="font-bold text-slate-900 shrink-0">• การแต่งกาย :</span>
                <span>ผ้าพื้นเมืองมอญ เครื่องเงิน</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold text-slate-900 shrink-0">• เครื่องดนตรี :</span>
                <span>ปี่พายม์มอญ ฆ้องมอญ ตะโพน</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold text-slate-900 shrink-0">• โอกาสแสดง :</span>
                <span>งานบุญ งานประเพณี งานต้อนรับแขก</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold text-slate-900 shrink-0">• การสืบทอด :</span>
                <span>ถ่ายทอดจากครูผู้สืบศิลป์ในชุมชน</span>
              </li>
            </ul>
          </div>

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
              <h4 class="font-bold text-slate-900 text-sm">วัดวังก์วิเวการาม (วัดวังก์กะ)</h4>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ [content.subDistrictName || 'ต.หนองลู', content.districtName || 'อ.สังขละบุรี', 'จ.กาญจนบุรี 71240'].join(' ') }}
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
              <div v-else class="h-44 bg-emerald-50/60 relative flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80"
                  alt="แผนที่สถานที่"
                  class="w-full h-full object-cover opacity-75"
                />
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#1c4d3e] text-white shadow-xl">
                    <i class="mdi mdi-map-marker text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-1">
              <span class="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <i class="mdi mdi-compass-outline text-slate-400"></i>
                14.6938° N, 98.4516° E
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
                <dd class="font-bold text-slate-800">{{ content.contentCategoryName || 'ศิลปะการแสดง' }}</dd>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <dt class="text-slate-400">หมวดหมู่</dt>
                <dd class="font-bold text-slate-800">{{ content.contentCategoryName || 'ศิลปะการแสดง' }}</dd>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <dt class="text-slate-400">เผยแพร่เมื่อ</dt>
                <dd class="font-bold text-slate-800">{{ formatDate(content.publishedAt || content.createdAt) }}</dd>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <dt class="text-slate-400">อัปเดตล่าสุด</dt>
                <dd class="font-bold text-slate-800">{{ formatDate(content.createdAt) }}</dd>
              </div>
              <div class="flex justify-between py-1">
                <dt class="text-slate-400">ผู้เผยแพร่</dt>
                <dd class="font-bold text-slate-800">{{ content.shopName || 'กลุ่มวัฒนธรรมมอญสังขละบุรี' }}</dd>
              </div>
            </dl>
          </div>

        </div>
      </div>

      <!-- TAB 2: รอบการแสดง (SCHEDULES) -->
      <div v-else-if="activeTab === 'schedules'" class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div class="flex items-center gap-2">
          <i class="mdi mdi-calendar-month-outline text-2xl text-[#1c4d3e]"></i>
          <h2 class="text-xl font-bold text-slate-900">รอบการแสดง ({{ schedules.length || 3 }} รอบ)</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <template v-if="schedules.length">
            <div
              v-for="sch in schedules"
              :key="sch.scheduleId"
              class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5"
            >
              <span class="font-bold text-slate-900 text-base block">{{ sch.title }}</span>
              <p class="text-xs text-slate-600 flex items-center gap-1.5">
                <i class="mdi mdi-clock-outline text-[#1c4d3e]"></i>
                <span>{{ formatDate(sch.startDateTime) }}</span>
              </p>
              <p v-if="sch.address" class="text-xs text-slate-600 flex items-center gap-1.5">
                <i class="mdi mdi-map-marker-outline text-[#1c4d3e]"></i>
                <span>{{ sch.address }}</span>
              </p>
              <span class="inline-block mt-2 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">เปิดจอง</span>
            </div>
          </template>
          <template v-else>
            <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5">
              <span class="font-bold text-slate-900 text-base block">30 ส.ค. 2568</span>
              <p class="text-xs text-slate-600 flex items-center gap-1.5"><i class="mdi mdi-clock-outline text-[#1c4d3e]"></i>10:00 - 11:00 น.</p>
              <p class="text-xs text-slate-600 flex items-center gap-1.5"><i class="mdi mdi-map-marker-outline text-[#1c4d3e]"></i>วัดวังก์วิเวการาม (วัดวังก์กะ)</p>
              <span class="inline-block mt-2 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">เปิดจอง</span>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5">
              <span class="font-bold text-slate-900 text-base block">30 ส.ค. 2568</span>
              <p class="text-xs text-slate-600 flex items-center gap-1.5"><i class="mdi mdi-clock-outline text-[#1c4d3e]"></i>14:00 - 15:00 น.</p>
              <p class="text-xs text-slate-600 flex items-center gap-1.5"><i class="mdi mdi-map-marker-outline text-[#1c4d3e]"></i>วัดวังก์วิเวการาม (วัดวังก์กะ)</p>
              <span class="inline-block mt-2 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">เปิดจอง</span>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5">
              <span class="font-bold text-slate-900 text-base block">31 ส.ค. 2568</span>
              <p class="text-xs text-slate-600 flex items-center gap-1.5"><i class="mdi mdi-clock-outline text-[#1c4d3e]"></i>16:00 - 17:00 น.</p>
              <p class="text-xs text-slate-600 flex items-center gap-1.5"><i class="mdi mdi-map-marker-outline text-[#1c4d3e]"></i>วัดวังก์วิเวการาม (วัดวังก์กะ)</p>
              <span class="inline-block mt-2 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">เปิดจอง</span>
            </div>
          </template>
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
            <h3 class="font-bold text-slate-900 text-lg">วัดวังก์วิเวการาม (วัดวังก์กะ)</h3>
            <p class="text-sm text-slate-600 mt-1">
              {{ [content.subDistrictName || 'ต.หนองลู', content.districtName || 'อ.สังขละบุรี', 'จ.กาญจนบุรี 71240'].join(' ') }}
            </p>
          </div>

          <div class="rounded-2xl overflow-hidden border border-slate-200 min-h-[380px]">
            <ContentLocationMap
              v-if="content.latitude && content.longitude"
              :latitude="content.latitude"
              :longitude="content.longitude"
              :title="content.title"
            />
            <div v-else class="h-[380px] bg-emerald-50/60 relative flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80"
                alt="แผนที่สถานที่"
                class="w-full h-full object-cover opacity-75"
              />
              <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#1c4d3e] text-white shadow-xl">
                  <i class="mdi mdi-map-marker text-2xl"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
            <span class="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
              <i class="mdi mdi-compass-outline text-slate-400"></i>
              พิกัด GPS: 14.6938° N, 98.4516° E
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
          <RouterLink to="/shops" class="text-sm font-semibold text-[#1c4d3e] hover:underline">ดูร้านค้าทั้งหมด</RouterLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div class="rounded-2xl border border-slate-200 p-4 space-y-3 bg-white shadow-xs">
            <div class="aspect-16/10 rounded-xl overflow-hidden bg-slate-100">
              <img src="https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80" alt="ร้านค้า" class="w-full h-full object-cover" />
            </div>
            <div>
              <h4 class="font-bold text-slate-900 text-base">ร้านหัตถกรรมชุมชนมอญ</h4>
              <p class="text-xs text-slate-500 mt-1">จำหน่ายสินค้าหัตถกรรม ผลิตภัณฑ์งานฝีมือของชาวมอญ</p>
              <div class="mt-3 flex items-center justify-between text-xs">
                <span class="text-slate-500"><i class="mdi mdi-map-marker text-[#1c4d3e]"></i> อ.สังขละบุรี</span>
                <span class="font-bold text-amber-500 flex items-center gap-0.5"><i class="mdi mdi-star"></i>4.8 (120 รีวิว)</span>
              </div>
            </div>
            <RouterLink to="/shops" class="block w-full py-2.5 rounded-xl border border-slate-200 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
              เข้าร้านค้า
            </RouterLink>
          </div>
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
          <template v-if="products.length">
            <RouterLink
              v-for="prod in products"
              :key="prod.productId"
              :to="`/products/${prod.productId}`"
              class="group bg-white rounded-2xl overflow-hidden border border-slate-200 p-3 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div class="aspect-4/3 rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                  <img :src="imageUrl(prod.imageUrl) || 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=300&q=80'" class="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <h4 class="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-[#1c4d3e]">{{ prod.productName }}</h4>
              </div>
              <p class="font-black text-[#1c4d3e] text-sm mt-2">{{ formatPrice(prod.price) }}</p>
            </RouterLink>
          </template>
          <template v-else>
            <div class="group bg-white rounded-2xl overflow-hidden border border-slate-200 p-3 shadow-xs hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div class="aspect-4/3 rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                  <img src="https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=300&q=80" class="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <h4 class="font-bold text-slate-900 text-sm">ผ้าทอมอญลายโบราณ</h4>
              </div>
              <p class="font-black text-[#1c4d3e] text-sm mt-2">850 บาท</p>
            </div>
            <div class="group bg-white rounded-2xl overflow-hidden border border-slate-200 p-3 shadow-xs hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div class="aspect-4/3 rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                  <img src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=300&q=80" class="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <h4 class="font-bold text-slate-900 text-sm">กระเป๋าผ้าทอมอญ</h4>
              </div>
              <p class="font-black text-[#1c4d3e] text-sm mt-2">650 บาท</p>
            </div>
            <div class="group bg-white rounded-2xl overflow-hidden border border-slate-200 p-3 shadow-xs hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div class="aspect-4/3 rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                  <img src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80" class="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <h4 class="font-bold text-slate-900 text-sm">เครื่องเงินมอญสร้อยคอ</h4>
              </div>
              <p class="font-black text-[#1c4d3e] text-sm mt-2">1,250 บาท</p>
            </div>
          </template>
        </div>
      </div>

      <!-- TAB 6: คอนเทนต์ที่เกี่ยวข้อง (RELATED CONTENTS ONLY) -->
      <div v-else-if="activeTab === 'related'" class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="mdi mdi-compass-outline text-2xl text-[#1c4d3e]"></i>
            <h2 class="text-xl font-bold text-slate-900">คอนเทนต์ที่เกี่ยวข้อง</h2>
          </div>
          <RouterLink to="/contents" class="text-sm font-semibold text-[#1c4d3e] hover:underline">ดูคอนเทนต์ทั้งหมด</RouterLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <RouterLink
            v-for="rel in relatedContents"
            :key="rel.id"
            to="/contents"
            class="group bg-white rounded-2xl overflow-hidden border border-slate-200 p-3.5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div class="aspect-16/10 rounded-xl overflow-hidden bg-slate-100 mb-3">
                <img :src="rel.image" :alt="rel.title" class="w-full h-full object-cover group-hover:scale-105 transition" />
              </div>
              <h4 class="font-bold text-slate-900 text-sm group-hover:text-[#1c4d3e] transition">{{ rel.title }}</h4>
            </div>
            <div class="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100">
              <span>📍 {{ rel.location }}</span>
              <span>👁️ {{ rel.views }}</span>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- FEEDBACK, SHARE & REPORT BAR (ALWAYS VISIBLE AT BOTTOM) -->
      <section class="rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
        <div class="flex items-center gap-3">
          <span class="font-bold text-slate-800">เนื้อหานี้มีประโยชน์กับคุณหรือไม่?</span>
          <button
            type="button"
            class="px-3 py-1.5 rounded-xl border transition font-bold flex items-center gap-1"
            :class="userVoted === 'useful' ? 'border-[#1c4d3e] bg-emerald-50 text-[#1c4d3e]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'"
            @click="vote('useful')"
          >
            <i class="mdi mdi-thumb-up-outline text-base"></i>
            <span>มีประโยชน์ ({{ usefulCount }})</span>
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-xl border transition font-bold flex items-center gap-1"
            :class="userVoted === 'notUseful' ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-700 hover:bg-slate-50'"
            @click="vote('notUseful')"
          >
            <i class="mdi mdi-thumb-down-outline text-base"></i>
            <span>ไม่เป็นประโยชน์ ({{ notUsefulCount }})</span>
          </button>
        </div>

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

      <!-- NEWSLETTER / SUBSCRIBE BANNER -->
      <section class="rounded-3xl bg-[#0d3831] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 class="text-lg sm:text-xl font-bold">ติดตามเรื่องราวดี ๆ จากกาญจนบุรี</h3>
          <p class="text-xs sm:text-sm text-emerald-100/80 mt-1">รับข่าวสารและกิจกรรมท้องถิ่นก่อนใคร</p>
        </div>

        <form @submit.prevent="handleSubscribe" class="w-full sm:w-auto flex items-center gap-2">
          <input
            v-model="subscribeEmail"
            type="email"
            placeholder="กรอกอีเมลของคุณ"
            class="px-4 py-2.5 rounded-xl bg-white text-slate-800 text-xs sm:text-sm outline-none w-full sm:w-64 placeholder:text-slate-400"
          />
          <button
            type="submit"
            class="shrink-0 px-6 py-2.5 rounded-xl bg-[#14392e] hover:bg-[#0f2d24] text-white font-bold text-xs sm:text-sm transition"
          >
            ติดตาม
          </button>
        </form>
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
