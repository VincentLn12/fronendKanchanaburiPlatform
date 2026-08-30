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
}

function categoryImageUrl(catId: string) {
  return `${apiOrigin}/api/shop-categories/${catId}/image`
}

// Category pills generated from API data with clean icons
const topCategoryPills = computed<CategoryPill[]>(() => {
  const list: CategoryPill[] = [
    { id: null, name: 'ทั้งหมด', icon: 'mdi-storefront-outline' },
  ]
  const icons = [
    'mdi-basket-outline',
    'mdi-tshirt-crew-outline',
    'mdi-food-variant',
    'mdi-gift-outline',
    'mdi-flower-outline',
    'mdi-glass-cocktail',
    'mdi-hand-wash-outline',
  ]
  categories.value.forEach((cat, idx) => {
    list.push({
      id: cat.shopCategoryId,
      name: cat.categoryName,
      icon: icons[idx % icons.length] ?? 'mdi-store-outline',
      imageUrl: cat.hasImage ? categoryImageUrl(cat.shopCategoryId) : undefined,
    })
  })
  return list
})

// Sort options for AppSelect
const sortOptions = [
  { id: 'latest', title: 'ล่าสุด' },
  { id: 'popular', title: 'ยอดนิยม' },
  { id: 'title', title: 'ตัวอักษร A-Z' },
]

// Top recommended shops computed from active list
const popularShops = computed(() => {
  return shops.value.slice(0, 4)
})

// Helper for shop cover image fallback
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

function formatPrice(value: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(value)
}

// Active Filter Labels computed for badge display
const selectedDistrictName = computed(() => {
  if (!districtId.value) return null
  return districts.value.find((d) => d.districtId === districtId.value)?.districtName
})

const selectedSubDistrictName = computed(() => {
  if (!subDistrictId.value) return null
  return subDistricts.value.find((sd) => sd.subDistrictId === subDistrictId.value)?.subDistrictName
})

const selectedCategoryName = computed(() => {
  if (!categoryId.value) return null
  return categories.value.find((c) => c.shopCategoryId === categoryId.value)?.categoryName
})

const hasActiveFilters = computed(() => {
  return Boolean(search.value || categoryId.value || districtId.value || subDistrictId.value)
})

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

// Leaflet Map Logic
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

  shopsWithLocation.value.forEach((shop, idx) => {
    const latitude = shop.latitude!
    const longitude = shop.longitude!
    const coverUrl = getShopCoverImage(shop, idx)
    
    const icon = L.divIcon({
      className: 'custom-shop-marker',
      html: `
        <div class="group relative flex items-center justify-center cursor-pointer">
          <div class="h-9 w-9 rounded-full bg-[#0d3831] text-white border-2 border-white shadow-xl flex items-center justify-center transition-transform duration-200 hover:scale-115">
            <i class="mdi mdi-storefront text-lg"></i>
          </div>
          <div class="absolute -bottom-1 w-2 h-2 bg-[#0d3831] rotate-45 border-r border-b border-white"></div>
        </div>
      `,
      iconSize: [36, 42],
      iconAnchor: [18, 42],
    })

    const area = [shop.subDistrictName ? `ต.${shop.subDistrictName}` : null, shop.districtName ? `อ.${shop.districtName}` : null]
      .filter(Boolean)
      .join(' ')

    const popupHtml = `
      <div class="p-1 max-w-[220px]">
        <div class="h-24 w-full rounded-lg overflow-hidden bg-slate-100 mb-2">
          <img src="${coverUrl}" alt="${escapePopupText(shop.shopName)}" class="h-full w-full object-cover" />
        </div>
        <div class="font-bold text-slate-900 text-sm leading-snug line-clamp-1">${escapePopupText(shop.shopName)}</div>
        ${area ? `<div class="text-xs text-emerald-800 font-medium mt-0.5"><i class="mdi mdi-map-marker text-xs"></i> ${escapePopupText(area)}</div>` : ''}
        <a href="/shops/${shop.shopId}" class="mt-2 block w-full py-1.5 px-3 rounded-lg bg-[#0d3831] text-white text-center text-xs font-semibold hover:bg-emerald-800 transition">
          ดูรายละเอียดร้านค้า
        </a>
      </div>
    `

    L.marker([latitude, longitude], { icon })
      .bindPopup(popupHtml, { maxWidth: 240 })
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
  <div class="min-h-screen bg-slate-50/70 text-slate-800 pb-20 font-sans">

    <!-- EXECUTIVE HERO BANNER -->
    <section class="relative bg-gradient-to-br from-[#061d19] via-[#0d3831] to-[#041411] text-white overflow-hidden border-b border-emerald-900/30">
      <!-- Ambient Background Photo & Dark Vignette -->
      <img
        :src="heroCoverImage"
        alt="สำรวจร้านค้ากาญจนบุรี"
        class="absolute inset-0 w-full h-full object-cover object-center opacity-25 mix-blend-overlay filter blur-[1px] scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-[#061d19] via-transparent to-black/40"></div>

      <!-- Glowing Light Orbs -->
      <div class="pointer-events-none absolute -right-16 top-10 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-16 bottom-0 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl"></div>

      <!-- Hero Header Content -->
      <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20 text-center">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md mb-4 shadow-sm">
          <i class="mdi mdi-shield-check-outline text-emerald-400 text-sm"></i>
          <span>KANCHANABURI COMMUNITY MARKETPLACE</span>
        </div>

        <h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
          ค้นพบร้านค้าและสินค้าคุณภาพแห่งเมืองกาญจน์
        </h1>
        <p class="mt-3 text-xs sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          ศูนย์รวมสินค้าชุมชน ผ้าทอพื้นเมือง ผลิตภัณฑ์ท้องถิ่น และของฝากขึ้นชื่อจากทั้ง 13 อำเภอ
        </p>

        <!-- Executive Search Bar Box -->
        <div class="mt-8 mx-auto max-w-2xl">
          <form @submit.prevent="loadShops" class="relative flex items-center rounded-2xl bg-white p-2 shadow-2xl border border-white/30 focus-within:ring-2 focus-within:ring-emerald-400/50 transition">
            <div class="flex-1 flex items-center pl-3 pr-2 gap-3">
              <i class="mdi mdi-magnify text-slate-400 text-2xl"></i>
              <input
                v-model="search"
                type="text"
                placeholder="ค้นหาร้านค้า เช่น ผ้าทอสังขละบุรี, ของฝากเมืองกาญจน์..."
                class="w-full bg-transparent text-slate-900 font-medium text-xs sm:text-sm focus:outline-none placeholder:text-slate-400"
                @keyup.enter="loadShops"
              />
              <button
                v-if="search"
                type="button"
                class="text-slate-400 hover:text-slate-600 transition"
                title="ล้างคำค้นหา"
                @click="search = ''; loadShops()"
              >
                <i class="mdi mdi-close-circle text-lg"></i>
              </button>
            </div>
            <button
              type="submit"
              class="shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0d3831] to-[#165246] hover:from-[#13483f] hover:to-[#1c6456] text-white font-semibold text-xs sm:text-sm transition duration-200 shadow-md flex items-center gap-2 active:scale-98"
            >
              <i class="mdi mdi-magnify text-base"></i>
              <span>ค้นหา</span>
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- CATEGORY NAVIGATION CHIPS -->
    <section class="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
      <div class="rounded-2xl bg-white p-3 sm:p-4 shadow-sm border border-slate-200/80">
        <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            v-for="cat in topCategoryPills"
            :key="cat.name"
            type="button"
            class="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-medium transition duration-200 shrink-0 cursor-pointer"
            :class="categoryId === cat.id 
              ? 'bg-[#0d3831] border-[#0d3831] text-white shadow-md shadow-emerald-950/20 font-semibold ring-2 ring-emerald-500/20' 
              : 'bg-white border-slate-200/80 text-slate-700 hover:border-emerald-500/40 hover:bg-emerald-50/50 hover:text-emerald-900'"
            @click="selectCategoryPill(cat.id)"
          >
            <div
              class="h-7 w-7 rounded-lg flex items-center justify-center transition duration-200"
              :class="categoryId === cat.id ? 'bg-white/15 text-white' : 'bg-slate-100 text-emerald-800 group-hover:bg-emerald-100'"
            >
              <img
                v-if="cat.imageUrl"
                :src="cat.imageUrl"
                :alt="cat.name"
                class="h-full w-full object-cover rounded-lg"
              />
              <i v-else :class="['mdi text-base', cat.icon]"></i>
            </div>
            <span class="whitespace-nowrap">{{ cat.name }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- MAIN BODY AREA -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-12 space-y-6">

      <!-- FILTER CONTROLS PANEL -->
      <section class="rounded-2xl bg-white border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 class="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <i class="mdi mdi-tune-vertical text-emerald-700 text-lg"></i>
            <span>ค้นหาตามเงื่อนไขและพื้นที่</span>
          </h2>

          <button
            v-if="hasActiveFilters"
            type="button"
            class="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 transition"
            @click="clearFilters"
          >
            <i class="mdi mdi-refresh text-sm"></i>
            <span>ล้างตัวกรองทั้งหมด</span>
          </button>
        </div>

        <!-- Dropdowns Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
              <i class="mdi mdi-map-marker-outline text-emerald-700"></i>
              <span>เลือกอำเภอ</span>
            </label>
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
            <label class="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
              <i class="mdi mdi-map-marker-radius-outline text-emerald-700"></i>
              <span>เลือกตำบล</span>
            </label>
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
            <label class="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
              <i class="mdi mdi-tag-outline text-emerald-700"></i>
              <span>ประเภทร้านค้า</span>
            </label>
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
            <label class="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
              <i class="mdi mdi-sort-variant text-emerald-700"></i>
              <span>เรียงลำดับ</span>
            </label>
            <AppSelect
              v-model="sortBy"
              :items="sortOptions"
              item-title="title"
              item-value="id"
              placeholder="ล่าสุด"
            />
          </div>
        </div>

        <!-- Active Filters Strip -->
        <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span class="text-slate-400 font-medium">กำลังกรอง:</span>
          
          <span v-if="search" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium">
            คำค้น: "{{ search }}"
            <button type="button" @click="search = ''; loadShops()" class="hover:text-rose-600 ml-0.5"><i class="mdi mdi-close text-xs"></i></button>
          </span>

          <span v-if="selectedDistrictName" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium">
            อำเภอ: {{ selectedDistrictName }}
            <button type="button" @click="districtId = null; changeDistrict()" class="hover:text-rose-600 ml-0.5"><i class="mdi mdi-close text-xs"></i></button>
          </span>

          <span v-if="selectedSubDistrictName" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium">
            ตำบล: {{ selectedSubDistrictName }}
            <button type="button" @click="subDistrictId = null; loadShops()" class="hover:text-rose-600 ml-0.5"><i class="mdi mdi-close text-xs"></i></button>
          </span>

          <span v-if="selectedCategoryName" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium">
            หมวดหมู่: {{ selectedCategoryName }}
            <button type="button" @click="categoryId = null; loadShops()" class="hover:text-rose-600 ml-0.5"><i class="mdi mdi-close text-xs"></i></button>
          </span>
        </div>
      </section>

      <!-- RESULTS TOOLBAR -->
      <section class="flex flex-wrap items-center justify-between gap-4 bg-white px-5 py-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span class="text-sm sm:text-base font-bold text-slate-900">
              ร้านค้าในระบบ
            </span>
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
            {{ totalCount }} รายการ
          </span>
        </div>

        <div class="flex items-center gap-3">
          <!-- View Switch Segmented Button -->
          <div class="flex items-center rounded-xl bg-slate-100/80 p-1 border border-slate-200/80">
            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              :class="viewMode === 'grid' ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'"
              @click="viewMode = 'grid'"
              title="มุมมองตาราง"
            >
              <i class="mdi mdi-grid-large text-sm"></i>
              <span class="hidden sm:inline">ตาราง</span>
            </button>
            
            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              :class="viewMode === 'list' ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'"
              @click="viewMode = 'list'"
              title="มุมมองรายการ"
            >
              <i class="mdi mdi-view-list text-sm"></i>
              <span class="hidden sm:inline">รายการ</span>
            </button>
          </div>

          <div class="h-4 w-px bg-slate-200"></div>

          <!-- Map Switch Button -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition shadow-xs"
            :class="showMap ? 'bg-[#0d3831] border-[#0d3831] text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'"
            @click="showMap = !showMap"
          >
            <i class="mdi mdi-map-marker-outline text-base" :class="showMap ? 'text-emerald-300' : 'text-emerald-800'"></i>
            <span>{{ showMap ? 'ซ่อนแผนที่' : 'แสดงแผนที่' }}</span>
          </button>
        </div>
      </section>

      <!-- CONTENT LAYOUT SPLIT -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- MAIN SHOPS COLUMN -->
        <div :class="showMap ? 'lg:col-span-7' : 'lg:col-span-12'">
          
          <!-- Loading Skeletons -->
          <div v-if="loading" class="grid gap-5" :class="showMap ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'">
            <div v-for="i in 6" :key="i" class="animate-pulse rounded-2xl bg-white border border-slate-200 h-80 p-4 space-y-4">
              <div class="h-40 bg-slate-200 rounded-xl"></div>
              <div class="h-4 bg-slate-200 rounded w-3/4"></div>
              <div class="h-3 bg-slate-100 rounded w-1/2"></div>
              <div class="h-10 bg-slate-100 rounded-xl"></div>
            </div>
          </div>

          <!-- SHOPS GRID VIEW -->
          <div
            v-else-if="shops.length && viewMode === 'grid'"
            class="grid gap-5"
            :class="showMap ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'"
          >
            <RouterLink
              v-for="(shop, idx) in shops"
              :key="shop.shopId"
              :to="`/shops/${shop.shopId}`"
              class="group relative bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-600/30 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div>
                <!-- Cover Image Container -->
                <div class="relative aspect-16/10 overflow-hidden bg-slate-900">
                  <img
                    :src="getShopCoverImage(shop, idx)"
                    :alt="shop.shopName"
                    class="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-95"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

                  <!-- Category Badge -->
                  <div class="absolute top-3 left-3">
                    <span class="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-950/75 backdrop-blur-md text-emerald-300 border border-white/10 shadow-sm">
                      {{ shop.categoryName || 'ร้านค้าชุมชน' }}
                    </span>
                  </div>

                  <!-- Verified Badge -->
                  <div class="absolute top-3 right-3">
                    <span class="h-7 w-7 rounded-full bg-white/90 backdrop-blur-md text-emerald-700 shadow-md flex items-center justify-center text-xs border border-emerald-100" title="ร้านค้าได้รับการยืนยัน">
                      <i class="mdi mdi-check-circle text-base"></i>
                    </span>
                  </div>
                </div>

                <!-- Text Info Body -->
                <div class="p-4 space-y-2.5">
                  <h3 class="font-bold text-slate-900 text-base group-hover:text-emerald-800 transition line-clamp-1">
                    {{ shop.shopName }}
                  </h3>

                  <div class="flex items-center justify-between text-xs text-slate-500">
                    <span class="flex items-center gap-1 text-slate-600 font-medium">
                      <i class="mdi mdi-map-marker text-emerald-700"></i>
                      {{ shop.districtName || shop.address || 'กาญจนบุรี' }}
                    </span>
                    <span class="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                      <i class="mdi mdi-star text-amber-500 text-xs"></i> 4.8
                    </span>
                  </div>

                  <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                    {{ shop.description || 'บริการสินค้าชุมชนคุณภาพและผลิตภัณฑ์จากภูมิปัญญาท้องถิ่นกาญจนบุรี' }}
                  </p>

                  <!-- Real Shop Products Preview -->
                  <div v-if="getShopProducts(shop.shopId).length" class="pt-2 border-t border-slate-100 space-y-1.5">
                    <span class="text-[11px] font-semibold text-slate-500 block">สินค้าแนะนำในร้าน</span>
                    <div class="grid grid-cols-3 gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                      <div
                        v-for="product in getShopProducts(shop.shopId)"
                        :key="product.productId"
                        class="relative aspect-square overflow-hidden rounded-lg bg-white border border-slate-200/60 shadow-2xs group/p"
                        :title="product.productName"
                      >
                        <img
                          v-if="product.imageUrl"
                          :src="imageUrl(product.imageUrl)"
                          :alt="product.productName"
                          class="h-full w-full object-cover group-hover/p:scale-105 transition"
                        />
                        <div v-else class="flex h-full w-full items-center justify-center text-slate-400 bg-slate-50">
                          <i class="mdi mdi-package-variant text-base"></i>
                        </div>
                        <span class="absolute inset-x-0 bottom-0 truncate bg-slate-900/85 px-1 py-0.5 text-[9px] font-semibold text-white text-center">
                          {{ formatPrice(product.price) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Footer -->
              <div class="px-4 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
                <span class="text-slate-500 font-medium flex items-center gap-1">
                  <i class="mdi mdi-phone-outline text-emerald-800"></i>
                  {{ shop.phone || 'เปิดบริการ' }}
                </span>
                <span class="text-emerald-800 font-semibold group-hover:text-emerald-950 flex items-center gap-1 transition">
                  <span>ดูรายละเอียด</span>
                  <i class="mdi mdi-arrow-right text-xs group-hover:translate-x-0.5 transition"></i>
                </span>
              </div>
            </RouterLink>
          </div>

          <!-- SHOPS COMPACT LIST VIEW -->
          <div v-else-if="shops.length && viewMode === 'list'" class="space-y-4">
            <RouterLink
              v-for="(shop, idx) in shops"
              :key="shop.shopId"
              :to="`/shops/${shop.shopId}`"
              class="group bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-lg hover:border-emerald-600/30 transition duration-300 flex flex-col sm:flex-row gap-5 items-stretch"
            >
              <!-- Cover Image Left -->
              <div class="sm:w-52 h-44 sm:h-auto shrink-0 rounded-xl overflow-hidden bg-slate-900 relative">
                <img :src="getShopCoverImage(shop, idx)" :alt="shop.shopName" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <span class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900/80 text-emerald-300 backdrop-blur-xs">
                  {{ shop.categoryName || 'ร้านค้า' }}
                </span>
              </div>

              <!-- Content Right -->
              <div class="flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <h3 class="font-bold text-slate-900 text-lg group-hover:text-emerald-800 transition">
                      {{ shop.shopName }}
                    </h3>
                    <span class="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 text-xs shrink-0">
                      <i class="mdi mdi-star text-amber-500"></i> 4.8
                    </span>
                  </div>

                  <p class="text-xs text-emerald-800 font-medium mt-1 flex items-center gap-1">
                    <i class="mdi mdi-map-marker"></i>
                    {{ shop.districtName ? `อำเภอ${shop.districtName}` : shop.address || 'กาญจนบุรี' }}
                  </p>

                  <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed mt-2">
                    {{ shop.description || 'ให้บริการสินค้าและผลิตภัณฑ์คุณภาพพร้อมบริการต้อนรับด้วยความไมตรี' }}
                  </p>
                </div>

                <!-- Footer row inside List card -->
                <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span class="text-slate-500 font-medium flex items-center gap-1">
                    <i class="mdi mdi-phone-outline text-emerald-800"></i>
                    {{ shop.phone || 'ติดต่อร้านค้า' }}
                  </span>

                  <span class="px-4 py-2 rounded-xl bg-[#0d3831] text-white font-semibold text-xs group-hover:bg-emerald-800 transition shadow-xs flex items-center gap-1.5">
                    <span>เข้าชมร้านค้า</span>
                    <i class="mdi mdi-arrow-right text-xs"></i>
                  </span>
                </div>
              </div>
            </RouterLink>
          </div>

          <!-- EMPTY STATE -->
          <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3 shadow-2xs">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mx-auto">
              <i class="mdi mdi-store-search-outline text-3xl"></i>
            </div>
            <h3 class="text-base font-bold text-slate-900">ไม่พบร้านค้าตามเงื่อนไขที่เลือก</h3>
            <p class="text-xs text-slate-500 max-w-xs mx-auto">ลองเปลี่ยนคำค้นหา หรือกดล้างตัวกรองเพื่อดูร้านค้าทั้งหมด</p>
            <button
              class="px-4 py-2 rounded-xl bg-[#0d3831] hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition"
              @click="clearFilters"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>

          <!-- PAGINATION -->
          <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              class="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold shadow-2xs disabled:opacity-40"
              :disabled="page === 1"
              @click="setPage(page - 1)"
            >
              <i class="mdi mdi-chevron-left text-lg"></i>
            </button>

            <button
              v-for="p in totalPages"
              :key="p"
              type="button"
              class="h-9 w-9 flex items-center justify-center rounded-xl font-semibold text-xs transition"
              :class="page === p ? 'bg-[#0d3831] text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'"
              @click="setPage(p)"
            >
              {{ p }}
            </button>

            <button
              type="button"
              class="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold shadow-2xs disabled:opacity-40"
              :disabled="page === totalPages"
              @click="setPage(page + 1)"
            >
              <i class="mdi mdi-chevron-right text-lg"></i>
            </button>
          </div>

        </div>

        <!-- RIGHT SIDEBAR (LEAFLET MAP & TOP SHOPS) -->
        <div v-if="showMap" class="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          
          <!-- Leaflet Interactive Map Card -->
          <div class="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
            <div class="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <span class="text-xs font-bold flex items-center gap-1.5">
                <i class="mdi mdi-map-marker-outline text-emerald-400 text-sm"></i>
                แผนที่พิกัดร้านค้า
              </span>
              <span class="text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/80">
                {{ shopsWithLocation.length }} พิกัด
              </span>
            </div>
            <div class="p-2.5">
              <div ref="mapContainer" class="h-[360px] w-full rounded-xl overflow-hidden bg-slate-100 relative z-10 border border-slate-200/60"></div>
            </div>
          </div>

          <!-- Featured Popular Shops Sidebar -->
          <div v-if="popularShops.length" class="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <i class="mdi mdi-[#0d3831] mdi-star-circle text-amber-500 text-base"></i>
                <span>ร้านค้าแนะนำ</span>
              </h3>
              <button type="button" class="text-xs font-semibold text-emerald-800 hover:underline" @click="clearFilters">
                ดูทั้งหมด
              </button>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <RouterLink
                v-for="(pop, popIdx) in popularShops"
                :key="pop.shopId"
                :to="`/shops/${pop.shopId}`"
                class="group bg-white rounded-xl overflow-hidden border border-slate-200/80 p-2 shadow-2xs hover:shadow-md hover:border-emerald-600/30 transition duration-300"
              >
                <div class="aspect-16/10 rounded-lg overflow-hidden bg-slate-100 mb-2 border border-slate-100">
                  <img :src="getShopCoverImage(pop, popIdx)" :alt="pop.shopName" class="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <h4 class="font-semibold text-slate-900 text-xs line-clamp-1 group-hover:text-emerald-800 transition">{{ pop.shopName }}</h4>
                <div class="flex items-center justify-between text-[10px] text-amber-700 font-semibold mt-1">
                  <span class="flex items-center gap-0.5"><i class="mdi mdi-star text-amber-500"></i>4.8</span>
                  <span class="text-slate-400 font-normal">การันตี</span>
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
