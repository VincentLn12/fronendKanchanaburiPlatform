
<template>
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-24 sm:pb-16 font-sans">
    <!-- Skeleton Loading -->
    <div v-if="loading" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div class="h-64 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"></div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          class="h-80 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] md:col-span-2"
        ></div>
        <div class="h-80 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"></div>
      </div>
    </div>

    <template v-else-if="shop">
      <!-- 1. HEADER BANNER SECTION -->
      <ShopDetailHeader
        v-model:is-following="isFollowing"
        :shop="shop"
        :shop-area="shopArea"
        :average-rating="reviewData.averageRating"
        :total-reviews="reviewData.totalCount"
        :image-url="imageUrl"
        @copy-link="copyShopLink"
      />

      <!-- 2. QUICK INFO BAR -->
      <ShopDetailInfoBar
        :shop="shop"
        :business-hours="businessHours"
        :is-open-now="isOpenNow"
        :shop-address="shopAddress"
        :has-shop-location="hasShopLocation"
        @open-map="openGoogleMaps"
      />

      <!-- 3. MAIN BODY CONTAINER -->
      <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- LEFT COLUMN: PRODUCTS, ABOUT, CONTENTS & NEARBY SHOPS -->
          <div class="lg:col-span-8 space-y-8">
            <!-- PRODUCTS CATALOG SECTION -->
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

            <!-- ABOUT SHOP SECTION -->
            <ShopDetailAbout :shop="shop" />

            <!-- COMMUNITY STORIES / CONTENTS SECTION -->
            <ShopDetailContents
              :shop="shop"
              :shop-contents="shopContents"
              :youtube-thumbnail="youtubeThumbnail"
            />

            <!-- NEARBY SHOPS SECTION -->
            <ShopDetailNearbyShops
              :shop="shop"
              :nearby-shops="nearbyShops"
              :get-nearby-shop-image="getNearbyShopImage"
              :format-shop-area="formatShopArea"
            />
          </div>

          <!-- RIGHT SIDEBAR: HIGHLIGHTS, MAP CARD & REVIEWS -->
          <div class="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <!-- HIGHLIGHTS CARD -->
            <ShopDetailHighlights :shop="shop" />

            <!-- MAP CARD -->
            <ShopDetailMapCard
              :shop="shop"
              :has-shop-location="hasShopLocation"
              @open-directions="openGoogleMaps"
            />

            <!-- REVIEWS CARD -->
            <ShopDetailReviews
              :shop="shop"
              :review-data="reviewData"
              :format-review-date="formatReviewDate"
              :reviewer-initial="reviewerInitial"
            />
          </div>
        </div>
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
import ShopDetailInfoBar from '../components/ShopDetailInfoBar.vue'
import ShopDetailProducts from '../components/ShopDetailProducts.vue'
import ShopDetailAbout from '../components/ShopDetailAbout.vue'
import ShopDetailContents from '../components/ShopDetailContents.vue'
import ShopDetailNearbyShops from '../components/ShopDetailNearbyShops.vue'
import ShopDetailHighlights from '../components/ShopDetailHighlights.vue'
import ShopDetailMapCard from '../components/ShopDetailMapCard.vue'
import ShopDetailReviews from '../components/ShopDetailReviews.vue'
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

const shopAddress = computed(() =>
  [shop.value?.address, shopArea.value].filter(Boolean).join(' · '),
)

function formatShopArea(target: Shop) {
  return [
    target.subDistrictName ? `ต.${target.subDistrictName}` : null,
    target.districtName ? `อ.${target.districtName}` : null,
  ]
    .filter(Boolean)
    .join(' ')
}

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


<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
