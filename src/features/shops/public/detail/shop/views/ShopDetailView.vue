<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getProductCategories,
  getShop,
  getShopProducts,
  getShopReviews,
  getShops,
  type Product,
  type ProductCategory,
  type Shop,
  type ShopReviews,
} from '@/features/shops/api'
import { getPublicContents, type PublicContent } from '@/features/contents/api'
import { push } from 'notivue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'

// Sub-components
import ShopDetailHeader from '../components/ShopDetailHeader.vue'
import ShopDetailCoupons from '../components/ShopDetailCoupons.vue'
import ShopDetailCampaign from '../components/ShopDetailCampaign.vue'
import ShopDetailProducts from '../components/ShopDetailProducts.vue'
import ShopDetailContents from '../components/ShopDetailContents.vue'
import ShopDetailAbout from '../components/ShopDetailAbout.vue'
import ShopDetailMapCard from '../components/ShopDetailMapCard.vue'
import ShopDetailReviews from '../components/ShopDetailReviews.vue'
import ShopDetailGuarantees from '../components/ShopDetailGuarantees.vue'
import ShopDetailMobileBar from '../components/ShopDetailMobileBar.vue'

const route = useRoute()
const router = useRouter()

const shop = ref<Shop | null>(null)
const products = ref<Product[]>([])
const categories = ref<ProductCategory[]>([])
const shopContents = ref<PublicContent[]>([])
const nearbyShops = ref<Shop[]>([])
const reviewData = ref<ShopReviews>({ totalCount: 0, averageRating: 0, reviews: [] })
const loading = ref(true)

const activeTab = ref<'home' | 'products' | 'contents' | 'about' | 'reviews'>('home')

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

function formatPrice(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

function getProductImage(product: Product, index: number): string {
  const defaults = [
    'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
  ]
  const resolved = imageUrl(product.imageUrl)
  return (resolved || defaults[index % defaults.length])!
}

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

function openGoogleMaps() {
  if (shop.value?.latitude != null && shop.value.longitude != null) {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${shop.value.latitude},${shop.value.longitude}`,
      '_blank',
    )
  }
}

async function copyShopLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    push.success({ title: 'คัดลอกลิงก์สำเร็จ', message: 'คัดลอกลิงก์ร้านค้าไปยังคลิปบอร์ดแล้ว' })
  } catch {
    push.error({ title: 'คัดลอกไม่สำเร็จ', message: 'ไม่สามารถคัดลอกลิงก์ได้ในขณะนี้' })
  }
}

function scrollToProducts() {
  activeTab.value = 'products'
  const el = document.getElementById('shop-products-section')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
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

async function loadShopData(shopId: string) {
  loading.value = true
  try {
    const [shopData, shopProducts, productCategories, contentsRes, reviews] = await Promise.all([
      getShop(shopId),
      getShopProducts(shopId),
      getProductCategories(),
      getPublicContents({ shopId, page: 1, pageSize: 6 }),
      getShopReviews(shopId).catch(() => ({ totalCount: 0, averageRating: 0, reviews: [] })),
    ])

    shop.value = shopData
    products.value = shopProducts
    categories.value = productCategories
    shopContents.value = contentsRes.items || []
    reviewData.value = reviews

    nearbyShops.value = await getNearbyShops(shopData)
  } catch (error) {
    push.error({ title: 'ไม่พบร้านค้า', message: getApiErrorMessage(error, 'ร้านค้านี้อาจถูกปิดการใช้งาน') })
    await router.replace('/shops')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadShopData(String(route.params.id))
})

watch(
  () => route.params.id,
  (newId) => {
    if (newId) void loadShopData(String(newId))
  },
)
</script>

<template>
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-24 sm:pb-16 font-sans">
    <!-- Skeleton Loading -->
    <div v-if="loading" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div class="h-64 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"></div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="h-80 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] md:col-span-2"></div>
        <div class="h-80 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"></div>
      </div>
    </div>

    <template v-else-if="shop">
      <!-- 1. OFFICIAL STOREFRONT HERO & PROFILE CARD -->
      <ShopDetailHeader
        v-model:is-following="isFollowing"
        :shop="shop"
        :shop-area="shopArea"
        :average-rating="reviewData.averageRating"
        :total-reviews="reviewData.totalCount"
        :total-products-count="products.length"
        :featured-content="shopContents[0]"
        :youtube-thumbnail="youtubeThumbnail"
        :image-url="imageUrl"
        :business-hours="businessHours"
        :is-open-now="isOpenNow"
        @copy-link="copyShopLink"
      />

      <!-- 2. STORE NAVIGATION SUB-BAR (Matches Reference Image 1:1) -->
      <section class="sticky top-16 z-30 bg-[#FFF9F2]/95 backdrop-blur-md border-y-2 border-[#E8D9C9] shadow-xs mt-6">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-6 sm:gap-8 overflow-x-auto text-xs sm:text-sm font-black scrollbar-none py-1">
            <button
              type="button"
              class="py-3 border-b-4 transition shrink-0 cursor-pointer"
              :class="activeTab === 'home' ? 'border-[#D96C2C] text-[#D96C2C]' : 'border-transparent text-[#786B62] hover:text-[#332820]'"
              @click="activeTab = 'home'"
            >
              หน้าแรกของร้าน
            </button>

            <button
              type="button"
              class="py-3 border-b-4 transition shrink-0 cursor-pointer"
              :class="activeTab === 'products' ? 'border-[#D96C2C] text-[#D96C2C]' : 'border-transparent text-[#786B62] hover:text-[#332820]'"
              @click="activeTab = 'products'"
            >
              สินค้าทั้งหมด ({{ products.length }})
            </button>

            <button
              type="button"
              class="py-3 border-b-4 transition shrink-0 cursor-pointer flex items-center gap-1"
              :class="activeTab === 'contents' ? 'border-[#D96C2C] text-[#D96C2C]' : 'border-transparent text-[#786B62] hover:text-[#332820]'"
              @click="activeTab = 'contents'"
            >
              <i class="mdi mdi-book-open-page-variant text-sm"></i>
              <span>เรื่องราวและคอนเทนต์ ({{ shopContents.length }})</span>
            </button>

            <button
              type="button"
              class="py-3 border-b-4 transition shrink-0 cursor-pointer"
              :class="activeTab === 'about' ? 'border-[#D96C2C] text-[#D96C2C]' : 'border-transparent text-[#786B62] hover:text-[#332820]'"
              @click="activeTab = 'about'"
            >
              เกี่ยวกับร้าน & พิกัดแผนที่
            </button>

            <button
              type="button"
              class="py-3 border-b-4 transition shrink-0 cursor-pointer flex items-center gap-1"
              :class="activeTab === 'reviews' ? 'border-[#D96C2C] text-[#D96C2C]' : 'border-transparent text-[#786B62] hover:text-[#332820]'"
              @click="activeTab = 'reviews'"
            >
              <span>รีวิวจากผู้ซื้อ</span>
              <span class="text-[10px] bg-[#D96C2C]/10 text-[#D96C2C] px-1.5 py-0.5 rounded-full">
                {{ reviewData.totalCount || '0' }}
              </span>
            </button>
          </div>
        </div>
      </section>

      <!-- 3. MAIN STORE BODY CONTAINER -->
      <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        <!-- 3.1 STORE COUPONS ROW (Matches Reference Image 1:1) -->
        <ShopDetailCoupons />

        <!-- 3.2 FEATURED CAMPAIGN / STORY HIGHLIGHT BANNER (Using Real Content & Real Products) -->
        <ShopDetailCampaign
          v-if="activeTab === 'home'"
          :shop="shop"
          :featured-content="shopContents[0]"
          :featured-products="products.slice(0, 2)"
          :youtube-thumbnail="youtubeThumbnail"
          :image-url="imageUrl"
          :format-price="formatPrice"
          @scroll-to-products="scrollToProducts"
        />

        <!-- 3.3 COMMUNITY CONTENTS & STORIES SECTION (*EXPLICIT USER REQUEST*) -->
        <div v-if="activeTab === 'home' || activeTab === 'contents'">
          <ShopDetailContents
            :shop="shop"
            :shop-contents="shopContents"
            :youtube-thumbnail="youtubeThumbnail"
          />
        </div>

        <!-- 3.4 PRODUCTS CATALOG SECTION (4-Column Grid with In-store Filters) -->
        <div id="shop-products-section" v-if="activeTab === 'home' || activeTab === 'products'">
          <ShopDetailProducts
            v-model:selected-category="selectedCategory"
            v-model:product-search-input="productSearchInput"
            v-model:product-search="productSearch"
            :shop="shop"
            :products="products"
            :categories="categories"
            :filtered-products="filteredProducts"
            :product-category-name="productCategoryName"
            :image-url="imageUrl"
            :format-price="formatPrice"
            :get-product-image="getProductImage"
          />
        </div>

        <!-- 3.5 ABOUT & MAP SECTION -->
        <div v-if="activeTab === 'home' || activeTab === 'about'" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-7">
            <ShopDetailAbout :shop="shop" />
          </div>
          <div class="lg:col-span-5">
            <ShopDetailMapCard
              :shop="shop"
              :has-shop-location="hasShopLocation"
              @open-directions="openGoogleMaps"
            />
          </div>
        </div>

        <!-- 3.6 REVIEWS SHOWCASE SECTION -->
        <div v-if="activeTab === 'home' || activeTab === 'reviews'">
          <ShopDetailReviews
            :shop="shop"
            :review-data="reviewData"
            :format-review-date="formatReviewDate"
            :reviewer-initial="reviewerInitial"
          />
        </div>

        <!-- 3.7 BOTTOM SERVICE TRUST & GUARANTEE BAR -->
        <ShopDetailGuarantees />
      </main>

      <!-- 4. STICKY MOBILE ACTION BAR -->
      <ShopDetailMobileBar
        v-model:is-following="isFollowing"
        :shop="shop"
        :has-shop-location="hasShopLocation"
        @copy-link="copyShopLink"
        @open-directions="openGoogleMaps"
      />
    </template>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
