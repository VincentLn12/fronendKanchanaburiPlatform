<script setup lang="ts">
import type { PublicContent } from '../api/contentApi'

interface Props {
  item: PublicContent
  displayMode?: 'grid' | 'list'
}

withDefaults(defineProps<Props>(), {
  displayMode: 'grid',
})

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

function formatPublishedDate(value?: string) {
  if (!value) return 'เรื่องราวกาญจนบุรี'
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}
</script>

<template>
  <!-- GRID MODE CARD -->
  <RouterLink
    v-if="displayMode === 'grid'"
    :to="`/contents/${item.contentId}`"
    class="group relative bg-white rounded-3xl overflow-hidden border border-[#E8E2D5] shadow-xs hover:shadow-xl hover:border-[#1C4D3E] transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between"
  >
    <!-- Card Image Frame (Clean Image - No Play Icon) -->
    <div>
      <div class="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        <img
          v-if="youtubeThumbnail(item.youtubeUrl)"
          :src="youtubeThumbnail(item.youtubeUrl)"
          :alt="item.title"
          class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
        />
        <div
          v-else
          class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1C4D3E] via-[#0D3831] to-slate-900 text-amber-200"
        >
          <i
            class="mdi mdi-compass-rose text-5xl opacity-80 group-hover:scale-110 transition-transform duration-500"
          ></i>
        </div>

        <div
          class="absolute inset-0 bg-slate-950/10 group-hover:bg-slate-950/20 transition duration-300"
        ></div>

        <!-- Top Left Category Badge -->
        <span
          v-if="item.contentCategoryName"
          class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black bg-[#1C4D3E]/95 text-amber-300 shadow-md backdrop-blur-md border border-amber-400/30 flex items-center gap-1.5"
        >
          <i class="mdi mdi-folder-outline text-xs"></i>
          {{ item.contentCategoryName }}
        </span>

        <!-- Top Right District Badge -->
        <span
          v-if="item.districtName"
          class="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/90 text-white shadow-md backdrop-blur-md border border-white/20 flex items-center gap-1"
        >
          <i class="mdi mdi-map-marker text-xs"></i>
          อ.{{ item.districtName }}
        </span>
      </div>

      <!-- Card Content Body -->
      <div class="p-5 space-y-2.5">
        <h3
          class="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-[#1C4D3E] transition-colors leading-snug line-clamp-2"
        >
          {{ item.title }}
        </h3>
        <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
          {{ item.summary || 'ค้นพบเรื่องราวน่าสนใจและการท่องเที่ยวในจังหวัดกาญจนบุรี' }}
        </p>
      </div>
    </div>

    <!-- Card Footer -->
    <div
      class="px-5 py-3.5 bg-[#F9F7F2] border-t border-[#E8E2D5] flex items-center justify-between text-xs font-medium"
    >
      <span class="flex items-center gap-1.5 text-slate-500">
        <i class="mdi mdi-calendar-blank-outline text-[#1C4D3E] text-sm"></i>
        {{ formatPublishedDate(item.publishedAt ?? item.createdAt) }}
      </span>

      <div
        class="flex items-center gap-1 font-extrabold text-[#1C4D3E] group-hover:text-[#D99A32] transition"
      >
        <span>อ่านรายละเอียด</span>
        <i
          class="mdi mdi-arrow-right text-sm transition-transform duration-200 group-hover:translate-x-1"
        ></i>
      </div>
    </div>
  </RouterLink>

  <!-- LIST MODE CARD -->
  <RouterLink
    v-else
    :to="`/contents/${item.contentId}`"
    class="group bg-white rounded-3xl overflow-hidden border border-[#E8E2D5] shadow-xs hover:shadow-xl hover:border-[#1C4D3E] transition-all duration-300 transform hover:-translate-y-1 flex flex-col sm:flex-row"
  >
    <div
      class="relative w-full sm:w-72 aspect-[16/9] sm:aspect-auto overflow-hidden bg-slate-100 shrink-0"
    >
      <img
        v-if="youtubeThumbnail(item.youtubeUrl)"
        :src="youtubeThumbnail(item.youtubeUrl)"
        :alt="item.title"
        class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1C4D3E] via-[#0D3831] to-slate-950 text-amber-200"
      >
        <i class="mdi mdi-compass-rose text-5xl opacity-80"></i>
      </div>
    </div>

    <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
      <div>
        <div class="flex items-center justify-between gap-2 mb-2">
          <span
            v-if="item.contentCategoryName"
            class="text-xs font-black text-[#1C4D3E] bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full"
          >
            {{ item.contentCategoryName }}
          </span>
          <span
            v-if="item.districtName"
            class="text-xs font-bold text-slate-500 flex items-center gap-1"
          >
            <i class="mdi mdi-map-marker text-[#D99A32]"></i>
            อ.{{ item.districtName }}
          </span>
        </div>
        <h3
          class="font-extrabold text-slate-900 text-lg group-hover:text-[#1C4D3E] transition-colors leading-snug"
        >
          {{ item.title }}
        </h3>
        <p class="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-1.5 leading-relaxed font-medium">
          {{ item.summary || 'ค้นพบเรื่องราวน่าสนใจและการท่องเที่ยวในจังหวัดกาญจนบุรี' }}
        </p>
      </div>

      <div
        class="flex items-center justify-between text-xs text-slate-500 border-t border-[#E8E2D5] pt-3 font-medium"
      >
        <span class="flex items-center gap-1.5 text-slate-500">
          <i class="mdi mdi-calendar-blank-outline text-[#1C4D3E]"></i>
          {{ formatPublishedDate(item.publishedAt ?? item.createdAt) }}
        </span>
        <div
          class="flex items-center gap-1 font-extrabold text-[#1C4D3E] group-hover:text-[#D99A32] transition"
        >
          <span>อ่านรายละเอียด</span>
          <i
            class="mdi mdi-arrow-right text-sm transition-transform duration-200 group-hover:translate-x-1"
          ></i>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
