<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  getShop,
  getShopReviews,
  getShops,
  getProductCategories,
  getShopProducts,
  type ShopReviews,
  type Shop,
  type Product,
  type ProductCategory,
} from '@/features/shops/api'
import { getPublicContents, type PublicContent } from '@/features/contents/api'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const route = useRoute()
const router = useRouter()
const swal = useSwal()

const shop = ref<Shop | null>(null)
const products = ref<Product[]>([])
const categories = ref<ProductCategory[]>([])
const shopContents = ref<PublicContent[]>([])
const nearbyShops = ref<Shop[]>([])
const reviewData = ref<ShopReviews>({ totalCount: 0, averageRating: 0, reviews: [] })
const loading = ref(true)

const selectedCategory = ref<string | null>(null)
const productSearchInput = ref('')
const productSearch = ref('')
const isFollowing = ref(false)

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
watch(productSearchInput, (value) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    productSearch.value = value
  }, 250)
})

function clearSearch() {
  productSearchInput.value = ''
  productSearch.value = ''
}

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function imageUrl(url?: string) {
  if (!url) return undefined
  return url.startsWith('/') ? `${apiOrigin}${url}` : url
}

const businessHours = computed(() => {
  if (!shop.value?.openingTime || !shop.value?.closingTime)
    return 'เปิดบริการทุกวัน 08:00 - 18:00 น.'
  return `เปิดบริการทุกวัน ${shop.value.openingTime} - ${shop.value.closingTime} น.`
})

const isOpenNow = computed(() => {
  const open = shop.value?.openingTime
  const close = shop.value?.closingTime
  if (!open || !close) return true
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return (h || 0) * 60 + (m || 0)
  }
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const openMinutes = toMinutes(open)
  const closeMinutes = toMinutes(close)
  if (closeMinutes <= openMinutes) {
    return nowMinutes >= openMinutes || nowMinutes <= closeMinutes
  }
  return nowMinutes >= openMinutes && nowMinutes <= closeMinutes
})

const hasShopLocation = computed(() => shop.value?.latitude != null && shop.value.longitude != null)

const shopArea = computed(() => {
  const subDistrict = shop.value?.subDistrictName
  const district = shop.value?.districtName
  return [subDistrict ? `ต.${subDistrict}` : null, district ? `อ.${district}` : null, 'จ.กาญจนบุรี']
    .filter(Boolean)
    .join(' ')
})

const shopAddress = computed(() =>
  [shop.value?.address, shopArea.value].filter(Boolean).join(' · '),
)

function formatShopArea(target: Shop) {
  return (
    [
      target.subDistrictName ? `ต.${target.subDistrictName}` : null,
      target.districtName ? `อ.${target.districtName}` : null,
    ]
      .filter(Boolean)
      .join(' ') || 'กาญจนบุรี'
  )
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function reviewerInitial(name: string) {
  return name.trim().charAt(0) || 'ผ'
}

async function copyShopLink() {
  const shareData = {
    title: shop.value?.shopName ?? 'ร้านค้า',
    text: shop.value?.description ?? 'ดูร้านค้านี้',
    url: window.location.href,
  }
  if (navigator.share) {
    try {
      await navigator.share(shareData)
      return
    } catch {
      // User cancelled native share sheet
    }
  }
  await navigator.clipboard.writeText(window.location.href)
  void swal.success('คัดลอกลิงก์ร้านค้าแล้ว', 'นำลิงก์ไปแชร์ให้เพื่อน ๆ ได้เลย')
}

function toggleFollow() {
  isFollowing.value = !isFollowing.value
  if (isFollowing.value) {
    void swal.success('ติดตามร้านค้าแล้ว', 'คุณจะได้รับข่าวสารและสินค้าใหม่จากร้านนี้ก่อนใคร')
  }
}

const productCategories = computed(() => [
  { id: null, name: 'ทั้งหมด', count: products.value.length },
  ...categories.value
    .filter((category) =>
      products.value.some((product) => product.productCategoryId === category.productCategoryId),
    )
    .map((category) => ({
      id: category.productCategoryId,
      name: category.categoryName,
      count: products.value.filter((p) => p.productCategoryId === category.productCategoryId)
        .length,
    })),
])

const filteredProducts = computed(() => {
  let list = products.value
  if (selectedCategory.value) {
    list = list.filter((product) => product.productCategoryId === selectedCategory.value)
  }
  if (productSearch.value.trim()) {
    const q = productSearch.value.toLowerCase().trim()
    list = list.filter((p) => p.productName.toLowerCase().includes(q))
  }
  return list
})

function productCategoryName(productCategoryId: string) {
  return (
    categories.value.find((category) => category.productCategoryId === productCategoryId)
      ?.categoryName ?? 'สินค้า'
  )
}

function getProductImage(product: Product, index: number) {
  if (product.imageUrl) return imageUrl(product.imageUrl)
  const defaults = [
    'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
  ]
  return defaults[index % defaults.length]
}

function youtubeThumbnail(url?: string) {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    const id = parsed.hostname.includes('youtu.be')
      ? parsed.pathname.slice(1)
      : (parsed.searchParams.get('v') ?? parsed.pathname.split('/').filter(Boolean).pop())
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''
  } catch {
    return ''
  }
}

async function getNearbyShops(currentShop: Shop) {
  const withoutCurrentShop = (items: Shop[]) =>
    items.filter((item) => item.shopId !== currentShop.shopId)
  if (currentShop.subDistrictId) {
    const res = await getShops({ subDistrictId: currentShop.subDistrictId })
    const sameSubDistrict = withoutCurrentShop(res.items || [])
    if (sameSubDistrict.length) return sameSubDistrict.slice(0, 4)
  }
  if (currentShop.districtId) {
    const res = await getShops({ districtId: currentShop.districtId })
    const sameDistrict = withoutCurrentShop(res.items || [])
    return sameDistrict.slice(0, 4)
  }
  return []
}

function getNearbyShopImage(nearbyShop: Shop) {
  return (
    imageUrl(nearbyShop.coverImageUrl) ||
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80'
  )
}

const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: L.Map | null = null

function initMap() {
  if (!mapContainer.value || mapInstance || !hasShopLocation.value || !shop.value) return

  const lat = shop.value.latitude!
  const lng = shop.value.longitude!

  const KANCHANABURI_BOUNDS: L.LatLngBoundsExpression = [
    [13.70, 98.00],
    [15.85, 100.00],
  ]

  mapInstance = L.map(mapContainer.value, {
    scrollWheelZoom: false,
    zoomControl: false,
    minZoom: 9,
    maxZoom: 18,
    maxBounds: KANCHANABURI_BOUNDS,
    maxBoundsViscosity: 0.4,
  }).setView([lat, lng], 14)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap',
    bounds: KANCHANABURI_BOUNDS,
    keepBuffer: 6,
  }).addTo(mapInstance)

  const icon = L.divIcon({
    className: 'custom-shop-detail-marker',
    html: `<div class="flex items-center justify-center h-10 w-10 rounded-2xl bg-[#D96C2C] text-white font-bold shadow-2xl border-2 border-white ring-4 ring-[#F2A65A]/40"><i class="mdi mdi-storefront text-xl"></i></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })

  L.marker([lat, lng], { icon })
    .addTo(mapInstance)
    .bindPopup(
      `<div class="p-1 font-bold text-[#332820]">${shop.value.shopName}</div><div class="text-xs text-[#786B62]">${shopArea.value}</div>`,
    )
    .openPopup()
}

function openDirections() {
  if (shop.value?.latitude != null && shop.value.longitude != null) {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${shop.value.latitude},${shop.value.longitude}`,
      '_blank',
    )
    return
  }
  const query = encodeURIComponent(`${shop.value?.shopName || ''} ${shopArea.value}`)
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
}

onMounted(async () => {
  try {
    shop.value = await getShop(String(route.params.id))
    if (shop.value) {
      const currentShop = shop.value
      const [shopProducts, productCategories, contents, nearby, reviews] = await Promise.all([
        getShopProducts(shop.value.shopId),
        getProductCategories(),
        getPublicContents({ shopId: shop.value.shopId, page: 1, pageSize: 3 }),
        getNearbyShops(currentShop),
        getShopReviews(currentShop.shopId).catch(() => ({
          totalCount: 0,
          averageRating: 0,
          reviews: [],
        })),
      ])
      products.value = shopProducts
      categories.value = productCategories

      shopContents.value = contents.items || []
      nearbyShops.value = nearby
      reviewData.value = reviews
    }
  } catch (error) {
    await swal.error(
      'ไม่พบร้านค้า',
      getApiErrorMessage(error, 'ร้านค้าอาจถูกปิดหรือไม่มีอยู่จริงในระบบ'),
    )
    await router.replace('/shops')
  } finally {
    loading.value = false
  }

  setTimeout(() => {
    initMap()
  }, 350)
})

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
})
</script>

<template>
  <!-- LOADING SKELETON STATE -->
  <div v-if="loading" class="min-h-screen bg-[#F7F0E6] animate-pulse">
    <div class="bg-[#D96C2C]/30 h-[340px] sm:h-[380px] w-full"></div>
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
      <div class="rounded-3xl bg-[#FFF9F2] h-28 shadow-xl border-2 border-[#E8D9C9]"></div>
    </div>
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 space-y-6">
      <div class="rounded-3xl bg-[#FFF9F2] h-72 border-2 border-[#E8D9C9]"></div>
      <div class="rounded-3xl bg-[#FFF9F2] h-56 border-2 border-[#E8D9C9]"></div>
    </div>
  </div>

  <div v-else-if="shop" class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-24 sm:pb-20">
    <!-- BREADCRUMB BAR -->
    <div class="bg-[#FFF9F2] border-b-2 border-[#E8D9C9] py-3 shadow-2xs">
      <div
        class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-[#786B62] flex items-center justify-between gap-3"
      >
        <div class="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <RouterLink to="/" class="hover:text-[#D96C2C] transition shrink-0">หน้าแรก</RouterLink>
          <i class="mdi mdi-chevron-right text-[#E8D9C9] shrink-0"></i>
          <RouterLink to="/shops" class="hover:text-[#D96C2C] transition shrink-0"
            >ร้านค้าทั้งหมด</RouterLink
          >
          <i class="mdi mdi-chevron-right text-[#E8D9C9] shrink-0"></i>
          <span class="text-[#332820] font-bold line-clamp-1">{{ shop.shopName }}</span>
        </div>

        <button
          type="button"
          class="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#786B62] hover:text-[#D96C2C] transition shrink-0 cursor-pointer"
          aria-label="แชร์ร้านค้านี้"
          @click="copyShopLink"
        >
          <i class="mdi mdi-share-variant-outline text-[#D96C2C]"></i>
          <span>แชร์ร้านค้านี้</span>
        </button>
      </div>
    </div>

    <!-- HERO HEADER SECTION (ORANGE & DARK BROWN GLASSMORPHISM) -->
    <section
      class="relative bg-[#171412] text-white min-h-[340px] sm:min-h-[380px] flex items-end overflow-hidden"
    >
      <!-- Background Cover Image with Ambient Overlay -->
      <img
        :src="
          imageUrl(shop.backgroundImageUrl || shop.coverImageUrl) ||
          'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=2000&q=80'
        "
        :alt="`ภาพปกร้าน ${shop.shopName}`"
        loading="lazy"
        class="absolute inset-0 w-full h-full object-cover opacity-50 scale-105 transition duration-700 hover:scale-100"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-[#171412] via-[#171412]/85 to-black/50"
      ></div>

      <!-- Floating Glow Orbs -->
      <div
        class="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-[#D96C2C]/20 blur-3xl"
      ></div>
      <div
        class="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-[#F2A65A]/20 blur-3xl"
      ></div>

      <!-- Hero Profile Header Container -->
      <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 pt-16 w-full">
        <div class="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <!-- Profile Avatar & Details -->
          <div class="flex flex-col sm:flex-row items-start sm:items-end gap-5 sm:gap-6">
            <!-- Avatar Logo Container -->
            <div
              class="relative flex h-28 w-28 sm:h-32 sm:w-32 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white/90 bg-[#171412] shadow-2xl ring-4 ring-[#D96C2C]/40"
            >
              <img
                :src="
                  imageUrl(shop.coverImageUrl) ||
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
                "
                :alt="`โลโก้ร้าน ${shop.shopName}`"
                class="w-full h-full object-cover"
              />
              <span
                class="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#D96C2C] text-white shadow-lg text-xs font-black"
                title="ร้านค้าได้รับการยืนยัน"
              >
                <i class="mdi mdi-check-bold"></i>
              </span>
            </div>

            <!-- Meta Details -->
            <div class="space-y-2.5">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D96C2C]/30 text-[#F2A65A] text-xs font-bold border border-[#F2A65A]/40 backdrop-blur-md"
                >
                  <i class="mdi mdi-tag-outline text-[#F2A65A]"></i>
                  {{ shop.categoryName || 'ร้านค้าชุมชน' }}
                </span>
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md"
                  :class="
                    isOpenNow
                      ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/30'
                      : 'bg-slate-500/20 text-slate-300'
                  "
                >
                  <span
                    class="h-2 w-2 rounded-full"
                    :class="isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'"
                  ></span>
                  {{ isOpenNow ? 'เปิดให้บริการอยู่' : 'ปิดให้บริการแล้ว' }}
                </span>
              </div>

              <h1
                class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md"
              >
                {{ shop.shopName }}
              </h1>

              <!-- Location & Rating -->
              <div
                class="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#F7F0E6]/90 font-medium"
              >
                <span class="flex items-center gap-1.5">
                  <i class="mdi mdi-map-marker text-[#F2A65A] text-base"></i>
                  {{ shopArea }}
                </span>

                <span class="text-[#F2A65A]/50">•</span>

                <span
                  v-if="reviewData.totalCount"
                  class="flex items-center gap-1.5 font-bold text-[#F2A65A] bg-[#D96C2C]/20 px-3 py-0.5 rounded-full border border-[#F2A65A]/40"
                >
                  <i class="mdi mdi-star"></i>
                  {{ reviewData.averageRating.toFixed(1) }}
                  <span class="text-[#F7F0E6] font-normal"
                    >({{ reviewData.totalCount }} รีวิว)</span
                  >
                </span>
                <span v-else class="text-[#F7F0E6]/80">ยังไม่มีรีวิว</span>
              </div>

              <!-- Shop Description Snippet -->
              <p
                class="text-xs sm:text-sm text-[#F7F0E6]/80 max-w-2xl line-clamp-2 leading-relaxed font-normal"
              >
                {{
                  shop.description ||
                  'ยินดีต้อนรับสู่ร้านค้าท้องถิ่นคุณภาพ พร้อมให้บริการสินค้าหลากหลายในจังหวัดกาญจนบุรี'
                }}
              </p>
            </div>
          </div>

          <!-- Action Buttons Bar (desktop) -->
          <div
            class="hidden sm:flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto pt-2 sm:pt-0"
          >
            <button
              type="button"
              class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all duration-200 active:scale-95 cursor-pointer border-2 border-[#D96C2C]"
              :class="
                isFollowing
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-[#D96C2C] hover:bg-[#BF5720] text-white shadow-[#D96C2C]/30'
              "
              :aria-pressed="isFollowing"
              @click="toggleFollow"
            >
              <i class="mdi text-base" :class="isFollowing ? 'mdi-check' : 'mdi-heart-outline'"></i>
              <span class="!text-white">{{ isFollowing ? 'ติดตามแล้ว' : 'ติดตามร้านค้า' }}</span>
            </button>

            <a
              v-if="shop.phone"
              :href="`tel:${shop.phone}`"
              class="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#FFF9F2] hover:bg-white text-[#332820] font-extrabold text-xs sm:text-sm shadow-lg transition active:scale-95 border-2 border-[#E8D9C9]"
            >
              <i class="mdi mdi-phone-outline text-[#D96C2C] text-base"></i>
              <span>โทรติดต่อ</span>
            </a>

            <button
              type="button"
              class="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition active:scale-95 cursor-pointer"
              aria-label="แชร์ร้านค้านี้"
              @click="copyShopLink"
            >
              <i class="mdi mdi-share-variant-outline text-base"></i>
              <span class="sm:hidden">แชร์</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- SHOP QUICK INFO BAR (FLOATING 4 COLUMNS CARD) -->
    <section class="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
      <div
        class="rounded-3xl bg-[#FFF9F2] p-5 sm:p-6 shadow-xl border-2 border-[#E8D9C9]"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <!-- Contact Phone -->
          <div class="flex items-center gap-3.5 p-2">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D96C2C]/15 text-[#D96C2C] shadow-2xs border border-[#D96C2C]/30"
            >
              <i class="mdi mdi-phone-outline text-xl"></i>
            </div>
            <div class="min-w-0">
              <span class="text-[11px] font-bold text-[#786B62] block uppercase tracking-wider"
                >เบอร์โทรศัพท์</span
              >
              <a
                v-if="shop.phone"
                :href="`tel:${shop.phone}`"
                class="font-black text-[#D96C2C] text-sm hover:text-[#BF5720] transition"
              >
                {{ shop.phone }}
              </a>
              <span v-else class="font-medium text-[#786B62] text-sm">ยังไม่ระบุ</span>
            </div>
          </div>

          <!-- Contact Email -->
          <div class="flex items-center gap-3.5 p-2">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D96C2C]/10 text-[#D96C2C] shadow-2xs border border-[#D96C2C]/20"
            >
              <i class="mdi mdi-email-outline text-xl"></i>
            </div>
            <div class="min-w-0">
              <span class="text-[11px] font-bold text-[#786B62] block uppercase tracking-wider"
                >อีเมลร้านค้า</span
              >
              <span class="font-black text-[#332820] text-sm line-clamp-1 block">{{
                shop.email || 'ยังไม่ระบุ'
              }}</span>
            </div>
          </div>

          <!-- Business Hours -->
          <div class="flex items-center gap-3.5 p-2">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D96C2C]/15 text-[#D96C2C] shadow-2xs border border-[#D96C2C]/30"
            >
              <i class="mdi mdi-clock-outline text-xl"></i>
            </div>
            <div class="min-w-0">
              <span class="text-[11px] font-bold text-[#786B62] block uppercase tracking-wider"
                >เวลาทำการ</span
              >
              <span class="font-extrabold text-[#332820] text-xs sm:text-sm block leading-snug">{{
                businessHours
              }}</span>
            </div>
          </div>

          <!-- Shop Location Address -->
          <div class="flex items-center gap-3.5 p-2">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D96C2C]/10 text-[#D96C2C] shadow-2xs border border-[#D96C2C]/20"
            >
              <i class="mdi mdi-map-marker-outline text-xl"></i>
            </div>
            <div class="min-w-0">
              <span class="text-[11px] font-bold text-[#786B62] block uppercase tracking-wider"
                >ที่อยู่และพิกัด</span
              >
              <span class="font-black text-[#332820] text-xs sm:text-sm line-clamp-1 block">{{
                shopAddress
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MAIN BODY CONTAINER (2 COLUMNS) -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-12 space-y-12">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- LEFT COLUMN: PRODUCTS, CONTENT & NEARBY SHOPS -->
        <div class="lg:col-span-8 space-y-10">
          <!-- SECTION 1: สินค้าในร้าน (SHOP PRODUCTS GRID) -->
          <section
            class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 sm:p-7 shadow-xs space-y-6"
          >
            <!-- Header Toolbar -->
            <div
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#E8D9C9] pb-5"
            >
              <div class="flex items-center justify-between w-full sm:w-auto">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D96C2C] text-white shadow-md font-bold"
                  >
                    <i class="mdi mdi-shopping-outline text-xl"></i>
                  </div>
                  <div>
                    <h2 class="text-xl font-black text-[#332820]">สินค้าในร้าน</h2>
                    <p class="text-xs text-[#786B62]">
                      แสดง {{ Math.min(filteredProducts.length, 6) }} จาก {{ products.length }} รายการ
                    </p>
                  </div>
                </div>

                <RouterLink
                  v-if="shop"
                  :to="`/shops/${shop.shopId}/products`"
                  class="sm:hidden text-xs font-black text-[#D96C2C] hover:underline flex items-center gap-0.5"
                >
                  <span>ดูทั้งหมด ></span>
                </RouterLink>
              </div>

              <!-- Right Actions: Search Box & View All Link -->
              <div class="flex items-center gap-3">
                <div class="relative min-w-[220px] flex-1 sm:flex-none">
                  <input
                    v-model="productSearchInput"
                    type="text"
                    placeholder="ค้นหาสินค้าในร้าน..."
                    aria-label="ค้นหาสินค้าในร้าน"
                    class="w-full rounded-2xl border-2 border-[#E8D9C9] bg-white pl-9 pr-9 py-2 text-xs text-[#332820] outline-none focus:border-[#D96C2C] transition font-medium"
                  />
                  <i
                    class="mdi mdi-magnify absolute left-3 top-1/2 -translate-y-1/2 text-[#D96C2C] text-base"
                  ></i>
                  <button
                    v-if="productSearchInput"
                    type="button"
                    aria-label="ล้างคำค้นหา"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#786B62] hover:text-[#332820]"
                    @click="clearSearch"
                  >
                    <i class="mdi mdi-close-circle text-base"></i>
                  </button>
                </div>

                <RouterLink
                  v-if="shop"
                  :to="`/shops/${shop.shopId}/products`"
                  class="hidden sm:inline-flex items-center gap-1 text-xs font-black text-[#D96C2C] hover:underline shrink-0"
                >
                  <span>ดูสินค้าทั้งหมด ({{ products.length }})</span>
                  <i class="mdi mdi-chevron-right text-base"></i>
                </RouterLink>
              </div>
            </div>

            <!-- Category Filter Pills Bar -->
            <div
              v-if="productCategories.length > 1"
              class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
            >
              <button
                v-for="cat in productCategories"
                :key="cat.name"
                type="button"
                class="px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer border-2"
                :class="
                  selectedCategory === cat.id
                    ? 'border-[#D96C2C] bg-[#D96C2C] text-white shadow-md'
                    : 'border-[#E8D9C9] bg-white text-[#332820] hover:border-[#D96C2C]'
                "
                @click="selectedCategory = cat.id"
              >
                <span>{{ cat.name }}</span>
                <span
                  class="text-[10px] rounded-full px-1.5 py-0.5"
                  :class="selectedCategory === cat.id ? 'bg-white text-[#D96C2C] font-bold' : 'bg-[#F7F0E6] text-[#786B62]'"
                  >{{ cat.count }}</span
                >
              </button>
            </div>

            <!-- Products Grid Cards (Showing 6 Preview Items) -->
            <div v-if="filteredProducts.length" class="grid grid-cols-2 sm:grid-cols-3 gap-5">
              <RouterLink
                v-for="(prod, idx) in filteredProducts.slice(0, 6)"
                :key="prod.productId"
                :to="`/products/${prod.productId}`"
                class="group bg-white rounded-2xl overflow-hidden border-2 border-[#E8D9C9] p-3 shadow-2xs hover:shadow-xl hover:border-[#D96C2C] hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div class="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-900 mb-3">
                    <img
                      :src="getProductImage(prod, idx)"
                      :alt="prod.productName"
                      loading="lazy"
                      class="w-full h-full object-cover group-hover:scale-108 transition duration-500"
                    />
                    <span
                      class="absolute top-2 left-2 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#D96C2C] text-white shadow-xs"
                    >
                      พร้อมส่ง
                    </span>
                  </div>

                  <h4
                    class="font-black text-[#332820] text-xs sm:text-sm line-clamp-1 group-hover:text-[#D96C2C] transition"
                  >
                    {{ prod.productName }}
                  </h4>
                  <p class="text-[11px] text-[#786B62] mt-0.5 line-clamp-1 font-medium">
                    {{ productCategoryName(prod.productCategoryId) }}
                  </p>
                </div>

                <div class="flex items-center justify-between mt-3 pt-2 border-t border-[#E8D9C9]">
                  <span class="font-black text-[#D96C2C] text-sm sm:text-base">{{
                    formatPrice(prod.price)
                  }}</span>
                  <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D96C2C] text-white hover:bg-[#BF5720] transition shadow-2xs cursor-pointer border border-[#D96C2C]"
                    :aria-label="`ดูรายละเอียดสินค้า ${prod.productName}`"
                  >
                    <i class="mdi mdi-cart-plus text-base text-white"></i>
                  </button>
                </div>
              </RouterLink>
            </div>

            <!-- View All Products Prominent Button -->
            <div v-if="shop && products.length > 0" class="pt-2">
              <RouterLink
                :to="`/shops/${shop.shopId}/products`"
                class="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#D96C2C]/10 hover:bg-[#D96C2C] text-[#D96C2C] hover:text-white border-2 border-[#D96C2C] font-black text-xs sm:text-sm shadow-md transition duration-200 cursor-pointer group"
              >
                <i class="mdi mdi-grid text-lg group-hover:text-white"></i>
                <span class="group-hover:text-white">ดูสินค้าทั้งหมดของร้านนี้ ({{ products.length }} รายการ)</span>
                <i class="mdi mdi-arrow-right text-base group-hover:text-white"></i>
              </RouterLink>
            </div>

            <!-- Empty Products State -->
            <div
              v-else
              class="rounded-3xl border-2 border-dashed border-[#E8D9C9] bg-[#F7F0E6]/60 py-12 text-center text-xs text-[#786B62]"
            >
              <i class="mdi mdi-package-variant-remove text-4xl text-[#D96C2C] block mb-2"></i>
              <span class="font-black text-[#332820] text-sm">ไม่พบสินค้าในรายการนี้</span>
              <p class="mt-1 text-[#786B62]">
                ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อดูสินค้าทั้งหมด
              </p>
              <button
                v-if="productSearchInput || selectedCategory"
                type="button"
                class="mt-3 text-[#D96C2C] font-bold text-xs hover:underline cursor-pointer"
                @click="
                  () => {
                    clearSearch()
                    selectedCategory = null
                  }
                "
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          </section>

          <!-- SECTION 2: คอนเทนต์จากร้าน (CONTENT FROM SHOP) -->
          <section
            class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 sm:p-7 shadow-xs space-y-6"
          >
            <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D96C2C] text-white shadow-md font-bold"
                >
                  <i class="mdi mdi-play-box-outline text-xl"></i>
                </div>
                <div>
                  <h2 class="text-xl font-black text-[#332820]">เรื่องราวและคอนเทนต์</h2>
                  <p class="text-xs text-[#786B62]">เรื่องราววิถีชีวิตและภูมิปัญญาจากร้านค้า</p>
                </div>
              </div>

              <RouterLink v-if="shop" :to="`/shops/${shop.shopId}/contents`" class="text-xs font-black text-[#D96C2C] hover:underline flex items-center gap-1">
                <span>ดูเรื่องราวทั้งหมด</span>
                <i class="mdi mdi-chevron-right text-base"></i>
              </RouterLink>
            </div>

            <div v-if="shopContents.length" class="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <RouterLink
                v-for="cnt in shopContents"
                :key="cnt.contentId"
                :to="`/contents/${cnt.contentId}`"
                class="group bg-white rounded-2xl overflow-hidden border-2 border-[#E8D9C9] p-3 shadow-2xs hover:shadow-md hover:border-[#D96C2C] transition flex flex-col justify-between"
              >
                <div>
                  <div class="relative aspect-16/10 rounded-xl overflow-hidden bg-[#171412] mb-3">
                    <img
                      v-if="youtubeThumbnail(cnt.youtubeUrl)"
                      :src="youtubeThumbnail(cnt.youtubeUrl)"
                      :alt="cnt.title"
                      loading="lazy"
                      class="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div
                      v-else
                      class="flex h-full items-center justify-center bg-[#D96C2C] text-white"
                    >
                      <i class="mdi mdi-play-circle-outline text-4xl text-white"></i>
                    </div>
                    <span
                      class="absolute top-2 left-2 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#D96C2C] text-white shadow-xs"
                    >
                      {{ cnt.contentCategoryName || 'คอนเทนต์' }}
                    </span>
                  </div>

                  <h4
                    class="font-black text-[#332820] text-xs sm:text-sm group-hover:text-[#D96C2C] transition line-clamp-1"
                  >
                    {{ cnt.title }}
                  </h4>
                  <p class="text-[11px] text-[#786B62] mt-1 line-clamp-2 leading-relaxed">
                    {{ cnt.summary || 'เรื่องราวจากร้านค้า' }}
                  </p>
                </div>

                <div
                  class="flex items-center justify-between text-[11px] text-[#786B62] mt-3 pt-2 border-t border-[#E8D9C9] font-semibold"
                >
                  <span class="group-hover:text-[#D96C2C]">อ่านเรื่องราว</span>
                  <i
                    class="mdi mdi-arrow-right text-xs text-[#D96C2C] transition-transform group-hover:translate-x-1"
                  ></i>
                </div>
              </RouterLink>
            </div>

            <!-- Prominent View All Stories Button -->
            <div v-if="shop && shopContents.length > 0" class="pt-2">
              <RouterLink
                :to="`/shops/${shop.shopId}/contents`"
                class="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#D96C2C]/10 hover:bg-[#D96C2C] text-[#D96C2C] hover:text-white border-2 border-[#D96C2C] font-black text-xs sm:text-sm shadow-md transition duration-200 cursor-pointer group"
              >
                <i class="mdi mdi-book-open-variant text-lg group-hover:text-white"></i>
                <span class="group-hover:text-white">ดูเรื่องราวและคอนเทนต์ทั้งหมดของร้านนี้</span>
                <i class="mdi mdi-arrow-right text-base group-hover:text-white"></i>
              </RouterLink>
            </div>

            <div v-else class="rounded-2xl bg-[#F7F0E6]/60 p-8 text-center text-xs text-[#786B62]">
              <i class="mdi mdi-play-box-remove-outline text-3xl text-[#D96C2C] block mb-2"></i>
              <span class="font-bold text-[#332820]">ร้านค้านี้ยังไม่มีคอนเทนต์เฉพาะ</span>
            </div>
          </section>

          <!-- SECTION 3: ร้านค้าใกล้เคียง (NEARBY SHOPS) -->
          <section
            v-if="nearbyShops.length"
            class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 sm:p-7 shadow-xs space-y-6"
          >
            <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D96C2C] text-white shadow-md font-bold"
                >
                  <i class="mdi mdi-map-marker-radius-outline text-xl"></i>
                </div>
                <div>
                  <h2 class="text-xl font-black text-[#332820]">ร้านค้าในละแวกใกล้เคียง</h2>
                  <p class="text-xs text-[#786B62]">
                    ค้นพบร้านค้าท้องถิ่นอื่น ๆ ในพื้นที่ใกล้เคียง
                  </p>
                </div>
              </div>

              <RouterLink to="/shops" class="text-xs font-bold text-[#D96C2C] hover:underline">
                ดูร้านค้าทั้งหมด >
              </RouterLink>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <RouterLink
                v-for="nb in nearbyShops"
                :key="nb.shopId"
                :to="`/shops/${nb.shopId}`"
                class="group bg-white rounded-2xl overflow-hidden border-2 border-[#E8D9C9] p-3 shadow-2xs hover:shadow-md hover:border-[#D96C2C] transition flex flex-col justify-between"
              >
                <div>
                  <div class="aspect-16/10 rounded-xl overflow-hidden bg-slate-900 mb-2.5">
                    <img
                      :src="getNearbyShopImage(nb)"
                      :alt="nb.shopName"
                      loading="lazy"
                      class="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <h4
                    class="font-black text-[#332820] text-xs group-hover:text-[#D96C2C] transition line-clamp-1"
                  >
                    {{ nb.shopName }}
                  </h4>
                  <p class="text-[10px] text-[#786B62] mt-0.5 font-medium">{{ formatShopArea(nb) }}</p>
                </div>

                <div
                  class="flex items-center justify-between text-[10px] text-[#786B62] mt-3 pt-2 border-t border-[#E8D9C9]"
                >
                  <span class="font-extrabold text-[#D96C2C]">{{
                    nb.categoryName || 'ร้านค้าชุมชน'
                  }}</span>
                  <span class="font-bold text-[#D96C2C]">เข้าชมร้าน</span>
                </div>
              </RouterLink>
            </div>
          </section>
        </div>

        <!-- RIGHT SIDEBAR COLUMN: ABOUT, LOCATION & REVIEWS -->
        <div class="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <!-- CARD 1: เกี่ยวกับร้าน -->
          <div class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 shadow-xs space-y-4">
            <h3
              class="font-black text-[#332820] text-base border-b-2 border-[#E8D9C9] pb-3 flex items-center gap-2"
            >
              <i class="mdi mdi-information-outline text-[#D96C2C] text-lg"></i>
              <span>เกี่ยวกับร้านค้า</span>
            </h3>

            <p class="text-xs sm:text-sm text-[#786B62] leading-relaxed whitespace-pre-line font-semibold">
              {{
                shop.description ||
                'ยินดีต้อนรับสู่ร้านค้าท้องถิ่นคุณภาพ พร้อมให้บริการสินค้าหลากหลายในจังหวัดกาญจนบุรี'
              }}
            </p>

            <div
              class="space-y-2.5 pt-2 border-t border-[#E8D9C9] text-xs font-extrabold text-[#332820]"
            >
              <div class="flex items-center gap-2">
                <i class="mdi mdi-check-circle text-[#D96C2C] text-base"></i>
                <span>สินค้าตรงจากชุมชนท้องถิ่น</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="mdi mdi-check-circle text-[#D96C2C] text-base"></i>
                <span>ผ่านการยืนยันตัวตนในระบบ</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="mdi mdi-check-circle text-[#D96C2C] text-base"></i>
                <span>สนับสนุนเศรษฐกิจชุมชนกาญจนบุรี</span>
              </div>
            </div>
          </div>

          <!-- CARD 2: ตำแหน่งร้าน (LEAFLET INTERACTIVE MAP) -->
          <div class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-3">
              <h3 class="font-black text-[#332820] text-base flex items-center gap-2">
                <i class="mdi mdi-map-marker-radius-outline text-[#D96C2C] text-lg"></i>
                <span>ตำแหน่งและแผนที่</span>
              </h3>
            </div>

            <div
              v-if="hasShopLocation"
              class="rounded-2xl overflow-hidden border-2 border-[#E8D9C9] h-52 relative z-10"
            >
              <div ref="mapContainer" class="w-full h-full bg-[#F7F0E6]"></div>
            </div>

            <div
              v-else
              class="flex h-44 items-center justify-center rounded-2xl border-2 border-dashed border-[#E8D9C9] bg-[#F7F0E6]/50 px-5 text-center text-xs text-[#786B62]"
            >
              ร้านค้ายังไม่ได้ระบุพิกัดบนแผนที่
            </div>

            <div class="flex items-center justify-between pt-1 text-xs">
              <span class="font-semibold text-[#786B62] flex items-center gap-1">
                <i class="mdi mdi-compass-outline text-[#D96C2C]"></i>
                {{
                  shop.latitude != null && shop.longitude != null
                    ? `${shop.latitude.toFixed(4)}°, ${shop.longitude.toFixed(4)}°`
                    : 'ยังไม่ระบุตำแหน่ง'
                }}
              </span>

              <button
                v-if="hasShopLocation"
                type="button"
                class="px-4 py-2 rounded-xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer border border-[#D96C2C]"
                @click="openDirections"
              >
                <i class="mdi mdi-navigation-variant text-white"></i>
                <span class="text-white">นำทาง Google Maps</span>
              </button>
            </div>
          </div>

          <!-- CARD 3: รีวิวจากลูกค้า (CUSTOMER REVIEWS CARD) -->
          <div class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-3">
              <div>
                <h3 class="font-black text-[#332820] text-base">รีวิวจากลูกค้า</h3>
                <span
                  v-if="reviewData.totalCount"
                  class="text-xs font-black text-[#D96C2C] flex items-center gap-1 mt-0.5"
                >
                  <i class="mdi mdi-star"></i>
                  {{ reviewData.averageRating.toFixed(1) }}
                  <span class="text-[#786B62] font-normal"
                    >จาก {{ reviewData.totalCount }} รีวิว</span
                  >
                </span>
                <span v-else class="mt-0.5 block text-xs text-[#786B62]"
                  >ยังไม่มีรีวิวจากผู้ซื้อ</span
                >
              </div>
            </div>

            <div
              v-if="reviewData.reviews.length"
              class="space-y-4 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin"
            >
              <div
                v-for="rev in reviewData.reviews"
                :key="rev.reviewId"
                class="border-b border-[#E8D9C9] pb-3.5 text-xs space-y-2 last:border-0 last:pb-0"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span
                      class="flex h-7 w-7 items-center justify-center rounded-full bg-[#D96C2C] font-black text-white text-xs shadow-2xs"
                    >
                      {{ reviewerInitial(rev.userName) }}
                    </span>
                    <span class="font-bold text-[#332820]">{{ rev.userName }}</span>
                  </div>
                  <span class="text-[10px] text-[#786B62]">{{
                    formatReviewDate(rev.createdAt)
                  }}</span>
                </div>

                <div v-if="rev.rating > 0" class="flex text-[#D96C2C] text-xs">
                  <i v-for="s in rev.rating" :key="s" class="mdi mdi-star"></i>
                </div>
                <p class="text-[#786B62] leading-relaxed font-medium">{{ rev.comment }}</p>

                <!-- Shop Reply Box -->
                <div
                  v-if="rev.reply"
                  class="rounded-xl bg-[#F7F0E6] p-3 text-[11px] text-[#786B62] border border-[#E8D9C9]"
                >
                  <div class="font-bold text-[#D96C2C] mb-1 flex items-center gap-1">
                    <i class="mdi mdi-reply text-[#D96C2C]"></i>
                    <span>ร้านค้าตอบกลับ</span>
                  </div>
                  <p>{{ rev.reply }}</p>
                </div>
              </div>
            </div>

            <p v-else class="rounded-2xl bg-[#F7F0E6]/60 px-4 py-6 text-center text-xs text-[#786B62]">
              ยังไม่มีรีวิวสำหรับร้านค้านี้
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- STICKY MOBILE ACTION BAR -->
    <div
      class="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-[#FFF9F2]/95 backdrop-blur-md border-t-2 border-[#E8D9C9] px-4 py-3 shadow-2xl flex items-center gap-2"
    >
      <button
        type="button"
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 transition active:scale-95 cursor-pointer"
        :class="
          isFollowing
            ? 'bg-slate-800 border-slate-800 text-white'
            : 'bg-[#FFF9F2] border-[#E8D9C9] text-[#D96C2C]'
        "
        :aria-pressed="isFollowing"
        aria-label="ติดตามร้านค้า"
        @click="toggleFollow"
      >
        <i class="mdi text-lg" :class="isFollowing ? 'mdi-check' : 'mdi-heart-outline'"></i>
      </button>

      <button
        type="button"
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-[#E8D9C9] bg-[#FFF9F2] text-[#D96C2C] cursor-pointer"
        aria-label="แชร์ร้านค้านี้"
        @click="copyShopLink"
      >
        <i class="mdi mdi-share-variant-outline text-lg"></i>
      </button>

      <a
        v-if="shop.phone"
        :href="`tel:${shop.phone}`"
        class="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-[#FFF9F2] border-2 border-[#D96C2C] text-[#D96C2C] font-extrabold text-xs active:scale-95 transition"
      >
        <i class="mdi mdi-phone-outline text-base text-[#D96C2C]"></i>
        <span>โทรติดต่อ</span>
      </a>

      <button
        v-if="hasShopLocation"
        type="button"
        class="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-[#D96C2C] text-white font-extrabold text-xs shadow-md active:scale-95 transition cursor-pointer border border-[#D96C2C]"
        @click="openDirections"
      >
        <i class="mdi mdi-navigation-variant text-base text-white"></i>
        <span class="text-white">นำทาง</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
:deep(.custom-shop-detail-marker) {
  background: transparent;
  border: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
