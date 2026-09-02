<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  getContentCategories,
  getDistricts,
  getPublicContents,
  type ContentCategory,
  type District,
  type PublicContent,
} from '@/features/contents/public/api/contentApi'
import { getShops } from '@/features/shops/public/api/shopApi'
import type { Shop } from '@/features/shops/shared/types/shop'
import type { Product } from '@/features/shops/shared/types/product'
import http from '@/shared/api/http'
import heroCoverImage from '@/assets/รูปปก.png'

const router = useRouter()
const searchQuery = ref('')

const loading = ref(true)
const categories = ref<ContentCategory[]>([])
const recommendedContents = ref<PublicContent[]>([])
const communityStories = ref<PublicContent[]>([])
const districts = ref<District[]>([])
const shops = ref<Shop[]>([])
const products = ref<Product[]>([])

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/contents', query: { search: searchQuery.value } })
  } else {
    router.push('/contents')
  }
}

function youtubeThumbnail(url?: string) {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    const id = parsed.hostname.includes('youtu.be')
      ? parsed.pathname.slice(1)
      : (parsed.searchParams.get('v') ?? parsed.pathname.split('/').filter(Boolean).pop())
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''
  } catch {
    return ''
  }
}

async function loadHomeData() {
  loading.value = true
  try {
    const [catRes, contentRes, distRes, shopRes] = await Promise.allSettled([
      getContentCategories(),
      getPublicContents({ page: 1, pageSize: 10 }),
      getDistricts(),
      getShops(),
    ])

    if (catRes.status === 'fulfilled') {
      categories.value = catRes.value || []
    }

    if (contentRes.status === 'fulfilled' && contentRes.value) {
      const items = contentRes.value.items || []
      recommendedContents.value = items.slice(0, 5)
      communityStories.value = items.slice(5, 9)
    }

    if (distRes.status === 'fulfilled') {
      districts.value = distRes.value || []
    }

    if (shopRes.status === 'fulfilled') {
      shops.value = (shopRes.value || []).slice(0, 4)
    }

    try {
      const { data } = await http.get<Product[]>('/products', { params: { page: 1, pageSize: 4 } })
      products.value = (data || []).slice(0, 4)
    } catch {
      products.value = []
    }
  } catch {
    /* ignore */
  }
  loading.value = false
}

onMounted(loadHomeData)
</script>

<template>
  <div class="min-h-screen bg-[#f8faf9] text-slate-800">
    <!-- HERO BANNER SECTION -->
    <section class="relative bg-slate-950 text-white min-h-[520px] lg:min-h-[560px] flex items-center justify-center overflow-hidden border-b-4 border-slate-700 shadow-2xl">
      <!-- Background Image (Prominent & Vivid) -->
      <img
        :src="heroCoverImage"
        alt="สะพานข้ามแม่น้ำแคว กาญจนบุรี"
        class="absolute inset-0 w-full h-full object-cover object-center opacity-100 brightness-105 contrast-105 transition duration-700 hover:scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30"></div>

      <!-- Hero Glass Content Frame -->
      <div class="relative z-10 mx-auto max-w-4xl px-4 text-center py-16">
        <div class="backdrop-blur-md bg-slate-950/60 p-6 sm:p-10 rounded-3xl border border-white/25 shadow-2xl space-y-4">
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-xl">
            ค้นพบเรื่องราว วิถีชุมชน<br />
            และภูมิปัญญาท้องถิ่นกาญจนบุรี
          </h1>
          <p class="text-xs sm:text-base md:text-lg text-slate-200 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
            แหล่งรวมเรื่องราว วัฒนธรรม ร้านค้า และสินค้าท้องถิ่น<br class="hidden sm:inline" />
            จากชุมชนสู่ชุมชน เพื่อคนกาญจนบุรี
          </p>

        <!-- Search Input Bar -->
        <div class="mt-8 mx-auto max-w-2xl">
          <form @submit.prevent="handleSearch" class="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-emerald-950/30">
            <div class="flex-1 flex items-center px-3">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาสถานที่ เรื่องราว อาหาร กิจกรรม ร้านค้า..."
                class="w-full bg-transparent text-slate-800 text-sm sm:text-base focus:outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              class="shrink-0 px-7 py-3 rounded-xl bg-[#1c4d3e] hover:bg-[#14392e] text-white font-medium text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2"
            >
              <span>ค้นหา</span>
            </button>
          </form>
        </div>
        </div>
      </div>
    </section>

    <!-- CATEGORIES BAR (DYNAMIC FROM API) -->
    <section v-if="categories.length" class="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12">
      <div class="rounded-3xl bg-white p-4 sm:p-6 shadow-xl shadow-slate-900/5 border border-slate-100/80">
        <div class="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          <RouterLink
            v-for="cat in categories"
            :key="cat.contentCategoryId"
            to="/contents"
            class="group shrink-0 flex flex-col items-center px-4 py-2.5 rounded-2xl border border-slate-200/80 bg-slate-50 hover:bg-emerald-50 hover:border-[#1c4d3e] transition-all duration-200"
          >
            <span class="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#1c4d3e]">
              {{ cat.categoryName }}
            </span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- MAIN CONTENT CONTAINER -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">

      <!-- SECTION 1: คอนเทนต์แนะนำ (REAL API DATA) -->
      <section v-if="recommendedContents.length || loading">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">คอนเทนต์แนะนำ</h2>
          <RouterLink to="/contents" class="text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#1c4d3e] flex items-center gap-1 transition">
            <span>ดูทั้งหมด</span>
            <i class="mdi mdi-chevron-right text-base"></i>
          </RouterLink>
        </div>

        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <div v-for="i in 5" :key="i" class="animate-pulse bg-white rounded-2xl h-48 border border-slate-200"></div>
        </div>

        <div v-else-if="recommendedContents.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-5">
          <RouterLink
            v-for="item in recommendedContents"
            :key="item.contentId"
            :to="`/contents/${item.contentId}`"
            class="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition duration-300 flex flex-col"
          >
            <div class="relative aspect-4/3 overflow-hidden bg-slate-100">
              <img
                v-if="youtubeThumbnail(item.youtubeUrl)"
                :src="youtubeThumbnail(item.youtubeUrl)"
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1c4d3e] to-teal-900 text-emerald-200">
                <i class="mdi mdi-compass-rose text-4xl opacity-40"></i>
              </div>
            </div>
            <div class="p-3.5 flex flex-col flex-1 justify-between">
              <div>
                <h3 class="font-bold text-slate-900 text-sm group-hover:text-[#1c4d3e] transition line-clamp-1">
                  {{ item.title }}
                </h3>
                <span class="inline-block mt-1 text-[11px] font-medium text-slate-500">
                  {{ item.contentCategoryName || 'คอนเทนต์' }}
                </span>
              </div>
              <div class="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                <span class="flex items-center gap-1 line-clamp-1"><i class="mdi mdi-map-marker text-slate-400"></i>{{ item.districtName || 'กาญจนบุรี' }}</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </section>

      <!-- SECTION 2: สำรวจตามพื้นที่ (DISTRICTS FROM REAL API) -->
      <section v-if="districts.length">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">สำรวจตามพื้นที่</h2>
          <RouterLink to="/contents" class="text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#1c4d3e] flex items-center gap-1 transition">
            <span>ดูทั้งหมด</span>
            <i class="mdi mdi-chevron-right text-base"></i>
          </RouterLink>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
          <RouterLink
            v-for="dist in districts"
            :key="dist.districtId"
            to="/contents"
            class="group bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#1c4d3e] hover:shadow-md transition text-center"
          >
            <div class="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-emerald-50 text-[#1c4d3e] group-hover:bg-[#1c4d3e] group-hover:text-white transition">
              <i class="mdi mdi-map-marker text-xl"></i>
            </div>
            <h4 class="font-bold text-slate-900 text-xs sm:text-sm mt-2.5 group-hover:text-[#1c4d3e]">
              {{ dist.districtName }}
            </h4>
          </RouterLink>
        </div>
      </section>

      <!-- SECTION 3: ร้านค้าแนะนำ (SHOPS FROM REAL API) -->
      <section v-if="shops.length || loading">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">ร้านค้าท้องถิ่นแนะนำ</h2>
          <RouterLink to="/shops" class="text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#1c4d3e] flex items-center gap-1 transition">
            <span>ดูทั้งหมด</span>
            <i class="mdi mdi-chevron-right text-base"></i>
          </RouterLink>
        </div>

        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="animate-pulse bg-white rounded-2xl h-44 border border-slate-200"></div>
        </div>

        <div v-else-if="shops.length" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <RouterLink
            v-for="shop in shops"
            :key="shop.shopId"
            :to="`/shops/${shop.shopId}`"
            class="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition duration-300"
          >
            <div class="relative aspect-16/10 overflow-hidden bg-slate-100">
              <img v-if="shop.coverImageUrl" :src="shop.coverImageUrl" :alt="shop.shopName" class="w-full h-full object-cover group-hover:scale-105 transition" />
              <div v-else class="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">
                <i class="mdi mdi-store text-4xl"></i>
              </div>
            </div>
            <div class="p-3">
              <h3 class="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#1c4d3e] transition line-clamp-1">
                {{ shop.shopName }}
              </h3>
              <p v-if="shop.districtName" class="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
                <i class="mdi mdi-map-marker"></i>{{ shop.districtName }}
              </p>
            </div>
          </RouterLink>
        </div>
      </section>

      <!-- SECTION 4: สินค้าแนะนำ (PRODUCTS FROM REAL API) -->
      <section v-if="products.length || loading">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">สินค้าแนะนำ</h2>
          <RouterLink to="/shops" class="text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#1c4d3e] flex items-center gap-1 transition">
            <span>ดูทั้งหมด</span>
            <i class="mdi mdi-chevron-right text-base"></i>
          </RouterLink>
        </div>

        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="animate-pulse bg-white rounded-2xl h-44 border border-slate-200"></div>
        </div>

        <div v-else-if="products.length" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <RouterLink
            v-for="prod in products"
            :key="prod.productId"
            :to="`/products/${prod.productId}`"
            class="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition duration-300 flex flex-col justify-between"
          >
            <div>
              <div class="relative aspect-16/10 overflow-hidden bg-slate-100">
                <img v-if="prod.imageUrl" :src="prod.imageUrl" :alt="prod.productName" class="w-full h-full object-cover group-hover:scale-105 transition" />
                <div v-else class="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">
                  <i class="mdi mdi-package-variant text-4xl"></i>
                </div>
              </div>
              <div class="p-3">
                <h3 class="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#1c4d3e] transition line-clamp-1">
                  {{ prod.productName }}
                </h3>
              </div>
            </div>
            <div class="px-3 pb-3 flex items-center justify-between">
              <span class="font-black text-slate-900 text-sm">{{ prod.price }} บาท</span>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-[#1c4d3e] hover:bg-[#1c4d3e] hover:text-white transition"
                title="ดูสินค้า"
              >
                <i class="mdi mdi-arrow-right text-base"></i>
              </button>
            </div>
          </RouterLink>
        </div>
      </section>

    </div>
  </div>
</template>
