<template>
  <div
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
            หมุดคอนเทนต์บนแผนที่
          </h3>
          <p class="text-[10px] text-slate-400 mt-0.5">
            พบ {{ contentsWithLocation.length }} สถานที่ที่มีพิกัด
          </p>
        </div>
        <button
          v-if="selectedContentId"
          type="button"
          class="text-[10px] text-amber-400 hover:underline font-bold cursor-pointer"
          @click="resetMapView"
        >
          แสดงทั้งหมด
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
              <div
                v-else
                class="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#0d3831] to-teal-900 text-emerald-200"
              >
                <i class="mdi mdi-compass-rose text-base"></i>
              </div>
            </div>

            <div class="min-w-0 flex-1">
              <h4
                class="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-emerald-800 transition"
              >
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
              <span
                v-for="tg in item.tags.slice(0, 2)"
                :key="tg.tagId"
                class="text-[9px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200/60 px-1 py-0.5 rounded"
              >
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
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { PublicContent } from '../api/contentApi'

interface Props {
  contents: PublicContent[]
}

const props = defineProps<Props>()

const selectedContentId = ref<string | null>(null)
const mapContainer = ref<HTMLElement | null>(null)

let mapInstance: L.Map | null = null
let markersLayer: L.LayerGroup | null = null
let contentMarkerMap = new Map<string, L.Marker>()

const contentsWithLocation = computed(() =>
  props.contents.filter((c) => c.latitude != null && c.longitude != null),
)

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
        popupAnchor: [0, -32],
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

watch(
  () => props.contents,
  () => {
    updateMapMarkers()
  },
  { deep: true },
)

onMounted(async () => {
  await nextTick()
  initMap()
})

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    markersLayer = null
  }
})
</script>

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
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.2),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

:deep(.custom-leaflet-popup .leaflet-popup-content) {
  margin: 0;
  width: 230px !important;
}
</style>
