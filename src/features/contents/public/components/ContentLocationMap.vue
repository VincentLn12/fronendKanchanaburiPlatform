<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{ latitude: number; longitude: number; title: string }>()
const element = ref<HTMLElement | null>(null)
let map: L.Map | null = null
onMounted(() => {
  map = L.map(element.value!, { scrollWheelZoom: false, dragging: !L.Browser.mobile }).setView([props.latitude, props.longitude], 15)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map)
  const icon = L.divIcon({ className: 'content-location-marker', html: '<i class="mdi mdi-map-marker"></i>', iconSize: [38, 38], iconAnchor: [19, 36] })
  L.marker([props.latitude, props.longitude], { icon }).addTo(map).bindPopup(props.title).openPopup()
})
onBeforeUnmount(() => map?.remove())
</script>

<template><div ref="element" class="h-80 overflow-hidden rounded-2xl" /></template>

<style scoped>
:deep(.content-location-marker) { display: flex; align-items: center; justify-content: center; height: 38px; width: 38px; border-radius: 9999px 9999px 9999px 0; transform: rotate(-45deg); background: #059669; color: white; box-shadow: 0 4px 12px rgb(5 150 105 / .35); }
:deep(.content-location-marker i) { transform: rotate(45deg); font-size: 23px; }
</style>
