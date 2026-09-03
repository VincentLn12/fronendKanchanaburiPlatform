<script setup lang="ts">
import type { Shop } from '@/features/shops/api'
import type { PublicContent } from '@/features/contents/api'

defineProps<{
  shop: Shop
  shopContents: PublicContent[]
  youtubeThumbnail: (url?: string) => string
}>()
</script>

<template>
  <section v-if="shopContents.length" class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-7 shadow-md space-y-6">
    <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D96C2C] text-white shadow-md font-bold">
          <i class="mdi mdi-book-open-page-variant-outline text-xl text-white"></i>
        </div>
        <div>
          <h2 class="text-xl font-black text-[#332820]">เรื่องราวและคอนเทนต์ชุมชน</h2>
          <p class="text-xs text-[#786B62]">วิถีชีวิตและเรื่องเล่าเบื้องหลังร้านค้า</p>
        </div>
      </div>

      <RouterLink
        v-if="shop"
        :to="`/shops/${shop.shopId}/contents`"
        class="text-xs font-black text-[#D96C2C] hover:underline flex items-center gap-1"
      >
        <span>ดูเรื่องราวทั้งหมด</span>
        <i class="mdi mdi-chevron-right text-base"></i>
      </RouterLink>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <RouterLink
        v-for="story in shopContents.slice(0, 3)"
        :key="story.contentId"
        :to="`/contents/${story.contentId}`"
        class="group bg-white rounded-3xl overflow-hidden border-2 border-[#E8D9C9] p-3.5 shadow-2xs hover:shadow-xl hover:border-[#D96C2C] hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
      >
        <div>
          <div class="relative aspect-16/10 rounded-2xl overflow-hidden bg-[#171412] mb-3">
            <img
              v-if="youtubeThumbnail(story.youtubeUrl)"
              :src="youtubeThumbnail(story.youtubeUrl)"
              :alt="story.title"
              class="w-full h-full object-cover group-hover:scale-108 transition duration-500"
            />
            <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#D96C2C] to-[#171412] text-white">
              <i class="mdi mdi-compass-rose text-4xl opacity-50"></i>
            </div>
            <span class="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#D96C2C] text-white shadow-md">
              {{ story.contentCategoryName || 'เรื่องราว' }}
            </span>
          </div>

          <h3 class="font-black text-[#332820] text-sm group-hover:text-[#D96C2C] transition line-clamp-2 leading-snug">
            {{ story.title }}
          </h3>
          <p v-if="story.summary" class="text-xs text-[#786B62] mt-1.5 line-clamp-2 font-medium">
            {{ story.summary }}
          </p>
        </div>

        <div class="flex items-center justify-between mt-4 pt-2.5 border-t border-[#E8D9C9] text-xs font-bold text-[#786B62]">
          <span class="flex items-center gap-1"><i class="mdi mdi-map-marker text-[#D96C2C]"></i>{{ story.districtName || 'กาญจนบุรี' }}</span>
          <span class="text-[11px] font-semibold text-[#D96C2C] group-hover:underline">อ่านต่อ ></span>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
