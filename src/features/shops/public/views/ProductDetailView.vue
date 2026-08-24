<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPublicProduct } from '../api/productApi'
import { getShop } from '../api/shopApi'
import type { Product } from '../../shared/types/product'
import type { Shop } from '../../shared/types/shop'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
import { addCartItem } from '@/features/cart/api/cartApi'
import { useAuthStore } from '@/features/auth/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const product = ref<Product | null>(null)
const shop = ref<Shop | null>(null)
const selectedImage = ref<string | null>(null)
const loading = ref(true)
const swal = useSwal()
const adding = ref(false)
const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(/\/api$/, '')

function imageUrl(url?: string) { return url?.startsWith('/') ? `${apiOrigin}${url}` : url }
const images = computed(() => product.value ? [product.value.imageUrl, ...(product.value.detailImages ?? [])].filter((url): url is string => Boolean(url)) : [])

onMounted(async () => {
  try {
    product.value = await getPublicProduct(String(route.params.id))
    shop.value = await getShop(product.value.shopId)
    selectedImage.value = images.value[0] ?? null
  } catch (error) { await swal.error('ไม่พบสินค้า', getApiErrorMessage(error, 'สินค้านี้อาจถูกปิดการขายหรือไม่มีอยู่')) }
  finally { loading.value = false }
})

async function addToCart() {
  if (!product.value) return
  if (!auth.isLoggedIn) { await router.push('/login'); return }
  adding.value = true
  try { await addCartItem(product.value.productId, 1); await swal.success('เพิ่มสินค้าลงตะกร้าแล้ว') }
  catch (error) { await swal.error('เพิ่มสินค้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่')) }
  finally { adding.value = false }
}
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    <div v-if="loading" class="h-1 animate-pulse rounded bg-indigo-600" />
    <template v-else-if="product && shop">
      <RouterLink :to="`/shops/${shop.shopId}`" class="text-sm font-semibold text-indigo-600">← กลับไป {{ shop.shopName }}</RouterLink>
      <section class="mt-5 grid gap-10 lg:grid-cols-2">
        <div><div class="flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white"><img v-if="selectedImage" :src="imageUrl(selectedImage)" :alt="product.productName" class="h-full w-full object-cover" /><span v-else class="text-slate-400">ไม่มีรูปสินค้า</span></div><div v-if="images.length > 1" class="mt-4 flex gap-3 overflow-x-auto pb-1"><button v-for="image in images" :key="image" class="h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2" :class="selectedImage === image ? 'border-indigo-600' : 'border-slate-200'" @click="selectedImage = image"><img :src="imageUrl(image)" :alt="product.productName" class="h-full w-full object-cover" /></button></div></div>
        <div class="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9"><p class="font-semibold text-indigo-600">สินค้าจาก {{ shop.shopName }}</p><h1 class="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">{{ product.productName }}</h1><p class="mt-6 text-3xl font-bold text-indigo-600">{{ Number(product.price).toLocaleString('th-TH') }} บาท</p><button class="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60" :disabled="adding" @click="addToCart">{{ adding ? 'กำลังเพิ่ม...' : 'เพิ่มลงตะกร้า' }}</button><div class="mt-8 border-t border-slate-100 pt-6"><h2 class="font-bold text-slate-900">รายละเอียดสินค้า</h2><p class="mt-3 whitespace-pre-line leading-7 text-slate-600">{{ product.description || 'ไม่มีรายละเอียดสินค้า' }}</p></div><div class="mt-8 rounded-2xl bg-slate-50 p-5"><p class="font-semibold text-slate-900">{{ shop.shopName }}</p><p class="mt-1 text-sm text-slate-500">{{ shop.address || shop.districtName || 'กาญจนบุรี' }}</p><RouterLink :to="`/shops/${shop.shopId}`" class="mt-3 inline-block text-sm font-semibold text-indigo-600">ดูหน้าร้าน</RouterLink></div></div>
      </section>
    </template>
    <div v-else class="py-16 text-center text-slate-500">ไม่พบสินค้า</div>
  </main>
</template>
