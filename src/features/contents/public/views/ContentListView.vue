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

// View Modes: 'contents' (Grid/List mode) or 'map' (Large Map mode)
const viewMode = ref<'contents' | 'map'>('contents')
const contentDisplayMode = ref<'grid' | 'list'>('grid')
const selectedContentId = ref<string | null>(null)
const filtersOpen = ref(false)

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

const contentsWithLocation = computed(() =>
  contents.value.filter((c) => c.latitude != null && c.longitude != null),
)

const sortedContents = computed(() => {
  const items = [...contents.value]
  if (sortBy.value === 'title') return items.sort((a, b) => a.title.localeCompare(b.title, 'th'))
  if (sortBy.value === 'popular') return items.sort((a, b) => b.tags.length - a.tags.length)
  return items.sort((a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime())
})

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
    if (viewMode.value === 'map') {
      updateMapMarkers()
    }
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
  page.value = 1
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

function formatPublishedDate(value?: string) {
  if (!value) return 'เรื่องราวกาญจนบุรี'
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

// Leaflet Map Initialization
const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: L.Map | null = null
let markersLayer: L.LayerGroup | null = null
let contentMarkerMap = new Map<string, L.Marker>()

function initMap() {
  if (!mapContainer.value || mapInstance) return

  mapInstance = L.map(mapContainer.value, {
    scrollWheelZoom: true,
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
  contentMarkerMap.clear()

  const validItems = contentsWithLocation.value

  if (validItems.length > 0) {
    const bounds: L.LatLngTuple[] = []
    validItems.forEach((c) => {
      const lat = c.latitude!
      const lng = c.longitude!
      bounds.push([lat, lng])
      const thumb = youtubeThumbnail(c.youtubeUrl)
      const isSelected = selectedContentId.value === c.contentId

      const icon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="content-marker-wrapper group cursor-pointer flex flex-col items-center">
            <div class="relative flex items-center justify-center">
              <div class="absolute -inset-1 rounded-full bg-emerald-400/40 animate-pulse"></div>
              <div class="relative h-11 w-11 rounded-full ${isSelected ? 'bg-amber-500 scale-110 ring-4 ring-amber-300' : 'bg-gradient-to-br from-[#0d3831] to-[#082621]'} text-white border-2 border-white shadow-xl flex items-center justify-center transition-all duration-300 group-hover:scale-115">
                <i class="mdi mdi-compass-rose text-xl text-emerald-200"></i>
              </div>
            </div>
            <div class="mt-1.5 px-2.5 py-1 rounded-full bg-white/95 text-[11px] font-extrabold text-slate-800 shadow-lg border border-slate-200/90 backdrop-blur-md whitespace-nowrap transition-all duration-200 group-hover:scale-105 group-hover:bg-white group-hover:border-emerald-500">
              ${escapePopupText(c.title)}
            </div>
          </div>
        `,
        iconSize: [46, 60],
        iconAnchor: [23, 34],
        popupAnchor: [0, -32]
      })

      const popupHtml = `
        <div class="content-popup-card group/pop relative overflow-hidden bg-white text-left font-sans rounded-2xl">
          <div class="relative h-28 w-full overflow-hidden bg-slate-900">
            ${thumb ? `<img src="${thumb}" alt="${escapePopupText(c.title)}" class="h-full w-full object-cover group-hover/pop:scale-108 transition duration-500" />` : `<div class="h-full w-full bg-gradient-to-br from-[#0d3831] to-slate-900 flex items-center justify-center text-emerald-200"><i class="mdi mdi-compass-rose text-3xl"></i></div>`}
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
            <span class="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-md bg-white/90 text-slate-900 text-[10px] font-black shadow-xs backdrop-blur-xs">
              ${escapePopupText(c.contentCategoryName || 'คอนเทนต์')}
            </span>
          </div>
          <div class="p-3 space-y-1.5">
            <h4 class="font-extrabold text-slate-900 text-sm leading-tight line-clamp-1">
              ${escapePopupText(c.title)}
            </h4>
            ${c.districtName ? `<div class="flex items-center gap-1 text-[11px] font-semibold text-emerald-700"><i class="mdi mdi-map-marker text-xs"></i><span>อ.${escapePopupText(c.districtName)}</span></div>` : ''}
            <div class="pt-2">
            <a href="/contents/${c.contentId}" class="!text-white flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-[#0d3831] hover:bg-[#1c4d3e] text-xs font-extrabold shadow-md transition-all duration-200 active:scale-95">
              <span class="!text-white">อ่านเนื้อหา</span>
              <i class="mdi mdi-arrow-right text-xs !text-white"></i>
            </a>
          </div>
          </div>
        </div>
      `

      const marker = L.marker([lat, lng], { icon }).bindPopup(popupHtml, {
        className: 'custom-leaflet-popup',
        closeButton: true,
        maxWidth: 240,
      })

      marker.on('click', () => {
        selectedContentId.value = c.contentId
        const element = document.getElementById(`sidebar-content-${c.contentId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      })

      marker.addTo(markersLayer!)
      contentMarkerMap.set(c.contentId, marker)
    })

    if (bounds.length > 1) {
      mapInstance.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 14 })
    } else if (bounds.length === 1) {
      mapInstance.setView(bounds[0]!, 13)
    } else {
      mapInstance.setView([14.35, 99.1], 9)
    }
  }
}

function flyToContent(item: PublicContent) {
  selectedContentId.value = item.contentId
  if (mapInstance && item.latitude != null && item.longitude != null) {
    mapInstance.flyTo([item.latitude, item.longitude], 15, { animate: true, duration: 1 })
    const marker = contentMarkerMap.get(item.contentId)
    if (marker) {
      setTimeout(() => {
        marker.openPopup()
      }, 350)
    }
  }
}

function resetMapView() {
  selectedContentId.value = null
  if (mapInstance) {
    updateMapMarkers()
  }
}

watch(viewMode, async (mode) => {
  if (mode === 'map') {
    await nextTick()
    initMap()
    mapInstance?.invalidateSize()
    updateMapMarkers()
  } else {
    if (mapInstance) {
      mapInstance.remove()
      mapInstance = null
      markersLayer = null
    }
  }
})

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

  if (viewMode.value === 'map') {
    await nextTick()
    initMap()
  }
})

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    markersLayer = null
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-100/90 text-slate-800 pb-16">
    <section class="relative isolate overflow-hidden bg-slate-950 text-white">
      <img
        :src="heroCoverImage"
        alt="สำรวจคอนเทนต์กาญจนบุรี"
        class="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-100 brightness-105 contrast-105"
      />
      <!-- Neutral dark gradient overlay for text legibility without green color tint -->
      <div class="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent"></div>
      <div class="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30"></div>

      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div class="max-w-3xl">
          <p class="text-sm font-extrabold tracking-wider text-amber-400 drop-shadow-sm">KANCHANABURI STORIES</p>
          <div class="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 class="text-3xl font-black leading-tight text-white drop-shadow-md sm:text-5xl">สำรวจเรื่องราวกาญจนบุรี</h1>
              <p class="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200 drop-shadow-sm sm:text-base">รวบรวมสถานที่ วัฒนธรรม และประสบการณ์ท้องถิ่นที่น่าออกไปค้นพบ</p>
            </div>
            <div class="inline-flex shrink-0 self-start border border-white/25 bg-black/40 backdrop-blur-md p-1 rounded-xl shadow-lg" aria-label="เลือกรูปแบบการแสดงผล">
              <button
                type="button"
                class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition sm:text-sm"
                :class="viewMode === 'contents' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-200 hover:bg-white/15 hover:text-white'"
                @click="viewMode = 'contents'"
              >
                <i class="mdi mdi-book-open-page-variant-outline text-base"></i>
                <span>รายการ</span>
              </button>
              <button
                type="button"
                class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition sm:text-sm"
                :class="viewMode === 'map' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-200 hover:bg-white/15 hover:text-white'"
                @click="viewMode = 'map'"
              >
                <i class="mdi mdi-map-marker-radius-outline text-base"></i>
                <span>แผนที่</span>
              </button>
            </div>
          </div>
          <form @submit.prevent="load" class="mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-white/30 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md">
              <div class="flex flex-1 items-center gap-2 px-3">
                <i class="mdi mdi-magnify text-slate-500 text-2xl"></i>
                <input
                  v-model="search"
                  type="text"
                  placeholder="ค้นหาคอนเทนต์ เช่น วัฒนธรรม, ที่เที่ยวสังขละบุรี..."
                  class="w-full bg-transparent py-2 text-sm font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400"
                  @keyup.enter="load"
                />
              </div>
              <button
                type="submit"
                class="shrink-0 rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <i class="mdi mdi-magnify text-base"></i>
                <span>ค้นหา</span>
              </button>
            </form>
        </div>
      </div>
    </section>

    <section v-if="categories.length" class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8 scrollbar-none">
          <button
            type="button"
            class="shrink-0 border px-3 py-2 text-xs font-bold transition"
            :class="categoryId === null ? 'border-[#1c4d3e] bg-[#1c4d3e] text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-[#1c4d3e]'"
            @click="selectCategoryPill(null)"
          >
            <i class="mdi mdi-view-grid-outline mr-1.5 text-sm"></i>
            ทั้งหมด
          </button>

          <button
            v-for="cat in categories"
            :key="cat.contentCategoryId"
            type="button"
            class="shrink-0 border px-3 py-2 text-xs font-bold transition"
            :class="categoryId === cat.contentCategoryId ? 'border-[#1c4d3e] bg-[#1c4d3e] text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-[#1c4d3e]'"
            @click="selectCategoryPill(cat.contentCategoryId)"
          >
            {{ cat.categoryName }}
          </button>
      </div>
    </section>

    <main class="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
      <section class="rounded-2xl border border-slate-200/90 bg-white shadow-md overflow-hidden">
        <button type="button" class="flex w-full items-center justify-between px-5 py-4 text-left" :aria-expanded="filtersOpen" @click="filtersOpen = !filtersOpen">
          <span class="flex items-center gap-2 text-sm font-bold text-slate-900"><i class="mdi mdi-tune-variant text-lg text-[#1c4d3e]" /> ตัวกรองค้นหา <span v-if="activeFilterCount" class="bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800">{{ activeFilterCount }}</span></span>
          <i class="mdi text-lg text-slate-500" :class="filtersOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
        </button>
        <div v-show="filtersOpen" class="space-y-4 border-t border-slate-100 px-5 py-5">

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

        <div v-if="tags.length" class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-bold text-slate-500">แท็ก:</span>
            <button
              v-for="tg in tags"
              :key="tg.tagId"
              type="button"
              class="px-3 py-1 rounded-full border text-xs font-semibold transition cursor-pointer"
              :class="tagId === tg.tagId ? 'bg-[#1c4d3e] text-white border-[#1c4d3e]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#1c4d3e]'"
              @click="selectTag(tg.tagId)"
            >
              # {{ tg.tagName }}
            </button>
          </div>

          <button
            v-if="activeFilterCount"
            type="button"
            class="text-xs font-bold text-slate-600 hover:text-[#1c4d3e] flex items-center gap-1.5 transition cursor-pointer"
            @click="clearFilters"
          >
            <span>ล้างตัวกรอง ({{ activeFilterCount }})</span>
            <i class="mdi mdi-refresh"></i>
          </button>
        </div></div>
      </section>

      <!-- MODE 1: CONTENT CARDS GRID / LIST VIEW -->
      <div v-if="viewMode === 'contents'" class="space-y-6">
        <!-- RESULTS TOOLBAR -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="text-base font-bold text-slate-900">
            พบ <span class="text-[#1c4d3e] font-black">{{ totalCount }}</span> คอนเทนต์
          </div>

          <div class="flex items-center gap-1 border border-slate-200 bg-white p-1 shadow-xs">
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center text-xs font-bold transition"
              :class="contentDisplayMode === 'grid' ? 'bg-[#1c4d3e] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
              @click="contentDisplayMode = 'grid'"
              title="แสดงแบบตาราง"
            >
              <i class="mdi mdi-view-grid-outline"></i>
            </button>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center text-xs font-bold transition"
              :class="contentDisplayMode === 'list' ? 'bg-[#1c4d3e] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
              @click="contentDisplayMode = 'list'"
              title="แสดงแบบรายการ"
            >
              <i class="mdi mdi-format-list-bulleted"></i>
            </button>
          </div>
        </div>

        <!-- SKELETON LOADING -->
        <div v-if="loading" class="grid gap-5" :class="contentDisplayMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'">
          <div v-for="i in 6" :key="i" class="animate-pulse rounded-2xl bg-white border border-slate-200 h-64 p-4 space-y-3">
            <div class="h-36 bg-slate-200 rounded-xl"></div>
            <div class="h-4 bg-slate-200 rounded w-3/4"></div>
            <div class="h-3 bg-slate-100 rounded w-1/2"></div>
          </div>
        </div>

        <!-- GRID MODE -->
        <div
          v-else-if="contents.length && contentDisplayMode === 'grid'"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
        >
          <RouterLink
            v-for="item in sortedContents"
            :key="item.contentId"
            :to="`/contents/${item.contentId}`"
            class="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-2xl hover:border-emerald-500/80 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between"
          >
            <!-- Card Image Frame -->
            <div>
              <div class="relative aspect-16/10 overflow-hidden bg-slate-950">
                <img
                  v-if="youtubeThumbnail(item.youtubeUrl)"
                  :src="youtubeThumbnail(item.youtubeUrl)"
                  :alt="item.title"
                  class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                />
                <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-[#0d3831] to-emerald-950 text-emerald-300">
                  <i class="mdi mdi-compass-rose text-6xl opacity-60 group-hover:scale-110 transition-transform duration-500"></i>
                </div>

                <!-- Vignette Overlay on Thumbnail bottom -->
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80"></div>

                <!-- Top Left Category Badge -->
                <span
                  v-if="item.contentCategoryName"
                  class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black bg-white/95 text-slate-900 shadow-md backdrop-blur-md border border-white/60 flex items-center gap-1.5"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  {{ item.contentCategoryName }}
                </span>

                <!-- Top Right District Badge -->
                <span
                  v-if="item.districtName"
                  class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/80 text-emerald-200 shadow-md backdrop-blur-md border border-white/10 flex items-center gap-1"
                >
                  <i class="mdi mdi-map-marker text-amber-400 text-xs"></i>
                  อ.{{ item.districtName }}
                </span>
              </div>

              <!-- Card Content Body -->
              <div class="p-5 space-y-2.5">
                <h3 class="font-black text-slate-900 text-base sm:text-lg group-hover:text-[#1c4d3e] transition-colors leading-snug line-clamp-2">
                  {{ item.title }}
                </h3>
                <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                  {{ item.summary || 'ค้นพบเรื่องราวน่าสนใจและการท่องเที่ยวในจังหวัดกาญจนบุรี' }}
                </p>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-emerald-50/40 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="flex items-center gap-1.5 font-semibold text-slate-500">
                <i class="mdi mdi-calendar-blank-outline text-emerald-700 text-sm"></i>
                {{ formatPublishedDate(item.publishedAt ?? item.createdAt) }}
              </span>

              <div class="flex items-center gap-1 font-bold text-[#0d3831] group-hover:text-emerald-700 transition">
                <span>อ่านต่อ</span>
                <i class="mdi mdi-arrow-right text-sm transition-transform duration-200 group-hover:translate-x-1"></i>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- LIST MODE -->
        <div v-else-if="contents.length && contentDisplayMode === 'list'" class="space-y-5">
          <RouterLink
            v-for="item in sortedContents"
            :key="item.contentId"
            :to="`/contents/${item.contentId}`"
            class="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-2xl hover:border-emerald-500/80 transition-all duration-300 transform hover:-translate-y-1 flex flex-col sm:flex-row"
          >
            <div class="relative w-full sm:w-72 aspect-16/10 sm:aspect-auto overflow-hidden bg-slate-950 shrink-0">
              <img
                v-if="youtubeThumbnail(item.youtubeUrl)"
                :src="youtubeThumbnail(item.youtubeUrl)"
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
              />
              <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-[#0d3831] to-emerald-950 text-emerald-300">
                <i class="mdi mdi-compass-rose text-5xl opacity-60"></i>
              </div>
              <span
                v-if="item.contentCategoryName"
                class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-black bg-white/95 text-slate-900 shadow-md backdrop-blur-md border border-white/60 sm:hidden"
              >
                {{ item.contentCategoryName }}
              </span>
            </div>

            <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div class="flex items-center justify-between gap-2 mb-1.5">
                  <span v-if="item.contentCategoryName" class="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md hidden sm:inline-block">
                    {{ item.contentCategoryName }}
                  </span>
                  <span v-if="item.districtName" class="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <i class="mdi mdi-map-marker text-amber-500"></i>
                    อ.{{ item.districtName }}
                  </span>
                </div>
                <h3 class="font-black text-slate-900 text-lg group-hover:text-[#1c4d3e] transition-colors leading-snug">
                  {{ item.title }}
                </h3>
                <p class="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                  {{ item.summary || 'ค้นพบเรื่องราวน่าสนใจและการท่องเที่ยวในจังหวัดกาญจนบุรี' }}
                </p>
              </div>

              <div class="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                <span class="flex items-center gap-1.5 font-medium text-slate-500">
                  <i class="mdi mdi-calendar-blank-outline text-emerald-700"></i>{{ formatPublishedDate(item.publishedAt ?? item.createdAt) }}
                </span>
                <div class="flex items-center gap-1 font-bold text-[#0d3831] group-hover:text-emerald-700 transition">
                  <span>ดูรายละเอียด</span>
                  <i class="mdi mdi-arrow-right text-sm transition-transform duration-200 group-hover:translate-x-1"></i>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- EMPTY STATE -->
        <div v-else class="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <i class="mdi mdi-compass-off-outline text-5xl text-slate-300"></i>
          <h3 class="text-base font-bold text-slate-800">ไม่พบคอนเทนต์ที่ตรงกับเงื่อนไข</h3>
          <p class="text-xs text-slate-500">ลองเปลี่ยนคำค้นหา หรือกดล้างตัวกรอง</p>
          <button class="px-5 py-2.5 rounded-xl bg-[#1c4d3e] text-white font-bold text-xs shadow-sm cursor-pointer" @click="clearFilters">
            ล้างตัวกรองทั้งหมด
          </button>
        </div>

        <!-- PAGINATION -->
        <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
          <button
            type="button"
            class="h-9 w-9 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            :disabled="page === 1"
            @click="setPage(page - 1)"
          >
            <i class="mdi mdi-chevron-left text-lg"></i>
          </button>

          <button
            v-for="p in totalPages"
            :key="p"
            type="button"
            class="h-9 w-9 flex items-center justify-center rounded-full font-bold text-xs transition cursor-pointer"
            :class="page === p ? 'bg-[#1c4d3e] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'"
            @click="setPage(p)"
          >
            {{ p }}
          </button>

          <button
            type="button"
            class="h-9 w-9 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            :disabled="page === totalPages"
            @click="setPage(page + 1)"
          >
            <i class="mdi mdi-chevron-right text-lg"></i>
          </button>
        </div>
      </div>

      <!-- MODE 2: LARGE MAP VIEW (แผนที่ใหญ่) -->
      <div
        v-else-if="viewMode === 'map'"
        class="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden h-[calc(100vh-200px)] min-h-[600px] flex flex-col md:flex-row relative"
      >
        <!-- LEFT SIDEBAR: Interactive Contents List Drawer -->
        <div
          class="w-full md:w-80 lg:w-96 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0 z-20 max-h-[35vh] md:max-h-none overflow-hidden shadow-md"
        >
          <!-- Sidebar Header -->
          <div
            class="p-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800"
          >
            <div>
              <h3 class="font-extrabold text-xs sm:text-sm flex items-center gap-1.5">
                <i class="mdi mdi-compass-rose text-emerald-400"></i>
                <span>คอนเทนต์บนแผนที่</span>
              </h3>
              <p class="text-[10px] text-slate-300">
                พบ {{ contentsWithLocation.length }} คอนเทนต์ที่มีพิกัด
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

          <!-- Scrollable Contents List -->
          <div class="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100">
            <div
              v-for="item in contentsWithLocation"
              :id="`sidebar-content-${item.contentId}`"
              :key="item.contentId"
              class="pt-2.5 first:pt-0 group p-2.5 rounded-xl border transition cursor-pointer"
              :class="
                selectedContentId === item.contentId
                  ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-2 ring-emerald-400/40'
                  : 'bg-white border-slate-100 hover:border-emerald-300 hover:bg-slate-50'
              "
              @click="flyToContent(item)"
            >
              <div class="flex items-center gap-3">
                <div
                  class="h-12 w-16 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200 relative"
                >
                  <img
                    v-if="youtubeThumbnail(item.youtubeUrl)"
                    :src="youtubeThumbnail(item.youtubeUrl)"
                    :alt="item.title"
                    class="h-full w-full object-cover group-hover:scale-108 transition duration-300"
                  />
                  <div v-else class="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#0d3831] to-teal-900 text-emerald-200">
                    <i class="mdi mdi-compass-rose text-base"></i>
                  </div>
                </div>

                <div class="min-w-0 flex-1">
                  <h4 class="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-emerald-800 transition">
                    {{ item.title }}
                  </h4>
                  <div class="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                    <i class="mdi mdi-map-marker text-emerald-700 text-xs"></i>
                    <span class="truncate">อ.{{ item.districtName || 'กาญจนบุรี' }}</span>
                  </div>
                  <div class="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                    {{ item.contentCategoryName || 'คอนเทนต์กาญจนบุรี' }}
                  </div>
                </div>
              </div>

              <div class="mt-2 flex items-center justify-between pt-1 text-[11px]">
                <div class="flex items-center gap-1">
                  <span v-for="tg in item.tags.slice(0, 2)" :key="tg.tagId" class="text-[9px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200/60 px-1 py-0.5 rounded">
                    #{{ tg.tagName }}
                  </span>
                </div>

                <RouterLink
                  :to="`/contents/${item.contentId}`"
                  class="px-2.5 py-1 rounded-md bg-[#0d3831] text-white font-bold text-[10px] hover:bg-[#1c4d3e] transition shadow-2xs"
                  @click.stop
                >
                  อ่านเพิ่มเติม
                </RouterLink>
              </div>
            </div>

            <div
              v-if="!contentsWithLocation.length"
              class="p-8 text-center text-xs text-slate-400 space-y-1"
            >
              <i class="mdi mdi-map-marker-off text-2xl text-slate-300"></i>
              <p>ไม่พบพิกัดคอนเทนต์ตามเงื่อนไขค้นหา</p>
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
:deep(.custom-map-marker) {
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
