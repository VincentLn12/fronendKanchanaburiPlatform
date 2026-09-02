<script setup lang="ts">
import heroCoverImage from '@/assets/รูปปก.png'

interface Props {
  search: string
  viewMode: 'contents' | 'map'
}

defineProps<Props>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:viewMode': [value: 'contents' | 'map']
  search: []
}>()

function onSearchInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:search', target.value)
}

function onSearchSubmit() {
  emit('search')
}
</script>

<template>
  <section class="relative isolate overflow-hidden bg-slate-950 text-white">
    <img
      :src="heroCoverImage"
      alt="สำรวจคอนเทนต์กาญจนบุรี"
      class="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-100 brightness-105 contrast-105"
    />
    <!-- Neutral dark gradient overlay for text legibility -->
    <div
      class="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent"
    ></div>
    <div
      class="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30"
    ></div>

    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div class="max-w-3xl">
        <p class="text-xs font-black tracking-widest text-[#D99A32] uppercase flex items-center gap-1.5 drop-shadow-sm">
          <i class="mdi mdi-compass-rose text-base"></i>
          KANCHANABURI CULTURAL TOURISM PLATFORM
        </p>
        <div class="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-3xl font-black leading-tight text-white drop-shadow-md sm:text-5xl">
              สำรวจเรื่องราวกาญจนบุรี
            </h1>
            <p
              class="mt-3 max-w-2xl text-sm leading-relaxed text-amber-100/90 drop-shadow-sm sm:text-base font-medium"
            >
              สัมผัสความงดงามทางวัฒนธรรม วิถีชีวิตท้องถิ่น และสถานที่ท่องเที่ยวที่คุณไม่ควรพลาด
            </p>
          </div>
          <div
            class="inline-flex shrink-0 self-start border border-white/20 bg-slate-950/70 backdrop-blur-md p-1 rounded-2xl shadow-xl"
            aria-label="เลือกรูปแบบการแสดงผล"
          >
            <button
              type="button"
              class="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition cursor-pointer"
              :class="
                viewMode === 'contents'
                  ? 'bg-gradient-to-r from-[#D99A32] to-amber-600 text-white shadow-md'
                  : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
              "
              @click="emit('update:viewMode', 'contents')"
            >
              <i class="mdi mdi-play-box-multiple-outline text-base"></i>
              <span>รายการวิดีโอ</span>
            </button>
            <button
              type="button"
              class="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition cursor-pointer"
              :class="
                viewMode === 'map'
                  ? 'bg-gradient-to-r from-[#D99A32] to-amber-600 text-white shadow-md'
                  : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
              "
              @click="emit('update:viewMode', 'map')"
            >
              <i class="mdi mdi-map-marker-radius-outline text-base"></i>
              <span>แผนที่พิกัด</span>
            </button>
          </div>
        </div>
        <form
          @submit.prevent="onSearchSubmit"
          class="mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-white/40 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md"
        >
          <div class="flex flex-1 items-center gap-2 px-3">
            <i class="mdi mdi-magnify text-[#1C4D3E] text-2xl"></i>
            <input
              :value="search"
              @input="onSearchInput"
              type="text"
              placeholder="ค้นหาคอนเทนต์ เช่น รำมอญ, ที่เที่ยวสังขละบุรี, วัฒนธรรม..."
              class="w-full bg-transparent py-2 text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-400"
              @keyup.enter="onSearchSubmit"
            />
          </div>
          <button
            type="submit"
            class="shrink-0 rounded-xl bg-[#1C4D3E] hover:bg-[#14392E] px-6 py-3 text-xs font-extrabold text-white transition-all duration-200 shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <i class="mdi mdi-magnify text-base text-amber-300"></i>
            <span>ค้นหา</span>
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
