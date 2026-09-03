<script setup lang="ts">
import type { PublicContent, ContentShopProduct } from '../../api/contentApi'
import type { Shop } from '@/features/shops/shared/types/shop'
import ContentLocationMap from './ContentLocationMap.vue'

interface Props {
  content: PublicContent
  shops?: Shop[]
  products?: ContentShopProduct[]
}

defineProps<Props>()

const emit = defineEmits<{
  'open-directions': []
}>()

const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? 'https://localhost:7289'
const apiOrigin = rawApiUrl.startsWith('http')
  ? rawApiUrl.replace(/\/api$/, '')
  : 'https://localhost:7289'

function resolveImageUrl(url?: string) {
  if (!url || !url.trim()) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return url.startsWith('/') ? `${apiOrigin}${url}` : `${apiOrigin}/${url}`
}

function getProductImage(url?: string) {
  const resolved = resolveImageUrl(url)
  if (resolved) return resolved
  return 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80'
}

function getShopImage(url?: string) {
  const resolved = resolveImageUrl(url)
  if (resolved) return resolved
  return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80'
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

const fallbackProductImg = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80'
const fallbackShopImg = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80'
</script>

<template>
  <div class="space-y-6">
    <!-- Card 1: 🛍️ ร้านค้าและผลิตภัณฑ์ชุมชน -->
    <div
      class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-5 sm:p-6 shadow-md hover:shadow-lg transition-all space-y-4 text-[#332820] relative overflow-hidden"
    >
      <!-- Top Accent Banner -->
      <div class="absolute top-0 right-0 bg-[#D96C2C] text-white text-[10px] font-black px-3 py-0.5 rounded-bl-xl shadow-xs">
        สินค้า & ร้านค้าชุมชน
      </div>

      <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-3 pt-1">
        <div class="flex items-center gap-2.5">
          <div
            class="h-9 w-9 rounded-xl bg-[#D96C2C] text-white flex items-center justify-center font-bold shadow-xs shrink-0"
          >
            <i class="mdi mdi-storefront text-xl text-white"></i>
          </div>
          <div>
            <h3 class="font-black text-[#332820] text-base">ผลิตภัณฑ์ & ร้านค้าชุมชน</h3>
            <p class="text-[11px] text-[#786B62] font-semibold">อุดหนุนสินค้าท้องถิ่นสังขละบุรี</p>
          </div>
        </div>
      </div>

      <!-- Products Highlight List -->
      <div v-if="products && products.length" class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-[#D96C2C] uppercase tracking-wide flex items-center gap-1">
            <i class="mdi mdi-tag-outline text-[#D96C2C]"></i>
            สินค้าไฮไลท์ในวิดีโอ
          </span>
          <span class="text-[10px] font-bold text-[#786B62]">({{ products.length }} รายการ)</span>
        </div>

        <div class="space-y-2.5">
          <RouterLink
            v-for="prod in products.slice(0, 4)"
            :key="prod.productId"
            :to="`/products/${prod.productId}`"
            class="group flex items-center gap-3 p-2.5 rounded-2xl border-2 border-[#E8D9C9] bg-[#F7F0E6] hover:border-[#D96C2C] transition cursor-pointer shadow-2xs"
          >
            <!-- Product Thumbnail Image -->
            <div class="h-14 w-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-[#E8D9C9] relative shadow-2xs">
              <img
                :src="getProductImage(prod.imageUrl)"
                :alt="prod.productName"
                class="h-full w-full object-cover group-hover:scale-110 transition duration-300"
                @error="(e) => (e.target as HTMLImageElement).src = fallbackProductImg"
              />
            </div>

            <!-- Product Title & Price -->
            <div class="flex-1 min-w-0">
              <span class="font-black text-[#332820] text-xs block truncate group-hover:text-[#D96C2C] transition">
                {{ prod.productName }}
              </span>
              <p class="text-[11px] text-[#786B62] line-clamp-1 mt-0.5 font-medium">
                {{ prod.description || 'สินค้าภูมิปัญญาท้องถิ่น' }}
              </p>
              <span class="inline-block mt-1 font-black text-[#D96C2C] text-xs bg-[#D96C2C]/10 px-2 py-0.5 rounded-md border border-[#D96C2C]/20">
                {{ formatPrice(prod.price) }}
              </span>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- Shops List -->
      <div v-if="shops && shops.length" class="pt-3 border-t-2 border-[#E8D9C9] space-y-3">
        <span class="text-xs font-black text-[#D96C2C] uppercase tracking-wide block flex items-center gap-1">
          <i class="mdi mdi-store-outline text-[#D96C2C]"></i>
          ร้านค้าชุมชนแนะนำ
        </span>
        <div class="space-y-2.5">
          <RouterLink
            v-for="shop in shops.slice(0, 2)"
            :key="shop.shopId"
            :to="`/shops/${shop.shopId}`"
            class="group flex items-center gap-3 p-2.5 rounded-2xl border-2 border-[#E8D9C9] bg-[#F7F0E6] hover:border-[#D96C2C] transition shadow-2xs"
          >
            <!-- Shop Cover Image -->
            <div class="h-12 w-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-[#E8D9C9] relative shadow-2xs">
              <img
                :src="getShopImage(shop.coverImageUrl)"
                :alt="shop.shopName"
                class="h-full w-full object-cover group-hover:scale-110 transition duration-300"
                @error="(e) => (e.target as HTMLImageElement).src = fallbackShopImg"
              />
            </div>
            
            <div class="flex-1 min-w-0">
              <span class="font-black text-[#332820] text-xs block leading-tight group-hover:text-[#D96C2C] transition truncate">
                {{ shop.shopName }}
              </span>
              <span class="text-[11px] text-[#786B62] mt-0.5 block truncate font-semibold">
                <i class="mdi mdi-map-marker text-[#D96C2C] mr-0.5"></i>{{ shop.districtName || 'อ.สังขละบุรี' }}
              </span>
            </div>
            <i class="mdi mdi-chevron-right text-[#786B62] group-hover:text-[#D96C2C] text-lg"></i>
          </RouterLink>
        </div>
      </div>

      <div class="pt-1">
        <RouterLink
          to="/shops"
          class="w-full py-2.5 rounded-xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 border border-[#D96C2C]"
        >
          <span class="text-white">สำรวจร้านค้า & สินค้าชุมชนทั้งหมด</span>
          <i class="mdi mdi-arrow-right text-xs text-white"></i>
        </RouterLink>
      </div>
    </div>

    <!-- Card 2: 📍 สถานที่พร้อมแผนที่ -->
    <div
      class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-5 sm:p-6 shadow-sm space-y-4 text-[#332820]"
    >
      <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-3">
        <div class="flex items-center gap-2">
          <div
            class="h-8 w-8 rounded-xl bg-[#D96C2C]/10 border border-[#D96C2C]/20 flex items-center justify-center text-[#D96C2C]"
          >
            <i class="mdi mdi-map-marker-radius text-lg"></i>
          </div>
          <h3 class="font-black text-[#332820] text-base">พิกัดสถานที่จริง</h3>
        </div>
        <span
          class="inline-flex items-center gap-1 text-[10px] font-black text-[#D96C2C] bg-[#D96C2C]/10 border border-[#D96C2C]/20 px-2.5 py-0.5 rounded-full"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-[#D96C2C] animate-ping"></span>
          พร้อมนำทาง
        </span>
      </div>

      <div>
        <h4 class="font-black text-[#332820] text-sm leading-tight">{{ content.title }}</h4>
        <p class="text-xs text-[#786B62] font-semibold mt-1">
          {{
            [content.subDistrictName, content.districtName].filter(Boolean).join(' ') ||
            'สังขละบุรี กาญจนบุรี'
          }}
        </p>
      </div>

      <!-- Embedded Location Map -->
      <div class="rounded-2xl overflow-hidden border-2 border-[#E8D9C9] shadow-inner min-h-[200px]">
        <ContentLocationMap
          v-if="content.latitude && content.longitude"
          :latitude="content.latitude"
          :longitude="content.longitude"
          :title="content.title"
        />
        <div
          v-else
          class="h-44 bg-[#F7F0E6] flex flex-col items-center justify-center gap-2 text-[#786B62] text-xs font-semibold"
        >
          <i class="mdi mdi-map-marker-off text-3xl text-[#D96C2C]"></i>
          <span>ยังไม่มีพิกัดในระบบ</span>
        </div>
      </div>

      <div class="space-y-3 pt-1">
        <span
          v-if="content.latitude && content.longitude"
          class="text-[11px] font-bold text-[#786B62] flex items-center gap-1 bg-[#F7F0E6] border border-[#E8D9C9] px-3 py-1.5 rounded-xl w-full justify-center"
        >
          <i class="mdi mdi-compass-outline text-[#D96C2C]"></i>
          GPS: {{ content.latitude.toFixed(4) }}, {{ content.longitude.toFixed(4) }}
        </span>

        <!-- Navigation Button -->
        <button
          type="button"
          class="w-full py-3 rounded-xl bg-[#D96C2C] hover:bg-[#BF5720] text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer border border-[#D96C2C]"
          @click="emit('open-directions')"
        >
          <i class="mdi mdi-navigation-variant text-base text-white"></i>
          <span class="text-white">เปิดแผนที่ / นำทาง (Google Maps)</span>
        </button>
      </div>
    </div>
  </div>
</template>
