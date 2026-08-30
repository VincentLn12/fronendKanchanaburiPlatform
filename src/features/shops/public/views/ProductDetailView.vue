<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getPublicProduct } from '../api/productApi'
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

const selectedImageIndex = ref(0)
const quantity = ref(1)
const activeTab = ref<'details' | 'specs' | 'shipping' | 'reviews'>('details')
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
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
  ]
  return list.concat(defaults).slice(0, 5)
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

// Other Products from this shop
const otherShopProducts = [
  {
    id: 'op-1',
    name: 'ผ้าพันคอทอมือ',
    price: 450,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'op-2',
    name: 'กระเป๋าผ้าทอมือ',
    price: 650,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'op-3',
    name: 'ผ้าทอมอญลายดอกพิกุล',
    price: 1250,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'op-4',
    name: 'ปลอกหมอนอิงผ้าทอ',
    price: 350,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80',
  },
]

// Recommended products
const recommendedProducts = [
  {
    id: 'rp-1',
    name: 'ผ้าทอไท-ยวน',
    price: 750,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'rp-2',
    name: 'ผ้าขาวม้าทอมือ',
    price: 120,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'rp-3',
    name: 'ผ้าพื้นเมืองไท-กะเหรี่ยง',
    price: 680,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'rp-4',
    name: 'กระเป๋าปักทอมือ',
    price: 390,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80',
  },
]

// Map Initialization
const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: L.Map | null = null

function initMap() {
  if (!mapContainer.value || mapInstance) return

  const lat = 14.5837
  const lng = 98.4523

  mapInstance = L.map(mapContainer.value, {
    scrollWheelZoom: false,
    zoomControl: false,
  }).setView([lat, lng], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap',
  }).addTo(mapInstance)

  const icon = L.divIcon({
    className: 'custom-product-shop-marker',
    html: `<div class="flex items-center justify-center h-9 w-9 rounded-full bg-[#1c4d3e] text-white font-bold shadow-xl border-2 border-white"><i class="mdi mdi-store text-lg"></i></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })

  L.marker([lat, lng], { icon })
    .addTo(mapInstance)
    .bindPopup(`<b>${shop.value?.shopName || 'ร้านค้าชุมชน'}</b>`)
}

function openMapDirections() {
  const query = encodeURIComponent(`${shop.value?.shopName || 'สังขละบุรี'} กาญจนบุรี`)
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
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
    shop.value = await getShop(product.value.shopId)
  } catch (error) {
    await swal.error('ไม่พบสินค้า', getApiErrorMessage(error, 'สินค้านี้อาจถูกปิดการขายหรือไม่มีอยู่ในระบบ'))
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
  <div v-if="product && shop" class="min-h-screen bg-[#f8faf9] text-slate-800 pb-16">
    <!-- BREADCRUMB BAR -->
    <div class="bg-white border-b border-slate-200/80 py-3">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex items-center gap-2 overflow-x-auto">
        <RouterLink to="/" class="hover:text-[#1c4d3e]">หน้าแรก</RouterLink>
        <i class="mdi mdi-chevron-right text-slate-300"></i>
        <RouterLink to="/shops" class="hover:text-[#1c4d3e]">ร้านค้า</RouterLink>
        <i class="mdi mdi-chevron-right text-slate-300"></i>
        <RouterLink :to="`/shops/${shop.shopId}`" class="hover:text-[#1c4d3e] line-clamp-1">{{ shop.shopName }}</RouterLink>
        <i class="mdi mdi-chevron-right text-slate-300"></i>
        <span class="text-slate-800 font-semibold line-clamp-1">{{ product.productName }}</span>
      </div>
    </div>

    <!-- TOP PRODUCT HEADER SECTION (GALLERY & PURCHASE PANEL) -->
    <section class="bg-white border-b border-slate-200/80 py-8">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <!-- Left: Product Main Gallery Strip -->
          <div class="lg:col-span-6 space-y-3">
            <div class="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-950 shadow-md border border-slate-200 group">
              <img
                :src="galleryImages[selectedImageIndex] || galleryImages[0]"
                :alt="product.productName"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <!-- Top Left Badge "สินค้าแนะนำ" -->
              <div class="absolute top-3 left-3">
                <span class="px-3 py-1 rounded-md text-xs font-bold bg-[#1c4d3e] text-white shadow-md">
                  สินค้าแนะนำ
                </span>
              </div>

              <!-- Top Right Favorite Heart Button -->
              <button
                type="button"
                class="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow-md hover:scale-110 transition"
                @click="isFavorite = !isFavorite"
              >
                <i class="mdi text-lg" :class="isFavorite ? 'mdi-heart text-rose-600' : 'mdi-heart-outline'"></i>
              </button>

              <!-- Left/Right Gallery Nav Arrows -->
              <button
                type="button"
                class="absolute top-1/2 left-3 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 text-slate-800 flex items-center justify-center shadow-md hover:bg-white transition"
                @click="selectedImageIndex = (selectedImageIndex - 1 + galleryImages.length) % galleryImages.length"
              >
                <i class="mdi mdi-chevron-left text-xl"></i>
              </button>
              <button
                type="button"
                class="absolute top-1/2 right-3 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 text-slate-800 flex items-center justify-center shadow-md hover:bg-white transition"
                @click="selectedImageIndex = (selectedImageIndex + 1) % galleryImages.length"
              >
                <i class="mdi mdi-chevron-right text-xl"></i>
              </button>

              <!-- Bottom Zoom Hint -->
              <div class="absolute bottom-3 right-3">
                <span class="px-2.5 py-1 rounded-lg bg-slate-900/70 text-white text-[11px] font-bold backdrop-blur-md flex items-center gap-1">
                  <i class="mdi mdi-magnify"></i> คลิกเพื่อขยาย
                </span>
              </div>
            </div>

            <!-- Thumbnail Strip Gallery (5 Items) -->
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
                <div v-if="idx === 0" class="absolute inset-0 flex items-center justify-center bg-slate-950/20">
                  <i class="mdi mdi-play-circle text-white text-xl"></i>
                </div>
              </button>
            </div>
          </div>

          <!-- Right: Product Purchase Panel -->
          <div class="lg:col-span-6 space-y-4">
            <div>
              <span class="inline-block px-3 py-1 rounded-md text-xs font-bold bg-[#1c4d3e] text-white shadow-xs">
                {{ shop.categoryName || 'สิ่งทอ' }}
              </span>
            </div>

            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
              {{ product.productName }}
            </h1>

            <!-- Shop link -->
            <RouterLink
              :to="`/shops/${shop.shopId}`"
              class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1c4d3e] hover:underline"
            >
              <i class="mdi mdi-storefront-outline text-base"></i>
              <span>{{ shop.shopName }}</span>
              <i class="mdi mdi-chevron-right text-xs"></i>
            </RouterLink>

            <!-- Rating & Sales Status Bar -->
            <div class="flex items-center gap-4 text-xs text-slate-500 py-1">
              <span class="font-bold text-amber-500 flex items-center gap-1">
                <i class="mdi mdi-star"></i> 4.8 (120 รีวิว)
              </span>
              <span>|</span>
              <span>ขายแล้ว 320 ชิ้น</span>
            </div>

            <!-- Big Price Display -->
            <div class="py-2">
              <span class="text-3xl sm:text-4xl font-black text-slate-900">{{ formatPrice(product.price) }}</span>
            </div>

            <!-- Stock Badge -->
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800">
                <span class="h-2 w-2 rounded-full bg-emerald-600"></span>
                มีสินค้าในสต็อก เหลือ {{ product.quantity }} ชิ้น
              </span>
            </div>

            <!-- Quantity Selector -->
            <div class="flex items-center gap-4 py-3 border-y border-slate-100 text-xs sm:text-sm">
              <span class="font-bold text-slate-800 shrink-0">จำนวน</span>
              <div class="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  class="h-8 w-8 flex items-center justify-center rounded-lg bg-white font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                  :disabled="quantity <= 1"
                  @click="decreaseQty"
                >
                  -
                </button>
                <input
                  v-model.number="quantity"
                  type="number"
                  class="w-12 text-center font-bold text-slate-800 bg-transparent outline-none"
                  @blur="validateQty"
                />
                <button
                  type="button"
                  class="h-8 w-8 flex items-center justify-center rounded-lg bg-white font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                  :disabled="quantity >= maxQuantity"
                  @click="increaseQty"
                >
                  +
                </button>
              </div>
              <span class="text-xs text-slate-400 font-normal">(สั่งซื้อได้ไม่เกิน {{ product.quantity }} ชิ้น)</span>
            </div>

            <!-- Action CTA Buttons -->
            <div class="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                class="py-3 px-4 rounded-xl border-2 border-[#1c4d3e] text-[#1c4d3e] font-bold text-xs sm:text-sm hover:bg-emerald-50 transition flex items-center justify-center gap-2"
                :disabled="adding || product.quantity <= 0"
                @click="addToCart"
              >
                <i class="mdi mdi-cart-outline text-base"></i>
                <span>เพิ่มลงตะกร้า</span>
              </button>

              <button
                type="button"
                class="py-3 px-4 rounded-xl bg-[#1c4d3e] hover:bg-[#14392e] text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
                :disabled="buyingNow || product.quantity <= 0"
                @click="buyNow"
              >
                <i class="mdi mdi-lightning-bolt text-base"></i>
                <span>ซื้อเลย</span>
              </button>
            </div>

            <!-- Service Guarantee Pills -->
            <div class="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-[11px] text-slate-600">
              <div class="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <i class="mdi mdi-shield-check-outline text-[#1c4d3e] text-lg"></i>
                <div>
                  <span class="font-bold text-slate-800 block">ชำระเงินปลอดภัย</span>
                  <span class="text-slate-400 text-[10px]">Secure Payment</span>
                </div>
              </div>
              <div class="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <i class="mdi mdi-truck-delivery-outline text-[#1c4d3e] text-lg"></i>
                <div>
                  <span class="font-bold text-slate-800 block">จัดส่งทั่วประเทศ</span>
                  <span class="text-slate-400 text-[10px]">1-3 วันทำการ</span>
                </div>
              </div>
              <div class="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <i class="mdi mdi-[#1c4d3e]-sync text-[#1c4d3e] text-lg"></i>
                <div>
                  <span class="font-bold text-slate-800 block">เปลี่ยน/คืนสินค้า</span>
                  <span class="text-slate-400 text-[10px]">ภายใน 7 วัน</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>

    <!-- TAB SUB-BAR -->
    <section class="sticky top-20 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-8 overflow-x-auto text-xs sm:text-sm font-bold scrollbar-none">
          <button
            type="button"
            class="py-4 border-b-2 transition shrink-0"
            :class="activeTab === 'details' ? 'border-[#1c4d3e] text-[#1c4d3e]' : 'border-transparent text-slate-600 hover:text-slate-900'"
            @click="activeTab = 'details'"
          >
            รายละเอียดสินค้า
          </button>
          <button
            type="button"
            class="py-4 border-b-2 transition shrink-0"
            :class="activeTab === 'specs' ? 'border-[#1c4d3e] text-[#1c4d3e]' : 'border-transparent text-slate-600 hover:text-slate-900'"
            @click="activeTab = 'specs'"
          >
            ข้อมูลเพิ่มเติม
          </button>
          <button
            type="button"
            class="py-4 border-b-2 transition shrink-0"
            :class="activeTab === 'shipping' ? 'border-[#1c4d3e] text-[#1c4d3e]' : 'border-transparent text-slate-600 hover:text-slate-900'"
            @click="activeTab = 'shipping'"
          >
            การจัดส่งและการคืนสินค้า
          </button>
          <button
            type="button"
            class="py-4 border-b-2 transition shrink-0"
            :class="activeTab === 'reviews' ? 'border-[#1c4d3e] text-[#1c4d3e]' : 'border-transparent text-slate-600 hover:text-slate-900'"
            @click="activeTab = 'reviews'"
          >
            รีวิว (120)
          </button>
        </div>
      </div>
    </section>

    <!-- MAIN BODY CONTAINER (2 COLUMNS) -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <!-- LEFT COLUMN: PRODUCT SPECS, STORY & RECOMMENDED PRODUCTS -->
        <div class="lg:col-span-8 space-y-10">

          <!-- SECTION 1: รายละเอียดสินค้า & เรื่องราวของผลิตภัณฑ์ -->
          <section class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div class="flex items-center gap-2">
              <i class="mdi mdi-clipboard-text-outline text-2xl text-[#1c4d3e]"></i>
              <h2 class="text-xl font-bold text-slate-900">รายละเอียดสินค้า</h2>
            </div>

            <p class="text-sm text-slate-600 leading-relaxed">
              {{ product.description || 'ผ้าทอมอญลายโบราณ ทอด้วยมือโดยช่างฝีมือในชุมชนมอญสังขละบุรี ลวดลายดั้งเดิมที่สืบทอดกันมาหลายชั่วอายุคน ผสมผสานสีธรรมชาติ ให้ความสวยงามและมีเอกลักษณ์ เหมาะสำหรับตัดเสื้อผ้า ผ้าพันคอ หรือของตกแต่งบ้าน' }}
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <!-- Specs List -->
              <ul class="space-y-3 text-xs sm:text-sm text-slate-700">
                <li class="flex items-start gap-2">
                  <span class="font-bold text-slate-900 shrink-0">📌 วัสดุ :</span>
                  <span>ฝ้าย 100%</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="font-bold text-slate-900 shrink-0">📏 ขนาด :</span>
                  <span>กว้าง 100 ซม. x ยาว 200 ซม.</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="font-bold text-slate-900 shrink-0">⚖️ น้ำหนัก :</span>
                  <span>ประมาณ 350 กรัม</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="font-bold text-slate-900 shrink-0">🎨 สี :</span>
                  <span>น้ำเงิน-แดง-ทอง (ย้อมสีธรรมชาติ)</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="font-bold text-slate-900 shrink-0">📍 แหล่งผลิต :</span>
                  <span>อ.สังขละบุรี จ.กาญจนบุรี</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="font-bold text-slate-900 shrink-0">🧼 การดูแลรักษา :</span>
                  <span>ซักมือในน้ำเย็น ไม่ฟอกขาว ตากลม</span>
                </li>
              </ul>

              <!-- Product Story Box -->
              <div class="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-3">
                <h4 class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <i class="mdi mdi-auto-fix text-[#1c4d3e]"></i>
                  เรื่องราวของผลิตภัณฑ์
                </h4>
                <p class="text-xs text-slate-600 leading-relaxed">
                  ลวดลายของผ้าทอมอญแต่ละผืนบอกเล่าเรื่องราวและความเชื่อของชาวมอญสังขละบุรี โดยลายนี้เป็นลายโบราณที่ใช้ในงานมงคล มีความหมายถึงความเจริญรุ่งเรืองและความสงบสุข
                </p>
                <div class="rounded-xl overflow-hidden aspect-16/9 bg-slate-100">
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80" alt="ช่างฝีมือชุมชน" class="w-full h-full object-cover" />
                </div>
                <button type="button" class="w-full py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition flex items-center justify-center gap-1">
                  <i class="mdi mdi-book-open-page-variant-outline"></i>
                  <span>อ่านเรื่องราวเพิ่มเติม</span>
                </button>
              </div>
            </div>
          </section>

          <!-- SECTION 2: สินค้าอื่นจากร้านนี้ (OTHER PRODUCTS FROM THIS SHOP) -->
          <section class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-slate-900">สินค้าอื่นจากร้านนี้</h2>
              <RouterLink :to="`/shops/${shop.shopId}`" class="text-xs font-semibold text-[#1c4d3e] hover:underline">ดูทั้งหมด ></RouterLink>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <RouterLink
                v-for="op in otherShopProducts"
                :key="op.id"
                :to="`/shops/${shop.shopId}`"
                class="group bg-white rounded-2xl overflow-hidden border border-slate-200 p-3 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div class="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                    <img :src="op.image" :alt="op.name" class="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <h4 class="font-bold text-slate-900 text-xs group-hover:text-[#1c4d3e] transition line-clamp-1">{{ op.name }}</h4>
                </div>
                <div class="flex items-center justify-between text-xs mt-3 pt-2 border-t border-slate-100">
                  <span class="font-black text-slate-900">{{ formatPrice(op.price) }}</span>
                  <span class="font-bold text-amber-500 text-[10px] flex items-center gap-0.5"><i class="mdi mdi-star"></i>{{ op.rating }}</span>
                </div>
              </RouterLink>
            </div>
          </section>

          <!-- SECTION 3: สินค้าที่คุณอาจสนใจ (RECOMMENDED PRODUCTS) -->
          <section class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-slate-900">สินค้าที่คุณอาจสนใจ</h2>
              <RouterLink to="/shops" class="text-xs font-semibold text-[#1c4d3e] hover:underline">ดูทั้งหมด ></RouterLink>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <RouterLink
                v-for="rp in recommendedProducts"
                :key="rp.id"
                to="/shops"
                class="group bg-white rounded-2xl overflow-hidden border border-slate-200 p-3 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div class="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                    <img :src="rp.image" :alt="rp.name" class="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <h4 class="font-bold text-slate-900 text-xs group-hover:text-[#1c4d3e] transition line-clamp-1">{{ rp.name }}</h4>
                </div>
                <div class="flex items-center justify-between text-xs mt-3 pt-2 border-t border-slate-100">
                  <span class="font-black text-slate-900">{{ formatPrice(rp.price) }}</span>
                  <span class="font-bold text-amber-500 text-[10px] flex items-center gap-0.5"><i class="mdi mdi-star"></i>{{ rp.rating }}</span>
                </div>
              </RouterLink>
            </div>
          </section>

        </div>

        <!-- RIGHT SIDEBAR COLUMN: SELLER CARD, MAP & REVIEWS BREAKDOWN -->
        <div class="lg:col-span-4 space-y-6 sticky top-24">

          <!-- CARD 1: ร้านผู้จำหน่าย (SELLER CARD) -->
          <div class="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 class="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">ร้านผู้จำหน่าย</h3>

            <div class="flex items-center gap-3">
              <img
                :src="imageUrl(shop.coverImageUrl) || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'"
                :alt="shop.shopName"
                class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div>
                <h4 class="font-bold text-slate-900 text-sm flex items-center gap-1">
                  <span>{{ shop.shopName }}</span>
                  <i class="mdi mdi-check-circle text-emerald-600 text-xs"></i>
                </h4>
                <p class="text-[11px] text-slate-500">{{ shop.categoryName || 'หัตถกรรม' }} • {{ shop.districtName || 'อ.สังขละบุรี' }}</p>
                <div class="flex items-center gap-1 text-[10px] text-amber-500 font-bold mt-0.5">
                  <i class="mdi mdi-star"></i>
                  <span>4.8 (120 รีวิว)</span>
                </div>
              </div>
            </div>

            <dl class="space-y-2 text-xs text-slate-600 pt-1">
              <div class="flex items-center gap-2">
                <i class="mdi mdi-phone-outline text-[#1c4d3e]"></i>
                <span>{{ shop.phone || '082-345-6789' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="mdi mdi-clock-outline text-[#1c4d3e]"></i>
                <span>เปิด จันทร์ - อาทิตย์ 08:00 - 18:00 น.</span>
              </div>
              <div class="flex items-start gap-2">
                <i class="mdi mdi-map-marker-outline text-[#1c4d3e] shrink-0 mt-0.5"></i>
                <span>{{ shop.address || 'บ้านวังก์กะ หมู่ 2 ต.หนองลู อ.สังขละบุรี จ.กาญจนบุรี 71240' }}</span>
              </div>
            </dl>

            <RouterLink
              :to="`/shops/${shop.shopId}`"
              class="block w-full py-2.5 rounded-xl border border-slate-200 text-center font-bold text-xs text-slate-700 hover:bg-slate-50 transition"
            >
              เข้าชมร้านค้า
            </RouterLink>
          </div>

          <!-- CARD 2: ตำแหน่งร้าน (SHOP LOCATION MAP CARD) -->
          <div class="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 class="font-bold text-slate-900 text-base">ตำแหน่งร้าน</h3>

            <div class="rounded-2xl overflow-hidden border border-slate-200 h-44">
              <div ref="mapContainer" class="w-full h-full bg-emerald-50/50"></div>
            </div>

            <button
              type="button"
              class="w-full py-2 rounded-xl border border-slate-200 text-center font-bold text-xs text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1"
              @click="openMapDirections"
            >
              <i class="mdi mdi-map-marker-outline"></i>
              <span>ดูแผนที่ขนาดใหญ่</span>
            </button>
          </div>

          <!-- CARD 3: รีวิวจากลูกค้า (CUSTOMER REVIEWS BREAKDOWN CARD) -->
          <div class="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="font-bold text-slate-900 text-base">รีวิวจากลูกค้า</h3>
              <span class="text-xs text-slate-400">จาก 120 รีวิว</span>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-3xl font-black text-amber-500">4.8</span>
              <div class="text-xs space-y-0.5">
                <div class="flex text-amber-400">
                  <i v-for="s in 5" :key="s" class="mdi mdi-star"></i>
                </div>
                <span class="text-slate-400 text-[10px]">2 สัปดาห์ที่แล้ว</span>
              </div>
            </div>

            <!-- Star Distribution Rating Bars -->
            <div class="space-y-1.5 text-[11px] text-slate-500">
              <div class="flex items-center gap-2">
                <span class="w-4 font-bold">5★</span>
                <div class="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div class="h-full bg-amber-400 w-[80%] rounded-full"></div>
                </div>
                <span class="w-6 text-right font-semibold">94</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-4 font-bold">4★</span>
                <div class="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div class="h-full bg-amber-400 w-[15%] rounded-full"></div>
                </div>
                <span class="w-6 text-right font-semibold">18</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-4 font-bold">3★</span>
                <div class="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div class="h-full bg-amber-400 w-[4%] rounded-full"></div>
                </div>
                <span class="w-6 text-right font-semibold">6</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-4 font-bold">2★</span>
                <div class="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div class="h-full bg-amber-400 w-[1%] rounded-full"></div>
                </div>
                <span class="w-6 text-right font-semibold">1</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-4 font-bold">1★</span>
                <div class="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div class="h-full bg-amber-400 w-[1%] rounded-full"></div>
                </div>
                <span class="w-6 text-right font-semibold">1</span>
              </div>
            </div>

            <!-- Customer Review Item -->
            <div class="pt-3 border-t border-slate-100 text-xs space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80" alt="ณัฐวดี พ." class="w-6 h-6 rounded-full object-cover" />
                  <span class="font-bold text-slate-800">ณัฐวดี พ.</span>
                </div>
                <span class="font-bold text-amber-500 text-[11px] flex items-center gap-0.5"><i class="mdi mdi-star"></i>5</span>
              </div>
              <p class="text-slate-600 leading-relaxed">
                ผ้าสวยมาก สีสวยถูกใจ ทอผ้านุ่มละเอียด จัดส่งไว แพ็คดีมากประทับใจร้านนี้มาก
              </p>

              <div class="grid grid-cols-3 gap-1.5 pt-1">
                <img src="https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=200&q=80" class="aspect-square w-full rounded-lg object-cover" />
                <img src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=200&q=80" class="aspect-square w-full rounded-lg object-cover" />
                <img src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=200&q=80" class="aspect-square w-full rounded-lg object-cover" />
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- BOTTOM VALUE PROPOSITION BAR (4 PROMISES) -->
      <section class="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#1c4d3e]">
            <i class="mdi mdi-seal-variant text-xl"></i>
          </div>
          <div>
            <span class="font-bold text-slate-900 block">มั่นใจได้ของแท้จากชุมชน</span>
            <span class="text-slate-400 text-[10px]">สนับสนุนชุมชนท้องถิ่น</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#1c4d3e]">
            <i class="mdi mdi-hand-heart-outline text-xl"></i>
          </div>
          <div>
            <span class="font-bold text-slate-900 block">สินค้า Handmade</span>
            <span class="text-slate-400 text-[10px]">ทำด้วยมือทุกผืน</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#1c4d3e]">
            <i class="mdi mdi-shield-check-outline text-xl"></i>
          </div>
          <div>
            <span class="font-bold text-slate-900 block">ปลอดภัย 100%</span>
            <span class="text-slate-400 text-[10px]">ชำระเงินปลอดภัย</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#1c4d3e]">
            <i class="mdi mdi-[#1c4d3e]-sync text-xl"></i>
          </div>
          <div>
            <span class="font-bold text-slate-900 block">คืนสินค้าฟรี</span>
            <span class="text-slate-400 text-[10px]">ภายใน 7 วัน</span>
          </div>
        </div>
      </section>

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
