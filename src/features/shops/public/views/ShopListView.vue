<template>
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-16">
    <!-- HERO BANNER SECTION -->
    <ShopHeroBanner v-model:search="search" v-model:viewMode="viewMode" @search="load" />

    <!-- CATEGORY BAR NAV -->
    <ShopCategoryBar
      :categories="categories"
      :selectedCategoryId="categoryId"
      @select="selectCategoryPill"
    />

    <main class="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <!-- FEATURED SHOPS HIGHLIGHT (Only on page 1 when no filter active) -->
      <ShopFeaturedSection v-if="page === 1 && !activeFilterCount" :shops="shops" />

      <!-- DISTRICT QUICK FILTER BAR -->
      <ShopDistrictFilterBar
        :districts="districts"
        :selectedDistrictId="districtId"
        @select="selectDistrictPill"
      />

      <!-- DETAILED FILTER SECTION -->
      <ShopFilterSection
        v-model:categoryId="categoryId"
        v-model:districtId="districtId"
        v-model:subDistrictId="subDistrictId"
        v-model:sortBy="sortBy"
        :categories="categories"
        :districts="districts"
        :subDistricts="subDistricts"
        :sortOptions="sortOptions"
        :activeFilterCount="activeFilterCount"
        @change-district="changeDistrict"
        @clear-filters="clearFilters"
        @filter-change="
          () => {
            page = 1
            load()
          }
        "
      />

      <!-- MODE 1: SHOP CARDS GRID VIEW -->
      <div v-if="viewMode === 'shops'" class="space-y-6">
        <!-- RESULTS TOOLBAR -->
        <div class="flex flex-wrap items-center justify-between gap-4 bg-[#FFF9F2] px-6 py-4 rounded-2xl border-2 border-[#E8D9C9] shadow-xs">
          <div class="text-sm font-extrabold text-[#332820]">
            พบ <span class="text-[#D96C2C] font-black text-base">{{ totalCount }}</span> ร้านค้าและผู้ประกอบการชุมชน
          </div>

          <button
            v-if="activeFilterCount"
            type="button"
            class="text-xs font-black text-[#D96C2C] hover:text-[#BF5720] hover:underline flex items-center gap-1 cursor-pointer"
            @click="clearFilters"
          >
            <i class="mdi mdi-refresh"></i> ล้างตัวกรอง
          </button>
        </div>

        <!-- SKELETON LOADING -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="i in 6"
            :key="i"
            class="animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] h-80 p-4 space-y-3"
          >
            <div class="h-44 bg-[#E8D9C9]/50 rounded-2xl"></div>
            <div class="h-4 bg-[#E8D9C9]/60 rounded w-3/4"></div>
            <div class="h-3 bg-[#E8D9C9]/40 rounded w-1/2"></div>
          </div>
        </div>

        <!-- SHOPS GRID -->
        <div v-else-if="shops.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ShopCard v-for="(shop, idx) in shops" :key="shop.shopId" :shop="shop" :index="idx" />
        </div>

        <!-- EMPTY STATE -->
        <div
          v-else
          class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-12 text-center shadow-xs space-y-4"
        >
          <div
            class="h-16 w-16 rounded-full bg-[#D96C2C]/15 text-[#D96C2C] flex items-center justify-center mx-auto text-3xl font-bold border border-[#D96C2C]/30"
          >
            <i class="mdi mdi-store-off-outline"></i>
          </div>
          <h3 class="text-lg font-black text-[#332820]">ไม่พบร้านค้าตามเงื่อนไข</h3>
          <p class="text-xs text-[#786B62] max-w-sm mx-auto font-medium">
            ลองปรับเปลี่ยนคำค้นหา หรือเลือกตัวกรองอำเภอและประเภทร้านค้าอื่น
          </p>
          <button
            type="button"
            class="px-6 py-2.5 rounded-xl bg-[#D96C2C] hover:bg-[#BF5720] text-white text-xs font-black transition shadow-md cursor-pointer border border-[#D96C2C]"
            @click="clearFilters"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>

        <!-- PAGINATION -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 pt-6">
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#E8D9C9] bg-[#FFF9F2] text-xs font-bold transition hover:border-[#D96C2C] disabled:opacity-40 cursor-pointer shadow-2xs text-[#332820]"
            :disabled="page <= 1"
            @click="prevPage"
          >
            <i class="mdi mdi-chevron-left text-base"></i>
          </button>

          <span
            class="px-4 py-2 rounded-xl bg-[#FFF9F2] border-2 border-[#E8D9C9] text-xs font-black text-[#D96C2C] shadow-2xs"
          >
            หน้า {{ page }} จาก {{ totalPages }}
          </span>

          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#E8D9C9] bg-[#FFF9F2] text-xs font-bold transition hover:border-[#D96C2C] disabled:opacity-40 cursor-pointer shadow-2xs text-[#332820]"
            :disabled="page >= totalPages"
            @click="nextPage"
          >
            <i class="mdi mdi-chevron-right text-base"></i>
          </button>
        </div>
      </div>

      <!-- MODE 2: MAP VIEW -->
      <div v-else-if="viewMode === 'map'">
        <ShopMapView :shops="shops" :loading="loading" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getDistricts, getShopCategories, getShops, getSubDistricts } from '../api/shopApi'
import type { District, Shop, ShopCategory, SubDistrict } from '../../shared/types/shop'

import ShopHeroBanner from '../components/ShopHeroBanner.vue'
import ShopCategoryBar from '../components/ShopCategoryBar.vue'
import ShopFeaturedSection from '../components/ShopFeaturedSection.vue'
import ShopDistrictFilterBar from '../components/ShopDistrictFilterBar.vue'
import ShopFilterSection from '../components/ShopFilterSection.vue'
import ShopCard from '../components/ShopCard.vue'
import ShopMapView from '../components/ShopMapView.vue'

const route = useRoute()

const shops = ref<Shop[]>([])
const categories = ref<ShopCategory[]>([])
const districts = ref<District[]>([])
const subDistricts = ref<SubDistrict[]>([])

const search = ref('')
const categoryId = ref<string | null>(null)
const districtId = ref<string | null>(null)
const subDistrictId = ref<string | null>(null)
const sortBy = ref<'latest' | 'popular' | 'title'>('latest')

const viewMode = ref<'shops' | 'map'>('shops')

const page = ref(1)
const pageSize = ref(9)
const totalCount = ref(0)
const totalPages = ref(1)
const loading = ref(true)

const sortOptions = [
  { id: 'latest', title: 'ล่าสุด' },
  { id: 'popular', title: 'ยอดนิยม' },
  { id: 'title', title: 'ชื่อร้านค้า (A-Z)' },
]

const activeFilterCount = computed(() => {
  let count = 0
  if (categoryId.value) count++
  if (districtId.value) count++
  if (subDistrictId.value) count++
  if (search.value.trim()) count++
  return count
})

async function loadMasterData() {
  try {
    const [catRes, distRes] = await Promise.all([getShopCategories(), getDistricts()])
    categories.value = catRes
    districts.value = distRes
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
      subDistrictId: subDistrictId.value || undefined,
      sortBy: sortBy.value,
      page: page.value,
      pageSize: pageSize.value,
    })
    shops.value = res.items
    totalCount.value = res.totalCount
    totalPages.value = res.totalPages
  } catch (err) {
    console.error('Failed loading shops', err)
    shops.value = []
    totalCount.value = 0
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

function load() {
  void loadShopsData()
}

function prevPage() {
  if (page.value > 1) {
    page.value--
    load()
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++
    load()
  }
}

async function changeDistrict() {
  subDistrictId.value = null
  subDistricts.value = []
  if (districtId.value) {
    try {
      subDistricts.value = await getSubDistricts(districtId.value)
    } catch (e) {
      console.error(e)
    }
  }
  page.value = 1
  load()
}

function selectDistrictPill(id: string | null) {
  districtId.value = id
  changeDistrict()
}

function selectCategoryPill(id: string | null) {
  categoryId.value = id
  page.value = 1
  load()
}

function clearFilters() {
  categoryId.value = null
  districtId.value = null
  subDistrictId.value = null
  search.value = ''
  sortBy.value = 'latest'
  page.value = 1
  load()
}

function applyQueryParams() {
  if (typeof route.query.categoryId === 'string') categoryId.value = route.query.categoryId
  if (typeof route.query.districtId === 'string') districtId.value = route.query.districtId
  if (typeof route.query.search === 'string') search.value = route.query.search
}

watch(
  () => route.query,
  () => {
    applyQueryParams()
    page.value = 1
    load()
  },
)

onMounted(async () => {
  applyQueryParams()
  await loadMasterData()
  if (districtId.value) {
    try {
      subDistricts.value = await getSubDistricts(districtId.value)
    } catch (e) {
      console.error(e)
    }
  }
  load()
})
</script>
