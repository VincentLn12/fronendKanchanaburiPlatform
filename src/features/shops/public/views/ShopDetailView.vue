<script setup lang="ts">
// Public storefront - Emerald Nature Shop Detail View
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getShop } from '../api/shopApi'
import { getShopProducts } from '../api/productApi'
import type { Shop } from '../../shared/types/shop'
import type { Product } from '../../shared/types/product'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const route = useRoute()
const shop = ref<Shop | null>(null)
const products = ref<Product[]>([])
const loading = ref(true)
const productSearch = ref('')
const swal = useSwal()

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(/\/api$/, '')

function imageUrl(url?: string) {
  if (!url) return undefined
  return url.startsWith('/') ? `${apiOrigin}${url}` : url
}

function copyShopLink() {
  navigator.clipboard.writeText(window.location.href)
  swal.success('คัดลอกลิงก์ร้านค้าเรียบร้อยแล้ว')
}

const filteredProducts = computed(() => {
  if (!products.value) return []
  return products.value.filter((p) => {
    const matchName = !productSearch.value || p.productName.toLowerCase().includes(productSearch.value.toLowerCase())
    return matchName
  })
})

onMounted(async () => {
  try {
    shop.value = await getShop(String(route.params.id))
    if (shop.value) {
      products.value = await getShopProducts(shop.value.shopId)
    }
  } catch (error) {
    await swal.error('ไม่พบร้านค้า', getApiErrorMessage(error, 'ร้านค้าอาจถูกปิดหรือไม่มีอยู่จริงในระบบ'))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50/60 pb-24">
    <!-- Back Navigation Top Bar -->
    <div class="border-b border-slate-200/80 bg-white shadow-xs">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <RouterLink
          to="/shops"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
        >
          <i class="mdi mdi-arrow-left text-sm"></i>
          <span>กลับไปหน้าร้านค้าทั้งหมด</span>
        </RouterLink>

        <button
          v-if="shop"
          class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-xs transition hover:bg-slate-50 hover:text-slate-900"
          @click="copyShopLink"
        >
          <i class="mdi mdi-share-variant-outline text-sm text-emerald-600"></i>
          <span class="hidden sm:inline">แชร์ร้านค้านี้</span>
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div class="h-64 w-full animate-pulse rounded-3xl bg-slate-200"></div>
      <div class="h-40 w-full animate-pulse rounded-3xl bg-slate-200"></div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 3" :key="i" class="h-64 animate-pulse rounded-2xl bg-slate-200"></div>
      </div>
    </div>

    <template v-else-if="shop">
      <!-- Shop Hero Header Banner (Emerald Nature Theme) -->
      <section class="relative bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white">
        <!-- Cover Background Image if exists -->
        <div v-if="shop.coverImageUrl" class="absolute inset-0 overflow-hidden">
          <img :src="imageUrl(shop.coverImageUrl)" :alt="shop.shopName" class="h-full w-full object-cover opacity-25 blur-xs scale-105" />
          <div class="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/80 to-transparent"></div>
        </div>

        <div class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <!-- Shop Profile Info -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <!-- Avatar / Logo Frame -->
              <div class="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white/20 bg-gradient-to-br from-emerald-600 to-teal-800 shadow-2xl backdrop-blur-md sm:h-28 sm:w-28">
                <img v-if="shop.coverImageUrl" :src="imageUrl(shop.coverImageUrl)" :alt="shop.shopName" class="h-full w-full object-cover" />
                <i v-else class="mdi mdi-storefront text-5xl text-white"></i>
              </div>

              <!-- Shop Meta Details -->
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 border border-emerald-400/30 backdrop-blur-md">
                    <i class="mdi mdi-tag-outline text-emerald-300"></i>
                    {{ shop.categoryName ?? 'ร้านค้าชุมชน' }}
                  </span>
                  <span class="inline-flex items-center gap-1 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-300 border border-teal-400/30 backdrop-blur-md">
                    <i class="mdi mdi-check-decagram text-emerald-400"></i>
                    ร้านค้าได้รับการยืนยัน
                  </span>
                </div>

                <h1 class="mt-2 text-2xl font-extrabold tracking-tight sm:text-4xl text-white">
                  {{ shop.shopName }}
                </h1>

                <!-- District & Phone quick info -->
                <div class="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-emerald-100/80 sm:text-sm">
                  <span class="flex items-center gap-1">
                    <i class="mdi mdi-map-marker text-emerald-400 text-base"></i>
                    {{ shop.districtName ?? shop.address ?? 'กาญจนบุรี' }}
                  </span>
                  <span v-if="shop.phone" class="flex items-center gap-1">
                    <i class="mdi mdi-phone text-emerald-300 text-base"></i>
                    {{ shop.phone }}
                  </span>
                  <span v-if="shop.email" class="flex items-center gap-1">
                    <i class="mdi mdi-email-outline text-emerald-300 text-base"></i>
                    {{ shop.email }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Header Action Button -->
            <div class="flex items-center gap-3 pt-4 sm:pt-0 border-t border-emerald-800/60 md:border-none">
              <a
                v-if="shop.phone"
                :href="`tel:${shop.phone}`"
                class="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-95"
              >
                <i class="mdi mdi-phone-call text-base"></i>
                <span>โทรติดต่อร้าน</span>
              </a>
              <button
                class="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                @click="copyShopLink"
              >
                <i class="mdi mdi-link-variant text-base"></i>
                <span>คัดลอกลิงก์</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Section Container -->
      <main class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="grid gap-8 lg:grid-cols-12">
          <!-- Left Sidebar: Shop Information Details -->
          <div class="lg:col-span-4 space-y-6">
            <!-- About Shop Card -->
            <div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 class="flex items-center gap-2 text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                <i class="mdi mdi-information-outline text-emerald-600 text-xl"></i>
                เกี่ยวกับร้านค้า
              </h2>

              <p class="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {{ shop.description || 'ยินดีต้อนรับสู่ร้านค้าของเรา เรามุ่งมั่นคัดสรรสินค้าคุณภาพเพื่อคุณลูกค้าทุกท่าน' }}
              </p>

              <!-- Quick Info List -->
              <div class="mt-6 space-y-4 border-t border-slate-100 pt-5 text-sm">
                <div class="flex items-start gap-3">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <i class="mdi mdi-map-marker text-lg"></i>
                  </div>
                  <div>
                    <span class="block text-xs font-semibold text-slate-400 uppercase">ที่อยู่ / สถานที่ตั้ง</span>
                    <span class="font-medium text-slate-800">{{ shop.address || shop.districtName || '-' }}</span>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <i class="mdi mdi-phone text-lg"></i>
                  </div>
                  <div>
                    <span class="block text-xs font-semibold text-slate-400 uppercase">เบอร์โทรศัพท์</span>
                    <a v-if="shop.phone" :href="`tel:${shop.phone}`" class="font-medium text-emerald-700 hover:underline">{{ shop.phone }}</a>
                    <span v-else class="font-medium text-slate-800">-</span>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime-50 text-lime-700">
                    <i class="mdi mdi-email-outline text-lg"></i>
                  </div>
                  <div>
                    <span class="block text-xs font-semibold text-slate-400 uppercase">อีเมลติดต่อ</span>
                    <span class="font-medium text-slate-800">{{ shop.email || '-' }}</span>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <i class="mdi mdi-store-check-outline text-lg"></i>
                  </div>
                  <div>
                    <span class="block text-xs font-semibold text-slate-400 uppercase">สถานะร้านค้า</span>
                    <span class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 mt-1">
                      <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      {{ shop.status === 'Active' ? 'เปิดให้บริการ' : shop.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Content: Shop Products -->
          <div class="lg:col-span-8 space-y-6">
            <!-- Header for Products Grid -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-xl font-extrabold text-slate-900">สินค้าในร้าน</h2>
                  <span class="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
                    {{ products.length }} รายการ
                  </span>
                </div>
                <p class="mt-1 text-xs text-slate-500">เลือกดูสินค้าคุณภาพและสั่งซื้อได้ทันที</p>
              </div>

              <!-- Product Search Box -->
              <div v-if="products.length > 0" class="relative min-w-[240px]">
                <input
                  v-model="productSearch"
                  type="text"
                  placeholder="ค้นหาสินค้าในร้าน..."
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
                <i class="mdi mdi-magnify absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base"></i>
              </div>
            </div>

            <!-- Empty Products State -->
            <div
              v-if="products.length === 0"
              class="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 px-6 text-center shadow-sm"
            >
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
                <i class="mdi mdi-package-variant-remove text-3xl"></i>
              </div>
              <h3 class="text-lg font-bold text-slate-800">ร้านนี้ยังไม่มีรายการสินค้า</h3>
              <p class="mt-1 max-w-sm text-xs text-slate-500">
                ทางร้านกำลังเตรียมทยอยลงรายการสินค้า กรุณาแวะกลับมาเยี่ยมชมอีกครั้งในเร็วๆ นี้
              </p>
            </div>

            <!-- No search matches -->
            <div
              v-else-if="filteredProducts.length === 0"
              class="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500"
            >
              <i class="mdi mdi-magnify-remove text-4xl text-slate-300 mb-2 block"></i>
              ไม่พบสินค้าที่ตรงกับคำค้นหา "{{ productSearch }}"
            </div>

            <!-- Products Grid -->
            <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <RouterLink
                v-for="product in filteredProducts"
                :key="product.productId"
                :to="`/products/${product.productId}`"
                class="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-600/10"
              >
                <!-- Product Image -->
                <div class="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    v-if="product.imageUrl"
                    :src="imageUrl(product.imageUrl)"
                    :alt="product.productName"
                    class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  <div v-else class="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-400">
                    <i class="mdi mdi-image-off-outline text-4xl opacity-50"></i>
                    <span class="mt-1 text-xs font-semibold">ไม่มีรูปภาพ</span>
                  </div>

                  <!-- Price Tag Badge Floating bottom left -->
                  <div class="absolute bottom-3 left-3">
                    <span class="inline-flex items-center rounded-xl bg-slate-900/85 px-3 py-1.5 text-xs font-extrabold text-white backdrop-blur-md border border-white/20 shadow-md">
                      ฿ {{ Number(product.price).toLocaleString('th-TH') }}
                    </span>
                  </div>

                  <!-- Stock Status floating top right -->
                  <div class="absolute top-3 right-3">
                    <span
                      v-if="product.quantity > 0"
                      class="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md shadow-xs"
                    >
                      มีสินค้า
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md shadow-xs"
                    >
                      สินค้าหมด
                    </span>
                  </div>
                </div>

                <!-- Product Info Body -->
                <div class="flex flex-1 flex-col p-5">
                  <h3 class="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {{ product.productName }}
                  </h3>

                  <p class="mt-1.5 flex-1 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                    {{ product.description || 'ดูรายละเอียดเพิ่มเติมของสินค้านี้' }}
                  </p>

                  <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span class="text-xs font-semibold text-slate-400">
                      คงเหลือ {{ product.quantity }} ชิ้น
                    </span>
                    <span class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                      ดูสินค้า
                      <i class="mdi mdi-arrow-right text-xs transition-transform group-hover:translate-x-1"></i>
                    </span>
                  </div>
                </div>
              </RouterLink>
            </div>
          </div>
        </div>
      </main>
    </template>

    <div v-else class="mx-auto max-w-md py-20 text-center">
      <div class="flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-500 mx-auto mb-4">
        <i class="mdi mdi-store-off-outline text-4xl"></i>
      </div>
      <h2 class="text-2xl font-bold text-slate-800">ไม่พบร้านค้าที่ต้องการ</h2>
      <p class="mt-2 text-sm text-slate-500">ร้านค้านี้อาจถูกลบหรือระงับการใช้งานในขณะนี้</p>
      <RouterLink
        to="/shops"
        class="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
      >
        <i class="mdi mdi-arrow-left"></i>
        <span>กลับไปหน้าร้านค้า</span>
      </RouterLink>
    </div>
  </div>
</template>
