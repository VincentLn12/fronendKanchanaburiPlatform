<script setup lang="ts">
// Public storefront
import { onMounted, ref } from 'vue'
import { getDistricts, getShopCategories, getShops } from '../api/shopApi'
import type { District, Shop, ShopCategory } from '../../shared/types/shop'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppSelect from '@/components/common/input/AppSelect.vue'

const shops = ref<Shop[]>([])
const categories = ref<ShopCategory[]>([])
const districts = ref<District[]>([])
const search = ref('')
const categoryId = ref<string | null>(null)
const districtId = ref<string | null>(null)
const loading = ref(false)
const swal = useSwal()

async function loadShops() {
  loading.value = true
  try {
    shops.value = await getShops({
      search: search.value || undefined,
      categoryId: categoryId.value || undefined,
      districtId: districtId.value || undefined,
    })
  } catch (error) {
    await swal.error('โหลดร้านค้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่'))
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  search.value = ''
  categoryId.value = null
  districtId.value = null
  loadShops()
}

onMounted(async () => {
  try {
    ;[categories.value, districts.value] = await Promise.all([getShopCategories(), getDistricts()])
  } catch {
    /* filter is optional */
  }
  await loadShops()
})
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <p class="font-semibold text-indigo-600">ร้านค้าในกาญจนบุรี</p>
    <h1 class="mt-1 text-3xl font-bold text-slate-900">ค้นหาร้านที่คุณสนใจ</h1>

    <section
      class="my-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4"
    >
      <AppTextField v-model="search" placeholder="ค้นหาชื่อร้าน" @keyup.enter="loadShops" />
      <AppSelect
        v-model="categoryId"
        :items="categories"
        item-title="categoryName"
        item-value="shopCategoryId"
        placeholder="ทุกหมวดหมู่"
        clearable
      />
      <AppSelect
        v-model="districtId"
        :items="districts"
        item-title="districtName"
        item-value="districtId"
        placeholder="ทุกเขต/อำเภอ"
        clearable
      />
      <div class="flex items-center gap-2">
        <button
          class="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
          :disabled="loading"
          @click="loadShops"
        >
          {{ loading ? 'กำลังโหลด...' : 'ค้นหา' }}
        </button>
        <button class="px-3 py-2 font-semibold text-slate-600" @click="clearFilters">ล้าง</button>
      </div>
    </section>

    <div v-if="loading" class="mb-6 h-1 animate-pulse rounded bg-indigo-600" />
    <div
      v-if="!loading && shops.length === 0"
      class="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500"
    >
      ไม่พบร้านค้าที่ตรงกับเงื่อนไข
    </div>
    <section v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink
        v-for="shop in shops"
        :key="shop.shopId"
        :to="`/shops/${shop.shopId}`"
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md"
      >
        <p class="text-sm font-semibold text-indigo-600">
          {{ shop.categoryName ?? 'ร้านค้า' }}
        </p>
        <h2 class="mt-2 text-xl font-bold text-slate-900">{{ shop.shopName }}</h2>
        <p class="mt-2 line-clamp-2 text-sm text-slate-600">
          {{ shop.description || 'ไม่มีรายละเอียดร้าน' }}
        </p>
        <p class="mt-5 text-sm text-slate-500">
          {{ shop.districtName ?? shop.address ?? '-' }}
        </p>
      </RouterLink>
    </section>
  </main>
</template>
