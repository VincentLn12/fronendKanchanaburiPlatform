<script setup lang="ts">
import type { PublicContent } from '@/features/contents/api'
import type { Shop } from '@/features/shops/api'

defineProps<{
  shop: Shop
  shopContents: PublicContent[]
  youtubeThumbnail: (url?: string) => string
}>()
</script>

<template>
  <section
    v-if="shopContents.length"
    class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-7 shadow-xs space-y-6"
  >
    <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D96C2C] text-white shadow-xs font-bold"
        >
          <i class="mdi mdi-text-box-multiple-outline text-xl text-white"></i>
        </div>
        <div>
          <h2 class="text-xl font-black text-[#332820]">เรื่องราวและคอนเทนต์ชุมชน</h2>
          <p class="text-xs text-[#786B62]">คอนเทนต์สร้างสรรค์และเรื่องน่ารู้จากร้านนี้</p>
        </div>
      </div>

      <RouterLink
        :to="`/shops/${shop.shopId}/contents`"
        class="text-xs font-black text-[#D96C2C] hover:underline flex items-center gap-1"
      >
        <span>ดูบทความทั้งหมด</span>
        <i class="mdi mdi-chevron-right text-base"></i>
      </RouterLink>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <RouterLink
        v-for="item in shopContents.slice(0, 3)"
        :key="item.contentId"
        :to="`/contents/${item.contentId}`"
        class="group bg-white rounded-3xl overflow-hidden border-2 border-[#E8D9C9] p-3.5 shadow-2xs hover:shadow-xl hover:border-[#D96C2C] hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
      >
        <div>
          <div class="relative aspect-16/10 rounded-2xl overflow-hidden bg-[#171412] mb-3">
            <img
              v-if="youtubeThumbnail(item.youtubeUrl)"
              :src="youtubeThumbnail(item.youtubeUrl)"
              :alt="item.title"
              class="w-full h-full object-cover group-hover:scale-108 transition duration-500"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#D96C2C] to-[#171412] text-white"
            >
              <i class="mdi mdi-compass-rose text-4xl opacity-50"></i>
            </div>
            <span
              class="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#D96C2C] text-white shadow-md"
            >
              {{ item.contentCategoryName || 'เรื่องราว' }}
            </span>
          </div>

          <h3
            class="font-black text-[#332820] text-xs sm:text-sm group-hover:text-[#D96C2C] transition line-clamp-2 leading-snug"
          >
            {{ item.title }}
          </h3>
          <p
            v-if="item.summary"
            class="text-xs text-[#786B62] mt-1.5 line-clamp-2 font-medium leading-relaxed"
          >
            {{ item.summary }}
          </p>
        </div>

        <div
          class="flex items-center justify-between text-[11px] mt-3 pt-2 border-t border-[#E8D9C9] font-black text-[#D96C2C]"
        >
          <span>อ่านบทความ</span>
          <i class="mdi mdi-arrow-right"></i>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
