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
    <!-- Card 1: 🛍️ ร้านค้าและผลิตภัณฑ์ชุมชน (EMPHASIZED WITH PROPER IMAGE URL RESOLUTION) -->
    <div
      class="rounded-3xl bg-white border-2 border-amber-300/80 p-5 sm:p-6 shadow-md hover:shadow-lg transition-all space-y-4 text-slate-800 relative overflow-hidden"
    >
      <!-- Top Accent Banner -->
      <div class="absolute top-0 right-0 bg-[#D99A32] text-white text-[10px] font-black px-3 py-0.5 rounded-bl-xl shadow-xs">
        สินค้า & ร้านค้าชุมชน
      </div>

      <div class="flex items-center justify-between border-b border-slate-100 pb-3 pt-1">
        <div class="flex items-center gap-2.5">
          <div
            class="h-9 w-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-[#D99A32] shadow-xs shrink-0"
          >
            <i class="mdi mdi-storefront text-xl"></i>
          </div>
          <div>
            <h3 class="font-black text-[#1C4D3E] text-base">ผลิตภัณฑ์ & ร้านค้าชุมชน</h3>
            <p class="text-[11px] text-slate-500 font-medium">อุดหนุนสินค้าท้องถิ่นสังขละบุรี</p>
          </div>
        </div>
      </div>

      <!-- Products Highlight List with Resolved Images & Fallback -->
      <div v-if="products && products.length" class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-[#1C4D3E] uppercase tracking-wide flex items-center gap-1">
            <i class="mdi mdi-tag-outline text-[#D99A32]"></i>
            สินค้าไฮไลท์ในวิดีโอ
          </span>
          <span class="text-[10px] font-bold text-slate-400">({{ products.length }} รายการ)</span>
        </div>

        <div class="space-y-2.5">
          <RouterLink
            v-for="prod in products.slice(0, 4)"
            :key="prod.productId"
            :to="`/products/${prod.productId}`"
            class="group flex items-center gap-3 p-2.5 rounded-2xl border border-slate-200/90 bg-[#F9F7F2] hover:border-[#1C4D3E] hover:bg-emerald-50/60 transition cursor-pointer shadow-2xs"
          >
            <!-- Product Thumbnail Image -->
            <div class="h-14 w-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200 relative shadow-2xs">
              <img
                :src="getProductImage(prod.imageUrl)"
                :alt="prod.productName"
                class="h-full w-full object-cover group-hover:scale-110 transition duration-300"
                @error="(e) => (e.target as HTMLImageElement).src = fallbackProductImg"
              />
            </div>

            <!-- Product Title & Price -->
            <div class="flex-1 min-w-0">
              <span class="font-extrabold text-slate-900 text-xs block truncate group-hover:text-[#1C4D3E] transition">
                {{ prod.productName }}
              </span>
              <p class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                {{ prod.description || 'สินค้าภูมิปัญญาท้องถิ่น' }}
              </p>
              <span class="inline-block mt-1 font-black text-[#D99A32] text-xs bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {{ formatPrice(prod.price) }}
              </span>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- Shops List with Cover Images & Fallback -->
      <div v-if="shops && shops.length" class="pt-3 border-t border-slate-100 space-y-3">
        <span class="text-xs font-extrabold text-[#1C4D3E] uppercase tracking-wide block flex items-center gap-1">
          <i class="mdi mdi-store-outline text-[#1C4D3E]"></i>
          ร้านค้าชุมชนแนะนำ
        </span>
        <div class="space-y-2.5">
          <RouterLink
            v-for="shop in shops.slice(0, 2)"
            :key="shop.shopId"
            :to="`/shops/${shop.shopId}`"
            class="group flex items-center gap-3 p-2.5 rounded-2xl border border-slate-200/90 bg-[#F9F7F2] hover:border-[#1C4D3E] transition shadow-2xs"
          >
            <!-- Shop Cover Image -->
            <div class="h-12 w-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200 relative shadow-2xs">
              <img
                :src="getShopImage(shop.coverImageUrl)"
                :alt="shop.shopName"
                class="h-full w-full object-cover group-hover:scale-110 transition duration-300"
                @error="(e) => (e.target as HTMLImageElement).src = fallbackShopImg"
              />
            </div>
            
            <div class="flex-1 min-w-0">
              <span class="font-extrabold text-slate-900 text-xs block leading-tight group-hover:text-[#1C4D3E] transition truncate">
                {{ shop.shopName }}
              </span>
              <span class="text-[11px] text-slate-500 mt-0.5 block truncate">
                <i class="mdi mdi-map-marker text-[#D99A32] mr-0.5"></i>{{ shop.districtName || 'อ.สังขละบุรี' }}
              </span>
            </div>
            <i class="mdi mdi-chevron-right text-slate-400 group-hover:text-[#1C4D3E] text-lg"></i>
          </RouterLink>
        </div>
      </div>

      <div class="pt-1">
        <RouterLink
          to="/shops"
          class="w-full py-2.5 rounded-xl bg-[#1C4D3E] hover:bg-[#14392E] text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
        >
          <span>สำรวจร้านค้า & สินค้าชุมชนทั้งหมด</span>
          <i class="mdi mdi-arrow-right text-xs"></i>
        </RouterLink>
      </div>
    </div>

    <!-- Card 2: 📍 สถานที่พร้อมแผนที่ (Interactive Location Map Card) -->
    <div
      class="rounded-3xl bg-white border border-[#E8E2D5] p-5 sm:p-6 shadow-sm space-y-4 text-slate-800"
    >
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2">
          <div
            class="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1C4D3E]"
          >
            <i class="mdi mdi-map-marker-radius text-lg"></i>
          </div>
          <h3 class="font-extrabold text-slate-900 text-base">พิกัดสถานที่จริง</h3>
        </div>
        <span
          class="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#1C4D3E] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          พร้อมนำทาง
        </span>
      </div>

      <div>
        <h4 class="font-extrabold text-slate-900 text-sm leading-tight">{{ content.title }}</h4>
        <p class="text-xs text-slate-500 font-medium mt-1">
          {{
            [content.subDistrictName, content.districtName].filter(Boolean).join(' ') ||
            'สังขละบุรี กาญจนบุรี'
          }}
        </p>
      </div>

      <!-- Embedded Location Map -->
      <div class="rounded-2xl overflow-hidden border border-slate-200 shadow-inner min-h-[200px]">
        <ContentLocationMap
          v-if="content.latitude && content.longitude"
          :latitude="content.latitude"
          :longitude="content.longitude"
          :title="content.title"
        />
        <div
          v-else
          class="h-44 bg-slate-100 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs font-semibold"
        >
          <i class="mdi mdi-map-marker-off text-3xl text-slate-300"></i>
          <span>ยังไม่มีพิกัดในระบบ</span>
        </div>
      </div>

      <div class="space-y-3 pt-1">
        <span
          v-if="content.latitude && content.longitude"
          class="text-[11px] font-bold text-slate-600 flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl w-full justify-center"
        >
          <i class="mdi mdi-compass-outline text-[#D99A32]"></i>
          GPS: {{ content.latitude.toFixed(4) }}, {{ content.longitude.toFixed(4) }}
        </span>

        <!-- Gold Navigation Button -->
        <button
          type="button"
          class="w-full py-3 rounded-xl bg-gradient-to-r from-[#D99A32] to-amber-600 hover:brightness-105 text-white text-xs font-extrabold transition flex items-center justify-center gap-2 shadow-md shadow-[#D99A32]/20 active:scale-95 cursor-pointer"
          @click="emit('open-directions')"
        >
          <i class="mdi mdi-navigation-variant text-base"></i>
          <span>เปิดแผนที่ / นำทาง (Google Maps)</span>
        </button>
      </div>
    </div>
  </div>
</template>
