<script setup lang="ts">
import type { PublicContent } from '../../api/contentApi'

interface Props {
  items: PublicContent[]
}

defineProps<Props>()

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
</script>

<template>
  <section v-if="items.length" class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-8 shadow-xs space-y-6">
    <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-2xl bg-[#D96C2C] text-white flex items-center justify-center font-bold shadow-md">
          <i class="mdi mdi-book-open-page-variant-outline text-xl text-white"></i>
        </div>
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-[#332820]">คอนเทนต์เรื่องราวที่เกี่ยวข้อง</h2>
          <p class="text-xs text-[#786B62] font-medium">สำรวจเรื่องราวแนะนำจากสถานที่ใกล้เคียงในกาญจนบุรี</p>
        </div>
      </div>
      <RouterLink to="/contents" class="text-xs font-black text-[#D96C2C] hover:underline flex items-center gap-1">
        ดูทั้งหมด <i class="mdi mdi-arrow-right"></i>
      </RouterLink>
    </div>

    <!-- 3-4 Content Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <RouterLink
        v-for="item in items.slice(0, 4)"
        :key="item.contentId"
        :to="`/contents/${item.contentId}`"
        class="group flex flex-col justify-between rounded-2xl bg-white border-2 border-[#E8D9C9] overflow-hidden shadow-2xs hover:shadow-md hover:border-[#D96C2C] transition duration-300 transform hover:-translate-y-1"
      >
        <!-- 16:9 Thumbnail -->
        <div class="relative aspect-[16/9] w-full overflow-hidden bg-[#171412]">
          <img
            v-if="youtubeThumbnail(item.youtubeUrl)"
            :src="youtubeThumbnail(item.youtubeUrl)"
            :alt="item.title"
            class="h-full w-full object-cover group-hover:scale-108 transition duration-500"
          />
          <div
            v-else
            class="h-full w-full bg-gradient-to-br from-[#D96C2C] to-[#171412] flex items-center justify-center text-white"
          >
            <i class="mdi mdi-compass-rose text-3xl"></i>
          </div>

          <div class="absolute inset-0 bg-slate-950/10 group-hover:bg-slate-950/20 transition"></div>

          <!-- Category Badge -->
          <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#D96C2C] text-white text-[10px] font-black shadow-xs">
            {{ item.contentCategoryName || 'วัฒนธรรม' }}
          </span>
        </div>

        <!-- Content Info -->
        <div class="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
          <div>
            <h4 class="font-black text-[#332820] text-sm line-clamp-2 group-hover:text-[#D96C2C] transition">
              {{ item.title }}
            </h4>
          </div>

          <div class="pt-2 border-t-2 border-[#E8D9C9] flex items-center justify-between text-[11px] font-extrabold text-[#786B62]">
            <span class="flex items-center gap-1 text-[#D96C2C]">
              <i class="mdi mdi-map-marker text-[#D96C2C]"></i>
              อ.{{ item.districtName || 'กาญจนบุรี' }}
            </span>
            <span class="flex items-center gap-1">
              <i class="mdi mdi-eye-outline text-[#786B62]"></i>
              980 เข้าชม
            </span>
          </div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
