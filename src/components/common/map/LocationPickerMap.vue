<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{ latitude: number | null; longitude: number | null }>()
const emit = defineEmits<{
  'update:latitude': [value: number]
  'update:longitude': [value: number]
}>()

const mapElement = ref<HTMLElement | null>(null)
const locating = ref(false)
const searching = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const searchResults = ref<PlaceResult[]>([])
let map: L.Map | null = null
let marker: L.Marker | null = null
const defaultLocation: L.LatLngExpression = [14.0227, 99.5328]

interface PlaceResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

const markerIcon = L.divIcon({
  className: 'location-picker-marker',
  html: '<div class="location-picker-pin"><i class="mdi mdi-map-marker"></i></div>',
  iconSize: [38, 38],
  iconAnchor: [19, 36],
})

function hasLocation() {
  return props.latitude !== null && props.longitude !== null
}

function setLocation(latitude: number, longitude: number, moveMap = true) {
  const point: L.LatLngExpression = [latitude, longitude]
  if (!map) return
  if (!marker) {
    marker = L.marker(point, { draggable: true, icon: markerIcon }).addTo(map)
    marker.on('dragend', () => {
      const position = marker?.getLatLng()
      if (position) publishLocation(position.lat, position.lng)
    })
  } else marker.setLatLng(point)
  if (moveMap) map.setView(point, Math.max(map.getZoom(), 15))
}

function publishLocation(latitude: number, longitude: number) {
  emit('update:latitude', Number(latitude.toFixed(6)))
  emit('update:longitude', Number(longitude.toFixed(6)))
}

function locateMe() {
  errorMessage.value = ''
  if (!navigator.geolocation) {
    errorMessage.value = 'เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง'
    return
  }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      setLocation(coords.latitude, coords.longitude)
      publishLocation(coords.latitude, coords.longitude)
      locating.value = false
    },
    () => {
      errorMessage.value =
        'ไม่สามารถอ่านตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง หรือลองเลือกบนแผนที่'
      locating.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 },
  )
}

async function searchPlace() {
  const query = searchQuery.value.trim()
  if (!query) return
  errorMessage.value = ''
  searchResults.value = []
  searching.value = true
  try {
    const params = new URLSearchParams({ format: 'jsonv2', limit: '5', countrycodes: 'th', q: query })
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`)
    if (!response.ok) throw new Error('Search request failed')
    searchResults.value = await response.json() as PlaceResult[]
    if (!searchResults.value.length) errorMessage.value = 'ไม่พบสถานที่ที่ค้นหา ลองระบุชื่อ อำเภอ หรือจังหวัดเพิ่ม'
  } catch {
    errorMessage.value = 'ค้นหาสถานที่ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
  } finally { searching.value = false }
}

function selectPlace(place: PlaceResult) {
  const latitude = Number(place.lat)
  const longitude = Number(place.lon)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return
  setLocation(latitude, longitude)
  publishLocation(latitude, longitude)
  searchQuery.value = place.display_name
  searchResults.value = []
}

onMounted(() => {
  map = L.map(mapElement.value!, { scrollWheelZoom: false }).setView(
    hasLocation() ? [props.latitude!, props.longitude!] : defaultLocation,
    hasLocation() ? 15 : 10,
  )
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map)
  map.on('click', (event: L.LeafletMouseEvent) => {
    setLocation(event.latlng.lat, event.latlng.lng, false)
    publishLocation(event.latlng.lat, event.latlng.lng)
  })
  if (hasLocation()) setLocation(props.latitude!, props.longitude!, false)
})

watch(
  () => [props.latitude, props.longitude],
  ([latitude, longitude]) => {
    if (typeof latitude === 'number' && typeof longitude === 'number')
      setLocation(latitude, longitude, false)
  },
)

onBeforeUnmount(() => map?.remove())
</script>

<template>
  <section class="space-y-3">
    <div class="flex gap-2">
      <input v-model="searchQuery" type="search" class="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" placeholder="ค้นหาสถานที่ เช่น น้ำตกเอราวัณ" @keyup.enter="searchPlace" />
      <button type="button" class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60" :disabled="searching || !searchQuery.trim()" @click="searchPlace"><i class="mdi" :class="searching ? 'mdi-loading animate-spin' : 'mdi-magnify'" /></button>
    </div>
    <div v-if="searchResults.length" class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <button v-for="place in searchResults" :key="place.place_id" type="button" class="block w-full border-b border-slate-100 px-3 py-2.5 text-left text-sm text-slate-700 last:border-b-0 hover:bg-indigo-50" @click="selectPlace(place)">{{ place.display_name }}</button>
    </div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="font-semibold text-slate-800">ตำแหน่งบนแผนที่</h3>
        <p class="text-xs text-slate-500">คลิกบนแผนที่หรือลากหมุดเพื่อระบุตำแหน่ง</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
        :disabled="locating"
        @click="locateMe"
      >
        <i class="mdi" :class="locating ? 'mdi-loading animate-spin' : 'mdi-crosshairs-gps'" />{{
          locating ? 'กำลังค้นหา...' : 'ใช้ตำแหน่งปัจจุบัน'
        }}
      </button>
    </div>
    <div ref="mapElement" class="h-80 overflow-hidden rounded-2xl border border-slate-200" />
    <p class="text-xs text-slate-500">
      ละติจูด {{ latitude ?? '-' }} · ลองจิจูด {{ longitude ?? '-' }}
    </p>
    <p v-if="errorMessage" class="text-xs text-rose-600">{{ errorMessage }}</p>
  </section>
</template>

<style scoped>
:deep(.location-picker-marker) {
  background: transparent;
  border: 0;
}
:deep(.location-picker-pin) {
  display: flex;
  height: 38px;
  width: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px 9999px 9999px 0;
  transform: rotate(-45deg);
  background: #4f46e5;
  color: white;
  box-shadow: 0 4px 12px rgb(79 70 229 / 0.35);
}
:deep(.location-picker-pin i) {
  transform: rotate(45deg);
  font-size: 22px;
}
</style>
