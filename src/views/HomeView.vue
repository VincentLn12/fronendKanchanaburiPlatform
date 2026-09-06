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

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function resolveImageUrl(url?: string) {
  if (!url || !url.trim()) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return url.startsWith('/') ? `${apiOrigin}${url}` : `${apiOrigin}/${url}`
}

const defaultShopCovers = [
  'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
]

const defaultProductCovers = [
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
]

function getShopCover(shop: Shop, idx: number) {
  const resolved = resolveImageUrl(shop.coverImageUrl)
  if (resolved) return resolved
  return defaultShopCovers[idx % defaultShopCovers.length]
}

function getProductCover(prod: Product, idx: number) {
  const resolved = resolveImageUrl(prod.imageUrl)
  if (resolved) return resolved
  return defaultProductCovers[idx % defaultProductCovers.length]
}

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
      const val = shopRes.value
      const items = 'items' in val ? val.items : val
      shops.value = (items || []).slice(0, 4)
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
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820]">
    <!-- HERO BANNER SECTION -->
    <section
      class="relative bg-[#171412] text-white min-h-[520px] lg:min-h-[580px] flex items-center justify-center overflow-hidden border-b-4 border-[#D96C2C] shadow-2xl"
    >
      <!-- Background Image (Prominent & Vivid) -->
      <img
        :src="heroCoverImage"
        alt="สะพานข้ามแม่น้ำแคว กาญจนบุรี"
        class="absolute inset-0 w-full h-full object-cover object-center opacity-90 brightness-105 contrast-105 transition duration-700 hover:scale-105"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-[#171412] via-[#171412]/50 to-black/30"
      ></div>

      <!-- Hero Glass Content Frame -->
      <div class="relative z-10 mx-auto max-w-4xl px-4 text-center py-16">
        <div
          class="backdrop-blur-md bg-[#171412]/75 p-6 sm:p-10 rounded-3xl border-2 border-white/20 shadow-2xl space-y-4"
        >
          <div
            class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#D96C2C]/40 px-4 py-1.5 text-xs font-bold text-[#F2A65A] backdrop-blur-md mb-1"
          >
            ✨ แพลตฟอร์มท่องเที่ยวและวัฒนธรรมกาญจนบุรี
          </div>
          <h1
            class="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight text-white drop-shadow-xl"
          >
            ค้นพบเรื่องราว วิถีชุมชน<br />
            และภูมิปัญญาท้องถิ่นกาญจนบุรี
          </h1>
          <p
            class="text-sm sm:text-base md:text-lg text-[#F7F0E6] max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-md"
          >
            แหล่งรวมเรื่องราว วัฒนธรรม ร้านค้า และสินค้าท้องถิ่น<br class="hidden sm:inline" />
            จากชุมชนสู่ชุมชน เพื่อคนกาญจนบุรี
          </p>

          <!-- Search Input Bar -->
          <div class="mt-8 mx-auto max-w-2xl">
            <form
              @submit.prevent="handleSearch"
              class="flex items-center gap-2 rounded-2xl bg-[#FFF9F2] p-2 shadow-2xl border-2 border-[#E8D9C9]"
            >
              <div class="flex-1 flex items-center px-3">
                <i class="mdi mdi-magnify text-2xl text-[#D96C2C] mr-2"></i>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="ค้นหาสถานที่ เรื่องราว อาหาร กิจกรรม ร้านค้า..."
                  class="w-full bg-transparent text-[#332820] text-sm sm:text-base font-medium focus:outline-none placeholder:text-[#786B62]"
                />
              </div>
              <button
                type="submit"
                class="shrink-0 px-7 py-3 rounded-xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-bold text-sm transition duration-200 shadow-md flex items-center justify-center gap-2 border border-[#D96C2C] cursor-pointer"
              >
                <span class="!text-white font-bold text-base">ค้นหา</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- CATEGORIES BAR (DYNAMIC FROM API) -->
    <section
      v-if="categories.length"
      class="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12"
    >
      <div class="rounded-3xl bg-[#FFF9F2] p-4 sm:p-5 shadow-xl border-2 border-[#E8D9C9]">
        <div class="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          <RouterLink
            v-for="cat in categories"
            :key="cat.contentCategoryId"
            to="/contents"
            class="group shrink-0 flex flex-col items-center px-4 py-2.5 rounded-2xl border-2 border-[#E8D9C9] bg-white hover:bg-[#D96C2C]/10 hover:border-[#D96C2C] transition duration-200 shadow-2xs"
          >
            <span class="text-sm sm:text-base font-semibold text-[#332820] group-hover:text-[#D96C2C]">
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
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-[#332820] tracking-tight">
              เรื่องราวและคอนเทนต์แนะนำ
            </h2>
            <p class="text-sm text-[#786B62] font-medium mt-0.5">
              รวมเรื่องน่าสนใจ สถานที่ท่องเที่ยว และภูมิปัญญากาญจนบุรี
            </p>
          </div>
          <RouterLink
            to="/contents"
            class="text-sm sm:text-base font-semibold text-[#D96C2C] hover:underline flex items-center gap-1 transition"
          >
            <span>ดูทั้งหมด</span>
            <i class="mdi mdi-chevron-right text-lg"></i>
          </RouterLink>
        </div>

        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <div
            v-for="i in 5"
            :key="i"
            class="animate-pulse bg-[#FFF9F2] rounded-2xl h-48 border-2 border-[#E8D9C9]"
          ></div>
        </div>

        <div
          v-else-if="recommendedContents.length"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-5"
        >
          <RouterLink
            v-for="item in recommendedContents"
            :key="item.contentId"
            :to="`/contents/${item.contentId}`"
            class="group bg-[#FFF9F2] rounded-2xl overflow-hidden border-2 border-[#E8D9C9] shadow-2xs hover:shadow-xl hover:border-[#D96C2C] hover:-translate-y-1 transition duration-300 flex flex-col"
          >
            <div class="relative aspect-4/3 overflow-hidden bg-[#171412]">
              <img
                v-if="youtubeThumbnail(item.youtubeUrl)"
                :src="youtubeThumbnail(item.youtubeUrl)"
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#D96C2C] to-[#171412] text-white"
              >
                <i class="mdi mdi-compass-rose text-4xl opacity-40"></i>
              </div>
              <span
                class="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D96C2C]/90 text-white shadow-md"
              >
                {{ item.contentCategoryName || 'คอนเทนต์' }}
              </span>
            </div>
            <div class="p-3.5 flex flex-col flex-1 justify-between">
              <div>
                <h3
                  class="font-bold text-[#332820] text-sm sm:text-base group-hover:text-[#D96C2C] transition line-clamp-1"
                >
                  {{ item.title }}
                </h3>
                <p class="text-xs sm:text-sm text-[#786B62] line-clamp-2 mt-1 font-normal leading-relaxed">
                  {{ item.summary || 'เรื่องราวจากกาญจนบุรี' }}
                </p>
              </div>
              <div
                class="mt-3 flex items-center justify-between text-xs text-[#786B62] border-t border-[#E8D9C9] pt-2 font-medium"
              >
                <span class="flex items-center gap-1 line-clamp-1"
                  ><i class="mdi mdi-map-marker text-[#D96C2C]"></i
                  >{{ item.districtName || 'กาญจนบุรี' }}</span
                >
              </div>
            </div>
          </RouterLink>
        </div>
      </section>

      <!-- SECTION 2: สำรวจตามพื้นที่ (DISTRICTS FROM REAL API) -->
      <section v-if="districts.length">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-[#332820] tracking-tight">
              สำรวจตามอำเภอและพื้นที่
            </h2>
            <p class="text-sm text-[#786B62] font-medium mt-0.5">
              เลือกท่องเที่ยวและค้นหาเรื่องราวรายอำเภอ
            </p>
          </div>
          <RouterLink
            to="/contents"
            class="text-sm sm:text-base font-semibold text-[#D96C2C] hover:underline flex items-center gap-1 transition"
          >
            <span>ดูทั้งหมด</span>
            <i class="mdi mdi-chevron-right text-lg"></i>
          </RouterLink>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
          <RouterLink
            v-for="dist in districts"
            :key="dist.districtId"
            to="/contents"
            class="group bg-[#FFF9F2] p-4 rounded-2xl border-2 border-[#E8D9C9] shadow-2xs hover:border-[#D96C2C] hover:shadow-md transition duration-200 text-center"
          >
            <div
              class="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-[#D96C2C]/10 text-[#D96C2C] group-hover:bg-[#D96C2C] group-hover:text-white transition"
            >
              <i class="mdi mdi-map-marker text-xl"></i>
            </div>
            <h4
              class="font-bold text-[#332820] text-sm sm:text-base mt-2.5 group-hover:text-[#D96C2C]"
            >
              {{ dist.districtName }}
            </h4>
          </RouterLink>
        </div>
      </section>

      <!-- SECTION 3: ร้านค้าแนะนำ (SHOPS FROM REAL API) -->
      <section v-if="shops.length || loading">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-[#332820] tracking-tight">
              ร้านค้าชุมชนแนะนำ
            </h2>
            <p class="text-sm text-[#786B62] font-medium mt-0.5">
              อุดหนุนสินค้าท้องถิ่น ส่งตรงจากชาวบ้านกาญจนบุรี
            </p>
          </div>
          <RouterLink
            to="/shops"
            class="text-sm sm:text-base font-semibold text-[#D96C2C] hover:underline flex items-center gap-1 transition"
          >
            <span>ดูทั้งหมด</span>
            <i class="mdi mdi-chevron-right text-lg"></i>
          </RouterLink>
        </div>

        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            v-for="i in 4"
            :key="i"
            class="animate-pulse bg-[#FFF9F2] rounded-2xl h-44 border-2 border-[#E8D9C9]"
          ></div>
        </div>

        <div v-else-if="shops.length" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <RouterLink
            v-for="(shop, idx) in shops"
            :key="shop.shopId"
            :to="`/shops/${shop.shopId}`"
            class="group bg-[#FFF9F2] rounded-2xl overflow-hidden border-2 border-[#E8D9C9] shadow-2xs hover:shadow-xl hover:border-[#D96C2C] hover:-translate-y-1 transition duration-300"
          >
            <div class="relative aspect-16/10 overflow-hidden bg-[#171412]">
              <img
                :src="getShopCover(shop, idx)"
                :alt="shop.shopName"
                class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <div class="p-3.5">
              <h3
                class="font-bold text-[#332820] text-sm sm:text-base group-hover:text-[#D96C2C] transition line-clamp-1"
              >
                {{ shop.shopName }}
              </h3>
              <p class="mt-1 text-xs text-[#786B62] font-medium flex items-center gap-1">
                <i class="mdi mdi-map-marker text-[#D96C2C]"></i>อ.{{
                  shop.districtName || 'สังขละบุรี'
                }}
              </p>
            </div>
          </RouterLink>
        </div>
      </section>

      <!-- SECTION 4: สินค้าแนะนำ (PRODUCTS FROM REAL API) -->
      <section v-if="products.length || loading">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-[#332820] tracking-tight">
              สินค้าขึ้นชื่อแนะนำ
            </h2>
            <p class="text-sm text-[#786B62] font-medium mt-0.5">
              ของฝาก หัตถกรรม และของดีเมืองกาญจน์
            </p>
          </div>
          <RouterLink
            to="/shops"
            class="text-sm sm:text-base font-semibold text-[#D96C2C] hover:underline flex items-center gap-1 transition"
          >
            <span>ดูทั้งหมด</span>
            <i class="mdi mdi-chevron-right text-lg"></i>
          </RouterLink>
        </div>

        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            v-for="i in 4"
            :key="i"
            class="animate-pulse bg-[#FFF9F2] rounded-2xl h-44 border-2 border-[#E8D9C9]"
          ></div>
        </div>

        <div v-else-if="products.length" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <RouterLink
            v-for="(prod, idx) in products"
            :key="prod.productId"
            :to="`/products/${prod.productId}`"
            class="group bg-[#FFF9F2] rounded-2xl overflow-hidden border-2 border-[#E8D9C9] shadow-2xs hover:shadow-xl hover:border-[#D96C2C] hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
          >
            <div>
              <div class="relative aspect-16/10 overflow-hidden bg-[#171412]">
                <img
                  :src="getProductCover(prod, idx)"
                  :alt="prod.productName"
                  class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div class="p-3.5">
                <h3
                  class="font-bold text-[#332820] text-sm sm:text-base group-hover:text-[#D96C2C] transition line-clamp-1"
                >
                  {{ prod.productName }}
                </h3>
              </div>
            </div>
            <div class="px-3.5 pb-3.5 flex items-center justify-between border-t border-[#E8D9C9] pt-2.5">
              <span class="font-bold text-[#D96C2C] text-base sm:text-lg"
                >฿ {{ Number(prod.price).toLocaleString('th-TH') }}</span
              >
              <button
                class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D96C2C] text-white hover:bg-[#BF5720] transition shadow-xs"
                title="ดูสินค้า"
              >
                <i class="mdi mdi-arrow-right text-lg text-white"></i>
              </button>
            </div>
          </RouterLink>
        </div>
      </section>
    </div>
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
