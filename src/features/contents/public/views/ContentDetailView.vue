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
function formatDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'long', timeStyle: 'short' }).format(
    new Date(value),
  )
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
async function load() {
  try {
    content.value = await getPublicContent(id.value)
    const [scheduleItems, productItems, reviews] = await Promise.all([
      getContentSchedules(id.value),
      getContentShopProducts(id.value),
      getContentReviews(id.value),
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
onMounted(load)
</script>

<template>
  <main v-if="content" class="min-h-screen bg-slate-50 pb-16">
    <section
      class="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 pb-20 pt-10 text-white"
    >
      <div class="mx-auto max-w-5xl px-4 sm:px-6">
        <div class="flex items-center justify-between gap-4">
          <RouterLink
            to="/contents"
            class="inline-flex items-center gap-1 text-sm font-semibold text-emerald-100 hover:text-white"
            ><i class="mdi mdi-arrow-left" /> กลับไปสำรวจคอนเทนต์</RouterLink
          ><div class="flex items-center gap-2"><button type="button" class="hidden rounded-xl px-3 py-2 text-sm font-bold text-emerald-100 transition hover:bg-white/10 sm:inline-flex sm:items-center sm:gap-1" @click="openReport({ contentId: content.contentId, label: content.title })"><i class="mdi mdi-flag-outline text-lg" />รายงาน</button><button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-50"
            :class="isFavorite ? 'border-rose-300/60 bg-rose-500/20 text-rose-100' : ''"
            :disabled="changingFavorite"
            @click="toggleFavorite"
          >
            <i class="mdi text-lg" :class="isFavorite ? 'mdi-heart' : 'mdi-heart-outline'" />{{ isFavorite ? 'บันทึกแล้ว' : 'บันทึกรายการโปรด' }}
          </button></div>
        </div>
        <div class="mt-9">
          <div class="flex flex-wrap gap-2">
            <span
              class="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-100"
              >{{ content.contentCategoryName ?? 'คอนเทนต์' }}</span
            ><span
              v-if="content.districtName"
              class="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white"
              ><i class="mdi mdi-map-marker" /> {{ content.districtName }}</span
            >
          </div>
          <h1 class="mt-5 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">
            {{ content.title }}
          </h1>
          <p
            v-if="content.summary"
            class="mt-5 max-w-3xl text-lg leading-relaxed text-emerald-50/85"
          >
            {{ content.summary }}
          </p>
        </div>
      </div>
    </section>
    <div
      class="mx-auto -mt-10 grid max-w-5xl gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px]"
    >
      <div class="space-y-6">
        <section
          v-if="youtubeEmbedUrl(content.youtubeUrl)"
          class="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-xl"
        >
          <div class="flex items-center justify-between bg-slate-900 px-4 py-3">
            <span class="inline-flex items-center gap-2 text-sm font-bold text-white"
              ><i class="mdi mdi-youtube text-xl text-rose-500" />วิดีโอ YouTube</span
            ><a
              :href="content.youtubeUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-700"
              ><i class="mdi mdi-open-in-new" />เปิดใน YouTube</a
            >
          </div>
          <iframe
            :src="youtubeEmbedUrl(content.youtubeUrl)"
            :title="content.title"
            class="aspect-video w-full"
            allowfullscreen
          />
        </section>
        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-slate-900">เกี่ยวกับคอนเทนต์นี้</h2>
          <p class="mt-3 leading-relaxed text-slate-600">
            {{ content.summary || 'ข้อมูลและเรื่องราวน่าสนใจจากจังหวัดกาญจนบุรี' }}
          </p>
          <div v-if="content.tags.length" class="mt-5 flex flex-wrap gap-2">
            <span
              v-for="tag in content.tags"
              :key="tag.tagId"
              class="rounded-xl bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700"
              >#{{ tag.tagName }}</span
            >
          </div>
        </section>
        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div
            class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5"
          >
            <div class="flex items-center gap-3">
              <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><i class="mdi mdi-comment-text-outline text-2xl" /></span>
              <div>
                <h2 class="text-xl font-bold text-slate-900">ความคิดเห็น</h2>
                <p class="text-sm text-slate-500">ความคิดเห็นจากผู้เข้าชมคอนเทนต์</p>
              </div>
            </div>
            <span class="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600">{{ reviewData.totalCount }} ความคิดเห็น</span>
          </div>
          <form
            v-if="auth.isLoggedIn"
            class="mt-5 rounded-2xl bg-slate-50 p-4"
            @submit.prevent="saveReview"
          >
            <p class="font-bold text-slate-800">{{ myReview ? 'แก้ไขความคิดเห็นของคุณ' : 'แสดงความคิดเห็น' }}</p>
            <textarea
              v-model="reviewForm.comment"
              rows="3"
              maxlength="2000"
              class="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              placeholder="แบ่งปันประสบการณ์หรือข้อมูลเพิ่มเติม..."
            />
            <div class="mt-3 flex justify-end gap-3">
              <button
                v-if="myReview"
                type="button"
                class="text-sm font-bold text-rose-600 hover:text-rose-700"
                @click="removeReview"
              >
                ลบรีวิว</button
              ><button
                type="submit"
                class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                :disabled="reviewSaving"
              >
                {{ reviewSaving ? 'กำลังบันทึก...' : myReview ? 'บันทึกการแก้ไข' : 'ส่งรีวิว' }}
              </button>
            </div>
          </form>
          <div
            v-else
            class="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-4"
          >
            <p class="text-sm text-emerald-900">เข้าสู่ระบบเพื่อแสดงความคิดเห็น</p>
            <RouterLink
              to="/login"
              class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
              >เข้าสู่ระบบ</RouterLink
            >
          </div>
          <div v-if="reviewData.reviews.length" class="mt-5 space-y-4">
            <article
              v-for="review in reviewData.reviews"
              :key="review.reviewId"
              class="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="font-bold text-slate-800">{{ review.userName }}</p>
                <span class="text-xs text-slate-400">{{ formatDate(review.createdAt) }}</span>
              </div>
              <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {{ review.comment }}
              </p>
              <button type="button" class="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 transition hover:text-rose-600" @click="openReport({ reviewId: review.reviewId, label: `รีวิวของ ${review.userName}` })"><i class="mdi mdi-flag-outline" />รายงานรีวิว</button>
            </article>
          </div>
          <div v-else class="py-10 text-center">
            <i class="mdi mdi-comment-text-outline text-4xl text-slate-300" />
            <p class="mt-2 text-sm text-slate-500">ยังไม่มีรีวิว เป็นคนแรกที่แบ่งปันความคิดเห็น</p>
          </div>
        </section>
        <section
          v-if="schedules.length"
          class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div class="flex items-center gap-2">
            <i class="mdi mdi-calendar-month-outline text-2xl text-emerald-600" />
            <h2 class="text-xl font-bold text-slate-900">กำหนดการกิจกรรม</h2>
          </div>
          <div class="mt-5 space-y-4">
            <article
              v-for="schedule in schedules"
              :key="schedule.scheduleId"
              class="rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <p class="font-bold text-slate-900">{{ schedule.title }}</p>
              <p class="mt-2 flex items-start gap-2 text-sm text-slate-600">
                <i class="mdi mdi-calendar-clock text-emerald-600" />{{
                  formatDate(schedule.startDateTime)
                }}<template v-if="schedule.endDateTime">
                  – {{ formatDate(schedule.endDateTime) }}</template
                >
              </p>
              <p v-if="schedule.address" class="mt-2 flex items-start gap-2 text-sm text-slate-600">
                <i class="mdi mdi-map-marker-outline text-emerald-600" />{{ schedule.address }}
              </p>
              <p v-if="schedule.description" class="mt-2 text-sm leading-relaxed text-slate-600">
                {{ schedule.description }}
              </p>
            </article>
          </div>
        </section>
        <section
          v-if="products.length"
          class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <i class="mdi mdi-storefront-outline text-2xl text-emerald-600" />
              <div>
                <h2 class="text-xl font-bold text-slate-900">สินค้าจากร้านนี้</h2>
                <p v-if="content.shopName" class="text-sm text-slate-500">{{ content.shopName }}</p>
              </div>
            </div>
            <RouterLink
              v-if="content.shopId"
              :to="`/shops/${content.shopId}`"
              class="text-sm font-bold text-emerald-700 hover:text-emerald-800"
            >
              ดูสินค้าทั้งหมด <i class="mdi mdi-arrow-right" />
            </RouterLink>
          </div>
          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <RouterLink
              v-for="product in products"
              :key="product.productId"
              :to="`/products/${product.productId}`"
              class="group overflow-hidden rounded-2xl border border-slate-200 transition hover:border-emerald-300 hover:shadow-md"
            >
              <div class="h-36 bg-slate-100">
                <img
                  v-if="imageUrl(product.imageUrl)"
                  :src="imageUrl(product.imageUrl)"
                  :alt="product.productName"
                  class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div
                  v-else
                  class="flex h-full items-center justify-center bg-emerald-50 text-emerald-500"
                >
                  <i class="mdi mdi-package-variant-closed text-4xl" />
                </div>
              </div>
              <div class="p-4">
                <h3 class="line-clamp-1 font-bold text-slate-900">{{ product.productName }}</h3>
                <p v-if="product.description" class="mt-1 line-clamp-1 text-xs text-slate-500">
                  {{ product.description }}
                </p>
                <div class="mt-3 flex items-center justify-between">
                  <span class="font-black text-emerald-700">{{ formatPrice(product.price) }}</span>
                  <span class="text-xs font-semibold text-slate-500">
                    {{ product.quantity > 0 ? `เหลือ ${product.quantity} ชิ้น` : 'สินค้าหมด' }}
                  </span>
                </div>
              </div>
            </RouterLink>
          </div>
        </section>
        <section
          v-if="
            content.latitude !== null &&
            content.latitude !== undefined &&
            content.longitude !== null &&
            content.longitude !== undefined
          "
          class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div class="p-6 pb-4">
            <h2 class="text-xl font-bold text-slate-900">ตำแหน่งบนแผนที่</h2>
            <p class="mt-1 text-sm text-slate-500">
              {{ content.subDistrictName ? `${content.subDistrictName}, ` : ''
              }}{{ content.districtName ?? 'กาญจนบุรี' }}
            </p>
          </div>
          <ContentLocationMap
            :latitude="content.latitude"
            :longitude="content.longitude"
            :title="content.title"
          />
        </section>
      </div>
      <aside
        class="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24"
      >
        <h2 class="font-bold text-slate-900">ข้อมูลสถานที่</h2>
        <dl class="mt-4 space-y-4 text-sm">
          <div>
            <dt class="text-slate-400">หมวดหมู่</dt>
            <dd class="mt-1 font-semibold text-slate-800">
              {{ content.contentCategoryName ?? '-' }}
            </dd>
          </div>
          <div v-if="content.districtName">
            <dt class="text-slate-400">พื้นที่</dt>
            <dd class="mt-1 font-semibold text-slate-800">
              {{ [content.subDistrictName, content.districtName].filter(Boolean).join(', ') }}
            </dd>
          </div>
          <div v-if="content.shopName">
            <dt class="text-slate-400">ร้านค้าที่เกี่ยวข้อง</dt>
            <dd class="mt-1 font-semibold text-slate-800">{{ content.shopName }}</dd>
          </div>
          <div>
            <dt class="text-slate-400">เผยแพร่เมื่อ</dt>
            <dd class="mt-1 font-semibold text-slate-800">
              {{ formatDate(content.publishedAt || content.createdAt) }}
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  </main>
  <div v-else-if="loading" class="mx-auto max-w-5xl px-6 py-16">
    <div class="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
  </div>
  <Teleport to="body">
    <div v-if="reportTarget" class="fixed inset-0 z-[100] flex items-end bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center sm:justify-center" @click.self="reportTarget = null">
      <form class="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" @submit.prevent="submitReport">
        <div class="flex items-start justify-between gap-4"><div><p class="text-sm font-bold text-rose-600"><i class="mdi mdi-flag-outline mr-1" />รายงานรายการ</p><h2 class="mt-1 text-xl font-black text-slate-900">{{ reportTarget.label }}</h2></div><button type="button" class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" @click="reportTarget = null"><i class="mdi mdi-close text-2xl" /></button></div>
        <label class="mt-6 block text-sm font-bold text-slate-700">เหตุผล</label><select v-model="reportForm.reason" class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"><option>ข้อมูลไม่ถูกต้อง</option><option>เนื้อหาไม่เหมาะสม</option><option>สแปมหรือโฆษณา</option><option>ละเมิดลิขสิทธิ์</option><option>อื่น ๆ</option></select>
        <label class="mt-4 block text-sm font-bold text-slate-700">รายละเอียดเพิ่มเติม (ถ้ามี)</label><textarea v-model="reportForm.description" rows="3" maxlength="2000" class="mt-2 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10" placeholder="อธิบายสิ่งที่พบเพื่อช่วยให้ทีมงานตรวจสอบ" />
        <div class="mt-6 flex justify-end gap-3"><button type="button" class="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100" @click="reportTarget = null">ยกเลิก</button><button type="submit" class="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50" :disabled="reporting">{{ reporting ? 'กำลังส่ง...' : 'ส่งรายงาน' }}</button></div>
      </form>
    </div>
  </Teleport>
</template>
