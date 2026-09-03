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
            resetPage()
            load()
          }
        "
      />

      <!-- MODE 1: SHOP CARDS GRID VIEW -->
      <div v-if="viewMode === 'shops'" class="space-y-6">
        <!-- RESULTS TOOLBAR -->
        <AppDisplayToolbar
          :total-count="totalCount"
          unit-label="ร้านค้าและผู้ประกอบการชุมชน"
          :show-display-toggle="false"
        />

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
import {
  getDistricts,
  getShopCategories,
  getShops,
  getSubDistricts,
  type District,
  type Shop,
  type ShopCategory,
  type SubDistrict,
} from '@/features/shops/api'

import ShopHeroBanner from '../../components/ShopHeroBanner.vue'
import ShopCategoryBar from '../../components/ShopCategoryBar.vue'
import ShopFeaturedSection from '../../components/ShopFeaturedSection.vue'
import ShopDistrictFilterBar from '../../components/ShopDistrictFilterBar.vue'
import ShopFilterSection from '../../components/ShopFilterSection.vue'
import ShopCard from '../../components/ShopCard.vue'
import ShopMapView from '../../components/ShopMapView.vue'

import AppPagination from '@/shared/components/AppPagination.vue'
import AppEmptyState from '@/shared/components/AppEmptyState.vue'
import AppDisplayToolbar from '@/shared/components/AppDisplayToolbar.vue'
import { usePagination } from '@/shared/composables/usePagination'

const route = useRoute()

const shops = ref<Shop[]>([])
const categories = ref<ShopCategory[]>([])
const districts = ref<District[]>([])
const subDistricts = ref<SubDistrict[]>([])

const { page, pageSize, totalCount, totalPages, setPageResult, resetPage } = usePagination(9)

const search = ref('')
const categoryId = ref<string | null>(null)
const districtId = ref<string | null>(null)
const subDistrictId = ref<string | null>(null)
const sortBy = ref<'latest' | 'popular' | 'title'>('latest')

const viewMode = ref<'shops' | 'map'>('shops')
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
    setPageResult(res.totalCount, res.totalPages)
  } catch (err) {
    console.error('Failed loading shops', err)
    shops.value = []
    setPageResult(0, 1)
  } finally {
    loading.value = false
  }
}

function load() {
  void loadShopsData()
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
  resetPage()
  load()
}

function selectDistrictPill(id: string | null) {
  districtId.value = id
  changeDistrict()
}

function selectCategoryPill(id: string | null) {
  categoryId.value = id
  resetPage()
  load()
}

function clearFilters() {
  categoryId.value = null
  districtId.value = null
  subDistrictId.value = null
  search.value = ''
  sortBy.value = 'latest'
  resetPage()
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
    resetPage()
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
