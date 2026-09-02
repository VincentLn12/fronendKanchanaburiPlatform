<template>
  <div class="min-h-screen bg-[#F9F7F2] text-slate-800 pb-16">
    <!-- HERO BANNER SECTION -->
    <ContentHeroBanner v-model:search="search" v-model:viewMode="viewMode" @search="load" />

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
        @filter-change="
          () => {
            page = 1
            load()
          }
        "
      />

      <!-- MODE 1: CONTENT CARDS GRID / LIST VIEW -->
      <div v-if="viewMode === 'contents'" class="space-y-6">
        <!-- RESULTS TOOLBAR -->
        <div class="flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-[#E8E2D5] shadow-xs">
          <div class="text-sm font-bold text-slate-800">
            พบ <span class="text-[#1C4D3E] font-black text-base">{{ totalCount }}</span> คอนเทนต์ท่องเที่ยวและวัฒนธรรม
          </div>

          <div class="flex items-center gap-1 border border-[#E8E2D5] bg-[#F9F7F2] p-1 rounded-xl shadow-2xs">
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center text-xs font-bold rounded-lg transition cursor-pointer"
              :class="
                contentDisplayMode === 'grid'
                  ? 'bg-[#1C4D3E] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              "
              @click="contentDisplayMode = 'grid'"
              title="แสดงแบบตาราง"
            >
              <i class="mdi mdi-view-grid-outline"></i>
            </button>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center text-xs font-bold rounded-lg transition cursor-pointer"
              :class="
                contentDisplayMode === 'list'
                  ? 'bg-[#1C4D3E] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              "
              @click="contentDisplayMode = 'list'"
              title="แสดงแบบรายการ"
            >
              <i class="mdi mdi-format-list-bulleted"></i>
            </button>
          </div>
        </div>

        <!-- SKELETON LOADING -->
        <div
          v-if="loading"
          class="grid gap-6"
          :class="
            contentDisplayMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          "
        >
          <div
            v-for="i in 6"
            :key="i"
            class="animate-pulse rounded-3xl bg-white border border-[#E8E2D5] h-72 p-4 space-y-3"
          >
            <div class="h-40 bg-slate-200 rounded-2xl"></div>
            <div class="h-4 bg-slate-200 rounded w-3/4"></div>
            <div class="h-3 bg-slate-100 rounded w-1/2"></div>
          </div>
        </div>

        <!-- GRID MODE -->
        <div
          v-else-if="contents.length && contentDisplayMode === 'grid'"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <ContentCard
            v-for="item in contents"
            :key="item.contentId"
            :item="item"
            display-mode="grid"
          />
        </div>

        <!-- LIST MODE -->
        <div
          v-else-if="contents.length && contentDisplayMode === 'list'"
          class="space-y-4"
        >
          <ContentCard
            v-for="item in contents"
            :key="item.contentId"
            :item="item"
            display-mode="list"
          />
        </div>

        <!-- EMPTY STATE -->
        <div
          v-else
          class="rounded-3xl border border-[#E8E2D5] bg-white p-12 text-center shadow-xs space-y-4"
        >
          <div class="h-16 w-16 rounded-full bg-amber-50 text-[#D99A32] flex items-center justify-center mx-auto text-3xl font-bold">
            <i class="mdi mdi-[#1C4D3E]"></i>
          </div>
          <h3 class="text-lg font-black text-slate-900">ไม่พบข้อมูลคอนเทนต์</h3>
          <p class="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่ อำเภอ เพื่อค้นหาเรื่องราวที่คุณสนใจ
          </p>
          <button
            type="button"
            class="px-6 py-2.5 rounded-xl bg-[#1C4D3E] hover:bg-[#14392E] text-white text-xs font-extrabold transition shadow-md cursor-pointer"
            @click="clearFilters"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>

        <!-- PAGINATION -->
        <div
          v-if="totalPages > 1"
          class="flex items-center justify-center gap-2 pt-6"
        >
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8E2D5] bg-white text-xs font-bold transition hover:border-[#1C4D3E] disabled:opacity-40 cursor-pointer shadow-2xs"
            :disabled="page <= 1"
            @click="prevPage"
          >
            <i class="mdi mdi-chevron-left text-base"></i>
          </button>

          <span class="px-4 py-2 rounded-xl bg-white border border-[#E8E2D5] text-xs font-extrabold text-[#1C4D3E] shadow-2xs">
            หน้า {{ page }} จาก {{ totalPages }}
          </span>

          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8E2D5] bg-white text-xs font-bold transition hover:border-[#1C4D3E] disabled:opacity-40 cursor-pointer shadow-2xs"
            :disabled="page >= totalPages"
            @click="nextPage"
          >
            <i class="mdi mdi-chevron-right text-base"></i>
          </button>
        </div>
      </div>

      <!-- MODE 2: MAP VIEW -->
      <div v-else-if="viewMode === 'map'">
        <ContentMapView :contents="contents" :loading="loading" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  getContentCategories,
  getDistricts,
  getPublicContents,
  getTags,
  getSubDistricts,
  type ContentCategory,
  type District,
  type PublicContent,
  type SubDistrict,
  type Tag,
} from '../../api/contentApi'

import ContentHeroBanner from '../../components/ContentHeroBanner.vue'
import ContentCategoryBar from '../../components/ContentCategoryBar.vue'
import ContentFilterSection from '../../components/ContentFilterSection.vue'
import ContentCard from '../../components/ContentCard.vue'
import ContentMapView from '../../components/ContentMapView.vue'

const route = useRoute()

const contents = ref<PublicContent[]>([])
const categories = ref<ContentCategory[]>([])
const districts = ref<District[]>([])
const subDistricts = ref<SubDistrict[]>([])
const tags = ref<Tag[]>([])

const search = ref('')
const categoryId = ref<string | null>(null)
const districtId = ref<string | null>(null)
const subDistrictId = ref<string | null>(null)
const tagId = ref<string | null>(null)
const sortBy = ref<'latest' | 'popular' | 'title'>('latest')

const viewMode = ref<'contents' | 'map'>('contents')
const contentDisplayMode = ref<'grid' | 'list'>('grid')
const filtersOpen = ref(true)

const page = ref(1)
const pageSize = ref(9)
const totalCount = ref(0)
const totalPages = ref(1)
const loading = ref(true)

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
    const [catRes, distRes, tagRes] = await Promise.all([
      getContentCategories(),
      getDistricts(),
      getTags(),
    ])
    categories.value = catRes
    districts.value = distRes
    tags.value = tagRes
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
    totalCount.value = res.totalCount
    totalPages.value = res.totalPages
  } catch (err) {
    console.error('Failed loading public contents', err)
    contents.value = []
    totalCount.value = 0
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

function load() {
  void loadData()
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

function selectCategoryPill(id: string | null) {
  categoryId.value = id
  page.value = 1
  load()
}

function selectTag(id: string) {
  tagId.value = tagId.value === id ? null : id
  page.value = 1
  load()
}

function clearFilters() {
  categoryId.value = null
  districtId.value = null
  subDistrictId.value = null
  tagId.value = null
  search.value = ''
  sortBy.value = 'latest'
  page.value = 1
  load()
}

function applyQueryParams() {
  if (typeof route.query.categoryId === 'string') categoryId.value = route.query.categoryId
  if (typeof route.query.districtId === 'string') districtId.value = route.query.districtId
  if (typeof route.query.tagId === 'string') tagId.value = route.query.tagId
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
