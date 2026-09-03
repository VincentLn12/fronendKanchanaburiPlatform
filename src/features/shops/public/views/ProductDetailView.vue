<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getProductReviews, getPublicProduct, getPublicProducts, type ProductReviews } from '../api/productApi'
import { getShop } from '../api/shopApi'
import type { Product } from '../../shared/types/product'
import type { Shop } from '../../shared/types/shop'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/features/auth/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cartStore = useCartStore()

const product = ref<Product | null>(null)
const shop = ref<Shop | null>(null)
const otherShopProducts = ref<Product[]>([])
const recommendedProducts = ref<Product[]>([])
const reviewData = ref<ProductReviews>({ totalCount: 0, averageRating: 0, reviews: [] })

const selectedImageIndex = ref(0)
const quantity = ref(1)
const activeTab = ref<'details' | 'reviews'>('details')
const isFavorite = ref(false)

const loading = ref(true)
const adding = ref(false)
const buyingNow = ref(false)
const swal = useSwal()

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(/\/api$/, '')

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

const galleryImages = computed(() => {
  const list: string[] = []
  if (product.value?.imageUrl) list.push(imageUrl(product.value.imageUrl)!)
  if (product.value?.detailImages?.length) {
    product.value.detailImages.forEach((img) => {
      if (img) list.push(imageUrl(img)!)
    })
  }
  const defaults = [
    'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  ]
  return list.length ? list : defaults
})

const maxQuantity = computed(() => {
  if (!product.value) return 1
  return Math.max(1, product.value.quantity)
})

function increaseQty() {
  if (quantity.value < maxQuantity.value) {
    quantity.value++
  }
}

function decreaseQty() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function validateQty() {
  if (isNaN(quantity.value) || quantity.value < 1) {
    quantity.value = 1
  } else if (quantity.value > maxQuantity.value) {
    quantity.value = maxQuantity.value
  }
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

function reviewerInitial(name: string) {
  return name.trim().charAt(0) || 'ผ'
}

// Leaflet Map Initialization
const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: L.Map | null = null

function initMap() {
  if (!mapContainer.value || mapInstance) return

  if (shop.value?.latitude == null || shop.value.longitude == null) return
  const lat = shop.value.latitude
  const lng = shop.value.longitude

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
    className: 'custom-product-shop-marker',
    html: `<div class="flex items-center justify-center h-10 w-10 rounded-full bg-[#D96C2C] text-white font-bold shadow-2xl border-2 border-white"><i class="mdi mdi-storefront text-xl text-white"></i></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })

  L.marker([lat, lng], { icon })
    .addTo(mapInstance)
    .bindPopup(`<b class="text-[#332820] font-black">${shop.value?.shopName || 'ร้านค้าชุมชน'}</b>`)
}

function openMapDirections() {
  if (shop.value?.latitude != null && shop.value.longitude != null) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${shop.value.latitude},${shop.value.longitude}`, '_blank')
  }
}

async function addToCart() {
  if (!product.value) return
  if (!auth.isLoggedIn) {
    await router.push('/login')
    return
  }
  adding.value = true
  try {
    await cartStore.add(product.value.productId, quantity.value)
    await swal.success('เพิ่มลงตะกร้าเรียบร้อย', `เพิ่ม ${product.value.productName} จำนวน ${quantity.value} ชิ้น เรียบร้อยแล้ว`)
  } catch (error) {
    await swal.error('เพิ่มสินค้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    adding.value = false
  }
}

async function buyNow() {
  if (!product.value) return
  if (!auth.isLoggedIn) {
    await router.push('/login')
    return
  }
  buyingNow.value = true
  try {
    await cartStore.add(product.value.productId, quantity.value)
    await router.push('/cart')
  } catch (error) {
    await swal.error('ไม่สามารถดำเนินการได้', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    buyingNow.value = false
  }
}

onMounted(async () => {
  try {
    product.value = await getPublicProduct(String(route.params.id))
    const currentProduct = product.value
    const [currentShop, allProducts, reviews] = await Promise.all([
      getShop(currentProduct.shopId),
      getPublicProducts(),
      getProductReviews(currentProduct.productId).catch(() => ({ totalCount: 0, averageRating: 0, reviews: [] })),
    ])
    shop.value = currentShop
    reviewData.value = reviews
    const otherProducts = allProducts.filter((item) => item.productId !== currentProduct.productId)
    otherShopProducts.value = otherProducts.filter((item) => item.shopId === currentProduct.shopId).slice(0, 4)
    recommendedProducts.value = otherProducts
      .filter((item) => item.shopId !== currentProduct.shopId)
      .slice(0, 4)
  } catch (error) {
    await swal.error('ไม่พบสินค้า', getApiErrorMessage(error, 'สินค้านี้อาจถูกปิดการขายหรือไม่มีอยู่ในระบบ'))
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
  <div v-if="product && shop" class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-20">
    <!-- BREADCRUMB BAR -->
    <div class="bg-[#FFF9F2] border-b-2 border-[#E8D9C9] py-3.5 shadow-2xs">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-[#786B62] flex items-center gap-2 overflow-x-auto scrollbar-none font-bold">
        <RouterLink to="/" class="hover:text-[#D96C2C] transition">หน้าแรก</RouterLink>
        <i class="mdi mdi-chevron-right text-[#E8D9C9]"></i>
        <RouterLink to="/shops" class="hover:text-[#D96C2C] transition">ร้านค้าทั้งหมด</RouterLink>
        <i class="mdi mdi-chevron-right text-[#E8D9C9]"></i>
        <RouterLink :to="`/shops/${shop.shopId}`" class="hover:text-[#D96C2C] line-clamp-1 transition">{{ shop.shopName }}</RouterLink>
        <i class="mdi mdi-chevron-right text-[#E8D9C9]"></i>
        <span class="text-[#332820] font-black line-clamp-1">{{ product.productName }}</span>
      </div>
    </div>

    <!-- MAIN PRODUCT DISPLAY CONTAINER -->
    <section class="bg-[#FFF9F2] border-b-2 border-[#E8D9C9] py-8 shadow-sm">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          <!-- Left Column: Product Image Gallery -->
          <div class="lg:col-span-6 space-y-4">
            <!-- Main Preview Frame -->
            <div class="relative aspect-4/3 sm:aspect-16/10 rounded-3xl overflow-hidden bg-[#171412] shadow-xl border-2 border-[#E8D9C9] group">
              <img
                :src="galleryImages[selectedImageIndex] || galleryImages[0]"
                :alt="product.productName"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <!-- Top Left Badge "สินค้าแนะนำ" -->
              <div class="absolute top-3 left-3">
                <span class="px-3.5 py-1 rounded-xl text-xs font-black bg-[#D96C2C] text-white shadow-lg border border-white/20">
                  ✨ สินค้าแนะนำ
                </span>
              </div>

              <!-- Top Right Favorite Heart Button -->
              <button
                type="button"
                class="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/95 text-[#332820] flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition border border-[#E8D9C9]"
                @click="isFavorite = !isFavorite"
              >
                <i class="mdi text-xl" :class="isFavorite ? 'mdi-heart text-rose-600' : 'mdi-heart-outline text-[#D96C2C]'"></i>
              </button>

              <!-- Gallery Navigation Arrows -->
              <button
                v-if="galleryImages.length > 1"
                type="button"
                class="absolute top-1/2 left-3 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-[#332820] flex items-center justify-center shadow-lg hover:bg-white transition"
                @click="selectedImageIndex = (selectedImageIndex - 1 + galleryImages.length) % galleryImages.length"
              >
                <i class="mdi mdi-chevron-left text-2xl"></i>
              </button>
              <button
                v-if="galleryImages.length > 1"
                type="button"
                class="absolute top-1/2 right-3 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-[#332820] flex items-center justify-center shadow-lg hover:bg-white transition"
                @click="selectedImageIndex = (selectedImageIndex + 1) % galleryImages.length"
              >
                <i class="mdi mdi-chevron-right text-2xl"></i>
              </button>

              <!-- Bottom Zoom Hint -->
              <div class="absolute bottom-3 right-3">
                <span class="px-3 py-1 rounded-xl bg-slate-950/80 text-white text-[11px] font-bold backdrop-blur-md flex items-center gap-1.5 border border-white/20">
                  <i class="mdi mdi-magnify text-[#F2A65A]"></i> คลิกเพื่อภาพขยาย
                </span>
              </div>
            </div>

            <!-- Thumbnail Strip Gallery -->
            <div v-if="galleryImages.length > 1" class="grid grid-cols-4 sm:grid-cols-5 gap-3">
              <button
                v-for="(img, idx) in galleryImages"
                :key="idx"
                type="button"
                class="relative aspect-square rounded-2xl overflow-hidden border-2 transition duration-200"
                :class="selectedImageIndex === idx ? 'border-[#D96C2C] ring-4 ring-[#D96C2C]/20 scale-95 shadow-md' : 'border-[#E8D9C9] hover:border-[#D96C2C] opacity-80'"
                @click="selectedImageIndex = idx"
              >
                <img :src="img" :alt="`ภาพสินค้า ${idx + 1}`" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- Right Column: Product Details & Purchase Panel -->
          <div class="lg:col-span-6 space-y-5">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-black bg-[#D96C2C]/10 text-[#D96C2C] border border-[#D96C2C]/20">
                <i class="mdi mdi-tag-outline text-[#D96C2C]"></i>
                {{ shop.categoryName || 'สินค้าชุมชน' }}
              </span>
            </div>

            <h1 class="text-3xl sm:text-4xl font-black text-[#332820] tracking-tight leading-tight">
              {{ product.productName }}
            </h1>

            <!-- Shop Seller Link Box -->
            <div class="inline-flex items-center gap-2.5 p-2.5 rounded-2xl bg-[#F7F0E6] border border-[#E8D9C9]">
              <img
                :src="imageUrl(shop.coverImageUrl) || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'"
                :alt="shop.shopName"
                class="w-7 h-7 rounded-full object-cover border border-white"
              />
              <RouterLink
                :to="`/shops/${shop.shopId}`"
                class="text-xs sm:text-sm font-black text-[#D96C2C] hover:underline flex items-center gap-1"
              >
                <span>{{ shop.shopName }}</span>
                <i class="mdi mdi-chevron-right text-xs"></i>
              </RouterLink>
            </div>

            <!-- Rating & Sales Status Bar -->
            <div class="flex items-center gap-4 text-xs font-bold text-[#786B62] border-y-2 border-[#E8D9C9] py-2.5">
              <span class="flex items-center gap-1.5 text-[#D96C2C] bg-[#D96C2C]/10 px-2.5 py-1 rounded-lg border border-[#D96C2C]/20 font-black">
                <i class="mdi mdi-star text-base text-[#D96C2C]"></i>
                <span>4.8 (120 รีวิว)</span>
              </span>
              <span class="text-[#E8D9C9]">•</span>
              <span class="text-[#786B62] font-semibold">ขายไปแล้ว 320 ชิ้น</span>
            </div>

            <!-- Price Display Box -->
            <div class="rounded-2xl bg-[#D96C2C]/10 p-4 border-2 border-[#D96C2C]/30 flex items-baseline justify-between">
              <div>
                <span class="text-xs font-black text-[#786B62] block uppercase">ราคาขาย</span>
                <span class="text-3xl sm:text-4xl font-black text-[#D96C2C] tracking-tight">{{ formatPrice(product.price) }}</span>
              </div>

              <!-- Stock Pill -->
              <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-white text-[#D96C2C] shadow-2xs border border-[#D96C2C]/30">
                <span class="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
                มีสินค้าในสต็อก {{ product.quantity }} ชิ้น
              </span>
            </div>

            <!-- Quantity Selector -->
            <div class="flex items-center gap-4 py-2 text-xs sm:text-sm">
              <span class="font-black text-[#332820] shrink-0">จำนวนที่ต้องการ</span>
              <div class="flex items-center rounded-2xl border-2 border-[#E8D9C9] bg-[#F7F0E6] p-1 shadow-2xs">
                <button
                  type="button"
                  class="h-9 w-9 flex items-center justify-center rounded-xl bg-white font-black text-[#332820] hover:bg-[#E8D9C9]/50 transition shadow-2xs disabled:opacity-40"
                  :disabled="quantity <= 1"
                  @click="decreaseQty"
                >
                  -
                </button>
                <input
                  v-model.number="quantity"
                  type="number"
                  class="w-14 text-center font-black text-[#332820] bg-transparent outline-none text-base"
                  @blur="validateQty"
                />
                <button
                  type="button"
                  class="h-9 w-9 flex items-center justify-center rounded-lg bg-white font-black text-[#332820] hover:bg-[#E8D9C9]/50 transition shadow-2xs disabled:opacity-40"
                  :disabled="quantity >= maxQuantity"
                  @click="increaseQty"
                >
                  +
                </button>
              </div>
              <span class="text-xs text-[#786B62] font-semibold">(สูงสุด {{ product.quantity }} ชิ้น)</span>
            </div>

            <!-- Action CTA Buttons (VIBRANT ORANGE SOLID & OUTLINE WITH WHITE/ORANGE CRISP TEXT) -->
            <div class="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                class="py-3.5 px-5 rounded-2xl border-2 border-[#D96C2C] text-[#D96C2C] font-black text-xs sm:text-sm hover:bg-[#D96C2C]/10 transition active:scale-95 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                :disabled="adding || product.quantity <= 0"
                @click="addToCart"
              >
                <i class="mdi mdi-cart-outline text-lg text-[#D96C2C]"></i>
                <span>เพิ่มลงตะกร้า</span>
              </button>

              <button
                type="button"
                class="py-3.5 px-5 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-black text-xs sm:text-sm shadow-xl transition active:scale-95 flex items-center justify-center gap-2 border-2 border-[#D96C2C] cursor-pointer"
                :disabled="buyingNow || product.quantity <= 0"
                @click="buyNow"
              >
                <i class="mdi mdi-lightning-bolt text-lg text-white"></i>
                <span class="!text-white font-black">สั่งซื้อทันที</span>
              </button>
            </div>

            <!-- Guarantee Badges -->
            <div class="grid grid-cols-3 gap-2.5 pt-4 border-t-2 border-[#E8D9C9] text-[11px] font-extrabold text-[#332820]">
              <div class="flex items-center gap-2 p-2.5 rounded-2xl bg-[#F7F0E6] border border-[#E8D9C9]">
                <i class="mdi mdi-shield-check-outline text-[#D96C2C] text-xl"></i>
                <div>
                  <span class="block text-[#332820]">ชำระเงินปลอดภัย</span>
                  <span class="text-[#786B62] font-semibold text-[10px]">Secure Payment</span>
                </div>
              </div>
              <div class="flex items-center gap-2 p-2.5 rounded-2xl bg-[#F7F0E6] border border-[#E8D9C9]">
                <i class="mdi mdi-truck-delivery-outline text-[#D96C2C] text-xl"></i>
                <div>
                  <span class="block text-[#332820]">จัดส่งรวดเร็ว</span>
                  <span class="text-[#786B62] font-semibold text-[10px]">1-3 วันทำการ</span>
                </div>
              </div>
              <div class="flex items-center gap-2 p-2.5 rounded-2xl bg-[#F7F0E6] border border-[#E8D9C9]">
                <i class="mdi mdi-sync text-[#D96C2C] text-xl"></i>
                <div>
                  <span class="block text-[#332820]">คืนสินค้าได้</span>
                  <span class="text-[#786B62] font-semibold text-[10px]">ภายใน 7 วัน</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>

    <!-- SUB-NAV TAB BAR -->
    <section class="sticky top-20 z-30 bg-[#FFF9F2] border-b-2 border-[#E8D9C9] shadow-xs">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-8 overflow-x-auto text-xs sm:text-sm font-black scrollbar-none">
          <button
            type="button"
            class="py-4 border-b-4 transition shrink-0 cursor-pointer"
            :class="activeTab === 'details' ? 'border-[#D96C2C] text-[#D96C2C]' : 'border-transparent text-[#786B62] hover:text-[#332820]'"
            @click="activeTab = 'details'"
          >
            รายละเอียดสินค้า
          </button>
          <button
            type="button"
            class="py-4 border-b-4 transition shrink-0 cursor-pointer"
            :class="activeTab === 'reviews' ? 'border-[#D96C2C] text-[#D96C2C]' : 'border-transparent text-[#786B62] hover:text-[#332820]'"
            @click="activeTab = 'reviews'"
          >
            รีวิวสินค้า ({{ reviewData.totalCount }})
          </button>
        </div>
      </div>
    </section>

    <!-- MAIN BODY CONTAINER (2 COLUMNS) -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <!-- LEFT COLUMN: SPECS, DESCRIPTION & RECOMMENDED -->
        <div class="lg:col-span-8 space-y-8">

          <!-- SECTION 1: รายละเอียดสินค้า -->
          <section class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-7 shadow-md space-y-6">
            <div class="flex items-center gap-2.5 border-b-2 border-[#E8D9C9] pb-4">
              <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D96C2C] text-white shadow-md font-bold">
                <i class="mdi mdi-clipboard-text-outline text-xl text-white"></i>
              </div>
              <div>
                <h2 class="text-xl font-black text-[#332820]">รายละเอียดสินค้าแบบเจาะลึก</h2>
                <p class="text-xs text-[#786B62]">ข้อมูลรายละเอียดวัตถุดิบและที่มาของสินค้า</p>
              </div>
            </div>

            <p v-if="product.description" class="text-sm text-[#786B62] leading-relaxed whitespace-pre-line font-semibold">
              {{ product.description }}
            </p>
            <p v-else class="rounded-2xl bg-[#F7F0E6] p-8 text-center text-sm text-[#786B62]">
              ร้านค้ายังไม่ได้ระบุรายละเอียดข้อความสินค้า
            </p>

            <!-- Specs Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div class="p-4 rounded-2xl bg-[#F7F0E6] border-2 border-[#E8D9C9] text-xs space-y-2">
                <span class="font-black text-[#D96C2C] block uppercase tracking-wider">📌 ข้อมูลเฉพาะ</span>
                <ul class="space-y-1.5 text-[#332820] font-semibold">
                  <li><strong>หมวดหมู่:</strong> {{ shop.categoryName || 'สินค้าหัตถกรรม' }}</li>
                  <li><strong>ร้านผู้ผลิต:</strong> {{ shop.shopName }}</li>
                  <li><strong>แหล่งที่มา:</strong> {{ shop.districtName || 'สังขละบุรี' }} กาญจนบุรี</li>
                </ul>
              </div>

              <div class="p-4 rounded-2xl bg-[#D96C2C]/10 border-2 border-[#D96C2C]/20 text-xs space-y-2">
                <span class="font-black text-[#D96C2C] block uppercase tracking-wider">💚 การรับประกันและดูแล</span>
                <ul class="space-y-1.5 text-[#332820] font-semibold">
                  <li><strong>รับประกันสินค้า:</strong> ของแท้จากชุมชน 100%</li>
                  <li><strong>บริการจัดส่ง:</strong> พัสดุด่วน EMS / Flash Express</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- SECTION 2: สินค้าอื่นจากร้านนี้ -->
          <section v-if="otherShopProducts.length" class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-7 shadow-md space-y-6">
            <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
              <h2 class="text-xl font-black text-[#332820]">สินค้าอื่นจากร้านนี้</h2>
              <RouterLink :to="`/shops/${shop.shopId}`" class="text-xs font-black text-[#D96C2C] hover:underline">
                ดูทั้งหมด >
              </RouterLink>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <RouterLink
                v-for="op in otherShopProducts"
                :key="op.productId"
                :to="`/products/${op.productId}`"
                class="group bg-white rounded-2xl overflow-hidden border-2 border-[#E8D9C9] p-3 shadow-2xs hover:shadow-xl hover:border-[#D96C2C] hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div class="aspect-square rounded-xl overflow-hidden bg-slate-900 mb-2.5">
                    <img v-if="op.imageUrl" :src="imageUrl(op.imageUrl)" :alt="op.productName" class="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <h4 class="font-black text-[#332820] text-xs group-hover:text-[#D96C2C] transition line-clamp-1">{{ op.productName }}</h4>
                </div>
                <div class="flex items-center justify-between text-xs mt-3 pt-2 border-t border-[#E8D9C9] font-black text-[#D96C2C]">
                  <span>{{ formatPrice(op.price) }}</span>
                </div>
              </RouterLink>
            </div>
          </section>

          <!-- SECTION 3: สินค้าที่คุณอาจสนใจ -->
          <section v-if="recommendedProducts.length" class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-7 shadow-md space-y-6">
            <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
              <h2 class="text-xl font-black text-[#332820]">สินค้าที่คุณอาจสนใจ</h2>
              <RouterLink to="/shops" class="text-xs font-black text-[#D96C2C] hover:underline">
                ดูทั้งหมด >
              </RouterLink>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <RouterLink
                v-for="rp in recommendedProducts"
                :key="rp.productId"
                :to="`/products/${rp.productId}`"
                class="group bg-white rounded-2xl overflow-hidden border-2 border-[#E8D9C9] p-3 shadow-2xs hover:shadow-xl hover:border-[#D96C2C] hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div class="aspect-square rounded-xl overflow-hidden bg-slate-900 mb-2.5">
                    <img v-if="rp.imageUrl" :src="imageUrl(rp.imageUrl)" :alt="rp.productName" class="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <h4 class="font-black text-[#332820] text-xs group-hover:text-[#D96C2C] transition line-clamp-1">{{ rp.productName }}</h4>
                </div>
                <div class="flex items-center justify-between text-xs mt-3 pt-2 border-t border-[#E8D9C9] font-black text-[#D96C2C]">
                  <span>{{ formatPrice(rp.price) }}</span>
                </div>
              </RouterLink>
            </div>
          </section>

        </div>

        <!-- RIGHT SIDEBAR: MERCHANT CARD, MAP & REVIEWS -->
        <div class="lg:col-span-4 space-y-6 lg:sticky lg:top-24">

          <!-- CARD 1: ร้านผู้จำหน่าย (SELLER CARD) -->
          <div class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 shadow-md space-y-4">
            <h3 class="font-black text-[#332820] text-base border-b-2 border-[#E8D9C9] pb-3 flex items-center gap-2">
              <i class="mdi mdi-storefront text-[#D96C2C] text-lg"></i>
              <span>ร้านผู้จำหน่าย</span>
            </h3>

            <div class="flex items-center gap-3">
              <img
                :src="imageUrl(shop.coverImageUrl) || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'"
                :alt="shop.shopName"
                class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-[#D96C2C]/30"
              />
              <div>
                <h4 class="font-black text-[#332820] text-sm flex items-center gap-1">
                  <span>{{ shop.shopName }}</span>
                  <i class="mdi mdi-check-circle text-[#D96C2C] text-xs"></i>
                </h4>
                <p class="text-[11px] text-[#786B62] font-semibold">{{ shop.categoryName || 'หัตถกรรม' }} • {{ shop.districtName || 'อ.สังขละบุรี' }}</p>
                <div class="flex items-center gap-1 text-[10px] text-[#D96C2C] font-black mt-0.5">
                  <i class="mdi mdi-star"></i>
                  <span>4.8 (120 รีวิว)</span>
                </div>
              </div>
            </div>

            <dl class="space-y-2 text-xs font-extrabold text-[#332820] pt-1">
              <div class="flex items-center gap-2">
                <i class="mdi mdi-phone-outline text-[#D96C2C] text-base"></i>
                <span>{{ shop.phone || '082-345-6789' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="mdi mdi-clock-outline text-[#D96C2C] text-base"></i>
                <span>เปิด จันทร์ - อาทิตย์ 08:00 - 18:00 น.</span>
              </div>
              <div class="flex items-start gap-2">
                <i class="mdi mdi-map-marker-outline text-[#D96C2C] text-base shrink-0 mt-0.5"></i>
                <span>{{ shop.address || 'บ้านวังก์กะ หมู่ 2 ต.หนองลู อ.สังขละบุรี จ.กาญจนบุรี' }}</span>
              </div>
            </dl>

            <RouterLink
              :to="`/shops/${shop.shopId}`"
              class="block w-full py-3 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-center font-black text-xs text-white shadow-md transition border border-[#D96C2C]"
            >
              เข้าชมร้านค้า >
            </RouterLink>
          </div>

          <!-- CARD 2: ตำแหน่งร้าน (SHOP LOCATION MAP CARD) -->
          <div class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 shadow-md space-y-3">
            <h3 class="font-black text-[#332820] text-base flex items-center gap-2">
              <i class="mdi mdi-map-marker text-[#D96C2C] text-lg"></i>
              <span>ตำแหน่งร้านค้า</span>
            </h3>

            <div v-if="shop.latitude != null && shop.longitude != null" class="rounded-2xl overflow-hidden border-2 border-[#E8D9C9] h-48">
              <div ref="mapContainer" class="w-full h-full bg-[#F7F0E6]"></div>
            </div>
            <div v-else class="flex h-44 items-center justify-center rounded-2xl border-2 border-dashed border-[#E8D9C9] bg-[#F7F0E6] text-xs text-[#786B62]">
              ร้านค้ายังไม่ได้ระบุตำแหน่งบนแผนที่
            </div>

            <button
              v-if="shop.latitude != null && shop.longitude != null"
              type="button"
              class="w-full py-2.5 rounded-xl border-2 border-[#E8D9C9] text-center font-black text-xs text-[#332820] hover:bg-[#F7F0E6] transition flex items-center justify-center gap-1 cursor-pointer"
              @click="openMapDirections"
            >
              <i class="mdi mdi-map-marker-outline text-[#D96C2C]"></i>
              <span>ดูแผนที่ขนาดใหญ่</span>
            </button>
          </div>

          <!-- CARD 3: รีวิวจากลูกค้า (CUSTOMER REVIEWS BREAKDOWN CARD) -->
          <div class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 shadow-md space-y-4">
            <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-3">
              <h3 class="font-black text-[#332820] text-base">รีวิวจากผู้สั่งซื้อ</h3>
              <span class="text-xs text-[#786B62] font-semibold">จาก 120 รีวิว</span>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-3xl font-black text-[#D96C2C]">4.8</span>
              <div class="text-xs space-y-0.5">
                <div class="flex text-[#D96C2C]">
                  <i v-for="s in 5" :key="s" class="mdi mdi-star"></i>
                </div>
                <span class="text-[#786B62] text-[10px] font-semibold">2 สัปดาห์ที่แล้ว</span>
              </div>
            </div>

            <!-- Star Distribution Rating Bars -->
            <div class="space-y-1.5 text-[11px] text-[#786B62] font-black">
              <div class="flex items-center gap-2">
                <span class="w-4">5★</span>
                <div class="flex-1 h-2 rounded-full bg-[#E8D9C9]/50 overflow-hidden">
                  <div class="h-full bg-[#D96C2C] w-[80%] rounded-full"></div>
                </div>
                <span class="w-6 text-right">94</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-4">4★</span>
                <div class="flex-1 h-2 rounded-full bg-[#E8D9C9]/50 overflow-hidden">
                  <div class="h-full bg-[#D96C2C] w-[15%] rounded-full"></div>
                </div>
                <span class="w-6 text-right">18</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-4">3★</span>
                <div class="flex-1 h-2 rounded-full bg-[#E8D9C9]/50 overflow-hidden">
                  <div class="h-full bg-[#D96C2C] w-[4%] rounded-full"></div>
                </div>
                <span class="w-6 text-right">6</span>
              </div>
            </div>

            <!-- Customer Review Item -->
            <div class="pt-3 border-t-2 border-[#E8D9C9] text-xs space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[#D96C2C] font-black text-white text-[10px]">ณ</span>
                  <span class="font-black text-[#332820]">ณัฐวดี พ.</span>
                </div>
                <span class="font-black text-[#D96C2C] text-[11px] flex items-center gap-0.5"><i class="mdi mdi-star"></i>5</span>
              </div>
              <p class="text-[#786B62] leading-relaxed font-semibold">
                สินค้าตรงปก สวยมาก คุณภาพดีเกินราคา จัดส่งรวดเร็วมากครับ
              </p>
            </div>
          </div>

        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
:deep(.custom-product-shop-marker) {
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
/* Hide spin buttons for number inputs */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
