<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  getDistricts,
  getPublicProducts,
  getShopCategories,
  getShops,
  type District,
  type Product,
  type Shop,
  type ShopCategory,
} from '@/features/shops/api'

// Sub-components
import ShopListHeroBanner from '../components/ShopListHeroBanner.vue'
import ShopListFeaturedSection from '../components/ShopListFeaturedSection.vue'
import ShopListSidebarFilter from '../components/ShopListSidebarFilter.vue'
import ShopCardItem from '../components/ShopCardItem.vue'
import ShopMerchantCtaBanner from '../components/ShopMerchantCtaBanner.vue'
import ShopMapView from '@/features/shops/public/components/ShopMapView.vue'
import ShopMapTopFilter from '../components/ShopMapTopFilter.vue'

import AppPagination from '@/shared/components/AppPagination.vue'
import AppEmptyState from '@/shared/components/AppEmptyState.vue'
import { usePagination } from '@/shared/composables/usePagination'

const route = useRoute()

const shops = ref<Shop[]>([])
const categories = ref<ShopCategory[]>([])
const districts = ref<District[]>([])
const allProducts = ref<Product[]>([])

const viewMode = ref<'shops' | 'map'>('shops')

const productsByShopId = computed(() => {
  const map = new Map<string, Product[]>()
  for (const prod of allProducts.value) {
    if (!map.has(prod.shopId)) {
      map.set(prod.shopId, [])
    }
    map.get(prod.shopId)!.push(prod)
  }
  return map
})

const { page, pageSize, totalCount, totalPages, setPageResult, resetPage } = usePagination(10)

const search = ref('')
const categoryId = ref<string | null>(null)
const districtId = ref<string | null>(null)
const verifiedOnly = ref(false)
const topRatedOnly = ref(false)
const sortBy = ref<'latest' | 'popular' | 'title'>('latest')
const showMobileFilter = ref(false)

const loading = ref(true)

const mapShops = ref<Shop[]>([])
const mapLoading = ref(false)

const filteredMapShops = computed(() => {
  let list = mapShops.value
  if (verifiedOnly.value) {
    list = list.filter((s) => s.status === 'Active')
  }
  return list
})

const activeFilterCount = computed(() => {
  let count = 0
  if (categoryId.value) count++
  if (districtId.value) count++
  if (search.value.trim()) count++
  if (verifiedOnly.value) count++
  if (topRatedOnly.value) count++
  return count
})

async function loadMasterData() {
  try {
    const [catRes, distRes, prodRes] = await Promise.all([
      getShopCategories(),
      getDistricts(),
      getPublicProducts().catch(() => [] as Product[]),
    ])
    categories.value = catRes
    districts.value = distRes
    allProducts.value = prodRes || []
  } catch (err) {
    console.error('Failed loading master data', err)
  }
}

async function loadShopsData() {
  loading.value = true
  try {
    const res = await getShops({
      search: search.value.trim() || undefined,
      categoryId: categoryId.value || undefined,
      districtId: districtId.value || undefined,
      sortBy: sortBy.value,
      page: page.value,
      pageSize: pageSize.value,
    })
    shops.value = res.items || []
    setPageResult(res.totalCount || 0, res.totalPages || 1)
  } catch (err) {
    console.error('Failed loading shops', err)
    shops.value = []
    setPageResult(0, 1)
  } finally {
    loading.value = false
  }
}

async function loadMapShops() {
  mapLoading.value = true
  try {
    const res = await getShops({
      search: search.value.trim() || undefined,
      categoryId: categoryId.value || undefined,
      districtId: districtId.value || undefined,
      sortBy: sortBy.value,
      page: 1,
      pageSize: 500, // Load all shops across Kanchanaburi for map display without pagination cutoff
    })
    mapShops.value = res.items || []
  } catch (err) {
    console.error('Failed loading map shops', err)
    mapShops.value = []
  } finally {
    mapLoading.value = false
  }
}

function load() {
  void loadShopsData()
}

function selectCategoryPill(id: string | null) {
  categoryId.value = id
  if (viewMode.value === 'map') {
    void loadMapShops()
  } else {
    resetPage()
    load()
  }
}

function clearFilters() {
  categoryId.value = null
  districtId.value = null
  search.value = ''
  verifiedOnly.value = false
  topRatedOnly.value = false
  sortBy.value = 'latest'
  if (viewMode.value === 'map') {
    void loadMapShops()
  } else {
    resetPage()
    load()
  }
}

function applyQueryParams() {
  if (typeof route.query.categoryId === 'string') categoryId.value = route.query.categoryId
  if (typeof route.query.districtId === 'string') districtId.value = route.query.districtId
  if (typeof route.query.search === 'string') search.value = route.query.search
}

watch([categoryId, districtId, sortBy, verifiedOnly, topRatedOnly], () => {
  if (viewMode.value === 'map') {
    void loadMapShops()
  } else {
    resetPage()
    load()
  }
})

watch(viewMode, (mode) => {
  if (mode === 'map') {
    void loadMapShops()
  } else {
    resetPage()
    load()
  }
})

watch(
  () => route.query,
  () => {
    applyQueryParams()
    if (viewMode.value === 'map') {
      void loadMapShops()
    } else {
      resetPage()
      load()
    }
  },
)

onMounted(async () => {
  applyQueryParams()
  await loadMasterData()
  if (viewMode.value === 'map') {
    void loadMapShops()
  } else {
    load()
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-24 font-sans space-y-10">
    <!-- 1. HERO BANNER & STATS SECTION -->
    <ShopListHeroBanner
      :categories="categories"
      :selected-category-id="categoryId"
      :view-mode="viewMode"
      @select-category="selectCategoryPill"
      @update:view-mode="viewMode = $event"
    />

    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
      <!-- 2. FEATURED SHOPS SECTION (Only on Page 1 without active filters in shops mode) -->
      <ShopListFeaturedSection
        v-if="viewMode === 'shops' && page === 1 && !activeFilterCount"
        :shops="shops"
        :products-by-shop-id="productsByShopId"
      />

      <!-- 2. FULL-WIDTH INTERACTIVE MAP VIEW MODE (Filters On Top & Wide Map) -->
      <div v-if="viewMode === 'map'" class="space-y-6">
        <!-- TOP HORIZONTAL FILTER BAR FOR MAP -->
        <ShopMapTopFilter
          v-model:search="search"
          v-model:category-id="categoryId"
          v-model:district-id="districtId"
          v-model:verified-only="verifiedOnly"
          v-model:top-rated-only="topRatedOnly"
          v-model:view-mode="viewMode"
          :categories="categories"
          :districts="districts"
          :active-filter-count="activeFilterCount"
          :total-count="filteredMapShops.length"
          @clear-filters="clearFilters"
          @filter-change="loadMapShops"
        />
        <!-- FULL-WIDTH LEAFLET MAP CONTAINER -->
        <div class="rounded-3xl overflow-hidden border-2 border-[#E8D9C9] shadow-xl bg-[#FFF9F2]">
          <ShopMapView :shops="filteredMapShops" :loading="mapLoading" />
        </div>
      </div>

      <!-- 3. MAIN 2-COLUMN MARKETPLACE LAYOUT (SHOPS LIST MODE) -->
      <template v-else>
        <!-- MOBILE FILTER TOGGLE BAR (Visible on mobile screens < lg) -->
        <div
          class="lg:hidden flex items-center justify-between gap-3 bg-[#FFF9F2] p-3 rounded-2xl border-2 border-[#E8D9C9] shadow-xs"
        >
          <button
            type="button"
            class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#D96C2C] text-white font-black text-xs shadow-xs cursor-pointer active:scale-95 transition"
            @click="showMobileFilter = !showMobileFilter"
          >
            <i :class="['mdi text-base', showMobileFilter ? 'mdi-close' : 'mdi-tune-variant']"></i>
            <span>{{ showMobileFilter ? 'ปิดตัวกรอง' : 'ตัวกรองร้านค้า (ค้นหา / อำเภอ)' }}</span>
            <span
              v-if="activeFilterCount"
              class="px-1.5 py-0.5 rounded-full bg-white text-[#D96C2C] text-[10px] font-black"
            >
              {{ activeFilterCount }}
            </span>
          </button>

          <button
            v-if="activeFilterCount"
            type="button"
            class="py-2.5 px-3 rounded-xl border-2 border-[#E8D9C9] bg-white text-xs font-black text-[#786B62] hover:text-[#D96C2C] cursor-pointer active:scale-95 transition shrink-0"
            @click="clearFilters"
          >
            ล้างค่า
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          <!-- LEFT SIDEBAR FILTER PANEL (Collapsible on Mobile, Persistent on Desktop) -->
          <div
            :class="[
              'lg:col-span-4 lg:sticky lg:top-24 transition-all duration-300',
              showMobileFilter ? 'block' : 'hidden lg:block',
            ]"
          >
            <ShopListSidebarFilter
              v-model:search="search"
              v-model:category-id="categoryId"
              v-model:district-id="districtId"
              v-model:verified-only="verifiedOnly"
              v-model:top-rated-only="topRatedOnly"
              :categories="categories"
              :districts="districts"
              :active-filter-count="activeFilterCount"
              @clear-filters="clearFilters"
              @filter-change="
                () => {
                  resetPage()
                  load()
                }
              "
            />
          </div>

          <!-- RIGHT STORE CARDS GRID CONTENT -->
          <div class="lg:col-span-8 space-y-6">
            <!-- TOOLBAR: TOTALS & VIEW MODE TOGGLE & SORTING -->
            <div
              class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-[#FFF9F2] p-4 sm:p-5 border-2 border-[#E8D9C9] shadow-xs"
            >
              <div>
                <h2 class="text-lg font-black text-[#332820] tracking-tight">
                  รายการร้านค้าทั้งหมด
                </h2>
                <p class="text-xs text-[#786B62] font-semibold">
                  พบ <span class="text-[#D96C2C] font-black">{{ totalCount }}</span> ร้านค้าในระบบ
                </p>
              </div>

              <!-- View Mode Switcher & Sort By Dropdown -->
              <div class="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                <!-- Mode Switcher Buttons -->
                <div
                  class="inline-flex rounded-2xl border-2 border-[#E8D9C9] bg-white p-1 shadow-2xs"
                >
                  <button
                    type="button"
                    class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer bg-[#D96C2C] text-white shadow-xs"
                    @click="viewMode = 'shops'"
                  >
                    <i class="mdi mdi-storefront-outline text-base"></i>
                    <span>ร้านค้า</span>
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer text-[#786B62] hover:text-[#332820]"
                    @click="viewMode = 'map'"
                  >
                    <i class="mdi mdi-map-marker-radius text-base"></i>
                    <span>แผนที่</span>
                  </button>
                </div>

                <!-- Sort By Dropdown -->
                <div class="flex items-center gap-2">
                  <select
                    v-model="sortBy"
                    class="rounded-2xl border-2 border-[#E8D9C9] bg-white px-3.5 py-2 text-xs font-black text-[#332820] outline-none focus:border-[#D96C2C] transition cursor-pointer"
                  >
                    <option value="latest">ร้านค้ามาใหม่</option>
                    <option value="popular">ยอดนิยม / เรตติ้ง</option>
                    <option value="title">ชื่อร้านค้า (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- SKELETON LOADING -->
            <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div
                v-for="i in 10"
                :key="i"
                class="animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] h-96 p-4 space-y-4"
              >
                <div class="h-44 bg-[#E8D9C9]/50 rounded-2xl"></div>
                <div class="h-5 bg-[#E8D9C9]/60 rounded w-3/4"></div>
                <div class="h-4 bg-[#E8D9C9]/40 rounded w-1/2"></div>
              </div>
            </div>

            <!-- SHOPS GRID (Displays Real Products inside each shop card) -->
            <div v-else-if="shops.length" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ShopCardItem
                v-for="(shop, idx) in shops"
                :key="shop.shopId"
                :shop="shop"
                :index="idx"
                :products="productsByShopId.get(shop.shopId) || []"
              />
            </div>

            <!-- EMPTY STATE -->
            <AppEmptyState
              v-else
              icon="mdi-store-off-outline"
              title="ไม่พบร้านค้าตามเงื่อนไข"
              description="ลองปรับเปลี่ยนคำค้นหา หรือเลือกตัวกรองอำเภอและประเภทร้านค้าอื่น"
              action-label="ล้างตัวกรองทั้งหมด"
              @action="clearFilters"
            />

            <!-- PAGINATION -->
            <AppPagination v-model:page="page" :total-pages="totalPages" @change="load" />
          </div>
        </div>
      </template>

      <!-- 4. MERCHANT REGISTRATION CTA BANNER -->
      <ShopMerchantCtaBanner />
    </main>
  </div>
</template>
