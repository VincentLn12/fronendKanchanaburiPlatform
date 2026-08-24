<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getAdminShops, updateShopStatus } from '../api/adminShopApi'
import type { Shop } from '@/features/shops/shared/types/shop'
import AppSelect from '@/components/common/input/AppSelect.vue'
import AppTextField from '@/components/common/input/AppTextField.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const shops = ref<Shop[]>([])
const search = ref('')
const status = ref<string | null>(null)
const loading = ref(true)
const updatingId = ref<string | null>(null)
const swal = useSwal()
const statusOptions = ['Active', 'Inactive', 'Suspended', 'Closed']

const filteredShops = computed(() => shops.value.filter((shop) =>
  (!search.value || shop.shopName.toLowerCase().includes(search.value.toLowerCase())) &&
  (!status.value || shop.status === status.value),
))

async function load() {
  loading.value = true
  try { shops.value = await getAdminShops() }
  catch (error) { await swal.error('โหลดร้านค้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่')) }
  finally { loading.value = false }
}

async function changeStatus(shop: Shop, nextStatus: string) {
  if (nextStatus === shop.status) return
  const result = await swal.confirm(`เปลี่ยนสถานะเป็น ${nextStatus}?`, shop.shopName)
  if (!result.isConfirmed) return
  updatingId.value = shop.shopId
  try {
    await updateShopStatus(shop.shopId, nextStatus)
    shop.status = nextStatus
    await swal.success('อัปเดตสถานะแล้ว')
  } catch (error) { await swal.error('อัปเดตไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่')) }
  finally { updatingId.value = null }
}

onMounted(load)
</script>

<template>
  <main class="mx-auto w-full max-w-[1600px] px-6 py-10 lg:px-10">
    <div class="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p class="font-semibold text-indigo-600">Administration</p><h1 class="mt-1 text-3xl font-bold text-slate-900">จัดการร้านค้า</h1><p class="mt-2 text-slate-500">ตรวจสอบและจัดการสถานะร้านค้าทั้งหมด</p></div><button class="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-600 hover:bg-white" @click="load">รีเฟรช</button></div>
    <section class="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2"><AppTextField v-model="search" placeholder="ค้นหาชื่อร้าน" /><AppSelect v-model="status" :items="statusOptions" placeholder="ทุกสถานะ" clearable /></section>
    <div v-if="loading" class="h-1 animate-pulse rounded bg-indigo-600" />
    <div v-else class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><table class="w-full min-w-[900px] text-left"><thead class="border-b border-slate-200 bg-slate-50 text-sm text-slate-500"><tr><th class="px-5 py-4">ร้านค้า</th><th class="px-5 py-4">เจ้าของ</th><th class="px-5 py-4">หมวดหมู่</th><th class="px-5 py-4">พื้นที่</th><th class="px-5 py-4">สถานะ</th><th class="px-5 py-4">จัดการ</th></tr></thead><tbody class="divide-y divide-slate-100"><tr v-for="shop in filteredShops" :key="shop.shopId" class="hover:bg-slate-50"><td class="px-5 py-4 font-semibold text-slate-900">{{ shop.shopName }}</td><td class="px-5 py-4 text-sm text-slate-600">{{ shop.ownerUserId || '-' }}</td><td class="px-5 py-4 text-sm text-slate-600">{{ shop.categoryName || '-' }}</td><td class="px-5 py-4 text-sm text-slate-600">{{ shop.districtName || '-' }}</td><td class="px-5 py-4"><span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="shop.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : shop.status === 'Suspended' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'">{{ shop.status }}</span></td><td class="px-5 py-4"><select :value="shop.status" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" :disabled="updatingId === shop.shopId" @change="changeStatus(shop, ($event.target as HTMLSelectElement).value)"><option v-for="item in statusOptions" :key="item" :value="item">{{ item }}</option></select></td></tr><tr v-if="filteredShops.length === 0"><td colspan="6" class="px-5 py-12 text-center text-slate-500">ไม่พบร้านค้า</td></tr></tbody></table></div>
  </main>
</template>
