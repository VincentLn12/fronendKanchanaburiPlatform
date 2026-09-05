<script setup lang="ts">
import type { Product, Shop } from '@/features/shops/api'

const props = defineProps<{
  shops: Shop[]
  productsByShopId?: Map<string, Product[]>
}>()

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function imageUrl(url?: string) {
  if (!url) return undefined
  return url.startsWith('/') ? `${apiOrigin}${url}` : url
}

const defaultImages = [
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=300&q=80',
]

function getShopProducts(shopId: string): Product[] {
  const prods = props.productsByShopId?.get(shopId)
  if (prods && prods.length > 0) {
    return prods.slice(0, 3)
  }
  return []
}
</script>

<template>
  <section v-if="shops.length" class="space-y-3 sm:space-y-4">
    <!-- Header Title Bar -->
    <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-3">
      <div class="flex items-center gap-2.5">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D96C2C] text-white font-bold shadow-md shrink-0">
          <i class="mdi mdi-star text-lg text-white"></i>
        </div>
        <div>
          <h2 class="text-lg sm:text-xl font-black text-[#332820] tracking-tight">ร้านค้าแนะนำประจำสัปดาห์</h2>
          <span class="text-[10px] sm:text-[11px] font-extrabold text-[#D96C2C] bg-[#D96C2C]/10 px-2 py-0.5 rounded border border-[#D96C2C]/20">
            Curated Selection
          </span>
        </div>
      </div>

      <span class="text-xs font-bold text-[#786B62] hidden md:block">
        คัดสรรร้านค้าคุณภาพที่มีคะแนนรีวิวสูงสุด 3 อันดับแรก
      </span>
    </div>

    <!-- 3 Featured Store Cards (Mobile swipe horizontal carousel + Desktop 3 cols) -->
    <div class="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory scrollbar-none sm:grid sm:grid-cols-2 md:grid-cols-3 sm:overflow-visible sm:pb-0">
      <div
        v-for="(shop, idx) in shops.slice(0, 3)"
        :key="shop.shopId"
        class="min-w-[85%] sm:min-w-0 snap-center group bg-[#FFF9F2] rounded-3xl overflow-hidden border-2 border-[#E8D9C9] shadow-md hover:shadow-2xl hover:border-[#D96C2C] transition duration-300 flex flex-col justify-between"
      >
        <div>
          <!-- Banner Cover Header -->
          <div class="relative aspect-16/9 w-full overflow-hidden bg-[#171412]">
            <img
              :src="
                imageUrl(shop.backgroundImageUrl || shop.coverImageUrl) ||
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'
              "
              :alt="shop.shopName"
              class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

            <!-- Mall / Official Badge (Top Right) -->
            <span
              class="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black bg-[#D96C2C] text-white shadow-lg border border-white/20"
            >
              Official Mall
            </span>
          </div>

          <!-- Logo & Shop Header Details -->
          <div class="p-4 sm:p-5 space-y-3.5">
            <div class="flex items-center gap-3">
              <img
                :src="
                  imageUrl(shop.coverImageUrl) ||
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
                "
                :alt="shop.shopName"
                class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-[#D96C2C]/30 shrink-0"
              />
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1">
                  <h3 class="font-black text-[#332820] text-sm sm:text-base group-hover:text-[#D96C2C] transition truncate">
                    {{ shop.shopName }}
                  </h3>
                  <i class="mdi mdi-check-decagram text-[#D96C2C] text-sm shrink-0"></i>
                </div>
                <p class="text-xs text-[#786B62] font-semibold truncate">
                  📍 อ.{{ shop.districtName || 'กาญจนบุรี' }} • {{ shop.categoryName || 'ร้านค้าชุมชน' }}
                </p>
              </div>
            </div>

            <!-- Rating & Stats Strip -->
            <div class="flex items-center justify-between text-xs bg-[#F7F0E6] p-2.5 rounded-2xl border border-[#E8D9C9] font-bold">
              <span class="flex items-center gap-1 text-[#D96C2C]">
                <i class="mdi mdi-star"></i>
                <span class="font-black text-[#332820]">4.9</span>
                <span class="text-[10px] text-[#786B62]">(120+ รีวิว)</span>
              </span>
              <span class="text-[#786B62] font-semibold text-[11px]">
                มีสินค้า {{ productsByShopId?.get(shop.shopId)?.length || 0 }} รายการ
              </span>
            </div>

            <!-- Product Thumbnails Row Inside Card (Displays Real Products from Database!) -->
            <div class="space-y-1.5 pt-1">
              <span class="text-[10px] sm:text-[11px] font-black text-[#786B62] uppercase tracking-wider block">
                สินค้าแนะนำประจำร้าน
              </span>

              <!-- If shop has real products -->
              <div v-if="getShopProducts(shop.shopId).length" class="grid grid-cols-3 gap-2">
                <RouterLink
                  v-for="(prod, pIdx) in getShopProducts(shop.shopId)"
                  :key="prod.productId"
                  :to="`/products/${prod.productId}`"
                  class="rounded-xl overflow-hidden border border-[#E8D9C9] bg-white p-1 text-center space-y-1 hover:border-[#D96C2C] transition group/p"
                  :title="prod.productName"
                >
                  <img
                    :src="imageUrl(prod.imageUrl) || defaultImages[pIdx % defaultImages.length]"
                    :alt="prod.productName"
                    class="w-full aspect-square object-cover rounded-lg group-hover/p:scale-105 transition"
                  />
                  <span class="block text-[10px] font-black text-[#D96C2C] truncate">
                    ฿{{ prod.price.toLocaleString() }}
                  </span>
                </RouterLink>
              </div>

              <!-- Fallback if shop currently has no products -->
              <div
                v-else
                class="p-3 rounded-xl border border-dashed border-[#E8D9C9] bg-white/60 text-center text-xs font-bold text-[#786B62]"
              >
                <span>สินค้ากำลังอัปเดต</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Button Footer -->
        <div class="p-4 sm:p-5 pt-0">
          <RouterLink
            :to="`/shops/${shop.shopId}`"
            class="flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-black text-xs sm:text-sm shadow-md transition border border-[#D96C2C] cursor-pointer"
          >
            <span>เข้าสู่หน้าร้านค้า</span>
            <i class="mdi mdi-arrow-right text-base text-white"></i>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
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
