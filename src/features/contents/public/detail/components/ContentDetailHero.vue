<script setup lang="ts">
import type { PublicContent } from '../../api/contentApi'

interface Props {
  content: PublicContent
  isFavorite: boolean
  changingFavorite?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'toggle-favorite': []
  share: [platform?: string]
}>()

function youtubeEmbedUrl(url?: string) {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    const videoId = parsed.hostname.includes('youtu.be')
      ? parsed.pathname.slice(1)
      : (parsed.searchParams.get('v') ??
          (parsed.pathname.startsWith('/embed/') ? parsed.pathname.split('/')[2] : ''))
    return videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&rel=0`
      : ''
  } catch {
    return ''
  }
}


function formatDate(value?: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(new Date(value))
}
</script>

<template>
  <div class="space-y-5">
    <!-- 16:9 Cinema Video Player Container -->
    <div
      class="relative overflow-hidden rounded-3xl border border-slate-900/90 bg-slate-950 shadow-xl group aspect-[16/9] w-full"
    >
      <iframe
        v-if="youtubeEmbedUrl(content.youtubeUrl)"
        :src="youtubeEmbedUrl(content.youtubeUrl)"
        :title="content.title"
        class="h-full w-full border-0 relative z-10"
        allowfullscreen
      />
      <a
        v-else
        :href="content.youtubeUrl || '#'"
        target="_blank"
        rel="noopener"
        class="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#1C4D3E] via-[#0D3831] to-slate-950 text-center text-white transition hover:brightness-105"
      >
        <div
          class="h-20 w-20 rounded-full bg-[#D99A32] text-white flex items-center justify-center shadow-xl shadow-[#D99A32]/30 transform group-hover:scale-110 transition duration-300 ring-4 ring-[#D99A32]/40"
        >
          <i class="mdi mdi-play text-5xl ml-1"></i>
        </div>
        <div>
          <span class="text-lg font-extrabold text-white block">รับชมวิดีโอแนะนำสถานที่บน YouTube</span>
          <span class="text-xs text-amber-200/80 font-medium mt-1 block"
            >คลิกเพื่อเปิดเล่นวิดีโอคุณภาพสูง</span
          >
        </div>
      </a>

      <!-- Video Overlay Badge -->
      <div class="absolute top-4 left-4 z-20 flex items-center gap-2">
        <span
          class="px-3.5 py-1.5 rounded-full text-xs font-black bg-[#1C4D3E]/90 text-amber-300 border border-amber-400/40 backdrop-blur-md shadow-md flex items-center gap-1.5"
        >
          <i class="mdi mdi-compass-rose text-sm"></i>
          {{ content.contentCategoryName || 'ศิลปะการแสดง' }}
        </span>
      </div>
    </div>

    <!-- Video Title & Main Action Bar -->
    <div class="rounded-3xl bg-white border border-[#E8E2D5] p-6 shadow-sm space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- Category & Location Badge -->
        <div class="flex flex-wrap items-center gap-2 text-xs font-bold text-[#1C4D3E]">
          <span class="bg-[#1C4D3E]/10 text-[#1C4D3E] px-3 py-1 rounded-full flex items-center gap-1">
            <i class="mdi mdi-folder-outline"></i>
            {{ content.contentCategoryName || 'วัฒนธรรม' }}
          </span>
          <span class="bg-amber-50 text-[#D99A32] px-3 py-1 rounded-full flex items-center gap-1 border border-amber-200">
            <i class="mdi mdi-map-marker text-[#D99A32]"></i>
            อ.{{ content.districtName || 'สังขละบุรี' }} จ.กาญจนบุรี
          </span>
        </div>

        <!-- Action Buttons: Bookmark & Share -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-extrabold text-xs hover:bg-slate-100 transition cursor-pointer active:scale-95 shadow-2xs"
            @click="emit('share')"
          >
            <i class="mdi mdi-share-variant-outline text-sm text-[#D99A32]"></i>
            <span>แชร์</span>
          </button>

          <button
            type="button"
            class="flex items-center gap-1.5 px-4 py-2 rounded-xl border transition font-extrabold text-xs active:scale-95 cursor-pointer shadow-2xs"
            :class="
              isFavorite
                ? 'border-rose-200 bg-rose-50 text-rose-600'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            "
            :disabled="changingFavorite"
            @click="emit('toggle-favorite')"
          >
            <i
              class="mdi text-sm"
              :class="isFavorite ? 'mdi-heart text-rose-600' : 'mdi-heart-outline text-[#D99A32]'"
            ></i>
            <span>{{ isFavorite ? 'บันทึกแล้ว' : 'บันทึก' }}</span>
          </button>
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
        {{ content.title }}
      </h1>

      <!-- Metadata Statistics Row -->
      <div
        class="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-100 text-xs text-slate-500 font-medium"
      >
        <div class="flex flex-wrap items-center gap-4">
          <span class="flex items-center gap-1">
            <i class="mdi mdi-clock-outline text-slate-400"></i>
            เผยแพร่: {{ formatDate(content.publishedAt || content.createdAt) }}
          </span>
          <span class="flex items-center gap-1 text-[#1C4D3E] font-bold">
            <i class="mdi mdi-eye-outline text-[#D99A32]"></i>
            1,280 เข้าชม
          </span>
          <span v-if="content.shopName" class="flex items-center gap-1 text-slate-700">
            <i class="mdi mdi-account-circle-outline text-[#1C4D3E]"></i>
            ผู้เผยแพร่: <strong class="text-[#1C4D3E]">{{ content.shopName }}</strong>
          </span>
        </div>
      </div>

      <!-- Hashtag Pills -->
      <div v-if="content.tags.length" class="flex flex-wrap gap-1.5">
        <span
          v-for="tag in content.tags"
          :key="tag.tagId"
          class="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-[#D99A32] transition"
        >
          #{{ tag.tagName }}
        </span>
      </div>
      <div v-else class="flex flex-wrap gap-1.5">
        <span class="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700">#รำมอญ</span>
        <span class="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700">#วัฒนธรรมมอญ</span>
        <span class="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700">#สังขละบุรี</span>
        <span class="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700">#กาญจนบุรี</span>
      </div>
    </div>
  </div>
</template>
