<template>
  <div class="rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-lg shadow-slate-200/50">
    <v-data-table
      :headers="headers"
      :items="items"
      :search="search"
      :loading="loading"
      :items-per-page="itemsPerPage"
      density="comfortable"
      class="elevation-0 app-data-table"
    >
      <!-- Optimized Slot Forwarding -->
      <template v-for="name in slotNames" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps || {}"></slot>
      </template>

      <!-- Default Empty State -->
      <template #no-data>
        <div class="py-8 text-center text-slate-400 font-medium">
          ไม่พบข้อมูลในระบบ
        </div>
      </template>

      <!-- Default Loading State -->
      <template #loading>
        <div class="py-8 text-center text-indigo-600 font-bold">
          กำลังโหลดข้อมูล...
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { useSlots, computed } from 'vue'

export interface DataTableHeader {
  title: string
  key: string
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
  width?: string | number
}

withDefaults(
  defineProps<{
    headers: DataTableHeader[]
    items: any[]
    search?: string
    loading?: boolean
    itemsPerPage?: number
  }>(),
  {
    search: '',
    loading: false,
    itemsPerPage: 10
  }
)

const rawSlots = useSlots()
const slotNames = computed(() => Object.keys(rawSlots))
</script>

<style scoped>
/* Header styling with dark slate/indigo gradient */
.app-data-table :deep(thead),
.app-data-table :deep(thead tr),
.app-data-table :deep(.v-data-table-header) {
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%) !important;
}

.app-data-table :deep(thead th),
.app-data-table :deep(.v-data-table-header__content) {
  color: #ffffff !important;
  font-weight: 700 !important;
  font-size: 0.825rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
}

.app-data-table :deep(thead .v-icon) {
  color: #a5b4fc !important;
}

/* Fast Pure CSS Row Hover & Zebra Stripes */
.app-data-table :deep(tbody tr:nth-of-type(even)) {
  background-color: #f8fafc !important;
}

.app-data-table :deep(tbody tr) {
  transition: background-color 0.15s ease;
}

.app-data-table :deep(tbody tr:hover) {
  background-color: #eef2ff !important;
}

.app-data-table :deep(td) {
  border-bottom: 1px solid #e2e8f0 !important;
  font-size: 0.875rem !important;
}

/* Footer Pagination Styling */
.app-data-table :deep(.v-data-table-footer) {
  background-color: #ffffff !important;
  border-top: 1px solid #e2e8f0 !important;
  color: #475569 !important;
  font-weight: 600 !important;
}
</style>
