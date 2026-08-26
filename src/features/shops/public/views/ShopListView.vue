<script setup lang="ts">
// Public storefront - Emerald Nature Redesign for Kanchanaburi Shops Directory
import { onMounted, ref, computed } from 'vue'
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
const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(/\/api$/, '')

function imageUrl(url?: string) {
  return url?.startsWith('/') ? `${apiOrigin}${url}` : url
}

async function loadShops() {
  loading.value = true
  try {
    shops.value = await getShops({
      search: search.value || undefined,
      categoryId: categoryId.value || undefined,
      districtId: districtId.value || undefined,
    })
  } catch (error) {
    await swal.error('โหลดร้านค้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
}

function selectCategory(catId: string | null) {
  categoryId.value = catId
  loadShops()
}

function clearFilters() {
  search.value = ''
  categoryId.value = null
  districtId.value = null
  loadShops()
}

const activeFiltersCount = computed(() => {
  let count = 0
  if (search.value.trim()) count++
  if (categoryId.value) count++
  if (districtId.value) count++
  return count
})

const selectedCategoryName = computed(() => {
  if (!categoryId.value) return null
  return categories.value.find((c) => c.shopCategoryId === categoryId.value)?.categoryName
})

const selectedDistrictName = computed(() => {
  if (!districtId.value) return null
  return districts.value.find((d) => d.districtId === districtId.value)?.districtName
})

onMounted(async () => {
  try {
    ;[categories.value, districts.value] = await Promise.all([getShopCategories(), getDistricts()])
  } catch {
    /* filter option load fail silent fallback */
  }
  await loadShops()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50/60 pb-20">
    <!-- Hero Header Banner Section (Emerald Nature Theme) -->
    <section class="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 py-16 text-white sm:py-20">
      <!-- Background Ambient Glow Decorative Orbs -->
      <div class="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl"></div>
      <div class="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl"></div>
      <div class="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/10 blur-2xl"></div>

      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col items-center text-center">
          <!-- Tag Pill -->
          <div class="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-1.5 text-xs font-semibold tracking-wide text-emerald-200 backdrop-blur-md">
            <i class="mdi mdi-leaf-circle-outline text-emerald-300 text-sm"></i>
            <span>ตลาดออนไลน์เมืองกาญจน์ • Emerald Nature Directory</span>
          </div>

          <h1 class="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            สัมผัสร้านค้าเด็ด <span class="bg-gradient-to-r from-emerald-200 via-teal-200 to-lime-300 bg-clip-text text-transparent">&amp; ของดีเมืองกาญจน์</span>
          </h1>

          <p class="mt-4 max-w-2xl text-base text-emerald-100/80 sm:text-lg">
            รวบรวมร้านค้าท้องถิ่น สินค้าหัตถกรรม อาหารพื้นบ้าน และของฝากจากธรรมชาติทั่วกาญจนบุรี ครบจบในที่เดียว
          </p>

          <!-- Stat Badges Bar -->
          <div class="mt-8 flex flex-wrap justify-center gap-6 sm:gap-10 border-t border-emerald-800/40 pt-6">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                <i class="mdi mdi-store text-xl"></i>
              </div>
              <div class="text-left">
                <div class="text-lg font-bold text-white">{{ shops.length }}+</div>
                <div class="text-xs text-emerald-200/70">ร้านค้าในระบบ</div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
                <i class="mdi mdi-map-marker-radius text-xl"></i>
              </div>
              <div class="text-left">
                <div class="text-lg font-bold text-white">{{ districts.length > 0 ? districts.length : 13 }}</div>
                <div class="text-xs text-emerald-200/70">อำเภอครอบคลุม</div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/20 text-lime-300">
                <i class="mdi mdi-shield-check text-xl"></i>
              </div>
              <div class="text-left">
                <div class="text-lg font-bold text-white">100%</div>
                <div class="text-xs text-emerald-200/70">ร้านค้าผ่านการยืนยัน</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content Area -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
      <!-- Search & Filter Card -->
      <section class="rounded-3xl border border-emerald-100/80 bg-white p-5 sm:p-7 shadow-xl shadow-emerald-950/5 backdrop-blur-xl">
        <!-- Quick Category Tabs (Horizontal Scrollable) -->
        <div class="mb-6 border-b border-slate-100 pb-5">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">หมวดหมู่ร้านค้ายอดนิยม</span>
            <span v-if="categoryId" class="text-xs font-medium text-emerald-600 cursor-pointer hover:underline" @click="selectCategory(null)">
              แสดงทั้งหมด
            </span>
          </div>

          <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              class="flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-200"
              :class="categoryId === null
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'bg-emerald-50/70 text-slate-600 hover:bg-emerald-100/70 hover:text-emerald-900'"
              @click="selectCategory(null)"
            >
              <i class="mdi mdi-view-grid-outline"></i>
              <span>ทั้งหมด</span>
            </button>

            <button
              v-for="cat in categories"
              :key="cat.shopCategoryId"
              class="flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-200"
              :class="categoryId === cat.shopCategoryId
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'bg-emerald-50/70 text-slate-600 hover:bg-emerald-100/70 hover:text-emerald-900'"
              @click="selectCategory(cat.shopCategoryId)"
            >
              <i class="mdi mdi-tag-outline"></i>
              <span>{{ cat.categoryName }}</span>
            </button>
          </div>
        </div>

        <!-- Inputs Grid -->
        <div class="grid gap-4 md:grid-cols-12 items-end">
          <!-- Search Input -->
          <div class="md:col-span-5">
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              <i class="mdi mdi-magnify text-emerald-600 mr-1"></i>ค้นหาชื่อร้านค้า
            </label>
            <div class="relative">
              <AppTextField
                v-model="search"
                placeholder="พิมพ์ชื่อร้านค้า หรือคีย์เวิร์ด..."
                class="w-full"
                @keyup.enter="loadShops"
              />
              <button
                v-if="search"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title="ล้างคำค้นหา"
                @click="search = ''; loadShops()"
              >
                <i class="mdi mdi-close-circle text-lg"></i>
              </button>
            </div>
          </div>

          <!-- Category Select -->
          <div class="md:col-span-3">
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              <i class="mdi mdi-shape-outline text-emerald-600 mr-1"></i>หมวดหมู่
            </label>
            <AppSelect
              v-model="categoryId"
              :items="categories"
              item-title="categoryName"
              item-value="shopCategoryId"
              placeholder="ทุกหมวดหมู่"
              clearable
              @change="loadShops"
            />
          </div>

          <!-- District Select -->
          <div class="md:col-span-3">
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              <i class="mdi mdi-map-marker-outline text-emerald-600 mr-1"></i>อำเภอ/เขต
            </label>
            <AppSelect
              v-model="districtId"
              :items="districts"
              item-title="districtName"
              item-value="districtId"
              placeholder="ทุกอำเภอ"
              clearable
              @change="loadShops"
            />
          </div>

          <!-- Action Buttons -->
          <div class="md:col-span-1 flex gap-2">
            <button
              class="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 hover:shadow-emerald-600/35 active:scale-95 disabled:opacity-60"
              :disabled="loading"
              title="ค้นหา"
              @click="loadShops"
            >
              <i class="mdi mdi-magnify text-xl" :class="{ 'animate-spin mdi-loading': loading }"></i>
            </button>

            <button
              v-if="activeFiltersCount > 0"
              class="flex h-11 shrink-0 px-3 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-semibold transition hover:bg-slate-100"
              title="ล้างเงื่อนไขการค้นหา"
              @click="clearFilters"
            >
              <i class="mdi mdi-refresh text-lg"></i>
            </button>
          </div>
        </div>

        <!-- Active Filter Pills Bar -->
        <div v-if="activeFiltersCount > 0" class="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
          <span class="font-medium text-slate-500">ตัวกรองที่เลือก:</span>

          <span v-if="search" class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-800 font-medium border border-emerald-200">
            <i class="mdi mdi-magnify text-xs"></i> "{{ search }}"
            <button class="hover:text-emerald-950" @click="search = ''; loadShops()"><i class="mdi mdi-close"></i></button>
          </span>

          <span v-if="selectedCategoryName" class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-800 font-medium border border-emerald-200">
            <i class="mdi mdi-tag-outline text-xs"></i> {{ selectedCategoryName }}
            <button class="hover:text-emerald-950" @click="categoryId = null; loadShops()"><i class="mdi mdi-close"></i></button>
          </span>

          <span v-if="selectedDistrictName" class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-800 font-medium border border-emerald-200">
            <i class="mdi mdi-map-marker-outline text-xs"></i> {{ selectedDistrictName }}
            <button class="hover:text-emerald-950" @click="districtId = null; loadShops()"><i class="mdi mdi-close"></i></button>
          </span>

          <button class="ml-auto text-xs font-semibold text-emerald-600 hover:text-emerald-800" @click="clearFilters">
            ล้างทั้งหมด ({{ activeFiltersCount }})
          </button>
        </div>
      </section>

      <!-- Status Header Bar -->
      <div class="my-6 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h2 class="text-xl font-bold text-slate-900">รายชื่อร้านค้า</h2>
          <span class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
            {{ loading ? '...' : shops.length }} ร้าน
          </span>
        </div>
      </div>

      <!-- Loading State Skeleton -->
      <div v-if="loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div class="h-52 w-full bg-slate-200"></div>
          <div class="p-6 space-y-3">
            <div class="h-4 w-1/3 rounded bg-slate-200"></div>
            <div class="h-6 w-3/4 rounded bg-slate-200"></div>
            <div class="h-4 w-full rounded bg-slate-200"></div>
            <div class="h-4 w-2/3 rounded bg-slate-200"></div>
            <div class="pt-4 border-t border-slate-100 flex justify-between">
              <div class="h-4 w-1/4 rounded bg-slate-200"></div>
              <div class="h-4 w-1/4 rounded bg-slate-200"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="shops.length === 0"
        class="my-10 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 px-6 text-center shadow-sm"
      >
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4">
          <i class="mdi mdi-store-search-outline text-4xl"></i>
        </div>
        <h3 class="text-xl font-bold text-slate-800">ไม่พบร้านค้าที่คุณกำลังค้นหา</h3>
        <p class="mt-2 max-w-md text-sm text-slate-500">
          ลองปรับเปลี่ยนคำค้นหา หรือล้างตัวกรองหมวดหมู่และอำเภอเพื่อดูร้านค้าทั้งหมดที่มีในกาญจนบุรี
        </p>
        <button
          class="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95"
          @click="clearFilters"
        >
          <i class="mdi mdi-refresh"></i>
          <span>ล้างตัวกรองทั้งหมด</span>
        </button>
      </div>

      <!-- Shops Grid -->
      <section v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="shop in shops"
          :key="shop.shopId"
          :to="`/shops/${shop.shopId}`"
          class="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-600/10"
        >
          <!-- Card Image Section -->
          <div class="relative h-52 w-full overflow-hidden bg-slate-100">
            <img
              v-if="shop.coverImageUrl"
              :src="imageUrl(shop.coverImageUrl)"
              :alt="shop.shopName"
              class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            />
            <div
              v-else
              class="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-6 text-center text-white"
            >
              <i class="mdi mdi-storefront text-5xl opacity-40"></i>
              <span class="mt-2 text-sm font-semibold tracking-wide text-emerald-100 opacity-90">
                {{ shop.categoryName || 'ร้านค้าเมืองกาญจน์' }}
              </span>
            </div>

            <!-- Gradient Overlay for Contrast -->
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity"></div>

            <!-- Top Floating Category Chip -->
            <div class="absolute top-3 left-3">
              <span class="inline-flex items-center gap-1 rounded-full bg-slate-900/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/20">
                <i class="mdi mdi-tag-outline text-emerald-300"></i>
                {{ shop.categoryName ?? 'ทั่วไป' }}
              </span>
            </div>

            <!-- Top Floating Verified Badge -->
            <div class="absolute top-3 right-3">
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/90 text-white shadow-md backdrop-blur-md" title="ร้านค้าได้รับการยืนยัน">
                <i class="mdi mdi-check-decagram text-base"></i>
              </span>
            </div>

            <!-- Bottom Floating District Tag on Image -->
            <div class="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-medium text-white/90">
              <i class="mdi mdi-map-marker text-emerald-400"></i>
              <span>{{ shop.districtName ?? shop.address ?? 'กาญจนบุรี' }}</span>
            </div>
          </div>

          <!-- Card Content Body -->
          <div class="flex flex-1 flex-col p-6">
            <!-- Shop Name -->
            <h3 class="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
              {{ shop.shopName }}
            </h3>

            <!-- Description -->
            <p class="mt-2.5 flex-1 line-clamp-2 text-sm text-slate-600 leading-relaxed">
              {{ shop.description || 'ยินดีต้อนรับสู่ร้านค้าท้องถิ่นคุณภาพ พร้อมให้บริการสินค้าหลากหลายในจังหวัดกาญจนบุรี' }}
            </p>

            <!-- Metadata & Action Bar -->
            <div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <!-- Contact Info snippet -->
              <div class="flex items-center gap-2 text-xs font-medium text-slate-500">
                <i v-if="shop.phone" class="mdi mdi-phone-outline text-emerald-600"></i>
                <span>{{ shop.phone || 'เปิดให้บริการ' }}</span>
              </div>

              <!-- Visit Button CTA -->
              <span class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                เข้าชมร้านค้า
                <i class="mdi mdi-arrow-right text-sm transition-transform group-hover:translate-x-1"></i>
              </span>
            </div>
          </div>
        </RouterLink>
      </section>
    </main>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
