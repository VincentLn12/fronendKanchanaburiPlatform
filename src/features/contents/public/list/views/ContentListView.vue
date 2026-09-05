<template>
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-16">
    <!-- HERO BANNER SECTION -->
    <ContentHeroBanner v-model:search="search" v-model:viewMode="viewMode" @search="onSearch" />

    <!-- CATEGORY BAR NAV -->
    <ContentCategoryBar
      :categories="categories"
      :selectedCategoryId="categoryId"
      @select="selectCategoryPill"
    />

    <main class="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <!-- FILTER SECTION -->
      <ContentFilterSection
        v-model:categoryId="categoryId"
        v-model:districtId="districtId"
        v-model:subDistrictId="subDistrictId"
        v-model:tagId="tagId"
        v-model:sortBy="sortBy"
        v-model:filtersOpen="filtersOpen"
        :categories="categories"
        :districts="districts"
        :subDistricts="subDistricts"
        :tags="tags"
        :sortOptions="sortOptions"
        :activeFilterCount="activeFilterCount"
        @change-district="changeDistrict"
        @select-tag="selectTag"
        @clear-filters="clearFilters"
        @filter-change="onFilterChange"
      />

      <!-- MODE 1: CONTENT CARDS GRID / LIST VIEW -->
      <div v-if="viewMode === 'contents'" class="space-y-6">
        <!-- RESULTS TOOLBAR -->
        <AppDisplayToolbar
          v-model:display-mode="contentDisplayMode"
          :total-count="totalCount"
          unit-label="คอนเทนต์ท่องเที่ยวและวัฒนธรรม"
        />

        <!-- SKELETON LOADING -->
        <div v-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          <div
            v-for="i in 6"
            :key="i"
            class="h-72 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
          />
        </div>

        <!-- GRID MODE -->
        <div
          v-else-if="contents.length && contentDisplayMode === 'grid'"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3"
        >
          <ContentCard
            v-for="item in contents"
            :key="item.contentId"
            :item="item"
            display-mode="grid"
          />
        </div>

        <!-- LIST MODE -->
        <div v-else-if="contents.length && contentDisplayMode === 'list'" class="space-y-4">
          <ContentCard
            v-for="item in contents"
            :key="item.contentId"
            :item="item"
            display-mode="list"
          />
        </div>

        <!-- EMPTY STATE -->
        <AppEmptyState
          v-else
          icon="mdi-play-box-remove-outline"
          title="ไม่พบข้อมูลคอนเทนต์"
          description="ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่ อำเภอ เพื่อค้นหาเรื่องราวที่คุณสนใจ"
          action-label="ล้างตัวกรองทั้งหมด"
          @action="clearFilters"
        />

        <!-- PAGINATION -->
        <AppPagination v-model:page="page" :total-pages="totalPages" @change="load" />
      </div>

      <!-- MODE 2: FULL-DATA MAP VIEW (ALL PINS WITHOUT PAGINATION CUTOFF) -->
      <div v-else-if="viewMode === 'map'">
        <ContentMapView :contents="mapContents" :loading="mapLoading" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  getContentCategories,
  getPublicContents,
  getTags,
  type ContentCategory,
  type PublicContent,
  type Tag,
} from '@/features/contents/api'

import ContentHeroBanner from '../components/ContentHeroBanner.vue'
import ContentCategoryBar from '../components/ContentCategoryBar.vue'
import ContentFilterSection from '../components/ContentFilterSection.vue'
import ContentCard from '../components/ContentCard.vue'
import ContentMapView from '../components/ContentMapView.vue'

import AppPagination from '@/shared/components/AppPagination.vue'
import AppEmptyState from '@/shared/components/AppEmptyState.vue'
import AppDisplayToolbar from '@/shared/components/AppDisplayToolbar.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { useLocations } from '@/shared/composables/useLocations'

const route = useRoute()

const contents = ref<PublicContent[]>([])
const mapContents = ref<PublicContent[]>([])
const categories = ref<ContentCategory[]>([])
const tags = ref<Tag[]>([])

const { districts, subDistricts, fetchDistricts, fetchSubDistricts } = useLocations()
const { page, pageSize, totalCount, totalPages, setPageResult, resetPage } = usePagination(9)

const search = ref('')
const categoryId = ref<string | null>(null)
const districtId = ref<string | null>(null)
const subDistrictId = ref<string | null>(null)
const tagId = ref<string | null>(null)
const sortBy = ref<'latest' | 'popular' | 'title'>('latest')

const viewMode = ref<'contents' | 'map'>('contents')
const contentDisplayMode = ref<'grid' | 'list'>('grid')
const filtersOpen = ref(true)
const loading = ref(true)
const mapLoading = ref(false)

const sortOptions = [
  { id: 'latest', title: 'ล่าสุด' },
  { id: 'popular', title: 'ยอดนิยม' },
  { id: 'title', title: 'ชื่อคอนเทนต์ (A-Z)' },
]

const activeFilterCount = computed(() => {
  let count = 0
  if (categoryId.value) count++
  if (districtId.value) count++
  if (subDistrictId.value) count++
  if (tagId.value) count++
  if (search.value.trim()) count++
  return count
})

async function loadMasterData() {
  try {
    const [catRes, tagRes] = await Promise.all([getContentCategories(), getTags()])
    categories.value = catRes
    tags.value = tagRes
    await fetchDistricts()
  } catch (err) {
    console.error('Failed loading master data', err)
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await getPublicContents({
      search: search.value.trim() || undefined,
      categoryId: categoryId.value || undefined,
      districtId: districtId.value || undefined,
      subDistrictId: subDistrictId.value || undefined,
      tagId: tagId.value || undefined,
      sortBy: sortBy.value,
      page: page.value,
      pageSize: pageSize.value,
    })
    contents.value = res.items
    setPageResult(res.totalCount, res.totalPages)
  } catch (err) {
    console.error('Failed loading public contents', err)
    contents.value = []
    setPageResult(0, 1)
  } finally {
    loading.value = false
  }
}

// Load all contents across Kanchanaburi for map display without pagination cutoff
async function loadMapContents() {
  mapLoading.value = true
  try {
    const res = await getPublicContents({
      search: search.value.trim() || undefined,
      categoryId: categoryId.value || undefined,
      districtId: districtId.value || undefined,
      subDistrictId: subDistrictId.value || undefined,
      tagId: tagId.value || undefined,
      sortBy: sortBy.value,
      page: 1,
      pageSize: 500, // Fetch all available contents
    })
    mapContents.value = res.items || []
  } catch (err) {
    console.error('Failed loading map contents', err)
    mapContents.value = []
  } finally {
    mapLoading.value = false
  }
}

function load() {
  void loadData()
}

function onSearch() {
  if (viewMode.value === 'map') {
    void loadMapContents()
  } else {
    resetPage()
    load()
  }
}

function onFilterChange() {
  if (viewMode.value === 'map') {
    void loadMapContents()
  } else {
    resetPage()
    load()
  }
}

async function changeDistrict() {
  subDistrictId.value = null
  await fetchSubDistricts(districtId.value)
  if (viewMode.value === 'map') {
    void loadMapContents()
  } else {
    resetPage()
    load()
  }
}

function selectCategoryPill(id: string | null) {
  categoryId.value = id
  if (viewMode.value === 'map') {
    void loadMapContents()
  } else {
    resetPage()
    load()
  }
}

function selectTag(id: string) {
  tagId.value = tagId.value === id ? null : id
  if (viewMode.value === 'map') {
    void loadMapContents()
  } else {
    resetPage()
    load()
  }
}

function clearFilters() {
  categoryId.value = null
  districtId.value = null
  subDistrictId.value = null
  tagId.value = null
  search.value = ''
  sortBy.value = 'latest'
  if (viewMode.value === 'map') {
    void loadMapContents()
  } else {
    resetPage()
    load()
  }
}

function applyQueryParams() {
  if (typeof route.query.categoryId === 'string') categoryId.value = route.query.categoryId
  if (typeof route.query.districtId === 'string') districtId.value = route.query.districtId
  if (typeof route.query.tagId === 'string') tagId.value = route.query.tagId
  if (typeof route.query.search === 'string') search.value = route.query.search
}

watch(viewMode, (mode) => {
  if (mode === 'map') {
    void loadMapContents()
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
      void loadMapContents()
    } else {
      resetPage()
      load()
    }
  },
)

onMounted(async () => {
  applyQueryParams()
  await loadMasterData()
  if (districtId.value) {
    await fetchSubDistricts(districtId.value)
  }
  if (viewMode.value === 'map') {
    void loadMapContents()
  } else {
    load()
  }
})
</script>
