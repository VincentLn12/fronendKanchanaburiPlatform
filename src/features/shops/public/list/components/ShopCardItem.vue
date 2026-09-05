<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Product, Shop } from '@/features/shops/api'

const props = defineProps<{
  shop: Shop
  index: number
  products?: Product[]
}>()

const isFollowing = ref(false)

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

function imageUrl(url?: string) {
  if (!url) return undefined
  return url.startsWith('/') ? `${apiOrigin}${url}` : url
}

const defaultImages = [
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=250&q=80',
]

const displayProducts = computed(() => {
  return props.products?.slice(0, 3) || []
})
</script>

<template>
  <div
    class="group bg-[#FFF9F2] rounded-3xl overflow-hidden border-2 border-[#E8D9C9] shadow-md hover:shadow-2xl hover:border-[#D96C2C] transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
  >
    <div>
      <!-- Cover Banner Photo Frame -->
      <div class="relative aspect-16/9 w-full overflow-hidden bg-[#171412]">
        <img
          :src="
            imageUrl(shop.backgroundImageUrl || shop.coverImageUrl) ||
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'
          "
          :alt="shop.shopName"
          loading="lazy"
          class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
        ></div>

        <!-- Top Left Status Badge (Mall / Top Seller / Recommended) -->
        <div class="absolute top-3 left-3">
          <span
            class="px-3 py-1 rounded-full text-[10px] font-black shadow-md border border-white/20 text-white"
            :class="
              index % 3 === 0 ? 'bg-[#D96C2C]' : index % 3 === 1 ? 'bg-amber-600' : 'bg-emerald-700'
            "
          >
            {{
              index % 3 === 0
                ? 'Verified Mall'
                : index % 3 === 1
                  ? 'Top Seller'
                  : 'ร้านค้าชุมชนเด่น'
            }}
          </span>
        </div>

        <!-- District Location Badge -->
        <div class="absolute top-3 right-3">
          <span
            class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-black/60 text-amber-200 backdrop-blur-md border border-white/20"
          >
            📍 อ.{{ shop.districtName || 'กาญจนบุรี' }}
          </span>
        </div>
      </div>

      <!-- Shop Identity Body -->
      <div class="p-5 space-y-4">
        <div class="flex items-center gap-3">
          <img
            :src="
              imageUrl(shop.coverImageUrl) ||
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
            "
            :alt="shop.shopName"
            class="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-[#D96C2C]/30 shrink-0"
          />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1">
              <h3
                class="font-black text-[#332820] text-base group-hover:text-[#D96C2C] transition truncate"
              >
                {{ shop.shopName }}
              </h3>
              <i
                class="mdi mdi-check-decagram text-[#D96C2C] text-sm shrink-0"
                title="ร้านค้าลงทะเบียนแล้ว"
              ></i>
            </div>
            <p class="text-xs text-[#786B62] font-semibold truncate">
              {{ shop.categoryName || 'ร้านค้าชุมชน' }} •
              {{ shop.subDistrictName ? `ต.${shop.subDistrictName}` : 'กาญจนบุรี' }}
            </p>
          </div>
        </div>

        <!-- Rating & Products Count Status Bar -->
        <div
          class="flex items-center justify-between text-xs bg-[#F7F0E6] p-2.5 rounded-2xl border border-[#E8D9C9] font-bold"
        >
          <span class="flex items-center gap-1 text-[#D96C2C]">
            <i class="mdi mdi-star text-amber-500"></i>
            <span class="font-black text-[#332820]">4.9</span>
            <span class="text-[10px] text-[#786B62]">(เรตติ้งดีเยี่ยม)</span>
          </span>
          <span class="text-emerald-700 text-[11px] font-extrabold flex items-center gap-1">
            <i class="mdi mdi-package-variant"></i> มีสินค้า {{ products?.length || 0 }} รายการ
          </span>
        </div>

        <!-- Mini Product Thumbnails Strip (Displays Real Products from Database!) -->
        <div class="space-y-1.5 pt-1">
          <div v-if="displayProducts.length" class="grid grid-cols-3 gap-2">
            <RouterLink
              v-for="(prod, pIdx) in displayProducts"
              :key="prod.productId"
              :to="`/products/${prod.productId}`"
              class="rounded-xl overflow-hidden border border-[#E8D9C9] bg-white p-1 text-center space-y-1 shadow-2xs hover:border-[#D96C2C] transition group/prod"
              :title="prod.productName"
            >
              <img
                :src="imageUrl(prod.imageUrl) || defaultImages[pIdx % defaultImages.length]"
                :alt="prod.productName"
                class="w-full aspect-square object-cover rounded-lg group-hover/prod:scale-105 transition"
              />
              <span class="block text-[10px] font-black text-[#D96C2C] truncate">
                ฿{{ prod.price.toLocaleString() }}
              </span>
            </RouterLink>
          </div>

          <!-- Empty State if shop has no products yet -->
          <div
            v-else
            class="p-2.5 rounded-xl border border-dashed border-[#E8D9C9] bg-white/60 text-center text-xs font-bold text-[#786B62]"
          >
            <span>สินค้ากำลังอัปเดตเร็วๆ นี้</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Dual Action Buttons Footer (Matches reference screenshot 1:1) -->
    <div class="p-5 pt-0 grid grid-cols-12 gap-2">
      <RouterLink
        :to="`/shops/${shop.shopId}`"
        class="col-span-8 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-black text-xs shadow-md transition border border-[#D96C2C] cursor-pointer"
      >
        <span class="!text-white font-black">เข้าชมหน้าร้าน</span>
        <i class="mdi mdi-arrow-right text-sm text-white"></i>
      </RouterLink>

      <button
        type="button"
        class="col-span-4 flex items-center justify-center gap-1 py-2.5 px-2 rounded-2xl border-2 transition font-black text-xs cursor-pointer active:scale-95"
        :class="
          isFollowing
            ? 'bg-slate-800 border-slate-800 text-white'
            : 'bg-white border-[#E8D9C9] text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C]'
        "
        @click="isFollowing = !isFollowing"
      >
        <i :class="['mdi', isFollowing ? 'mdi-check text-emerald-400' : 'mdi-plus']"></i>
        <span>{{ isFollowing ? 'ติดตามแล้ว' : 'ติดตาม' }}</span>
      </button>
    </div>
  </div>
</template>
