<script setup lang="ts">
// Public storefront - Emerald Nature Product Detail View with Multi-Quantity Support
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
const selectedImage = ref<string | null>(null)
const quantity = ref(1)
const loading = ref(true)
const swal = useSwal()
const adding = ref(false)
const buyingNow = ref(false)

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(/\/api$/, '')

function imageUrl(url?: string) {
  return url?.startsWith('/') ? `${apiOrigin}${url}` : url
}

const images = computed(() =>
  product.value
    ? [product.value.imageUrl, ...(product.value.detailImages ?? [])].filter((url): url is string => Boolean(url))
    : []
)

const maxQuantity = computed(() => {
  if (!product.value) return 1
  return Math.max(1, product.value.quantity)
})

const totalPrice = computed(() => {
  if (!product.value) return 0
  return Number(product.value.price) * quantity.value
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

onMounted(async () => {
  try {
    product.value = await getPublicProduct(String(route.params.id))
    shop.value = await getShop(product.value.shopId)
    selectedImage.value = images.value[0] ?? null
  } catch (error) {
    await swal.error('ไม่พบสินค้า', getApiErrorMessage(error, 'สินค้านี้อาจถูกปิดการขายหรือไม่มีอยู่ในระบบ'))
  } finally {
    loading.value = false
  }
})

async function addToCart() {
  if (!product.value) return
  if (!auth.isLoggedIn) {
    await router.push('/login')
    return
  }
  adding.value = true
  try {
    await cartStore.add(product.value.productId, quantity.value)
    await swal.success('เพิ่มสินค้าลงตะกร้าแล้ว', `เพิ่ม ${product.value.productName} จำนวน ${quantity.value} ชิ้น เรียบร้อยแล้ว`)
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
</script>

<template>
  <div class="min-h-screen bg-slate-50/60 pb-24">
    <!-- Top Breadcrumb Bar -->
    <div class="border-b border-slate-200/80 bg-white shadow-xs">
      <div class="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8">
        <nav class="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto">
          <RouterLink to="/" class="hover:text-emerald-600">หน้าแรก</RouterLink>
          <i class="mdi mdi-chevron-right text-slate-300"></i>
          <RouterLink to="/shops" class="hover:text-emerald-600">ร้านค้า</RouterLink>
          <template v-if="shop">
            <i class="mdi mdi-chevron-right text-slate-300"></i>
            <RouterLink :to="`/shops/${shop.shopId}`" class="hover:text-emerald-600 truncate max-w-[150px] sm:max-w-xs">
              {{ shop.shopName }}
            </RouterLink>
          </template>
          <template v-if="product">
            <i class="mdi mdi-chevron-right text-slate-300"></i>
            <span class="text-slate-900 truncate max-w-[180px] sm:max-w-xs">{{ product.productName }}</span>
          </template>
        </nav>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-6 h-96 animate-pulse rounded-3xl bg-slate-200"></div>
        <div class="lg:col-span-6 space-y-4">
          <div class="h-6 w-1/3 animate-pulse rounded bg-slate-200"></div>
          <div class="h-10 w-3/4 animate-pulse rounded bg-slate-200"></div>
          <div class="h-12 w-1/2 animate-pulse rounded bg-slate-200"></div>
          <div class="h-32 w-full animate-pulse rounded-2xl bg-slate-200"></div>
        </div>
      </div>
    </div>

    <main v-else-if="product && shop" class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid gap-10 lg:grid-cols-12">
        <!-- Left Column: Product Gallery -->
        <div class="lg:col-span-6 space-y-4">
          <!-- Main Display Image Box -->
          <div class="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
            <img
              v-if="selectedImage"
              :src="imageUrl(selectedImage)"
              :alt="product.productName"
              class="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <div v-else class="flex flex-col items-center text-slate-400">
              <i class="mdi mdi-image-off-outline text-5xl"></i>
              <span class="mt-2 text-sm">ไม่มีรูปภาพสินค้า</span>
            </div>

            <!-- Floating Badges -->
            <div class="absolute top-4 left-4">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/90 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md shadow-sm">
                <i class="mdi mdi-leaf text-lime-300"></i>
                สินค้าคุณภาพกาญจนบุรี
              </span>
            </div>

            <div class="absolute top-4 right-4">
              <span
                v-if="product.quantity > 0"
                class="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md"
              >
                <i class="mdi mdi-check-circle text-emerald-400"></i>
                พร้อมส่ง (เหลือ {{ product.quantity }} ชิ้น)
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 rounded-full bg-rose-600/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md"
              >
                <i class="mdi mdi-alert-circle text-white"></i>
                สินค้าหมดชั่วคราว
              </span>
            </div>
          </div>

          <!-- Gallery Thumbnails -->
          <div v-if="images.length > 1" class="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            <button
              v-for="img in images"
              :key="img"
              class="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all"
              :class="selectedImage === img ? 'border-emerald-600 ring-2 ring-emerald-200 scale-95' : 'border-slate-200 opacity-75 hover:opacity-100'"
              @click="selectedImage = img"
            >
              <img :src="imageUrl(img)" :alt="product.productName" class="h-full w-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Right Column: Product Specs, Quantity Selector & CTA -->
        <div class="lg:col-span-6 space-y-6">
          <div class="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <!-- Merchant Category Pill & Link -->
            <div class="flex items-center justify-between">
              <RouterLink
                :to="`/shops/${shop.shopId}`"
                class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full"
              >
                <i class="mdi mdi-storefront text-sm"></i>
                {{ shop.shopName }}
              </RouterLink>

              <span class="text-xs text-slate-400">รหัสสินค้า: #{{ product.productId.slice(0, 8) }}</span>
            </div>

            <!-- Title -->
            <h1 class="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {{ product.productName }}
            </h1>

            <!-- Price Display Section -->
            <div class="mt-4 flex items-baseline gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50/50 p-4 border border-emerald-100">
              <div class="text-3xl font-black text-emerald-700 sm:text-4xl">
                ฿ {{ Number(product.price).toLocaleString('th-TH') }}
              </div>
              <span class="text-xs text-slate-500 font-medium">/ ชิ้น (ราคารวมภาษีแล้ว)</span>
            </div>

            <!-- Multi-Quantity Selection Controls -->
            <div class="mt-6 border-t border-b border-slate-100 py-6 space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <i class="mdi mdi-numeric text-emerald-600 text-lg"></i>
                  จำนวนที่ต้องการซื้อ:
                </label>
                <span class="text-xs text-slate-500">
                  คลังสินค้ามีทั้งหมด <strong class="text-emerald-700">{{ product.quantity }}</strong> ชิ้น
                </span>
              </div>

              <div class="flex items-center gap-4">
                <!-- Counter Controls -->
                <div class="flex items-center rounded-2xl border border-slate-300 bg-slate-50/80 p-1 shadow-xs">
                  <button
                    class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-xs transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white"
                    :disabled="quantity <= 1 || product.quantity <= 0"
                    @click="decreaseQty"
                  >
                    <i class="mdi mdi-minus text-base"></i>
                  </button>

                  <input
                    v-model.number="quantity"
                    type="number"
                    min="1"
                    :max="maxQuantity"
                    class="w-16 text-center text-lg font-bold text-slate-900 outline-none bg-transparent"
                    :disabled="product.quantity <= 0"
                    @blur="validateQty"
                  />

                  <button
                    class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-xs transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white"
                    :disabled="quantity >= maxQuantity || product.quantity <= 0"
                    @click="increaseQty"
                  >
                    <i class="mdi mdi-plus text-base"></i>
                  </button>
                </div>

                <!-- Subtotal Preview -->
                <div class="flex-1 text-right">
                  <div class="text-xs text-slate-500">ราคารวมทั้งสิ้น</div>
                  <div class="text-xl font-extrabold text-emerald-700">
                    ฿ {{ totalPrice.toLocaleString('th-TH') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- CTA Buttons -->
            <div class="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                class="flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-emerald-600 bg-emerald-50 px-5 font-bold text-emerald-700 transition hover:bg-emerald-100 active:scale-95 disabled:opacity-50"
                :disabled="adding || product.quantity <= 0"
                @click="addToCart"
              >
                <i class="mdi mdi-cart-plus text-xl" :class="{ 'animate-spin mdi-loading': adding }"></i>
                <span>{{ adding ? 'กำลังบันทึก...' : 'เพิ่มลงตะกร้า' }}</span>
              </button>

              <button
                class="flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                :disabled="buyingNow || product.quantity <= 0"
                @click="buyNow"
              >
                <i class="mdi mdi-lightning-bolt text-xl" :class="{ 'animate-spin mdi-loading': buyingNow }"></i>
                <span>{{ buyingNow ? 'กำลังนำไปชำระเงิน...' : 'ซื้อทันที' }}</span>
              </button>
            </div>
          </div>

          <!-- Description Card -->
          <div class="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 class="flex items-center gap-2 text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              <i class="mdi mdi-text-box-search-outline text-emerald-600 text-xl"></i>
              รายละเอียดสินค้า
            </h2>
            <p class="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {{ product.description || 'ไม่มีรายละเอียดสินค้าเพิ่มเติมสำหรับรายการนี้' }}
            </p>
          </div>

          <!-- Merchant / Shop Card -->
          <div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-emerald-600 text-white font-bold shadow-sm">
                  <img v-if="shop.coverImageUrl" :src="imageUrl(shop.coverImageUrl)" :alt="shop.shopName" class="h-full w-full object-cover" />
                  <i v-else class="mdi mdi-storefront text-2xl"></i>
                </div>
                <div>
                  <h3 class="font-bold text-slate-900">{{ shop.shopName }}</h3>
                  <p class="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <i class="mdi mdi-map-marker text-emerald-600"></i>
                    {{ shop.address || shop.districtName || 'กาญจนบุรี' }}
                  </p>
                </div>
              </div>

              <RouterLink
                :to="`/shops/${shop.shopId}`"
                class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
              >
                เข้าชมร้านค้า
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Product Not Found State -->
    <div v-else class="mx-auto max-w-md py-20 text-center">
      <div class="flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-500 mx-auto mb-4">
        <i class="mdi mdi-package-variant-remove text-4xl"></i>
      </div>
      <h2 class="text-2xl font-bold text-slate-800">ไม่พบสินค้ารายการนี้</h2>
      <p class="mt-2 text-sm text-slate-500">สินค้านี้อาจถูกยกเลิกหรือไม่มีในระบบแล้ว</p>
      <RouterLink
        to="/shops"
        class="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
      >
        <i class="mdi mdi-arrow-left"></i>
        <span>กลับไปเลือกสินค้าจากร้านค้า</span>
      </RouterLink>
    </div>
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

/* Hide spin buttons for Firefox/Chrome on number input */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
