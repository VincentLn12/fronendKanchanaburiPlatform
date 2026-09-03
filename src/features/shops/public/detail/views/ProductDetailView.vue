<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getProductReviews,
  getPublicProduct,
  getPublicProducts,
  getShop,
  type Product,
  type ProductReviews,
  type Shop,
} from '@/features/shops/api'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/features/auth/stores/auth'

// Sub-components
import ProductGallery from '../components/ProductGallery.vue'
import ProductInfoPanel from '../components/ProductInfoPanel.vue'
import ProductSellerCard from '../components/ProductSellerCard.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cartStore = useCartStore()
const swal = useSwal()

const product = ref<Product | null>(null)
const shop = ref<Shop | null>(null)
const otherShopProducts = ref<Product[]>([])
const recommendedProducts = ref<Product[]>([])
const reviewData = ref<ProductReviews>({ totalCount: 0, averageRating: 0, reviews: [] })

const selectedImageIndex = ref(0)
const quantity = ref(1)
const activeTab = ref<'details' | 'reviews'>('details')
const isFavorite = ref(false)

const loading = ref(true)
const adding = ref(false)
const buyingNow = ref(false)

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function imageUrl(url?: string) {
  if (!url) return undefined
  return url.startsWith('/') ? `${apiOrigin}${url}` : url
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

const galleryImages = computed(() => {
  const list: string[] = []
  if (product.value?.imageUrl) list.push(imageUrl(product.value.imageUrl)!)
  if (product.value?.detailImages?.length) {
    product.value.detailImages.forEach((img) => {
      if (img) list.push(imageUrl(img)!)
    })
  }
  const defaults = [
    'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  ]
  return list.length ? list : defaults
})

const maxQuantity = computed(() => {
  if (!product.value) return 1
  return Math.max(1, product.value.quantity)
})

function openMapDirections() {
  if (shop.value?.latitude != null && shop.value.longitude != null) {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${shop.value.latitude},${shop.value.longitude}`,
      '_blank',
    )
  }
}

async function addToCart() {
  if (!product.value) return
  if (!auth.isLoggedIn) {
    await router.push('/login')
    return
  }
  adding.value = true
  try {
    await cartStore.add(product.value.productId, quantity.value)
    await swal.success(
      'เพิ่มลงตะกร้าเรียบร้อย',
      `เพิ่ม ${product.value.productName} จำนวน ${quantity.value} ชิ้น เรียบร้อยแล้ว`,
    )
  } catch (error) {
    await swal.error('เพิ่มสินค้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    adding.value = false
  }
}

async function buyNow() {
  if (!product.value) return
  if (!auth.isLoggedIn) {
    await router.push('/login')
    return
  }
  buyingNow.value = true
  try {
    await cartStore.add(product.value.productId, quantity.value)
    await router.push('/cart')
  } catch (error) {
    await swal.error('ไม่สามารถดำเนินการได้', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    buyingNow.value = false
  }
}

onMounted(async () => {
  try {
    product.value = await getPublicProduct(String(route.params.id))
    const currentProduct = product.value
    const [currentShop, allProducts, reviews] = await Promise.all([
      getShop(currentProduct.shopId),
      getPublicProducts(),
      getProductReviews(currentProduct.productId).catch(() => ({
        totalCount: 0,
        averageRating: 0,
        reviews: [],
      })),
    ])
    shop.value = currentShop
    reviewData.value = reviews
    const otherProducts = allProducts.filter((item) => item.productId !== currentProduct.productId)
    otherShopProducts.value = otherProducts
      .filter((item) => item.shopId === currentProduct.shopId)
      .slice(0, 4)
    recommendedProducts.value = otherProducts
      .filter((item) => item.shopId !== currentProduct.shopId)
      .slice(0, 4)
  } catch (error) {
    await swal.error(
      'ไม่พบสินค้า',
      getApiErrorMessage(error, 'สินค้านี้อาจถูกปิดการขายหรือไม่มีอยู่ในระบบ'),
    )
    await router.replace('/shops')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="product && shop" class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-20 font-sans">
    <!-- BREADCRUMB BAR -->
    <div class="bg-[#FFF9F2] border-b-2 border-[#E8D9C9] py-3.5 shadow-2xs">
      <div
        class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-[#786B62] flex items-center gap-2 overflow-x-auto scrollbar-none font-bold"
      >
        <RouterLink to="/" class="hover:text-[#D96C2C] transition">หน้าแรก</RouterLink>
        <i class="mdi mdi-chevron-right text-[#E8D9C9]"></i>
        <RouterLink to="/shops" class="hover:text-[#D96C2C] transition">ร้านค้าทั้งหมด</RouterLink>
        <i class="mdi mdi-chevron-right text-[#E8D9C9]"></i>
        <RouterLink
          :to="`/shops/${shop.shopId}`"
          class="hover:text-[#D96C2C] line-clamp-1 transition"
        >
          {{ shop.shopName }}
        </RouterLink>
        <i class="mdi mdi-chevron-right text-[#E8D9C9]"></i>
        <span class="text-[#332820] font-black line-clamp-1">{{ product.productName }}</span>
      </div>
    </div>

    <!-- MAIN PRODUCT DISPLAY CONTAINER -->
    <section class="bg-[#FFF9F2] border-b-2 border-[#E8D9C9] py-8 shadow-sm">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <!-- Left Column: Product Image Gallery Component -->
          <div class="lg:col-span-6">
            <ProductGallery
              v-model:selected-image-index="selectedImageIndex"
              v-model:is-favorite="isFavorite"
              :product="product"
              :gallery-images="galleryImages"
            />
          </div>

          <!-- Right Column: Product Details & Purchase Panel Component -->
          <div class="lg:col-span-6">
            <ProductInfoPanel
              v-model:quantity="quantity"
              :product="product"
              :shop="shop"
              :adding="adding"
              :buying-now="buyingNow"
              :max-quantity="maxQuantity"
              :image-url="imageUrl"
              :format-price="formatPrice"
              @add-to-cart="addToCart"
              @buy-now="buyNow"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- SUB-NAV TAB BAR -->
    <section class="sticky top-20 z-30 bg-[#FFF9F2] border-b-2 border-[#E8D9C9] shadow-xs">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          class="flex items-center gap-8 overflow-x-auto text-xs sm:text-sm font-black scrollbar-none"
        >
          <button
            type="button"
            class="py-4 border-b-4 transition shrink-0 cursor-pointer"
            :class="
              activeTab === 'details'
                ? 'border-[#D96C2C] text-[#D96C2C]'
                : 'border-transparent text-[#786B62] hover:text-[#332820]'
            "
            @click="activeTab = 'details'"
          >
            รายละเอียดสินค้า
          </button>
          <button
            type="button"
            class="py-4 border-b-4 transition shrink-0 cursor-pointer"
            :class="
              activeTab === 'reviews'
                ? 'border-[#D96C2C] text-[#D96C2C]'
                : 'border-transparent text-[#786B62] hover:text-[#332820]'
            "
            @click="activeTab = 'reviews'"
          >
            รีวิวสินค้า ({{ reviewData.totalCount }})
          </button>
        </div>
      </div>
    </section>

    <!-- MAIN BODY CONTAINER -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- LEFT COLUMN: SPECS, DESCRIPTION & RECOMMENDED -->
        <div class="lg:col-span-8 space-y-8">
          <!-- SECTION 1: รายละเอียดสินค้า -->
          <section
            class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-7 shadow-md space-y-6"
          >
            <div class="flex items-center gap-2.5 border-b-2 border-[#E8D9C9] pb-4">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D96C2C] text-white shadow-md font-bold"
              >
                <i class="mdi mdi-clipboard-text-outline text-xl text-white"></i>
              </div>
              <div>
                <h2 class="text-xl font-black text-[#332820]">รายละเอียดสินค้าแบบเจาะลึก</h2>
                <p class="text-xs text-[#786B62]">ข้อมูลรายละเอียดวัตถุดิบและที่มาของสินค้า</p>
              </div>
            </div>

            <p
              v-if="product.description"
              class="text-sm text-[#786B62] leading-relaxed whitespace-pre-line font-semibold"
            >
              {{ product.description }}
            </p>
            <p v-else class="rounded-2xl bg-[#F7F0E6] p-8 text-center text-sm text-[#786B62]">
              ร้านค้ายังไม่ได้ระบุรายละเอียดข้อความสินค้า
            </p>

            <!-- Specs Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div class="p-4 rounded-2xl bg-[#F7F0E6] border-2 border-[#E8D9C9] text-xs space-y-2">
                <span class="font-black text-[#D96C2C] block uppercase tracking-wider"
                  >📌 ข้อมูลเฉพาะ</span
                >
                <ul class="space-y-1.5 text-[#332820] font-semibold">
                  <li><strong>หมวดหมู่:</strong> {{ shop.categoryName || 'สินค้าหัตถกรรม' }}</li>
                  <li><strong>ร้านผู้ผลิต:</strong> {{ shop.shopName }}</li>
                  <li>
                    <strong>แหล่งที่มา:</strong> {{ shop.districtName || 'สังขละบุรี' }} กาญจนบุรี
                  </li>
                </ul>
              </div>

              <div
                class="p-4 rounded-2xl bg-[#D96C2C]/10 border-2 border-[#D96C2C]/20 text-xs space-y-2"
              >
                <span class="font-black text-[#D96C2C] block uppercase tracking-wider"
                  >💚 การรับประกันและดูแล</span
                >
                <ul class="space-y-1.5 text-[#332820] font-semibold">
                  <li><strong>รับประกันสินค้า:</strong> ของแท้จากชุมชน 100%</li>
                  <li><strong>บริการจัดส่ง:</strong> พัสดุด่วน EMS / Flash Express</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- SECTION 2: สินค้าอื่นจากร้านนี้ -->
          <section
            v-if="otherShopProducts.length"
            class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-7 shadow-md space-y-6"
          >
            <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
              <h2 class="text-xl font-black text-[#332820]">สินค้าอื่นจากร้านนี้</h2>
              <RouterLink
                :to="`/shops/${shop.shopId}`"
                class="text-xs font-black text-[#D96C2C] hover:underline"
              >
                ดูทั้งหมด >
              </RouterLink>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <RouterLink
                v-for="op in otherShopProducts"
                :key="op.productId"
                :to="`/products/${op.productId}`"
                class="group bg-white rounded-2xl overflow-hidden border-2 border-[#E8D9C9] p-3 shadow-2xs hover:shadow-xl hover:border-[#D96C2C] hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div class="aspect-square rounded-xl overflow-hidden bg-slate-900 mb-2.5">
                    <img
                      v-if="op.imageUrl"
                      :src="imageUrl(op.imageUrl)"
                      :alt="op.productName"
                      class="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <h4
                    class="font-black text-[#332820] text-xs group-hover:text-[#D96C2C] transition line-clamp-1"
                  >
                    {{ op.productName }}
                  </h4>
                </div>
                <div
                  class="flex items-center justify-between text-xs mt-3 pt-2 border-t border-[#E8D9C9] font-black text-[#D96C2C]"
                >
                  <span>{{ formatPrice(op.price) }}</span>
                </div>
              </RouterLink>
            </div>
          </section>

          <!-- SECTION 3: สินค้าที่คุณอาจสนใจ -->
          <section
            v-if="recommendedProducts.length"
            class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-7 shadow-md space-y-6"
          >
            <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
              <h2 class="text-xl font-black text-[#332820]">สินค้าที่คุณอาจสนใจ</h2>
              <RouterLink to="/shops" class="text-xs font-black text-[#D96C2C] hover:underline">
                ดูทั้งหมด >
              </RouterLink>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <RouterLink
                v-for="rp in recommendedProducts"
                :key="rp.productId"
                :to="`/products/${rp.productId}`"
                class="group bg-white rounded-2xl overflow-hidden border-2 border-[#E8D9C9] p-3 shadow-2xs hover:shadow-xl hover:border-[#D96C2C] hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div class="aspect-square rounded-xl overflow-hidden bg-slate-900 mb-2.5">
                    <img
                      v-if="rp.imageUrl"
                      :src="imageUrl(rp.imageUrl)"
                      :alt="rp.productName"
                      class="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <h4
                    class="font-black text-[#332820] text-xs group-hover:text-[#D96C2C] transition line-clamp-1"
                  >
                    {{ rp.productName }}
                  </h4>
                </div>
                <div
                  class="flex items-center justify-between text-xs mt-3 pt-2 border-t border-[#E8D9C9] font-black text-[#D96C2C]"
                >
                  <span>{{ formatPrice(rp.price) }}</span>
                </div>
              </RouterLink>
            </div>
          </section>
        </div>

        <!-- RIGHT SIDEBAR: SELLER CARD COMPONENT -->
        <div class="lg:col-span-4">
          <ProductSellerCard
            :shop="shop"
            :image-url="imageUrl"
            @open-directions="openMapDirections"
          />
        </div>
      </div>
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
