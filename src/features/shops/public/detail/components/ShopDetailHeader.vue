<script setup lang="ts">
import type { Shop } from '@/features/shops/api'

defineProps<{
  shop: Shop
  shopArea: string
  averageRating: number
  totalReviews: number
  imageUrl: (url?: string) => string | undefined
}>()

const isFollowing = defineModel<boolean>('isFollowing', { default: false })

const emit = defineEmits<{
  (e: 'copy-link'): void
}>()
</script>

<template>
  <section class="relative bg-[#171412] border-b-2 border-[#E8D9C9] overflow-hidden">
    <!-- Background Cover Blur Image -->
    <div class="absolute inset-0 opacity-25 filter blur-xl scale-110 pointer-events-none">
      <img
        :src="
          imageUrl(shop.coverImageUrl) ||
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80'
        "
        :alt="shop.shopName"
        class="w-full h-full object-cover"
      />
    </div>

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div class="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
        <!-- Left: Shop Avatar & Identity Details -->
        <div class="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
          <!-- Avatar Frame -->
          <div class="relative shrink-0">
            <img
              :src="
                imageUrl(shop.coverImageUrl) ||
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'
              "
              :alt="shop.shopName"
              class="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-2xl ring-4 ring-[#D96C2C]/30 bg-white"
            />
            <span
              class="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#D96C2C] text-white shadow-lg border-2 border-white"
            >
              <i class="mdi mdi-check-decagram text-base"></i>
            </span>
          </div>

          <div class="space-y-2">
            <!-- Category & Location Badge -->
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span class="px-3 py-1 rounded-full text-xs font-black bg-[#D96C2C] text-white shadow-md">
                {{ shop.categoryName || 'ร้านค้าชุมชน' }}
              </span>
              <span
                class="px-3 py-1 rounded-full text-xs font-black bg-white/10 text-white backdrop-blur-md border border-white/20"
              >
                📍 {{ shopArea }}
              </span>
            </div>

            <!-- Shop Title -->
            <h1 class="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {{ shop.shopName }}
            </h1>

            <!-- Rating & Verified Info -->
            <div class="flex items-center justify-center sm:justify-start gap-3 text-xs text-amber-200 font-bold">
              <div
                class="flex items-center gap-1 bg-black/40 px-3 py-1 rounded-xl backdrop-blur-xs border border-white/10"
              >
                <i class="mdi mdi-star text-amber-400 text-sm"></i>
                <span class="font-black text-white">{{ averageRating ? averageRating.toFixed(1) : '4.8' }}</span>
                <span class="text-amber-200/80">({{ totalReviews }} รีวิว)</span>
              </div>
              <span class="text-white/40">•</span>
              <span class="text-emerald-300 font-extrabold flex items-center gap-1">
                <i class="mdi mdi-shield-check text-sm"></i> ร้านค้าลงทะเบียนแล้ว
              </span>
            </div>
          </div>
        </div>

        <!-- Right: Action Buttons (Follow, Share, Call) -->
        <div class="flex items-center justify-center sm:justify-end gap-3 w-full sm:w-auto shrink-0 flex-wrap">
          <!-- Share Button -->
          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-md border border-white/20 cursor-pointer shadow-md"
            title="คัดลอกลิงก์ร้านค้า"
            @click="emit('copy-link')"
          >
            <i class="mdi mdi-share-variant-outline text-lg"></i>
          </button>

          <!-- Call Button -->
          <a
            v-if="shop.phone"
            :href="`tel:${shop.phone}`"
            class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs sm:text-sm backdrop-blur-md border border-white/20 transition shadow-md"
          >
            <i class="mdi mdi-phone-outline text-base"></i>
            <span>โทรติดต่อ</span>
          </a>

          <!-- Follow Button -->
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-xl transition active:scale-95 cursor-pointer border-2"
            :class="
              isFollowing
                ? 'bg-white/10 text-white border-white/30 hover:bg-white/20'
                : 'bg-[#D96C2C] hover:bg-[#BF5720] text-white border-[#D96C2C]'
            "
            @click="isFollowing = !isFollowing"
          >
            <i
              :class="['mdi', isFollowing ? 'mdi-check text-emerald-400' : 'mdi-heart-outline text-white']"
            ></i>
            <span>{{ isFollowing ? 'ติดตามแล้ว' : 'กดติดตามร้าน' }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
