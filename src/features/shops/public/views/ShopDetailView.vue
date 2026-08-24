<script setup lang="ts">
// Public storefront
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getShop } from '../api/shopApi'
import { getShopProducts } from '../api/productApi'
import type { Shop } from '../../shared/types/shop'
import type { Product } from '../../shared/types/product'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const route = useRoute()
const shop = ref<Shop | null>(null)
const products = ref<Product[]>([])
const loading = ref(true)
const swal = useSwal()

onMounted(async () => {
  try {
    shop.value = await getShop(String(route.params.id))
    products.value = await getShopProducts(shop.value.shopId)
  }
  catch (error) { await swal.error('ไม่พบร้านค้า', getApiErrorMessage(error, 'ร้านค้าอาจถูกปิดหรือไม่มีอยู่')) }
  finally { loading.value = false }
})
</script>

<template>
  <main class="mx-auto max-w-4xl px-4 py-10 sm:px-6">
    <div v-if="loading" class="h-1 animate-pulse rounded bg-indigo-600" />
    <template v-else-if="shop">
      <RouterLink to="/shops" class="text-sm font-semibold text-indigo-600">← กลับไปหน้าร้านค้า</RouterLink>
      <section class="mt-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <p class="font-semibold text-indigo-600">{{ shop.categoryName ?? 'ร้านค้า' }}</p>
        <h1 class="mt-2 text-3xl font-bold text-slate-900">{{ shop.shopName }}</h1>
        <p class="mt-5 whitespace-pre-line leading-7 text-slate-700">{{ shop.description || 'ไม่มีรายละเอียดร้าน' }}</p>
        <div class="mt-8 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div><p class="text-sm text-slate-500">ที่อยู่</p><p>{{ shop.address || '-' }}</p></div>
          <div><p class="text-sm text-slate-500">โทรศัพท์</p><p>{{ shop.phone || '-' }}</p></div>
          <div><p class="text-sm text-slate-500">อีเมล</p><p>{{ shop.email || '-' }}</p></div>
          <div><p class="text-sm text-slate-500">พื้นที่</p><p>{{ shop.districtName ?? '-' }}</p></div>
        </div>
      </section>
      <section class="mt-10">
        <div class="mb-5 flex items-end justify-between"><div><p class="font-semibold text-indigo-600">สินค้าในร้าน</p><h2 class="mt-1 text-2xl font-bold text-slate-900">เลือกดูสินค้า</h2></div><p class="text-sm text-slate-500">{{ products.length }} รายการ</p></div>
        <div v-if="products.length" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <RouterLink v-for="product in products" :key="product.productId" :to="`/products/${product.productId}`" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"><img v-if="product.imageUrl" :src="product.imageUrl.startsWith('/') ? `https://localhost:7289${product.imageUrl}` : product.imageUrl" :alt="product.productName" class="h-44 w-full object-cover" /><div v-else class="flex h-44 items-center justify-center bg-slate-100 text-slate-400">ไม่มีรูปสินค้า</div><div class="p-5"><h3 class="truncate font-bold text-slate-900">{{ product.productName }}</h3><p class="mt-2 text-lg font-bold text-indigo-600">{{ Number(product.price).toLocaleString('th-TH') }} บาท</p></div></RouterLink>
        </div>
        <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">ร้านนี้ยังไม่มีสินค้าที่เปิดขาย</div>
      </section>
    </template>
    <div v-else class="py-16 text-center text-slate-500">ไม่พบร้านค้า</div>
  </main>
</template>
