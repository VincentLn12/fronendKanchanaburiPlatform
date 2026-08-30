<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  getContentCategories,
  getDistricts,
  getPublicContents,
  getSubDistricts,
  getTags,
  type ContentCategory,
  type District,
  type PublicContent,
  type SubDistrict,
  type Tag,
} from '../api/contentApi'
import AppSelect from '@/components/common/input/AppSelect.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import heroCoverImage from '@/assets/รูปปก.png'
import { useSwal } from '@/plugins/sweetalert'

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

const viewMode = ref<'grid' | 'list'>('grid')
const showMap = ref(false)
const searchOnMapMove = ref(true)

const page = ref(1)
const pageSize = ref(12)
const totalCount = ref(0)
const totalPages = ref(1)
const loading = ref(true)

const swal = useSwal()

const activeFilterCount = computed(
  () =>
    [search.value.trim(), categoryId.value, districtId.value, tagId.value, subDistrictId.value]
      .filter(Boolean).length,
)

// Sort options
const sortOptions = [
  { id: 'latest', title: 'ล่าสุด' },
  { id: 'popular', title: 'ยอดนิยม' },
  { id: 'title', title: 'ตัวอักษร' },
]

function youtubeThumbnail(url?: string) {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    const id = parsed.hostname.includes('youtu.be')
      ? parsed.pathname.slice(1)
      : (parsed.searchParams.get('v') ?? parsed.pathname.split('/').filter(Boolean).pop())
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''
  } catch {
    return ''
  }
}

async function load() {
  loading.value = true
  try {
    const result = await getPublicContents({
      search: search.value || undefined,
      categoryId: categoryId.value || undefined,
      districtId: districtId.value || undefined,
      subDistrictId: subDistrictId.value || undefined,
      tagId: tagId.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
    })

    contents.value = result.items || []
    totalCount.value = result.totalCount || 0
    totalPages.value = result.totalPages || Math.ceil((result.totalCount || 0) / pageSize.value) || 1
    updateMapMarkers()
  } catch (error) {
    contents.value = []
    totalCount.value = 0
    totalPages.value = 1
    await swal.error('โหลดคอนเทนต์ไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
}

async function changeDistrict() {
  subDistrictId.value = null
  subDistricts.value = districtId.value ? await getSubDistricts(districtId.value) : []
  await load()
}

function selectCategoryPill(catId: string | null) {
  categoryId.value = catId
  page.value = 1
  load()
}

function selectTag(tId: string) {
  tagId.value = tagId.value === tId ? null : tId
  page.value = 1
  load()
}

function clearFilters() {
  search.value = ''
  categoryId.value = null
  districtId.value = null
  subDistrictId.value = null
  subDistricts.value = []
  tagId.value = null
  sortBy.value = 'latest'
  page.value = 1
  load()
}

function setPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  page.value = p
  load()
}

// Leaflet Map Initialization
const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: L.Map | null = null
let markersLayer: L.LayerGroup | null = null

function initMap() {
  if (!mapContainer.value || mapInstance) return

  mapInstance = L.map(mapContainer.value, {
    scrollWheelZoom: false,
    zoomControl: false,
  }).setView([14.15, 99.25], 9)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap',
  }).addTo(mapInstance)

  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance)
  markersLayer = L.layerGroup().addTo(mapInstance)
  updateMapMarkers()
}

function updateMapMarkers() {
  if (!mapInstance || !markersLayer) return
  markersLayer.clearLayers()

  const validItems = contents.value.filter((c) => c.latitude && c.longitude)

  if (validItems.length > 0) {
    const bounds: [number, number][] = []
    validItems.forEach((c) => {
      const lat = c.latitude!
      const lng = c.longitude!
      bounds.push([lat, lng])

      const icon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div class="flex items-center justify-center h-8 w-8 rounded-full bg-[#1c4d3e] text-white font-bold text-xs shadow-md border-2 border-white"><i class="mdi mdi-map-marker text-lg"></i></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      L.marker([lat, lng], { icon })
        .addTo(markersLayer!)
        .bindPopup(`<b>${c.title}</b><br/>${c.districtName || ''}`)
    })

    if (bounds.length > 0) {
      mapInstance.fitBounds(L.latLngBounds(bounds), { padding: [30, 30], maxZoom: 13 })
    }
  }
}

onMounted(async () => {
  try {
    ;[categories.value, districts.value, tags.value] = await Promise.all([
      getContentCategories(),
      getDistricts(),
      getTags(),
    ])
  } catch {
    /* list remains available */
  }
  await load()

  setTimeout(() => {
    initMap()
  }, 300)
})

watch(showMap, async (val) => {
  if (!val) {
    mapInstance?.remove()
    mapInstance = null
    markersLayer = null
    return
  }

  await nextTick()
  initMap()
})

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#f8faf9] text-slate-800 pb-16">
    <!-- HERO BANNER SECTION -->
    <section class="relative bg-slate-900 text-white min-h-[320px] sm:min-h-[360px] flex items-center justify-center overflow-hidden">
      <img
        :src="heroCoverImage"
        alt="สำรวจคอนเทนต์กาญจนบุรี"
        class="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-slate-950/40"></div>

      <div class="relative z-10 mx-auto max-w-4xl px-4 text-center py-12 sm:py-16">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
          สำรวจคอนเทนต์กาญจนบุรี
        </h1>
        <p class="mt-3 text-sm sm:text-base text-emerald-100/90 max-w-xl mx-auto font-normal">
          ค้นพบเรื่องราว วัฒนธรรม ภูมิปัญญา และความงดงามของท้องถิ่น
        </p>

        <!-- Search Bar -->
        <div class="mt-7 mx-auto max-w-2xl">
          <form @submit.prevent="load" class="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-emerald-950/30">
            <div class="flex-1 flex items-center px-3 gap-2">
              <i class="mdi mdi-magnify text-slate-400 text-xl"></i>
              <input
                v-model="search"
                type="text"
                placeholder="ค้นหาคอนเทนต์..."
                class="w-full bg-transparent text-slate-800 text-sm sm:text-base focus:outline-none placeholder:text-slate-400"
                @keyup.enter="load"
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

    <!-- CATEGORY PILLS BAR (FROM REAL API CATEGORIES) -->
    <section v-if="categories.length" class="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10">
      <div class="rounded-3xl bg-white p-4 sm:p-5 shadow-xl shadow-slate-900/5 border border-slate-100">
        <div class="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            class="shrink-0 px-4 py-2.5 rounded-2xl font-bold text-xs transition border"
            :class="categoryId === null ? 'bg-[#1c4d3e] text-white border-[#1c4d3e]' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'"
            @click="selectCategoryPill(null)"
          >
            <i class="mdi mdi-view-grid-outline mr-1.5 text-sm"></i>
            ทั้งหมด
          </button>

          <button
            v-for="cat in categories"
            :key="cat.contentCategoryId"
            type="button"
            class="shrink-0 px-4 py-2.5 rounded-2xl font-bold text-xs transition border"
            :class="categoryId === cat.contentCategoryId ? 'bg-[#1c4d3e] text-white border-[#1c4d3e]' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'"
            @click="selectCategoryPill(cat.contentCategoryId)"
          >
            {{ cat.categoryName }}
          </button>
        </div>
      </div>
    </section>

    <!-- MAIN CONTAINER -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-8">
      <!-- FILTER PANEL CARD -->
      <section class="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h2 class="text-base font-bold text-slate-900">ตัวกรองการค้นหา</h2>

        <!-- Dropdowns Row -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 items-end">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">หมวดหมู่</label>
            <AppSelect
              v-model="categoryId"
              :items="categories"
              item-title="categoryName"
              item-value="contentCategoryId"
              placeholder="ทุกหมวดหมู่"
              clearable
              @update:model-value="load"
            />
          </div>

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
              @update:model-value="load"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">แท็ก</label>
            <AppSelect
              v-model="tagId"
              :items="tags"
              item-title="tagName"
              item-value="tagId"
              placeholder="เลือกแท็ก"
              clearable
              @update:model-value="load"
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

        <!-- Tags Chips Row from API -->
        <div v-if="tags.length" class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-bold text-slate-500">แท็ก:</span>
            <button
              v-for="tg in tags"
              :key="tg.tagId"
              type="button"
              class="px-3 py-1 rounded-full border text-xs font-semibold transition"
              :class="tagId === tg.tagId ? 'bg-[#1c4d3e] text-white border-[#1c4d3e]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#1c4d3e]'"
              @click="selectTag(tg.tagId)"
            >
              # {{ tg.tagName }}
            </button>
          </div>

          <button
            v-if="activeFilterCount"
            type="button"
            class="text-xs font-bold text-slate-600 hover:text-[#1c4d3e] flex items-center gap-1.5 transition"
            @click="clearFilters"
          >
            <span>ล้างตัวกรอง ({{ activeFilterCount }})</span>
            <i class="mdi mdi-refresh"></i>
          </button>
        </div>
      </section>

      <!-- RESULTS TOOLBAR -->
      <section class="flex flex-wrap items-center justify-between gap-4">
        <div class="text-lg font-bold text-slate-900">
          พบ <span class="text-[#1c4d3e] font-black">{{ totalCount }}</span> คอนเทนต์
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
              <span>แสดงแบบการ์ด</span>
            </button>
            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition"
              :class="viewMode === 'list' ? 'bg-[#1c4d3e] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
              @click="viewMode = 'list'"
            >
              <i class="mdi mdi-format-list-bulleted"></i>
              <span>แสดงแบบรายการ</span>
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

      <!-- CONTENT CARDS & MAP SPLIT VIEW AREA -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div :class="showMap ? 'lg:col-span-7' : 'lg:col-span-12'">
          <div v-if="loading" class="grid gap-5" :class="viewMode === 'grid' ? (showMap ? 'sm:grid-cols-2' : 'sm:grid-cols-3') : 'grid-cols-1'">
            <div v-for="i in 6" :key="i" class="animate-pulse rounded-2xl bg-white border border-slate-200 h-64"></div>
          </div>

          <div
            v-else-if="contents.length && viewMode === 'grid'"
            class="grid gap-5"
            :class="showMap ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'"
          >
            <RouterLink
              v-for="item in contents"
              :key="item.contentId"
              :to="`/contents/${item.contentId}`"
              class="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
            >
              <div>
                <div class="relative aspect-16/10 overflow-hidden bg-slate-900">
                  <img
                    v-if="youtubeThumbnail(item.youtubeUrl)"
                    :src="youtubeThumbnail(item.youtubeUrl)"
                    :alt="item.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1c4d3e] to-teal-900 text-emerald-200">
                    <i class="mdi mdi-compass-rose text-5xl opacity-40"></i>
                  </div>

                  <span
                    v-if="item.contentCategoryName"
                    class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/90 text-slate-800 backdrop-blur shadow-xs"
                  >
                    {{ item.contentCategoryName }}
                  </span>
                </div>

                <div class="p-4 space-y-1.5">
                  <h3 class="font-bold text-slate-900 text-base group-hover:text-[#1c4d3e] transition line-clamp-1">
                    {{ item.title }}
                  </h3>
                  <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {{ item.summary || 'ค้นพบเรื่องราวน่าสนใจจากกาญจนบุรี' }}
                  </p>
                </div>
              </div>

              <div class="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span v-if="item.districtName" class="flex items-center gap-1">
                  <i class="mdi mdi-map-marker text-slate-400"></i>{{ item.districtName }}
                </span>
                <span v-else class="flex items-center gap-1">
                  <i class="mdi mdi-map-marker text-slate-400"></i>กาญจนบุรี
                </span>
                <div class="flex items-center gap-1">
                  <span v-for="tg in item.tags.slice(0, 2)" :key="tg.tagId" class="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                    #{{ tg.tagName }}
                  </span>
                </div>
              </div>
            </RouterLink>
          </div>

          <div v-else-if="contents.length && viewMode === 'list'" class="space-y-4">
            <RouterLink
              v-for="item in contents"
              :key="item.contentId"
              :to="`/contents/${item.contentId}`"
              class="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition duration-300 flex flex-col sm:flex-row"
            >
              <div class="relative w-full sm:w-56 aspect-16/10 sm:aspect-auto overflow-hidden bg-slate-900 shrink-0">
                <img
                  v-if="youtubeThumbnail(item.youtubeUrl)"
                  :src="youtubeThumbnail(item.youtubeUrl)"
                  :alt="item.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1c4d3e] to-teal-900 text-emerald-200">
                  <i class="mdi mdi-compass-rose text-5xl opacity-40"></i>
                </div>
              </div>

              <div class="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <span v-if="item.contentCategoryName" class="text-[11px] font-bold text-amber-600 uppercase tracking-wide">
                    {{ item.contentCategoryName }}
                  </span>
                  <h3 class="font-bold text-slate-900 text-lg group-hover:text-[#1c4d3e] transition">
                    {{ item.title }}
                  </h3>
                  <p class="text-xs text-slate-500 line-clamp-2 mt-1">
                    {{ item.summary || 'ค้นพบเรื่องราวน่าสนใจจากกาญจนบุรี' }}
                  </p>
                </div>

                <div class="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-2">
                  <span class="flex items-center gap-1">
                    <i class="mdi mdi-map-marker text-slate-400"></i>{{ item.districtName || 'กาญจนบุรี' }}
                  </span>
                  <div class="flex items-center gap-1">
                    <span v-for="tg in item.tags.slice(0, 3)" :key="tg.tagId" class="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                      #{{ tg.tagName }}
                    </span>
                  </div>
                </div>
              </div>
            </RouterLink>
          </div>

          <div v-else class="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <i class="mdi mdi-compass-off-outline text-5xl text-slate-300"></i>
            <h3 class="mt-3 text-lg font-bold text-slate-800">ไม่พบคอนเทนต์ที่ค้นหา</h3>
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

        <!-- Interactive Map Sidebar -->
        <div v-if="showMap" class="lg:col-span-5 sticky top-24 space-y-3">
          <div class="rounded-3xl bg-white border border-slate-200/80 shadow-md p-3.5 overflow-hidden space-y-3">
            <label class="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none px-1">
              <input
                v-model="searchOnMapMove"
                type="checkbox"
                class="rounded text-[#1c4d3e] focus:ring-[#1c4d3e] h-4 w-4"
              />
              <span>ค้นหาเมื่อขยับแผนที่</span>
            </label>

            <div ref="mapContainer" class="h-[520px] w-full rounded-2xl overflow-hidden bg-emerald-50/40 relative z-10 border border-slate-100"></div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
:deep(.custom-map-marker) {
  background: transparent;
  border: none;
}
</style>
