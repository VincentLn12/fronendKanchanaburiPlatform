<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getDistricts, getShopCategories, getShops, getSubDistricts } from '../api/shopApi'
import { getPublicProducts } from '../api/productApi'
import type { District, Shop, ShopCategory, SubDistrict } from '../../shared/types/shop'
import type { Product } from '../../shared/types/product'
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

// View Mode: 'shops' (Shop Cards Grid) or 'map' (Large Map View)
const viewMode = ref<'shops' | 'map'>('shops')
const selectedShopId = ref<string | null>(null)

const page = ref(1)
const pageSize = ref(6)
const totalCount = ref(0)
const totalPages = ref(1)
const loading = ref(true)

const rawApiUrl = import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api'
const apiOrigin = rawApiUrl.startsWith('http')
  ? rawApiUrl.replace(/\/api$/, '')
  : 'https://localhost:7289'

function imageUrl(url?: string) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return url.startsWith('/') ? `${apiOrigin}${url}` : `${apiOrigin}/${url}`
}

interface CategoryTab {
  id: string | null
  name: string
  icon: string
  color?: string
}

const categoryTabs = ref<CategoryTab[]>([
  { id: null, name: 'ทั้งหมด', icon: 'mdi-plus-box-outline', color: 'text-emerald-700' },
])

const defaultCovers = [
  'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
]

const sortOptions = [
  { id: 'latest', title: 'ล่าสุด' },
  { id: 'popular', title: 'ยอดนิยม' },
  { id: 'title', title: 'ตัวอักษร A-Z' },
]

// Popular Recommended Shops Sidebar Items
const popularSidebarShops = computed(() => {
  return shops.value.slice(0, 4)
})

function getShopCoverImage(shop: Shop, index: number) {
  if (shop.coverImageUrl) return imageUrl(shop.coverImageUrl)
  return defaultCovers[index % defaultCovers.length] || ''
}

function getShopProducts(shopId: string) {
  return products.value.filter((product) => product.shopId === shopId).slice(0, 4)
}

function getShopItemCount(shopId: string) {
  return products.value.filter((product) => product.shopId === shopId).length
}

// Track images that failed to load
const brokenImageKeys = ref<Set<string>>(new Set())
function markImageBroken(key: string) {
  brokenImageKeys.value = new Set(brokenImageKeys.value).add(key)
}
function isImageBroken(key: string) {
  return brokenImageKeys.value.has(key)
}

const isValidGuid = (id: string | null) =>
  !!id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)

async function loadShops() {
  loading.value = true
  try {
    const data = await getShops({
      search: search.value || undefined,
      categoryId: isValidGuid(categoryId.value) ? categoryId.value! : undefined,
      districtId: isValidGuid(districtId.value) ? districtId.value! : undefined,
      subDistrictId: isValidGuid(subDistrictId.value) ? subDistrictId.value! : undefined,
      page: page.value,
      pageSize: pageSize.value,
    })

    shops.value = data || []
  } catch (err) {
    console.error('Failed to load shops from API:', err)
    shops.value = []
  } finally {
    totalCount.value = shops.value.length
    totalPages.value = Math.max(1, Math.ceil(totalCount.value / pageSize.value))
    if (viewMode.value === 'map') {
      renderShopMarkers()
    }
    loading.value = false
  }
}

async function changeDistrict() {
  subDistrictId.value = null
  if (districtId.value) {
    try {
      subDistricts.value = await getSubDistricts(districtId.value)
    } catch {
      subDistricts.value = []
    }
  } else {
    subDistricts.value = []
  }
  await loadShops()
}

function selectCategoryTab(catId: string | null) {
  categoryId.value = catId
  page.value = 1
  loadShops()
}

function clearSearch() {
  search.value = ''
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

// Leaflet Map Logic
const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: L.Map | null = null
let shopMarkerLayer: L.LayerGroup | null = null
let shopMarkerMap = new Map<string, L.Marker>()

const shopsWithLocation = computed(() =>
  shops.value.filter((shop) => shop.latitude != null && shop.longitude != null),
)

function escapePopupText(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[character] ?? character,
  )
}

function renderShopMarkers() {
  if (!mapInstance || !shopMarkerLayer) return

  const markerLayer = shopMarkerLayer
  markerLayer.clearLayers()
  shopMarkerMap.clear()
  const bounds: L.LatLngTuple[] = []

  shopsWithLocation.value.forEach((shop, idx) => {
    const latitude = shop.latitude!
    const longitude = shop.longitude!
    const coverUrl = getShopCoverImage(shop, idx)
    const isSelected = selectedShopId.value === shop.shopId

    const icon = L.divIcon({
      className: 'custom-shop-marker',
      html: `
        <div class="shop-marker-wrapper group cursor-pointer flex flex-col items-center">
          <div class="relative flex items-center justify-center">
            <div class="absolute -inset-1 rounded-full bg-emerald-400/40 animate-pulse"></div>
            <div class="relative h-11 w-11 rounded-full ${isSelected ? 'bg-amber-500 scale-110 ring-4 ring-amber-300' : 'bg-gradient-to-br from-[#1c4d3e] to-[#0f3026]'} text-white border-2 border-white shadow-xl flex items-center justify-center transition-all duration-300 group-hover:scale-115">
              <i class="mdi mdi-storefront text-xl text-emerald-200"></i>
            </div>
          </div>
          <div class="mt-1.5 px-2.5 py-1 rounded-full bg-white/95 text-[11px] font-extrabold text-slate-800 shadow-lg border border-slate-200/90 backdrop-blur-md whitespace-nowrap transition-all duration-200 group-hover:scale-105 group-hover:bg-white group-hover:border-emerald-500">
            ${escapePopupText(shop.shopName)}
          </div>
        </div>
      `,
      iconSize: [46, 60],
      iconAnchor: [23, 34],
      popupAnchor: [0, -32]
    })

    const area = [
      shop.subDistrictName ? `ต.${shop.subDistrictName}` : null,
      shop.districtName ? `อ.${shop.districtName}` : null,
    ]
      .filter(Boolean)
      .join(' ')

    const popupHtml = `
      <div class="shop-popup-card group/pop relative overflow-hidden bg-white text-left font-sans rounded-2xl">
        <div class="relative h-28 w-full overflow-hidden bg-slate-900">
          ${coverUrl ? `<img src="${coverUrl}" alt="${escapePopupText(shop.shopName)}" class="h-full w-full object-cover group-hover/pop:scale-108 transition duration-500" />` : `<div class="h-full w-full bg-gradient-to-br from-[#1c4d3e] to-slate-900 flex items-center justify-center text-emerald-200"><i class="mdi mdi-storefront text-3xl"></i></div>`}
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
          <span class="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-md bg-white/90 text-slate-900 text-[10px] font-black shadow-xs backdrop-blur-xs">
            ${escapePopupText(shop.categoryName || 'ร้านค้า')}
          </span>
        </div>
        <div class="p-3 space-y-1.5">
          <h4 class="font-extrabold text-slate-900 text-sm leading-tight line-clamp-1">
            ${escapePopupText(shop.shopName)}
          </h4>
          ${area ? `<div class="flex items-center gap-1 text-[11px] font-semibold text-emerald-700"><i class="mdi mdi-map-marker text-xs"></i><span>${escapePopupText(area)}</span></div>` : ''}
          <div class="pt-2">
            <a href="/shops/${shop.shopId}" class="!text-white flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-[#1c4d3e] hover:bg-[#153b30] text-xs font-extrabold shadow-md transition-all duration-200 active:scale-95">
              <span class="!text-white">ดูรายละเอียดร้านค้า</span>
              <i class="mdi mdi-arrow-right text-xs !text-white"></i>
            </a>
          </div>
        </div>
      </div>
    `

    const marker = L.marker([latitude, longitude], { icon }).bindPopup(popupHtml, {
      className: 'custom-leaflet-popup',
      closeButton: true,
      maxWidth: 240,
    })

    marker.on('click', () => {
      selectedShopId.value = shop.shopId
      const element = document.getElementById(`sidebar-shop-${shop.shopId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    })

    marker.addTo(markerLayer)
    shopMarkerMap.set(shop.shopId, marker)
    bounds.push([latitude, longitude])
  })

  if (bounds.length > 1) {
    mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
  } else if (bounds.length === 1) {
    mapInstance.setView(bounds[0]!, 13)
  } else {
    mapInstance.setView([14.35, 99.1], 9)
  }
}

function initMap() {
  if (!mapContainer.value || mapInstance) return

  mapInstance = L.map(mapContainer.value, {
    scrollWheelZoom: true,
    zoomControl: false,
  }).setView([14.35, 99.1], 9)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap',
  }).addTo(mapInstance)

  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance)
  shopMarkerLayer = L.layerGroup().addTo(mapInstance)
  renderShopMarkers()
}

function flyToShop(shop: Shop) {
  selectedShopId.value = shop.shopId
  if (mapInstance && shop.latitude != null && shop.longitude != null) {
    mapInstance.flyTo([shop.latitude, shop.longitude], 15, { animate: true, duration: 1 })
    const marker = shopMarkerMap.get(shop.shopId)
    if (marker) {
      setTimeout(() => {
        marker.openPopup()
      }, 350)
    }
  }
}

function resetMapView() {
  selectedShopId.value = null
  if (mapInstance) {
    renderShopMarkers()
  }
}

watch(viewMode, async (mode) => {
  if (mode === 'map') {
    await nextTick()
    initMap()
    mapInstance?.invalidateSize()
    renderShopMarkers()
  } else {
    if (mapInstance) {
      mapInstance.remove()
      mapInstance = null
      shopMarkerLayer = null
    }
  }
})

onMounted(async () => {
  try {
    const [shopCategories, locationDistricts, publicProducts] = await Promise.all([
      getShopCategories(),
      getDistricts(),
      getPublicProducts(),
    ])
    categories.value = shopCategories || []
    districts.value = locationDistricts || []
    products.value = publicProducts || []

    if (shopCategories && shopCategories.length > 0) {
      categoryTabs.value = [
        { id: null, name: 'ทั้งหมด', icon: 'mdi-plus-box-outline', color: 'text-emerald-700' },
        ...shopCategories.map((c, idx) => {
          const colors = [
            'text-amber-700',
            'text-sky-700',
            'text-orange-700',
            'text-pink-700',
            'text-teal-700',
            'text-purple-700',
          ]
          const icons = [
            'mdi-vase-outline',
            'mdi-book-open-variant',
            'mdi-pot-steam-outline',
            'mdi-gift-outline',
            'mdi-hospital-box-outline',
            'mdi-dots-hexagon',
          ]
          return {
            id: c.shopCategoryId,
            name: c.categoryName,
            icon: icons[idx % icons.length] || 'mdi-tag-outline',
            color: colors[idx % colors.length] || 'text-emerald-700',
          }
        }),
      ]
    }
  } catch (err) {
    console.error('Failed to load initial shops metadata:', err)
  }

  await loadShops()
  if (viewMode.value === 'map') {
    await nextTick()
    initMap()
  }
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
  <div class="min-h-screen bg-[#f3f6f8] text-slate-800 font-sans pb-24">
    <!-- COMPACT HERO BANNER WITH VIEW MODE TOGGLE -->
    <section
      class="relative bg-slate-900 text-white pt-8 pb-10 px-4 sm:px-6 lg:px-12 overflow-hidden shadow-sm"
    >
      <!-- Ambient Background Image -->
      <img
        :src="heroCoverImage"
        alt="สะพานข้ามแม่น้ำแคว กาญจนบุรี"
        class="absolute inset-0 w-full h-full object-cover object-center opacity-45 mix-blend-luminosity filter brightness-95 contrast-125"
      />
      <div
        class="absolute inset-0 bg-gradient-to-r from-black/80 via-slate-950/60 to-black/70"
      ></div>

      <div class="relative z-10 mx-auto max-w-7xl">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div class="space-y-1">
            <h1
              class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight"
            >
              สำรวจร้านค้าท้องถิ่นกาญจนบุรี
            </h1>
            <p class="text-xs sm:text-sm text-slate-200 font-normal">
              สนับสนุนสินค้าชุมชน ของดีท้องถิ่น และภูมิปัญญาไทย
            </p>
          </div>

          <!-- PROMINENT VIEW MODE TOGGLE (รายการร้านค้า vs แผนที่ใหญ่) -->
          <div
            class="self-start md:self-auto inline-flex items-center gap-1.5 p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-md"
          >
            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer"
              :class="
                viewMode === 'shops'
                  ? 'bg-[#1c4d3e] text-white shadow-md'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              "
              @click="viewMode = 'shops'"
            >
              <i class="mdi mdi-storefront-outline text-base"></i>
              <span>รายการร้านค้า</span>
            </button>
            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer"
              :class="
                viewMode === 'map'
                  ? 'bg-[#1c4d3e] text-white shadow-md'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              "
              @click="viewMode = 'map'"
            >
              <i class="mdi mdi-map-marker-radius-outline text-base"></i>
              <span>แผนที่ใหญ่</span>
            </button>
          </div>
        </div>

        <!-- SEARCH INPUT BOX FLOATING IN HERO -->
        <div class="max-w-2xl">
          <div
            class="bg-white rounded-2xl p-1.5 shadow-xl flex items-center gap-2 border border-white/80"
          >
            <div class="pl-3 text-slate-400">
              <i class="mdi mdi-magnify text-xl"></i>
            </div>
            <input
              v-model="search"
              type="text"
              placeholder="ค้นหาร้านค้า เช่น ผ้าทอ, ของฝาก, อาหารพื้นบ้าน..."
              class="w-full bg-transparent border-none px-2 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none placeholder:text-slate-400"
              @keyup.enter="loadShops"
            />
            <button
              v-if="search"
              type="button"
              class="text-slate-400 hover:text-slate-600 p-1"
              @click="clearSearch"
            >
              <i class="mdi mdi-close-circle text-base"></i>
            </button>
            <button
              type="button"
              class="px-5 py-2.5 rounded-xl bg-[#1c4d3e] hover:bg-[#153b30] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-sm"
              @click="loadShops"
            >
              <i class="mdi mdi-magnify text-base"></i>
              <span>ค้นหา</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- MAIN BODY CONTAINER -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 pt-6 space-y-5">
      <!-- CATEGORY PILLS HORIZONTAL BAR -->
      <section class="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80">
        <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            v-for="cat in categoryTabs"
            :key="cat.name"
            type="button"
            class="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border"
            :class="
              categoryId === cat.id
                ? 'bg-[#1c4d3e] border-[#1c4d3e] text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
            "
            @click="selectCategoryTab(cat.id)"
          >
            <i
              :class="['mdi text-base', cat.icon, categoryId === cat.id ? 'text-white' : cat.color]"
            ></i>
            <span>{{ cat.name }}</span>
          </button>
        </div>
      </section>

      <!-- FILTER DROPDOWNS BAR -->
      <section class="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <!-- District -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1">อำเภอ</label>
            <AppSelect
              v-model="districtId"
              :items="districts"
              item-title="districtName"
              item-value="districtId"
              placeholder="ทั้งหมด"
              clearable
              @update:model-value="changeDistrict"
            />
          </div>

          <!-- SubDistrict -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1">ตำบล</label>
            <AppSelect
              v-model="subDistrictId"
              :items="subDistricts"
              item-title="subDistrictName"
              item-value="subDistrictId"
              placeholder="ทั้งหมด"
              :disabled="!districtId"
              clearable
              @update:model-value="loadShops"
            />
          </div>

          <!-- Category -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1">ประเภทร้านค้า</label>
            <AppSelect
              v-model="categoryId"
              :items="categories"
              item-title="categoryName"
              item-value="shopCategoryId"
              placeholder="ทั้งหมด"
              clearable
              @update:model-value="loadShops"
            />
          </div>

          <!-- Sort Order -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1">เรียงตาม</label>
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

      <!-- MODE 1: SHOP CARDS GRID VIEW -->
      <div v-if="viewMode === 'shops'" class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-700">พบ {{ totalCount }} ร้านค้า</h2>

          <button
            v-if="search || districtId || categoryId"
            type="button"
            class="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
            @click="clearFilters"
          >
            <i class="mdi mdi-refresh"></i> ล้างตัวกรอง
          </button>
        </div>

        <!-- Loading Skeletons -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="i in 6"
            :key="i"
            class="animate-pulse bg-white rounded-2xl border border-slate-200 h-80 p-4 space-y-3"
          >
            <div class="h-36 bg-slate-200 rounded-xl"></div>
            <div class="h-4 bg-slate-200 rounded w-3/4"></div>
            <div class="h-3 bg-slate-100 rounded w-1/2"></div>
          </div>
        </div>

        <!-- SHOPS GRID -->
        <div v-else-if="shops.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <RouterLink
            v-for="(shop, idx) in shops"
            :key="shop.shopId"
            :to="`/shops/${shop.shopId}`"
            class="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all duration-200 flex flex-col justify-between overflow-hidden relative"
          >
            <div>
              <!-- Cover Photo with Badge -->
              <div class="relative aspect-16/9 overflow-hidden bg-slate-900">
                <img
                  v-if="!isImageBroken(`shop-${shop.shopId}`)"
                  :src="getShopCoverImage(shop, idx)"
                  :alt="shop.shopName"
                  loading="lazy"
                  class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  @error="markImageBroken(`shop-${shop.shopId}`)"
                />
                <div v-else class="w-full h-full bg-[#1c4d3e] flex items-center justify-center">
                  <i class="mdi mdi-storefront text-4xl text-emerald-200"></i>
                </div>

                <!-- แนะนำ Badge for featured shops -->
                <div v-if="idx < 2" class="absolute top-2.5 left-2.5">
                  <span
                    class="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#1c4d3e] text-white shadow-xs"
                  >
                    แนะนำ
                  </span>
                </div>
              </div>

              <!-- Card Body -->
              <div class="p-4 space-y-2.5">
                <div class="flex items-start gap-3">
                  <!-- Shop Icon/Logo Avatar -->
                  <div
                    class="h-10 w-10 rounded-full bg-[#1c4d3e] border-2 border-white shadow-sm flex items-center justify-center text-white shrink-0 overflow-hidden -mt-7 relative z-10"
                  >
                    <img
                      v-if="!isImageBroken(`shop-avatar-${shop.shopId}`)"
                      :src="getShopCoverImage(shop, idx)"
                      :alt="shop.shopName"
                      class="h-full w-full object-cover"
                      @error="markImageBroken(`shop-avatar-${shop.shopId}`)"
                    />
                    <i v-else class="mdi mdi-storefront text-base"></i>
                  </div>

                  <div class="min-w-0 flex-1">
                    <h3
                      class="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-emerald-800 transition line-clamp-1"
                    >
                      {{ shop.shopName }}
                    </h3>

                    <!-- Category & Location subtitle -->
                    <div
                      class="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 truncate"
                    >
                      <span class="truncate">{{ shop.categoryName || 'หัตถกรรม' }}</span>
                      <span>•</span>
                      <span class="flex items-center text-slate-500 truncate">
                        <i class="mdi mdi-map-marker text-[11px] text-slate-400"></i>
                        อ.{{ shop.districtName || 'กาญจนบุรี' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Description -->
                <p
                  class="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal pt-1"
                >
                  {{
                    shop.description ||
                    'สินค้าชุมชนคุณภาพสูง สั่งซื้อและสนับสนุนภูมิปัญญาท้องถิ่น'
                  }}
                </p>

                <!-- 4 Mini Product Thumbnails -->
                <div
                  v-if="getShopProducts(shop.shopId).length"
                  class="grid grid-cols-4 gap-1.5 pt-1.5"
                >
                  <div
                    v-for="product in getShopProducts(shop.shopId)"
                    :key="product.productId"
                    class="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200/80 group/prod"
                    :title="product.productName"
                  >
                    <img
                      v-if="product.imageUrl && !isImageBroken(`prod-${product.productId}`)"
                      :src="imageUrl(product.imageUrl)"
                      :alt="product.productName"
                      loading="lazy"
                      class="h-full w-full object-cover group-hover/prod:scale-110 transition duration-300"
                      @error="markImageBroken(`prod-${product.productId}`)"
                    />
                    <div
                      v-else
                      class="h-full w-full flex items-center justify-center bg-emerald-50 text-emerald-700"
                    >
                      <i class="mdi mdi-package-variant text-sm"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card Footer: Total Items & "ดูร้านค้า" Button -->
            <div
              class="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs"
            >
              <span class="text-[11px] text-slate-500 font-semibold">
                สินค้า {{ getShopItemCount(shop.shopId) }} รายการ
              </span>

              <span
                class="px-3.5 py-1 rounded-lg bg-[#1c4d3e] text-white font-bold text-[11px] group-hover:bg-[#153b30] transition shadow-2xs"
              >
                ดูร้านค้า
              </span>
            </div>
          </RouterLink>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center space-y-3"
        >
          <div
            class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 mx-auto"
          >
            <i class="mdi mdi-store-search-outline text-3xl"></i>
          </div>
          <h3 class="text-base font-bold text-slate-800">ไม่พบร้านค้าที่ตรงกับเงื่อนไข</h3>
          <p class="text-xs text-slate-500">ลองเปลี่ยนคำค้นหา หรือกดล้างตัวกรอง</p>
          <button
            class="px-5 py-2 rounded-xl bg-[#1c4d3e] text-white font-bold text-xs shadow-sm cursor-pointer"
            @click="clearFilters"
          >
            ล้างตัวกรอง
          </button>
        </div>

        <!-- PAGINATION -->
        <div
          v-if="totalPages > 1 || totalCount > 0"
          class="pt-4 flex items-center justify-center gap-1.5"
        >
          <button
            type="button"
            class="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
            :disabled="page === 1"
            @click="setPage(page - 1)"
          >
            <i class="mdi mdi-chevron-left text-base"></i>
          </button>

          <button
            v-for="p in Math.min(5, totalPages)"
            :key="p"
            type="button"
            class="h-8 w-8 flex items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer"
            :class="
              page === p
                ? 'bg-[#1c4d3e] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            "
            @click="setPage(p)"
          >
            {{ p }}
          </button>

          <span v-if="totalPages > 6" class="px-1 text-slate-400 text-xs font-bold">...</span>

          <button
            v-if="totalPages > 5"
            type="button"
            class="h-8 w-8 flex items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer"
            :class="
              page === totalPages
                ? 'bg-[#1c4d3e] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            "
            @click="setPage(totalPages)"
          >
            {{ totalPages }}
          </button>

          <button
            type="button"
            class="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
            :disabled="page === totalPages"
            @click="setPage(page + 1)"
          >
            <i class="mdi mdi-chevron-right text-base"></i>
          </button>
        </div>

        <!-- POPULAR SHOPS CARD SECTION AT BOTTOM -->
        <section
          v-if="popularSidebarShops.length"
          class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4 mt-8"
        >
          <div class="flex items-center justify-between">
            <h3 class="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <i class="mdi mdi-fire text-emerald-700 text-lg"></i>
              <span>ร้านค้ายอดนิยมแนะนำ</span>
            </h3>
            <button
              type="button"
              class="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
              @click="clearFilters"
            >
              ดูทั้งหมด
            </button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <RouterLink
              v-for="(pop, popIdx) in popularSidebarShops"
              :key="pop.shopId"
              :to="`/shops/${pop.shopId}`"
              class="group block space-y-2 bg-slate-50/60 p-2.5 rounded-xl border border-slate-200/70 hover:border-emerald-500/50 hover:bg-white transition"
            >
              <div
                class="aspect-16/10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative"
              >
                <img
                  v-if="
                    getShopCoverImage(pop, popIdx) && !isImageBroken(`pop-sidebar-${pop.shopId}`)
                  "
                  :src="getShopCoverImage(pop, popIdx)"
                  :alt="pop.shopName"
                  loading="lazy"
                  class="h-full w-full object-cover group-hover:scale-108 transition duration-300"
                  @error="markImageBroken(`pop-sidebar-${pop.shopId}`)"
                />
                <div
                  v-else
                  class="h-full w-full flex items-center justify-center bg-emerald-100 text-emerald-800"
                >
                  <i class="mdi mdi-storefront text-lg"></i>
                </div>
              </div>

              <div class="space-y-0.5">
                <h4
                  class="font-extrabold text-slate-900 text-xs line-clamp-1 group-hover:text-emerald-800 transition leading-tight"
                >
                  {{ pop.shopName }}
                </h4>
                <div class="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span class="text-amber-600 font-extrabold flex items-center gap-0.5">
                    <i class="mdi mdi-star text-xs"></i> 5.0
                  </span>
                  <span>{{ getShopItemCount(pop.shopId) }} สินค้า</span>
                </div>
              </div>
            </RouterLink>
          </div>
        </section>
      </div>

      <!-- MODE 2: LARGE MAP VIEW (แผนที่ใหญ่) -->
      <div
        v-else-if="viewMode === 'map'"
        class="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden h-[calc(100vh-200px)] min-h-[600px] flex flex-col md:flex-row relative"
      >
        <!-- LEFT SIDEBAR: Interactive Shop List Drawer -->
        <div
          class="w-full md:w-80 lg:w-96 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0 z-20 max-h-[35vh] md:max-h-none overflow-hidden shadow-md"
        >
          <!-- Sidebar Header -->
          <div
            class="p-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800"
          >
            <div>
              <h3 class="font-extrabold text-xs sm:text-sm flex items-center gap-1.5">
                <i class="mdi mdi-storefront text-emerald-400"></i>
                <span>ร้านค้าบนแผนที่</span>
              </h3>
              <p class="text-[10px] text-slate-300">
                พบ {{ shopsWithLocation.length }} ร้านค้าที่มีพิกัด
              </p>
            </div>

            <button
              type="button"
              class="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              title="รีเซ็ตมุมมองแผนที่"
              @click="resetMapView"
            >
              <i class="mdi mdi-target text-xs"></i>
              <span>ซูมทั้งหมด</span>
            </button>
          </div>

          <!-- Scrollable Shops List -->
          <div class="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100">
            <div
              v-for="(shop, idx) in shopsWithLocation"
              :id="`sidebar-shop-${shop.shopId}`"
              :key="shop.shopId"
              class="pt-2.5 first:pt-0 group p-2.5 rounded-xl border transition cursor-pointer"
              :class="
                selectedShopId === shop.shopId
                  ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-2 ring-emerald-400/40'
                  : 'bg-white border-slate-100 hover:border-emerald-300 hover:bg-slate-50'
              "
              @click="flyToShop(shop)"
            >
              <div class="flex items-center gap-3">
                <div
                  class="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative"
                >
                  <img
                    v-if="!isImageBroken(`map-side-${shop.shopId}`)"
                    :src="getShopCoverImage(shop, idx)"
                    :alt="shop.shopName"
                    class="h-full w-full object-cover group-hover:scale-108 transition duration-300"
                    @error="markImageBroken(`map-side-${shop.shopId}`)"
                  />
                  <div v-else class="h-full w-full flex items-center justify-center bg-emerald-100 text-emerald-800">
                    <i class="mdi mdi-storefront text-lg"></i>
                  </div>
                </div>

                <div class="min-w-0 flex-1">
                  <h4 class="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-emerald-800 transition">
                    {{ shop.shopName }}
                  </h4>
                  <div class="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                    <i class="mdi mdi-map-marker text-emerald-700 text-xs"></i>
                    <span class="truncate">อ.{{ shop.districtName || 'กาญจนบุรี' }}</span>
                  </div>
                  <div class="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                    {{ shop.categoryName || 'ร้านค้าท้องถิ่น' }}
                  </div>
                </div>
              </div>

              <div class="mt-2 flex items-center justify-between pt-1 text-[11px]">
                <span class="text-slate-500 text-[10px]">
                  <i class="mdi mdi-package-variant text-slate-400"></i> {{ getShopItemCount(shop.shopId) }} รายการ
                </span>

                <RouterLink
                  :to="`/shops/${shop.shopId}`"
                  class="px-2.5 py-1 rounded-md bg-[#1c4d3e] text-white font-bold text-[10px] hover:bg-[#153b30] transition shadow-2xs"
                  @click.stop
                >
                  ดูร้านค้า
                </RouterLink>
              </div>
            </div>

            <div
              v-if="!shopsWithLocation.length"
              class="p-8 text-center text-xs text-slate-400 space-y-1"
            >
              <i class="mdi mdi-map-marker-off text-2xl text-slate-300"></i>
              <p>ไม่พบพิกัดร้านค้าตามเงื่อนไขค้นหา</p>
            </div>
          </div>
        </div>

        <!-- RIGHT AREA: LARGE LEAFLET MAP -->
        <div class="flex-1 h-full w-full relative bg-slate-100">
          <div ref="mapContainer" class="h-full w-full z-10"></div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
:deep(.custom-shop-marker) {
  background: transparent;
  border: none;
}

:deep(.custom-leaflet-popup .leaflet-popup-content-wrapper) {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  padding: 0;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

:deep(.custom-leaflet-popup .leaflet-popup-content) {
  margin: 0;
  width: 230px !important;
}

:deep(.custom-leaflet-popup .leaflet-popup-tip) {
  background: rgba(255, 255, 255, 0.98);
}

:deep(.custom-leaflet-popup .leaflet-popup-close-button) {
  top: 8px !important;
  right: 8px !important;
  color: #ffffff !important;
  background: rgba(15, 23, 42, 0.6) !important;
  backdrop-filter: blur(4px);
  border-radius: 9999px !important;
  width: 22px !important;
  height: 22px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 13px !important;
  z-index: 20 !important;
  transition: all 0.2s ease;
}

:deep(.custom-leaflet-popup .leaflet-popup-close-button:hover) {
  background: rgba(15, 23, 42, 0.9) !important;
  transform: scale(1.1);
}

:deep(.custom-leaflet-popup a),
:deep(.custom-leaflet-popup a:hover),
:deep(.custom-leaflet-popup a:visited),
:deep(.custom-leaflet-popup a span),
:deep(.custom-leaflet-popup a i) {
  color: #ffffff !important;
  text-decoration: none !important;
}

.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
