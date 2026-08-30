<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
const isFollowing = ref(false)

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(/\/api$/, '')

function imageUrl(url?: string) {
  if (!url) return undefined
  return url.startsWith('/') ? `${apiOrigin}${url}` : url
}

const businessHours = computed(() => {
  if (!shop.value?.openingTime || !shop.value?.closingTime) return 'ยังไม่ระบุเวลาทำการ'
  return `เปิดทุกวัน ${shop.value.openingTime} - ${shop.value.closingTime} น.`
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
    void swal.success('ติดตามร้านค้าแล้ว', 'คุณจะได้รับข่าวสารและสินค้าใหม่ก่อนใคร')
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
  if (!selectedCategory.value) return products.value
  return products.value.filter((product) => product.productCategoryId === selectedCategory.value)
})

function productCategoryName(productCategoryId: string) {
  return categories.value.find((category) => category.productCategoryId === productCategoryId)?.categoryName ?? 'สินค้า'
}

// Mockup image helpers for fallback
function getProductImage(product: Product, index: number) {
  if (product.imageUrl) return imageUrl(product.imageUrl)
  const defaults = [
    'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
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

// Map Initialization
const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: L.Map | null = null

function initMap() {
  if (!mapContainer.value || mapInstance || !hasShopLocation.value || !shop.value) return

  const lat = shop.value.latitude!
  const lng = shop.value.longitude!

  mapInstance = L.map(mapContainer.value, {
    scrollWheelZoom: false,
    zoomControl: false,
  }).setView([lat, lng], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap',
  }).addTo(mapInstance)

  const icon = L.divIcon({
    className: 'custom-shop-detail-marker',
    html: `<div class="flex items-center justify-center h-10 w-10 rounded-full bg-[#1c4d3e] text-white font-bold shadow-xl border-2 border-white"><i class="mdi mdi-map-marker text-xl"></i></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })

  L.marker([lat, lng], { icon })
    .addTo(mapInstance)
    .bindPopup(`<b>${shop.value.shopName}</b><br/>${shopArea.value}`)
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
      shopContents.value = contents.items
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
  }, 300)
})

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<template>
  <div v-if="shop" class="min-h-screen bg-[#f8faf9] text-slate-800 pb-16">
    <!-- BREADCRUMB BAR -->
    <div class="bg-white border-b border-slate-200/80 py-3">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex items-center gap-2">
        <RouterLink to="/" class="hover:text-[#1c4d3e]">หน้าแรก</RouterLink>
        <i class="mdi mdi-chevron-right text-slate-300"></i>
        <RouterLink to="/shops" class="hover:text-[#1c4d3e]">ร้านค้า</RouterLink>
        <i class="mdi mdi-chevron-right text-slate-300"></i>
        <span class="text-slate-800 font-semibold line-clamp-1">{{ shop.shopName }}</span>
      </div>
    </div>

    <!-- TOP SHOP HERO HEADER SECTION -->
    <section class="relative bg-slate-900 text-white min-h-[300px] sm:min-h-[340px] flex items-center overflow-hidden">
      <!-- Cover Background Image -->
      <img
        :src="imageUrl(shop.backgroundImageUrl || shop.coverImageUrl) || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=2000&q=80'"
        :alt="shop.shopName"
        class="absolute inset-0 w-full h-full object-cover opacity-45 scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-slate-950/50"></div>

      <!-- Top Right Button: แชร์ร้าน -->
      <div class="absolute top-6 right-6 z-20">
        <button
          type="button"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 font-bold text-xs shadow-lg backdrop-blur-sm transition"
          @click="copyShopLink"
        >
          <i class="mdi mdi-share-variant-outline text-slate-700 text-base"></i>
          <span>แชร์ร้าน</span>
        </button>
      </div>

      <!-- Hero Profile Area -->
      <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <!-- Left Avatar & Meta Details -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <!-- Avatar Logo Circle -->
            <div class="relative flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/90 bg-slate-950 shadow-2xl">
              <img
                :src="imageUrl(shop.coverImageUrl) || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'"
                :alt="shop.shopName"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Meta Information -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                  {{ shop.shopName }}
                </h1>
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md text-xs" title="ร้านค้าได้รับการยืนยัน">
                  <i class="mdi mdi-check"></i>
                </span>
              </div>

              <p class="text-xs sm:text-sm font-semibold text-emerald-100/90 flex items-center gap-2">
                <span>{{ shop.categoryName || 'หัตถกรรมผ้าทอ' }}</span>
                <span>•</span>
                <span class="flex items-center gap-1"><i class="mdi mdi-map-marker text-emerald-400"></i>{{ shopArea }}</span>
              </p>

              <!-- Rating Summary -->
              <div class="flex flex-wrap items-center gap-4 text-xs text-white/90 pt-1">
                <span v-if="reviewData.totalCount" class="flex items-center gap-1 font-bold text-amber-400">
                  <i class="mdi mdi-star text-base"></i>
                  <span>{{ reviewData.averageRating.toFixed(1) }} ({{ reviewData.totalCount }} รีวิว)</span>
                </span>
                <span v-else>ยังไม่มีรีวิว</span>
              </div>

              <!-- Description Snippet -->
              <p class="text-xs text-slate-200/90 max-w-2xl line-clamp-2 leading-relaxed pt-1">
                {{ shop.description || 'ผ้าทอมอญจากภูมิปัญญาชาวมอญ ทอด้วยมือทุกผืน ลวดลายเป็นเอกลักษณ์ เน้นคุณภาพ ใช้วัตถุดิบธรรมชาติ สวยงาม ทนทาน' }}
                <span class="text-emerald-300 font-bold hover:underline cursor-pointer ml-1">ดูเพิ่มเติม</span>
              </p>
            </div>
          </div>

          <!-- Right Action Buttons -->
          <div class="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              class="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
              :class="isFollowing ? 'bg-slate-700 text-white' : 'bg-[#1c4d3e] hover:bg-[#14392e] text-white'"
              @click="toggleFollow"
            >
              <i class="mdi" :class="isFollowing ? 'mdi-check' : 'mdi-store-outline'"></i>
              <span>{{ isFollowing ? 'ติดตามแล้ว' : 'ติดตามร้าน' }}</span>
            </button>

            <a
              v-if="shop.phone"
              :href="`tel:${shop.phone}`"
              class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-md transition"
            >
              <i class="mdi mdi-message-text-outline text-slate-700"></i>
              <span>ติดต่อร้าน</span>
            </a>

            <button
              v-if="hasShopLocation"
              type="button"
              class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-md transition"
              @click="openDirections"
            >
              <i class="mdi mdi-map-marker-outline text-slate-700"></i>
              <span>ดูแผนที่</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- SHOP QUICK INFO CONTACT BAR (4 COLUMNS CARD) -->
    <section class="bg-white border-b border-slate-200/80 py-4 shadow-xs">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600">
          <div class="flex items-center gap-3 p-2">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#1c4d3e]">
              <i class="mdi mdi-phone-outline text-xl"></i>
            </div>
            <div>
              <span class="font-bold text-slate-900 text-sm block">{{ shop.phone || '082-345-6789' }}</span>
              <span class="text-slate-400">โทรติดต่อ</span>
            </div>
          </div>

          <div class="flex items-center gap-3 p-2">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#1c4d3e]">
              <i class="mdi mdi-email-outline text-xl"></i>
            </div>
            <div>
              <span class="font-bold text-slate-900 text-sm block line-clamp-1">{{ shop.email || 'wangkae.weaving@gmail.com' }}</span>
              <span class="text-slate-400">อีเมล</span>
            </div>
          </div>

          <div class="flex items-center gap-3 p-2">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#1c4d3e]">
              <i class="mdi mdi-clock-outline text-xl"></i>
            </div>
            <div>
              <span class="font-bold text-slate-900 text-sm block">{{ businessHours }}</span>
              <span class="text-slate-400">เวลาทำการ</span>
            </div>
          </div>

          <div class="flex items-center gap-3 p-2">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#1c4d3e]">
              <i class="mdi mdi-map-marker-outline text-xl"></i>
            </div>
            <div>
              <span class="font-bold text-slate-900 text-sm block line-clamp-1">{{ shopAddress || shopArea }}</span>
              <span class="text-slate-400">พื้นที่ตั้งร้าน</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MAIN BODY CONTAINER (2 COLUMNS) -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <!-- LEFT COLUMN: PRODUCTS, CONTENT & NEARBY SHOPS -->
        <div class="lg:col-span-8 space-y-10">

          <!-- SECTION 1: สินค้าในร้าน (PRODUCTS GRID) -->
          <section v-if="nearbyShops.length" class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <h2 class="text-xl font-bold text-slate-900">สินค้าในร้าน</h2>
              <button type="button" class="text-xs font-semibold text-[#1c4d3e] hover:underline">ดูสินค้าทั้งหมด ></button>
            </div>

            <!-- Category Filter Pills -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                v-for="cat in productCategories"
                :key="cat.name"
                type="button"
                class="px-4 py-1.5 rounded-xl text-xs font-bold transition shrink-0"
                :class="selectedCategory === cat.id ? 'bg-[#1c4d3e] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                @click="selectedCategory = cat.id"
              >
                {{ cat.name }}
              </button>
            </div>

            <!-- Products Grid (8 Items) -->
            <div v-if="filteredProducts.length" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <RouterLink
                v-for="(prod, idx) in filteredProducts"
                :key="prod.productId"
                :to="`/products/${prod.productId}`"
                class="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 p-3 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div class="relative aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                    <img :src="getProductImage(prod, idx)" :alt="prod.productName" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <span class="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#1c4d3e] text-white shadow-xs">
                      ขายดี
                    </span>
                  </div>
                  <h4 class="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-[#1c4d3e] transition">{{ prod.productName }}</h4>
                  <p class="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{{ productCategoryName(prod.productCategoryId) }}</p>
                </div>
                <div class="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <span class="font-black text-[#1c4d3e] text-sm">{{ formatPrice(prod.price) }}</span>
                  <button type="button" class="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-[#1c4d3e] hover:text-white transition" title="เพิ่มลงตะกร้า">
                    <i class="mdi mdi-cart-outline text-sm"></i>
                  </button>
                </div>
              </RouterLink>
            </div>

            <div v-else class="text-center py-10 text-xs text-slate-400">
              ไม่มีสินค้าในหมวดหมู่นี้
            </div>
          </section>

          <!-- SECTION 2: คอนเทนต์จากร้าน (CONTENT FROM SHOP) -->
          <section class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-slate-900">คอนเทนต์จากร้าน</h2>
              <RouterLink to="/contents" class="text-xs font-semibold text-[#1c4d3e] hover:underline">ดูทั้งหมด ></RouterLink>
            </div>

            <div v-if="shopContents.length" class="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <RouterLink
                v-for="cnt in shopContents"
                :key="cnt.contentId"
                :to="`/contents/${cnt.contentId}`"
                class="group bg-white rounded-2xl overflow-hidden border border-slate-200 p-3 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div class="relative aspect-16/10 rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                    <img v-if="youtubeThumbnail(cnt.youtubeUrl)" :src="youtubeThumbnail(cnt.youtubeUrl)" :alt="cnt.title" class="w-full h-full object-cover group-hover:scale-105 transition" />
                    <div v-else class="flex h-full items-center justify-center bg-emerald-50 text-emerald-600"><i class="mdi mdi-play-circle-outline text-4xl" /></div>
                    <span class="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#1c4d3e] text-white shadow-xs">
                      {{ cnt.contentCategoryName || 'คอนเทนต์' }}
                    </span>
                  </div>
                  <h4 class="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#1c4d3e] transition line-clamp-1">{{ cnt.title }}</h4>
                  <p class="text-[11px] text-slate-500 mt-1 line-clamp-1">{{ cnt.summary || 'คอนเทนต์จากร้านค้า' }}</p>
                </div>
                <div class="flex items-center justify-end gap-1 text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                  <i class="mdi mdi-arrow-right"></i><span>ดูคอนเทนต์</span>
                </div>
              </RouterLink>
            </div>
            <div v-else class="rounded-2xl bg-slate-50 py-8 text-center text-xs text-slate-500">ร้านนี้ยังไม่มีคอนเทนต์ที่เผยแพร่</div>
          </section>

          <!-- SECTION 3: ร้านค้าใกล้เคียง (NEARBY SHOPS) -->
          <section class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-slate-900">ร้านค้าใกล้เคียง</h2>
              <RouterLink to="/shops" class="text-xs font-semibold text-[#1c4d3e] hover:underline">ดูทั้งหมด ></RouterLink>
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
                  <span class="font-semibold text-emerald-700">{{ nb.categoryName || 'ร้านค้าชุมชน' }}</span>
                  <span class="flex items-center gap-0.5"><i class="mdi mdi-storefront-outline text-[#1c4d3e]"></i>ดูร้าน</span>
                </div>
              </RouterLink>
            </div>
          </section>

        </div>

        <!-- RIGHT SIDEBAR COLUMN: ABOUT, LOCATION & REVIEWS -->
        <div class="lg:col-span-4 space-y-6 sticky top-24">

          <!-- CARD 1: เกี่ยวกับร้าน -->
          <div class="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-3.5">
            <h3 class="font-bold text-slate-900 text-base border-b border-slate-100 pb-2.5">เกี่ยวกับร้าน</h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              {{ shop.description || 'ร้านผ้าทอชุมชนบ้านวังก์กะ เริ่มต้นจากกลุ่มแม่บ้านชาวมอญที่ต้องการสืบสานภูมิปัญญาการทอผ้าให้คงอยู่สืบไป ปัจจุบันมีสมาชิกกว่า 30 ครัวเรือน รายได้กระจายสู่ชุมชน และใช้วัตถุดิบธรรมชาติในการผลิตทุกขั้นตอน' }}
            </p>
          </div>

          <!-- CARD 2: ตำแหน่งร้าน (SHOP LOCATION CARD WITH LEAFLET MAP) -->
          <div class="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 class="font-bold text-slate-900 text-base">ตำแหน่งร้าน</h3>

            <div v-if="hasShopLocation" class="rounded-2xl overflow-hidden border border-slate-200 h-48">
              <div ref="mapContainer" class="w-full h-full bg-emerald-50/50"></div>
            </div>
            <div v-else class="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center text-xs text-slate-500">
              ร้านค้ายังไม่ได้ระบุตำแหน่งบนแผนที่
            </div>

            <div class="flex items-center justify-between pt-1 text-xs">
              <span class="font-semibold text-slate-500 flex items-center gap-1">
                <i class="mdi mdi-compass-outline text-slate-400"></i>
                {{ shop.latitude != null && shop.longitude != null ? `${shop.latitude.toFixed(6)}, ${shop.longitude.toFixed(6)}` : 'ยังไม่ระบุตำแหน่ง' }}
              </span>

              <button
                v-if="hasShopLocation"
                type="button"
                class="px-4 py-2 rounded-xl bg-[#1c4d3e] hover:bg-[#14392e] text-white font-bold transition flex items-center gap-1.5 shadow-xs"
                @click="openDirections"
              >
                <i class="mdi mdi-navigation-variant"></i>
                <span>นำทาง</span>
              </button>
            </div>
          </div>

          <!-- CARD 3: รีวิวจากลูกค้า (CUSTOMER REVIEWS CARD) -->
          <div class="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 class="font-bold text-slate-900 text-base">รีวิวจากลูกค้า</h3>
                <span v-if="reviewData.totalCount" class="text-xs font-bold text-amber-500 flex items-center gap-1 mt-0.5">
                  <i class="mdi mdi-star"></i>
                  {{ reviewData.averageRating.toFixed(1) }} <span class="text-slate-400 font-normal">จาก {{ reviewData.totalCount }} รีวิว</span>
                </span>
                <span v-else class="mt-0.5 block text-xs text-slate-400">ยังไม่มีรีวิวจากลูกค้า</span>
              </div>
              <span v-if="reviewData.totalCount > reviewData.reviews.length" class="text-xs font-semibold text-slate-500">ล่าสุด {{ reviewData.reviews.length }} รีวิว</span>
            </div>

            <div v-if="reviewData.reviews.length" class="space-y-4">
              <div v-for="rev in reviewData.reviews" :key="rev.reviewId" class="border-b border-slate-100 pb-3 text-xs space-y-2 last:border-0 last:pb-0">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">{{ reviewerInitial(rev.userName) }}</span>
                    <span class="font-bold text-slate-800">{{ rev.userName }}</span>
                  </div>
                  <span class="text-[10px] text-slate-400">{{ formatReviewDate(rev.createdAt) }}</span>
                </div>
                <div v-if="rev.rating > 0" class="flex text-amber-400 text-xs">
                  <i v-for="s in rev.rating" :key="s" class="mdi mdi-star"></i>
                </div>
                <p class="text-slate-600 leading-relaxed">{{ rev.comment }}</p>

                <!-- Shop Reply Box -->
                <div v-if="rev.reply" class="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600 border border-slate-100">
                  <div class="font-bold text-slate-800 mb-1">
                    <span>ร้านค้าตอบกลับ</span>
                  </div>
                  <p>{{ rev.reply }}</p>
                </div>
              </div>
            </div>
            <p v-else class="rounded-2xl bg-slate-50 px-4 py-5 text-center text-xs text-slate-400">ยังไม่มีรีวิวสำหรับร้านค้านี้</p>
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
