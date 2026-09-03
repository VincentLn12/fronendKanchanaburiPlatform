<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{ latitude: number | null; longitude: number | null }>()
const emit = defineEmits<{
  'update:latitude': [value: number]
  'update:longitude': [value: number]
  'address-detected': [data: { districtName?: string; subDistrictName?: string; fullAddress?: string }]
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

async function reverseGeocode(latitude: number, longitude: number) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=th`,
    )
    if (!response.ok) return
    const data = (await response.json()) as {
      display_name?: string
      address?: Record<string, string>
    }
    const addr = data.address || {}

    // Extract district (อำเภอ)
    let districtName = addr.county || addr.district || addr.city_district || addr.state_district || ''
    districtName = districtName.replace(/^(อำเภอ|อ\.)\s*/, '').trim()

    // Extract sub-district (ตำบล)
    let subDistrictName = addr.subdistrict || addr.quarter || addr.village || addr.suburb || addr.town || addr.neighbourhood || ''
    subDistrictName = subDistrictName.replace(/^(ตำบล|ต\.)\s*/, '').trim()

    emit('address-detected', {
      districtName,
      subDistrictName,
      fullAddress: data.display_name,
    })
  } catch (error) {
    console.warn('Reverse geocoding error:', error)
  }
}

function publishLocation(latitude: number, longitude: number) {
  const lat = Number(latitude.toFixed(6))
  const lng = Number(longitude.toFixed(6))
  emit('update:latitude', lat)
  emit('update:longitude', lng)
  void reverseGeocode(lat, lng)
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
    searchResults.value = (await response.json()) as PlaceResult[]
    if (!searchResults.value.length) errorMessage.value = 'ไม่พบสถานที่ที่ค้นหา ลองระบุชื่อ อำเภอ หรือจังหวัดเพิ่ม'
  } catch {
    errorMessage.value = 'ค้นหาสถานที่ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
  } finally {
    searching.value = false
  }
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
  const KANCHANABURI_BOUNDS: L.LatLngBoundsExpression = [
    [13.70, 98.00],
    [15.85, 100.00],
  ]
  map = L.map(mapElement.value!, {
    scrollWheelZoom: false,
    minZoom: 9,
    maxZoom: 18,
    maxBounds: KANCHANABURI_BOUNDS,
    maxBoundsViscosity: 0.4,
  }).setView(
    hasLocation() ? [props.latitude!, props.longitude!] : defaultLocation,
    hasLocation() ? 15 : 10,
  )
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    bounds: KANCHANABURI_BOUNDS,
    keepBuffer: 6,
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
      <input
        v-model="searchQuery"
        type="search"
        class="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#D96C2C]"
        placeholder="ค้นหาสถานที่ เช่น น้ำตกเอราวัณ"
        @keyup.enter="searchPlace"
      />
      <button
        type="button"
        class="rounded-xl bg-[#D96C2C] hover:bg-[#BF5720] px-4 py-2 text-sm font-bold text-white shadow-sm disabled:opacity-60 cursor-pointer"
        :disabled="searching || !searchQuery.trim()"
        @click="searchPlace"
      >
        <i class="mdi text-white" :class="searching ? 'mdi-loading animate-spin' : 'mdi-magnify'" />
      </button>
    </div>
    <div
      v-if="searchResults.length"
      class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <button
        v-for="place in searchResults"
        :key="place.place_id"
        type="button"
        class="block w-full border-b border-slate-100 px-3 py-2.5 text-left text-sm text-slate-700 last:border-b-0 hover:bg-[#D96C2C]/10 cursor-pointer"
        @click="selectPlace(place)"
      >
        {{ place.display_name }}
      </button>
    </div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="font-bold text-[#332820]">ตำแหน่งบนแผนที่</h3>
        <p class="text-xs text-[#786B62] font-semibold">คลิกบนแผนที่หรือลากหมุดเพื่อระบุตำแหน่ง</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#D96C2C] bg-[#D96C2C]/10 px-3 py-2 text-xs font-black text-[#D96C2C] hover:bg-[#D96C2C] hover:text-white transition disabled:opacity-60 cursor-pointer"
        :disabled="locating"
        @click="locateMe"
      >
        <i class="mdi" :class="locating ? 'mdi-loading animate-spin' : 'mdi-crosshairs-gps'" />{{
          locating ? 'กำลังค้นหาพิกัด...' : 'ใช้ตำแหน่งปัจจุบัน'
        }}
      </button>
    </div>
    <div
      ref="mapElement"
      class="h-80 overflow-hidden rounded-2xl border-2 border-[#E8D9C9] shadow-xs"
    />
    <p class="text-xs text-[#786B62] font-semibold">
      ละติจูด {{ latitude ?? '-' }} · ลองจิจูด {{ longitude ?? '-' }}
    </p>
    <p v-if="errorMessage" class="text-xs text-rose-600 font-bold">{{ errorMessage }}</p>
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
  background: #d96c2c;
  color: white;
  box-shadow: 0 4px 12px rgba(217, 108, 44, 0.4);
}
:deep(.location-picker-pin i) {
  transform: rotate(45deg);
  font-size: 22px;
  color: white;
}
</style>
