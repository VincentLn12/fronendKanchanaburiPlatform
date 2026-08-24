<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { removeProduct, getProducts } from '../api/productApi'
import { getMyShop } from '../api/shopApi'
import type { Product } from '../../shared/types/product'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const products = ref<Product[]>([])
const hasShop = ref(false)
const loading = ref(true)
const swal = useSwal()
const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(/\/api$/, '')

function imageUrl(url?: string) {
  return url?.startsWith('/') ? `${apiOrigin}${url}` : url
}

async function load() {
  loading.value = true
  try {
    const shop = await getMyShop()
    hasShop.value = true
    products.value = (await getProducts()).filter((product) => product.shopId === shop.shopId)
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) await swal.error('โหลดสินค้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่'))
  } finally { loading.value = false }
}

async function closeProduct(product: Product) {
  const result = await swal.confirm(`ปิดการขาย ${product.productName}?`, 'ข้อมูลสินค้าจะไม่ถูกลบ')
  if (!result.isConfirmed) return
  try {
    await removeProduct(product.productId)
    products.value = products.value.filter((item) => item.productId !== product.productId)
    await swal.success('ปิดการขายสินค้าแล้ว')
  } catch (error) { await swal.error('ดำเนินการไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่')) }
}

onMounted(load)
</script>

<template>
  <div class="mx-auto w-full max-w-7xl 2xl:max-w-[1600px]">
    <div v-if="loading" class="h-1 animate-pulse rounded bg-indigo-600" />
    <template v-else-if="hasShop">
      <div class="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p class="font-semibold text-indigo-600">จัดการร้านค้า</p><h1 class="mt-1 text-3xl font-bold text-slate-900">สินค้า</h1><p class="mt-2 text-slate-500">ทั้งหมด {{ products.length }} รายการที่กำลังขาย</p></div><RouterLink to="/my-shop/products/new" class="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700">+ เพิ่มสินค้า</RouterLink></div>
      <div v-if="products.length === 0" class="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center text-slate-500">ยังไม่มีสินค้า <RouterLink to="/my-shop/products/new" class="font-semibold text-indigo-600">เพิ่มสินค้าแรก</RouterLink></div>
      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article v-for="product in products" :key="product.productId" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><img v-if="product.imageUrl" :src="imageUrl(product.imageUrl)" :alt="product.productName" class="h-44 w-full object-cover" /><div v-else class="flex h-44 items-center justify-center bg-slate-100 text-slate-400">ไม่มีรูปสินค้า</div><div class="p-5"><h2 class="truncate text-lg font-bold text-slate-900">{{ product.productName }}</h2><p class="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500">{{ product.description || '-' }}</p><p class="mt-4 text-lg font-bold text-indigo-600">{{ Number(product.price).toLocaleString('th-TH') }} บาท</p><div class="mt-5 flex gap-3 border-t border-slate-100 pt-4"><RouterLink :to="`/my-shop/products/${product.productId}/edit`" class="font-semibold text-indigo-600">แก้ไข</RouterLink><button class="font-semibold text-red-600" @click="closeProduct(product)">ปิดขาย</button></div></div></article>
      </div>
    </template>
    <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center text-slate-500">กรุณา <RouterLink to="/my-shop" class="font-semibold text-indigo-600">สร้างร้าน</RouterLink> ก่อนจัดการสินค้า</div>
  </div>
</template>
