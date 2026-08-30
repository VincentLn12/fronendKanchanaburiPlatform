<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getShop, getShopReviews, getShops, type ShopReviews } from '../api/shopApi'
import { getProductCategories, getShopProducts } from '../api/productApi'
import { getPublicContents, type PublicContent } from '@/features/contents/public/api/contentApi'
import type { Shop } from '../../shared/types/shop'
import type { Product, ProductCategory } from '../../shared/types/product'
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
const productSearch = ref('')
const isFollowing = ref(false)

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(/\/api$/, '')

function imageUrl(url?: string) {
  if (!url) return undefined
  return url.startsWith('/') ? `${apiOrigin}${url}` : url
}

const businessHours = computed(() => {
  if (!shop.value?.openingTime || !shop.value?.closingTime) return 'เปิดบริการทุกวัน 08:00 - 18:00 น.'
  return `เปิดบริการทุกวัน ${shop.value.openingTime} - ${shop.value.closingTime} น.`
})

const hasShopLocation = computed(
  () => shop.value?.latitude != null && shop.value.longitude != null,
)

const shopArea = computed(() => {
  const subDistrict = shop.value?.subDistrictName
  const district = shop.value?.districtName
  return [
    subDistrict ? `ต.${subDistrict}` : null,
    district ? `อ.${district}` : null,
    'จ.กาญจนบุรี',
  ].filter(Boolean).join(' ')
})

const shopAddress = computed(() => [shop.value?.address, shopArea.value].filter(Boolean).join(' · '))

function formatShopArea(target: Shop) {
  return [
    target.subDistrictName ? `ต.${target.subDistrictName}` : null,
    target.districtName ? `อ.${target.districtName}` : null,
  ].filter(Boolean).join(' ') || 'กาญจนบุรี'
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
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

function reviewerInitial(name: string) {
  return name.trim().charAt(0) || 'ผ'
}

function copyShopLink() {
  navigator.clipboard.writeText(window.location.href)
  void swal.success('คัดลอกลิงก์ร้านค้าแล้ว', 'นำลิงก์ไปแชร์ให้เพื่อน ๆ ได้เลย')
}

function toggleFollow() {
  isFollowing.value = !isFollowing.value
  if (isFollowing.value) {
    void swal.success('ติดตามร้านค้าแล้ว', 'คุณจะได้รับข่าวสารและสินค้าใหม่จากร้านนี้ก่อนใคร')
  }
}

const productCategories = computed(() => [
  { id: null, name: 'ทั้งหมด' },
  ...categories.value
    .filter((category) => products.value.some((product) => product.productCategoryId === category.productCategoryId))
    .map((category) => ({ id: category.productCategoryId, name: category.categoryName })),
])

// Filtered products list
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
  return categories.value.find((category) => category.productCategoryId === productCategoryId)?.categoryName ?? 'สินค้า'
}

// Fallback image helper
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
  } catch { return '' }
}

async function getNearbyShops(currentShop: Shop) {
  const withoutCurrentShop = (items: Shop[]) => items.filter((item) => item.shopId !== currentShop.shopId)
  if (currentShop.subDistrictId) {
    const sameSubDistrict = withoutCurrentShop(await getShops({ subDistrictId: currentShop.subDistrictId }))
    if (sameSubDistrict.length) return sameSubDistrict.slice(0, 4)
  }
  if (currentShop.districtId) {
    const sameDistrict = withoutCurrentShop(await getShops({ districtId: currentShop.districtId }))
    return sameDistrict.slice(0, 4)
  }
  return []
}

function getNearbyShopImage(nearbyShop: Shop) {
  return imageUrl(nearbyShop.coverImageUrl) || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80'
}

// Leaflet Map Initialization
const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: L.Map | null = null

function initMap() {
  if (!mapContainer.value || mapInstance || !hasShopLocation.value || !shop.value) return

  const lat = shop.value.latitude!
  const lng = shop.value.longitude!

  mapInstance = L.map(mapContainer.value, {
    scrollWheelZoom: false,
    zoomControl: false,
  }).setView([lat, lng], 14)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap',
  }).addTo(mapInstance)

  const icon = L.divIcon({
    className: 'custom-shop-detail-marker',
    html: `<div class="flex items-center justify-center h-10 w-10 rounded-full bg-[#1c4d3e] text-white font-bold shadow-2xl border-2 border-white ring-4 ring-emerald-500/20"><i class="mdi mdi-storefront text-xl"></i></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })

  L.marker([lat, lng], { icon })
    .addTo(mapInstance)
    .bindPopup(`<div class="p-1 font-bold text-slate-900">${shop.value.shopName}</div><div class="text-xs text-slate-500">${shopArea.value}</div>`)
    .openPopup()
}

function openDirections() {
  if (shop.value?.latitude != null && shop.value.longitude != null) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${shop.value.latitude},${shop.value.longitude}`, '_blank')
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
        getShopReviews(currentShop.shopId).catch(() => ({ totalCount: 0, averageRating: 0, reviews: [] })),
      ])
      products.value = shopProducts
      categories.value = productCategories

      let contentItems = contents.items || []
      if (!contentItems.length) {
        const fallbackRes = await getPublicContents({ page: 1, pageSize: 3 }).catch(() => ({ items: [] }))
        contentItems = fallbackRes.items || []
      }
      shopContents.value = contentItems
      nearbyShops.value = nearby
      reviewData.value = reviews
    }
  } catch (error) {
    await swal.error('ไม่พบร้านค้า', getApiErrorMessage(error, 'ร้านค้าอาจถูกปิดหรือไม่มีอยู่จริงในระบบ'))
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
})
</script>

<template>
  <div v-if="shop" class="min-h-screen bg-[#f8faf9] text-slate-800 pb-20">
    <!-- BREADCRUMB BAR -->
    <div class="bg-white border-b border-slate-200/80 py-3 shadow-2xs">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex items-center justify-between">
        <div class="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <RouterLink to="/" class="hover:text-[#1c4d3e] transition">หน้าแรก</RouterLink>
          <i class="mdi mdi-chevron-right text-slate-300"></i>
          <RouterLink to="/shops" class="hover:text-[#1c4d3e] transition">ร้านค้าทั้งหมด</RouterLink>
          <i class="mdi mdi-chevron-right text-slate-300"></i>
          <span class="text-slate-900 font-bold line-clamp-1">{{ shop.shopName }}</span>
        </div>

        <button
          type="button"
          class="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1c4d3e] transition"
          @click="copyShopLink"
        >
          <i class="mdi mdi-share-variant-outline text-emerald-700"></i>
          <span>แชร์ร้านค้านี้</span>
        </button>
      </div>
    </div>

    <!-- HERO HEADER SECTION (MODERN DARK EMERALD GLASSMORPHISM) -->
    <section class="relative bg-slate-950 text-white min-h-[340px] sm:min-h-[380px] flex items-end overflow-hidden">
      <!-- Background Cover Image with Ambient Overlay -->
      <img
        :src="imageUrl(shop.backgroundImageUrl || shop.coverImageUrl) || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=2000&q=80'"
        :alt="shop.shopName"
        class="absolute inset-0 w-full h-full object-cover opacity-50 scale-105 transition duration-700 hover:scale-100"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-[#0d3831] via-[#0d3831]/75 to-slate-950/40"></div>

      <!-- Floating Glow Orbs -->
      <div class="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl"></div>

      <!-- Hero Profile Header Container -->
      <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 pt-16 w-full">
        <div class="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <!-- Profile Avatar & Details -->
          <div class="flex flex-col sm:flex-row items-start sm:items-end gap-5 sm:gap-6">
            <!-- Avatar Logo Container -->
            <div class="relative flex h-28 w-28 sm:h-32 sm:w-32 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white/90 bg-slate-900 shadow-2xl ring-4 ring-emerald-500/20">
              <img
                :src="imageUrl(shop.coverImageUrl) || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'"
                :alt="shop.shopName"
                class="w-full h-full object-cover"
              />
              <span class="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg text-xs" title="ร้านค้าได้รับการยืนยัน">
                <i class="mdi mdi-check-bold"></i>
              </span>
            </div>

            <!-- Meta Details -->
            <div class="space-y-2.5">
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 text-emerald-200 text-xs font-bold border border-emerald-400/30 backdrop-blur-md">
                  <i class="mdi mdi-tag-outline text-emerald-300"></i>
                  {{ shop.categoryName || 'ร้านค้าชุมชน' }}
                </span>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-semibold backdrop-blur-md">
                  <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                  เปิดให้บริการอยู่
                </span>
              </div>

              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
                {{ shop.shopName }}
              </h1>

              <!-- Location & Rating -->
              <div class="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-emerald-100/90 font-medium">
                <span class="flex items-center gap-1.5">
                  <i class="mdi mdi-map-marker text-emerald-400 text-base"></i>
                  {{ shopArea }}
                </span>

                <span class="text-emerald-400/50">•</span>

                <span v-if="reviewData.totalCount" class="flex items-center gap-1.5 font-bold text-amber-400 bg-amber-400/10 px-3 py-0.5 rounded-full border border-amber-400/20">
                  <i class="mdi mdi-star"></i>
                  {{ reviewData.averageRating.toFixed(1) }}
                  <span class="text-emerald-100 font-normal">({{ reviewData.totalCount }} รีวิว)</span>
                </span>
                <span v-else class="text-emerald-200/80">ยังไม่มีรีวิว</span>
              </div>

              <!-- Shop Description Snippet -->
              <p class="text-xs sm:text-sm text-emerald-100/80 max-w-2xl line-clamp-2 leading-relaxed font-normal">
                {{ shop.description || 'ยินดีต้อนรับสู่ร้านค้าท้องถิ่นคุณภาพ พร้อมให้บริการสินค้าหลากหลายในจังหวัดกาญจนบุรี' }}
              </p>
            </div>
          </div>

          <!-- Action Buttons Bar -->
          <div class="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
            <button
              type="button"
              class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-xl transition-all duration-200 active:scale-95"
              :class="isFollowing ? 'bg-slate-800 text-white border border-slate-700' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-900/30'"
              @click="toggleFollow"
            >
              <i class="mdi text-base" :class="isFollowing ? 'mdi-check' : 'mdi-heart-outline'"></i>
              <span>{{ isFollowing ? 'ติดตามแล้ว' : 'ติดตามร้านค้า' }}</span>
            </button>

            <a
              v-if="shop.phone"
              :href="`tel:${shop.phone}`"
              class="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/95 hover:bg-white text-slate-800 font-bold text-xs sm:text-sm shadow-lg transition active:scale-95"
            >
              <i class="mdi mdi-phone-outline text-emerald-700 text-base"></i>
              <span>โทรติดต่อ</span>
            </a>

            <button
              type="button"
              class="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition active:scale-95"
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
      <div class="rounded-3xl bg-white p-5 sm:p-6 shadow-xl shadow-emerald-950/5 border border-slate-100">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <!-- Contact Phone -->
          <div class="flex items-center gap-3.5 p-2">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#1c4d3e] shadow-2xs">
              <i class="mdi mdi-phone-outline text-xl"></i>
            </div>
            <div>
              <span class="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">เบอร์โทรศัพท์</span>
              <a v-if="shop.phone" :href="`tel:${shop.phone}`" class="font-bold text-slate-900 text-sm hover:text-[#1c4d3e] transition">
                {{ shop.phone }}
              </a>
              <span v-else class="font-medium text-slate-400 text-sm">ยังไม่ระบุ</span>
            </div>
          </div>

          <!-- Contact Email -->
          <div class="flex items-center gap-3.5 p-2">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 shadow-2xs">
              <i class="mdi mdi-email-outline text-xl"></i>
            </div>
            <div>
              <span class="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">อีเมลร้านค้า</span>
              <span class="font-bold text-slate-900 text-sm line-clamp-1">{{ shop.email || 'ยังไม่ระบุ' }}</span>
            </div>
          </div>

          <!-- Business Hours -->
          <div class="flex items-center gap-3.5 p-2">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-2xs">
              <i class="mdi mdi-clock-outline text-xl"></i>
            </div>
            <div>
              <span class="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">เวลาทำการ</span>
              <span class="font-bold text-slate-900 text-xs sm:text-sm block leading-snug">{{ businessHours }}</span>
            </div>
          </div>

          <!-- Shop Location Address -->
          <div class="flex items-center gap-3.5 p-2">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#1c4d3e] shadow-2xs">
              <i class="mdi mdi-map-marker-outline text-xl"></i>
            </div>
            <div>
              <span class="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">ที่อยู่และพิกัด</span>
              <span class="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 block">{{ shopAddress }}</span>
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
          <section class="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-6">
            <!-- Header Toolbar -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div class="flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1c4d3e] text-white shadow-md shadow-emerald-950/10">
                  <i class="mdi mdi-shopping-outline text-xl"></i>
                </div>
                <div>
                  <h2 class="text-xl font-extrabold text-slate-900">สินค้าในร้าน</h2>
                  <p class="text-xs text-slate-500">รวมสินค้าคุณภาพที่คัดสรรจากร้านนี้</p>
                </div>
              </div>

              <!-- Product Search Box inside shop -->
              <div class="relative min-w-[220px]">
                <input
                  v-model="productSearch"
                  type="text"
                  placeholder="ค้นหาสินค้าในร้าน..."
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-700 outline-none focus:border-[#1c4d3e] focus:bg-white transition"
                />
                <i class="mdi mdi-magnify absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base"></i>
              </div>
            </div>

            <!-- Category Filter Pills Bar -->
            <div v-if="productCategories.length > 1" class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                v-for="cat in productCategories"
                :key="cat.name"
                type="button"
                class="px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0"
                :class="selectedCategory === cat.id ? 'bg-[#1c4d3e] text-white shadow-md shadow-emerald-950/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                @click="selectedCategory = cat.id"
              >
                {{ cat.name }}
              </button>
            </div>

            <!-- Products Grid Cards -->
            <div v-if="filteredProducts.length" class="grid grid-cols-2 sm:grid-cols-3 gap-5">
              <RouterLink
                v-for="(prod, idx) in filteredProducts"
                :key="prod.productId"
                :to="`/products/${prod.productId}`"
                class="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 p-3 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div class="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 mb-3">
                    <img :src="getProductImage(prod, idx)" :alt="prod.productName" class="w-full h-full object-cover group-hover:scale-108 transition duration-500" />
                    <span class="absolute top-2 left-2 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#1c4d3e] text-white shadow-xs">
                      พร้อมส่ง
                    </span>
                  </div>

                  <h4 class="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-[#1c4d3e] transition">
                    {{ prod.productName }}
                  </h4>
                  <p class="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {{ productCategoryName(prod.productCategoryId) }}
                  </p>
                </div>

                <div class="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <span class="font-black text-[#1c4d3e] text-sm">{{ formatPrice(prod.price) }}</span>
                  <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-[#1c4d3e] hover:text-white transition shadow-2xs"
                    title="ดูรายละเอียดสินค้า"
                  >
                    <i class="mdi mdi-cart-plus text-base"></i>
                  </button>
                </div>
              </RouterLink>
            </div>

            <!-- Empty Products State -->
            <div v-else class="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 text-center text-xs text-slate-500">
              <i class="mdi mdi-package-variant-remove text-4xl text-slate-300 block mb-2"></i>
              <span class="font-bold text-slate-700 text-sm">ไม่พบสินค้าในรายการนี้</span>
              <p class="mt-1 text-slate-400">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อดูสินค้าทั้งหมด</p>
            </div>
          </section>

          <!-- SECTION 2: คอนเทนต์จากร้าน (CONTENT FROM SHOP) -->
          <section class="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-6">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <div class="flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1c4d3e] text-white shadow-md">
                  <i class="mdi mdi-play-box-outline text-xl"></i>
                </div>
                <div>
                  <h2 class="text-xl font-extrabold text-slate-900">เรื่องราวและคอนเทนต์</h2>
                  <p class="text-xs text-slate-500">เรื่องราววิถีชีวิตและภูมิปัญญาจากร้านค้า</p>
                </div>
              </div>

              <RouterLink to="/contents" class="text-xs font-bold text-[#1c4d3e] hover:underline">
                ดูทั้งหมด >
              </RouterLink>
            </div>

            <div v-if="shopContents.length" class="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <RouterLink
                v-for="cnt in shopContents"
                :key="cnt.contentId"
                :to="`/contents/${cnt.contentId}`"
                class="group bg-white rounded-2xl overflow-hidden border border-slate-200 p-3 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div class="relative aspect-16/10 rounded-xl overflow-hidden bg-slate-900 mb-3">
                    <img v-if="youtubeThumbnail(cnt.youtubeUrl)" :src="youtubeThumbnail(cnt.youtubeUrl)" :alt="cnt.title" class="w-full h-full object-cover group-hover:scale-105 transition" />
                    <div v-else class="flex h-full items-center justify-center bg-[#1c4d3e] text-white">
                      <i class="mdi mdi-play-circle-outline text-4xl"></i>
                    </div>
                    <span class="absolute top-2 left-2 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#1c4d3e] text-white shadow-xs">
                      {{ cnt.contentCategoryName || 'คอนเทนต์' }}
                    </span>
                  </div>

                  <h4 class="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#1c4d3e] transition line-clamp-1">
                    {{ cnt.title }}
                  </h4>
                  <p class="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {{ cnt.summary || 'เรื่องราวจากร้านค้า' }}
                  </p>
                </div>

                <div class="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 font-medium">
                  <span>อ่านเรื่องราว</span>
                  <i class="mdi mdi-arrow-right text-xs transition-transform group-hover:translate-x-1"></i>
                </div>
              </RouterLink>
            </div>

            <div v-else class="rounded-2xl bg-slate-50 p-8 text-center text-xs text-slate-500">
              <i class="mdi mdi-play-box-remove-outline text-3xl text-slate-300 block mb-2"></i>
              <span class="font-bold text-slate-700">ร้านค้านี้ยังไม่มีคอนเทนต์เฉพาะ</span>
            </div>
          </section>

          <!-- SECTION 3: ร้านค้าใกล้เคียง (NEARBY SHOPS) -->
          <section v-if="nearbyShops.length" class="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-6">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <div class="flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md">
                  <i class="mdi mdi-map-marker-radius-outline text-xl"></i>
                </div>
                <div>
                  <h2 class="text-xl font-extrabold text-slate-900">ร้านค้าในละแวกใกล้เคียง</h2>
                  <p class="text-xs text-slate-500">ค้นพบร้านค้าท้องถิ่นอื่น ๆ ในพื้นที่ใกล้เคียง</p>
                </div>
              </div>

              <RouterLink to="/shops" class="text-xs font-bold text-[#1c4d3e] hover:underline">
                ดูร้านค้าทั้งหมด >
              </RouterLink>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <RouterLink
                v-for="nb in nearbyShops"
                :key="nb.shopId"
                :to="`/shops/${nb.shopId}`"
                class="group bg-white rounded-2xl overflow-hidden border border-slate-200 p-3 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div class="aspect-16/10 rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                    <img :src="getNearbyShopImage(nb)" :alt="nb.shopName" class="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <h4 class="font-bold text-slate-900 text-xs group-hover:text-[#1c4d3e] transition line-clamp-1">{{ nb.shopName }}</h4>
                  <p class="text-[10px] text-slate-500 mt-0.5">{{ formatShopArea(nb) }}</p>
                </div>

                <div class="flex items-center justify-between text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
                  <span class="font-semibold text-[#1c4d3e]">{{ nb.categoryName || 'ร้านค้าชุมชน' }}</span>
                  <span class="font-bold text-[#1c4d3e]">เข้าชมร้าน</span>
                </div>
              </RouterLink>
            </div>
          </section>

        </div>

        <!-- RIGHT SIDEBAR COLUMN: ABOUT, LOCATION & REVIEWS -->
        <div class="lg:col-span-4 space-y-6 lg:sticky lg:top-24">

          <!-- CARD 1: เกี่ยวกับร้าน -->
          <div class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 class="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <i class="mdi mdi-information-outline text-[#1c4d3e] text-lg"></i>
              <span>เกี่ยวกับร้านค้า</span>
            </h3>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {{ shop.description || 'ยินดีต้อนรับสู่ร้านค้าท้องถิ่นคุณภาพ พร้อมให้บริการสินค้าหลากหลายในจังหวัดกาญจนบุรี' }}
            </p>

            <div class="space-y-2.5 pt-2 border-t border-slate-100 text-xs font-medium text-slate-700">
              <div class="flex items-center gap-2">
                <i class="mdi mdi-check-circle text-emerald-600 text-base"></i>
                <span>สินค้าตรงจากชุมชนท้องถิ่น</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="mdi mdi-check-circle text-emerald-600 text-base"></i>
                <span>ผ่านการยืนยันตัวตนในระบบ</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="mdi mdi-check-circle text-emerald-600 text-base"></i>
                <span>สนับสนุนเศรษฐกิจชุมชนกาญจนบุรี</span>
              </div>
            </div>
          </div>

          <!-- CARD 2: ตำแหน่งร้าน (LEAFLET INTERACTIVE MAP) -->
          <div class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
                <i class="mdi mdi-map-marker-radius-outline text-[#1c4d3e] text-lg"></i>
                <span>ตำแหน่งและแผนที่</span>
              </h3>
            </div>

            <div v-if="hasShopLocation" class="rounded-2xl overflow-hidden border border-slate-200 h-52 relative z-10">
              <div ref="mapContainer" class="w-full h-full bg-emerald-50/50"></div>
            </div>

            <div v-else class="flex h-44 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center text-xs text-slate-500">
              ร้านค้ายังไม่ได้ระบุพิกัดบนแผนที่
            </div>

            <div class="flex items-center justify-between pt-1 text-xs">
              <span class="font-semibold text-slate-500 flex items-center gap-1">
                <i class="mdi mdi-compass-outline text-slate-400"></i>
                {{ shop.latitude != null && shop.longitude != null ? `${shop.latitude.toFixed(4)}°, ${shop.longitude.toFixed(4)}°` : 'ยังไม่ระบุตำแหน่ง' }}
              </span>

              <button
                v-if="hasShopLocation"
                type="button"
                class="px-4 py-2 rounded-xl bg-[#1c4d3e] hover:bg-[#14392e] text-white font-bold transition flex items-center gap-1.5 shadow-xs"
                @click="openDirections"
              >
                <i class="mdi mdi-navigation-variant"></i>
                <span>นำทาง Google Maps</span>
              </button>
            </div>
          </div>

          <!-- CARD 3: รีวิวจากลูกค้า (CUSTOMER REVIEWS CARD) -->
          <div class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 class="font-bold text-slate-900 text-base">รีวิวจากลูกค้า</h3>
                <span v-if="reviewData.totalCount" class="text-xs font-bold text-amber-500 flex items-center gap-1 mt-0.5">
                  <i class="mdi mdi-star"></i>
                  {{ reviewData.averageRating.toFixed(1) }} <span class="text-slate-400 font-normal">จาก {{ reviewData.totalCount }} รีวิว</span>
                </span>
                <span v-else class="mt-0.5 block text-xs text-slate-400">ยังไม่มีรีวิวจากผู้ซื้อ</span>
              </div>
            </div>

            <div v-if="reviewData.reviews.length" class="space-y-4">
              <div v-for="rev in reviewData.reviews" :key="rev.reviewId" class="border-b border-slate-100 pb-3.5 text-xs space-y-2 last:border-0 last:pb-0">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800 text-xs shadow-2xs">
                      {{ reviewerInitial(rev.userName) }}
                    </span>
                    <span class="font-bold text-slate-800">{{ rev.userName }}</span>
                  </div>
                  <span class="text-[10px] text-slate-400">{{ formatReviewDate(rev.createdAt) }}</span>
                </div>

                <div v-if="rev.rating > 0" class="flex text-amber-400 text-xs">
                  <i v-for="s in rev.rating" :key="s" class="mdi mdi-star"></i>
                </div>
                <p class="text-slate-600 leading-relaxed">{{ rev.comment }}</p>

                <!-- Shop Reply Box -->
                <div v-if="rev.reply" class="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-100">
                  <div class="font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <i class="mdi mdi-reply text-[#1c4d3e]"></i>
                    <span>ร้านค้าตอบกลับ</span>
                  </div>
                  <p>{{ rev.reply }}</p>
                </div>
              </div>
            </div>

            <p v-else class="rounded-2xl bg-slate-50 px-4 py-6 text-center text-xs text-slate-400">
              ยังไม่มีรีวิวสำหรับร้านค้านี้
            </p>
          </div>

        </div>

      </div>
    </main>
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
