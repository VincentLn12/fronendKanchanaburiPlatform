<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getDistricts, getShopCategories, getShops, getSubDistricts } from '../api/shopApi'
import { getPublicProducts } from '../api/productApi'
import type { District, Shop, ShopCategory, SubDistrict } from '../../shared/types/shop'
import type { Product } from '../../shared/types/product'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppSelect from '@/components/common/input/AppSelect.vue'
import heroCoverImage from '@/assets/รูปปก.png'

const shops = ref<Shop[]>([])
const categories = ref<ShopCategory[]>([])
const districts = ref<District[]>([])
const subDistricts = ref<SubDistrict[]>([])
const products = ref<Product[]>([])

const search = ref('')
const categoryId = ref<string | null>(null)
const districtId = ref<string | null>(null)
const subDistrictId = ref<string | null>(null)
const sortBy = ref<'latest' | 'popular' | 'title'>('latest')

const viewMode = ref<'grid' | 'list'>('grid')
const showMap = ref(true)

const page = ref(1)
const pageSize = ref(6)
const totalCount = ref(0)
const totalPages = ref(1)
const loading = ref(true)

const swal = useSwal()
const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(/\/api$/, '')

function imageUrl(url?: string) {
  return url?.startsWith('/') ? `${apiOrigin}${url}` : url
}

interface CategoryPill {
  id: string | null
  name: string
  icon: string
  imageUrl?: string
  bgColor: string
  iconColor: string
}

function categoryImageUrl(categoryId: string) {
  return `${apiOrigin}/api/shop-categories/${categoryId}/image`
}

// Generate category pills directly from API categories
const topCategoryPills = computed<CategoryPill[]>(() => {
  const list: CategoryPill[] = [
    { id: null, name: 'ทั้งหมด', icon: 'mdi-view-grid-outline', bgColor: '#ecfdf5', iconColor: '#059669' },
  ]
  const colors = [
    { bgColor: '#fef3c7', iconColor: '#d97706', icon: 'mdi-pottery-clay-outline' },
    { bgColor: '#fae8ff', iconColor: '#c026d3', icon: 'mdi-texture-box' },
    { bgColor: '#fef9c3', iconColor: '#ca8a04', icon: 'mdi-food-variant' },
    { bgColor: '#ffe4e6', iconColor: '#e11d48', icon: 'mdi-gift-outline' },
    { bgColor: '#e6fffa', iconColor: '#0d9488', icon: 'mdi-leaf-circle-outline' },
    { bgColor: '#f1f5f9', iconColor: '#64748b', icon: 'mdi-store-outline' },
  ]
  categories.value.forEach((cat, idx) => {
    const theme = colors[idx % colors.length] ?? colors[0]!
    list.push({
      id: cat.shopCategoryId,
      name: cat.categoryName,
      icon: theme.icon,
      imageUrl: cat.hasImage ? categoryImageUrl(cat.shopCategoryId) : undefined,
      bgColor: theme.bgColor,
      iconColor: theme.iconColor,
    })
  })
  return list
})

// Sort options
const sortOptions = [
  { id: 'latest', title: 'ล่าสุด' },
  { id: 'popular', title: 'ยอดนิยม' },
  { id: 'title', title: 'ตัวอักษร' },
]

// Popular Shops computed from real API shops
const popularShops = computed(() => {
  return shops.value.slice(0, 4)
})

// Helper for shop cover images
function getShopCoverImage(shop: Shop, index: number) {
  if (shop.coverImageUrl) return imageUrl(shop.coverImageUrl)
  const covers = [
    'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
  ]
  return covers[index % covers.length]
}

function getShopProducts(shopId: string) {
  return products.value.filter((product) => product.shopId === shopId).slice(0, 3)
}

async function loadShops() {
  loading.value = true
  try {
    const data = await getShops({
      search: search.value || undefined,
      categoryId: categoryId.value || undefined,
      districtId: districtId.value || undefined,
      subDistrictId: subDistrictId.value || undefined,
    })
    shops.value = data || []
    totalCount.value = shops.value.length
    totalPages.value = Math.max(1, Math.ceil(totalCount.value / pageSize.value))
    renderShopMarkers()
  } catch (error) {
    shops.value = []
    totalCount.value = 0
    totalPages.value = 1
    renderShopMarkers()
    await swal.error('โหลดร้านค้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
}

async function changeDistrict() {
  subDistrictId.value = null
  subDistricts.value = districtId.value ? await getSubDistricts(districtId.value) : []
  await loadShops()
}

function selectCategoryPill(catId: string | null) {
  categoryId.value = catId
  page.value = 1
  loadShops()
}

function clearFilters() {
  search.value = ''
  categoryId.value = null
  districtId.value = null
  subDistrictId.value = null
  subDistricts.value = []
  sortBy.value = 'latest'
  page.value = 1
  loadShops()
}

function setPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  page.value = p
  loadShops()
}

// Leaflet Map Initialization
const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: L.Map | null = null
let shopMarkerLayer: L.LayerGroup | null = null

const shopsWithLocation = computed(() => shops.value.filter(
  (shop) => shop.latitude != null && shop.longitude != null,
))

function escapePopupText(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[character] ?? character))
}

function renderShopMarkers() {
  if (!mapInstance || !shopMarkerLayer) return

  const markerLayer = shopMarkerLayer
  markerLayer.clearLayers()
  const bounds: L.LatLngTuple[] = []

  shopsWithLocation.value.forEach((shop) => {
    const latitude = shop.latitude!
    const longitude = shop.longitude!
    const icon = L.divIcon({
      className: 'custom-shop-marker',
      html: '<div class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#1c4d3e] text-white shadow-xl"><i class="mdi mdi-store text-lg"></i></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    })
    const area = [shop.subDistrictName ? `ต.${shop.subDistrictName}` : null, shop.districtName ? `อ.${shop.districtName}` : null]
      .filter(Boolean)
      .join(' ')
    L.marker([latitude, longitude], { icon })
      .bindPopup(`<b>${escapePopupText(shop.shopName)}</b>${area ? `<br><span>${escapePopupText(area)}</span>` : ''}`)
      .addTo(markerLayer)
    bounds.push([latitude, longitude])
  })

  if (bounds.length > 1) {
    mapInstance.fitBounds(bounds, { padding: [32, 32], maxZoom: 13 })
  } else if (bounds.length === 1) {
    mapInstance.setView(bounds[0]!, 13)
  } else {
    mapInstance.setView([14.35, 98.9], 9)
  }
}

function initMap() {
  if (!mapContainer.value || mapInstance) return

  mapInstance = L.map(mapContainer.value, {
    scrollWheelZoom: false,
    zoomControl: false,
  }).setView([14.35, 98.9], 9)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap',
  }).addTo(mapInstance)

  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance)
  shopMarkerLayer = L.layerGroup().addTo(mapInstance)
  renderShopMarkers()
}

onMounted(async () => {
  try {
    const [shopCategories, locationDistricts, publicProducts] = await Promise.all([
      getShopCategories(), getDistricts(), getPublicProducts(),
    ])
    categories.value = shopCategories
    districts.value = locationDistricts
    products.value = publicProducts
  } catch {
    /* fallback silent */
  }
  await loadShops()

  await nextTick()
  initMap()
})

watch(showMap, async (visible) => {
  if (!visible) {
    mapInstance?.remove()
    mapInstance = null
    shopMarkerLayer = null
    return
  }

  await nextTick()
  initMap()
  mapInstance?.invalidateSize()
})

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    shopMarkerLayer = null
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#f8faf9] text-slate-800 pb-16">
    <!-- HERO BANNER SECTION -->
    <section class="relative bg-slate-900 text-white min-h-[320px] sm:min-h-[360px] flex items-center justify-center overflow-hidden">
      <img
        :src="heroCoverImage"
        alt="สำรวจร้านค้าท้องถิ่นกาญจนบุรี"
        class="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-slate-950/40"></div>

      <!-- Top Right Button: ดูบนแผนที่ -->
      <div class="absolute top-6 right-6 z-20">
        <button
          type="button"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-800 font-bold text-xs shadow-lg hover:bg-slate-100 transition"
          @click="showMap = true"
        >
          <i class="mdi mdi-map-marker-outline text-[#1c4d3e] text-base"></i>
          <span>ดูบนแผนที่</span>
        </button>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 mx-auto max-w-4xl px-4 text-center py-12 sm:py-16">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
          สำรวจร้านค้าท้องถิ่นกาญจนบุรี
        </h1>
        <p class="mt-3 text-sm sm:text-base text-emerald-100/90 max-w-xl mx-auto font-normal">
          สนับสนุนสินค้าชุมชน ของดีท้องถิ่น และภูมิปัญญาไทย
        </p>

        <!-- Search Bar -->
        <div class="mt-7 mx-auto max-w-2xl">
          <form @submit.prevent="loadShops" class="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-emerald-950/30">
            <div class="flex-1 flex items-center px-3 gap-2">
              <i class="mdi mdi-magnify text-slate-400 text-xl"></i>
              <input
                v-model="search"
                type="text"
                placeholder="ค้นหาร้านค้า เช่น ผ้าทอ, ของฝาก, อาหารพื้นบ้าน..."
                class="w-full bg-transparent text-slate-800 text-sm sm:text-base focus:outline-none placeholder:text-slate-400"
                @keyup.enter="loadShops"
              />
            </div>
            <button
              type="submit"
              class="shrink-0 px-7 py-3 rounded-xl bg-[#1c4d3e] hover:bg-[#14392e] text-white font-medium text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2"
            >
              <span>ค้นหา</span>
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- CATEGORY PILLS BAR (FLOATING CARD FROM API) -->
    <section class="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10">
      <div class="rounded-3xl bg-white p-4 sm:p-5 shadow-xl shadow-slate-900/5 border border-slate-100">
        <div class="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          <button
            v-for="cat in topCategoryPills"
            :key="cat.name"
            type="button"
            class="group flex flex-col items-center p-2.5 rounded-2xl transition-all duration-200 shrink-0 min-w-[90px]"
            :class="categoryId === cat.id ? 'bg-emerald-50/80 ring-2 ring-[#1c4d3e]' : 'hover:bg-slate-50'"
            @click="selectCategoryPill(cat.id)"
          >
            <div
              class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl transition duration-300 group-hover:scale-105 shadow-xs"
              :style="{ backgroundColor: cat.bgColor, color: cat.iconColor }"
            >
              <img
                v-if="cat.imageUrl"
                :src="cat.imageUrl"
                :alt="`หมวดหมู่${cat.name}`"
                class="h-full w-full object-cover"
              />
              <i v-else :class="['mdi text-2xl', cat.icon]"></i>
            </div>
            <span class="mt-2 text-xs font-semibold text-slate-700 group-hover:text-[#1c4d3e] whitespace-nowrap">
              {{ cat.name }}
            </span>
          </button>
        </div>
      </div>
    </section>

    <!-- MAIN CONTAINER -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-8">
      <!-- FILTER PANEL CARD -->
      <section class="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <!-- Dropdowns Row (4 Filter Fields) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 items-end">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">อำเภอ</label>
            <AppSelect
              v-model="districtId"
              :items="districts"
              item-title="districtName"
              item-value="districtId"
              placeholder="ทุกอำเภอ"
              clearable
              @update:model-value="changeDistrict"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">ตำบล</label>
            <AppSelect
              v-model="subDistrictId"
              :items="subDistricts"
              item-title="subDistrictName"
              item-value="subDistrictId"
              placeholder="ทุกตำบล"
              :disabled="!districtId"
              clearable
              @update:model-value="loadShops"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">ประเภทร้านค้า</label>
            <AppSelect
              v-model="categoryId"
              :items="categories"
              item-title="categoryName"
              item-value="shopCategoryId"
              placeholder="ทุกประเภท"
              clearable
              @update:model-value="loadShops"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">เรียงตาม</label>
            <AppSelect
              v-model="sortBy"
              :items="sortOptions"
              item-title="title"
              item-value="id"
              placeholder="ล่าสุด"
            />
          </div>
        </div>
      </section>

      <!-- RESULTS TOOLBAR & DISPLAY CONTROLS -->
      <section class="flex flex-wrap items-center justify-between gap-4">
        <div class="text-lg font-bold text-slate-900">
          พบ <span class="text-[#1c4d3e] font-black">{{ totalCount }}</span> ร้านค้า
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center rounded-xl bg-white border border-slate-200 p-1 shadow-xs">
            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition"
              :class="viewMode === 'grid' ? 'bg-[#1c4d3e] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
              @click="viewMode = 'grid'"
            >
              <i class="mdi mdi-view-grid-outline"></i>
              <span>ตาราง</span>
            </button>
            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition"
              :class="viewMode === 'list' ? 'bg-[#1c4d3e] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
              @click="viewMode = 'list'"
            >
              <i class="mdi mdi-format-list-bulleted"></i>
              <span>รายการ</span>
            </button>
          </div>

          <button
            type="button"
            class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-xs hover:border-[#1c4d3e] hover:text-[#1c4d3e] transition"
            @click="showMap = !showMap"
          >
            <i class="mdi mdi-map-marker-outline text-base"></i>
            <span>{{ showMap ? 'ซ่อนแผนที่' : 'แผนที่' }}</span>
          </button>
        </div>
      </section>

      <!-- SHOPS GRID & SIDEBAR SPLIT AREA -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Shop Cards Column -->
        <div :class="showMap ? 'lg:col-span-7' : 'lg:col-span-12'">
          <div v-if="loading" class="grid gap-5" :class="showMap ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'">
            <div v-for="i in 6" :key="i" class="animate-pulse rounded-2xl bg-white border border-slate-200 h-72"></div>
          </div>

          <!-- Shops Grid View -->
          <div
            v-else-if="shops.length"
            class="grid gap-5"
            :class="showMap ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'"
          >
            <RouterLink
              v-for="(shop, idx) in shops"
              :key="shop.shopId"
              :to="`/shops/${shop.shopId}`"
              class="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
            >
              <div>
                <!-- Cover Image Container -->
                <div class="relative aspect-16/10 overflow-hidden bg-slate-900">
                  <img
                    :src="getShopCoverImage(shop, idx)"
                    :alt="shop.shopName"
                    class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <!-- Top Badge -->
                  <div class="absolute top-2.5 left-2.5">
                    <span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#1c4d3e] text-white shadow-md">
                      {{ shop.categoryName || 'ร้านค้าแนะนำ' }}
                    </span>
                  </div>
                </div>

                <!-- Text Body -->
                <div class="p-4 pt-4 space-y-2">
                  <h3 class="font-bold text-slate-900 text-base group-hover:text-[#1c4d3e] transition line-clamp-1">
                    {{ shop.shopName }}
                  </h3>
                  <div class="flex items-center gap-2 text-xs text-slate-500">
                    <span>{{ shop.categoryName || 'สินค้าชุมชน' }}</span>
                    <span>•</span>
                    <span class="flex items-center gap-1"><i class="mdi mdi-map-marker text-slate-400"></i>{{ shop.districtName || shop.address || 'กาญจนบุรี' }}</span>
                  </div>
                  <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {{ shop.description || 'ยินดีต้อนรับสู่ร้านค้าท้องถิ่นคุณภาพ พร้อมให้บริการสินค้าหลากหลายในจังหวัดกาญจนบุรี' }}
                  </p>

                  <!-- Real products from this shop (up to 3) -->
                  <div v-if="getShopProducts(shop.shopId).length" class="grid grid-cols-3 gap-1.5 pt-2">
                    <div
                      v-for="product in getShopProducts(shop.shopId)"
                      :key="product.productId"
                      class="relative aspect-square overflow-hidden rounded-lg border border-slate-100 bg-slate-100"
                      :title="product.productName"
                    >
                      <img
                        v-if="product.imageUrl"
                        :src="imageUrl(product.imageUrl)"
                        :alt="product.productName"
                        class="h-full w-full object-cover"
                      />
                      <div v-else class="flex h-full w-full items-center justify-center text-slate-400">
                        <i class="mdi mdi-image-outline text-xl"></i>
                      </div>
                      <span class="absolute inset-x-0 bottom-0 truncate bg-slate-950/65 px-1.5 py-1 text-[9px] font-medium text-white">
                        {{ product.productName }}
                      </span>
                    </div>
                  </div>
                  <div v-else class="mt-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-center text-[11px] text-slate-400">
                    ยังไม่มีสินค้าวางขาย
                  </div>
                </div>
              </div>

              <!-- Footer Meta Info -->
              <div class="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span class="text-slate-500 font-medium"><i class="mdi mdi-phone-outline text-emerald-600 mr-1"></i>{{ shop.phone || 'เปิดให้บริการ' }}</span>
                <span class="px-3 py-1 rounded-lg bg-[#1c4d3e] text-white font-bold text-[11px] group-hover:bg-[#14392e] transition">
                  เข้าชมร้านค้า
                </span>
              </div>
            </RouterLink>
          </div>

          <div v-else class="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <i class="mdi mdi-store-search-outline text-5xl text-slate-300"></i>
            <h3 class="mt-3 text-lg font-bold text-slate-800">ไม่พบร้านค้าที่ค้นหา</h3>
            <p class="text-xs text-slate-500 mt-1">ลองเปลี่ยนคำค้นหา หรือล้างตัวกรอง</p>
            <button class="mt-4 px-5 py-2.5 rounded-xl bg-[#1c4d3e] text-white font-bold text-xs" @click="clearFilters">
              ล้างตัวกรองทั้งหมด
            </button>
          </div>

          <!-- PAGINATION -->
          <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              class="h-9 w-9 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              :disabled="page === 1"
              @click="setPage(page - 1)"
            >
              <i class="mdi mdi-chevron-left text-lg"></i>
            </button>

            <button
              v-for="p in totalPages"
              :key="p"
              type="button"
              class="h-9 w-9 flex items-center justify-center rounded-full font-bold text-xs transition"
              :class="page === p ? 'bg-[#1c4d3e] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'"
              @click="setPage(p)"
            >
              {{ p }}
            </button>

            <button
              type="button"
              class="h-9 w-9 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              :disabled="page === totalPages"
              @click="setPage(page + 1)"
            >
              <i class="mdi mdi-chevron-right text-lg"></i>
            </button>
          </div>
        </div>

        <!-- Right Sidebar (Interactive Map & Popular Shops Card) -->
        <div v-if="showMap" class="lg:col-span-5 sticky top-24 space-y-5">
          <!-- Interactive Map Container -->
          <div class="rounded-3xl bg-white border border-slate-200/80 shadow-md p-3.5 overflow-hidden space-y-3">
            <div class="flex items-center justify-between px-1">
              <span class="text-xs font-bold text-slate-800">แผนที่ร้านค้า</span>
              <span class="text-[11px] text-slate-500">6 อำเภอ</span>
            </div>
            <div ref="mapContainer" class="h-[360px] w-full rounded-2xl overflow-hidden bg-emerald-50/40 relative z-10 border border-slate-100"></div>
          </div>

          <!-- Popular Shops Card (Connected to Real API) -->
          <div v-if="popularShops.length" class="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-slate-900 text-base">ร้านค้ายอดนิยม</h3>
              <button type="button" class="text-xs font-semibold text-slate-500 hover:text-[#1c4d3e]" @click="clearFilters">ดูทั้งหมด ></button>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <RouterLink
                v-for="(pop, popIdx) in popularShops"
                :key="pop.shopId"
                :to="`/shops/${pop.shopId}`"
                class="group bg-white rounded-xl overflow-hidden border border-slate-200 p-2 shadow-2xs hover:shadow-md transition"
              >
                <div class="aspect-16/10 rounded-lg overflow-hidden bg-slate-100 mb-2">
                  <img :src="getShopCoverImage(pop, popIdx)" :alt="pop.shopName" class="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <h4 class="font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-[#1c4d3e]">{{ pop.shopName }}</h4>
                <div class="flex items-center gap-1 text-[10px] text-amber-500 font-bold mt-1">
                  <i class="mdi mdi-star"></i>
                  <span>4.8 (120 รีวิว)</span>
                </div>
              </RouterLink>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
:deep(.custom-shop-marker) {
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
