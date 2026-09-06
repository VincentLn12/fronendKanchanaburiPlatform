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
  <section class="relative isolate overflow-hidden bg-[#171412] text-white">
    <img
      :src="heroCoverImage"
      alt="สำรวจคอนเทนต์กาญจนบุรี"
      class="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-100 brightness-105 contrast-105"
    />
    <!-- Neutral dark gradient overlay for text legibility -->
    <div
      class="absolute inset-0 -z-10 bg-gradient-to-r from-[#171412]/95 via-[#171412]/80 to-transparent"
    ></div>
    <div
      class="absolute inset-0 -z-10 bg-gradient-to-t from-[#F7F0E6] via-transparent to-black/40"
    ></div>

    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div class="max-w-3xl">
        <p class="text-sm font-semibold tracking-wider text-[#F2A65A] uppercase flex items-center gap-1.5 drop-shadow-sm">
          <i class="mdi mdi-compass-rose text-lg"></i>
          KANCHANABURI CULTURAL TOURISM PLATFORM
        </p>
        <div class="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold leading-tight text-white drop-shadow-md sm:text-5xl">
              สำรวจเรื่องราวกาญจนบุรี
            </h1>
            <p
              class="mt-3 max-w-2xl text-base sm:text-lg leading-relaxed text-[#F7F0E6] drop-shadow-sm font-normal"
            >
              สัมผัสความงดงามทางวัฒนธรรม วิถีชีวิตท้องถิ่น และสถานที่ท่องเที่ยวที่คุณไม่ควรพลาด
            </p>
          </div>
          <div
            class="inline-flex shrink-0 self-start border-2 border-white/30 bg-[#171412]/90 backdrop-blur-md p-1.5 rounded-2xl shadow-xl"
            aria-label="เลือกรูปแบบการแสดงผล"
          >
            <button
              type="button"
              class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition cursor-pointer"
              :class="
                viewMode === 'contents'
                  ? 'bg-[#D96C2C] text-white shadow-md border border-white/20'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              "
              @click="emit('update:viewMode', 'contents')"
            >
              <i class="mdi mdi-play-box-multiple-outline text-lg text-white"></i>
              <span class="!text-white font-bold">รายการวิดีโอ</span>
            </button>
            <button
              type="button"
              class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition cursor-pointer"
              :class="
                viewMode === 'map'
                  ? 'bg-[#D96C2C] text-white shadow-md border border-white/20'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              "
              @click="emit('update:viewMode', 'map')"
            >
              <i class="mdi mdi-map-marker-radius-outline text-lg text-white"></i>
              <span class="!text-white font-bold">แผนที่พิกัด</span>
            </button>
          </div>
        </div>
        <form
          @submit.prevent="onSearchSubmit"
          class="mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-2 shadow-2xl backdrop-blur-md"
        >
          <div class="flex flex-1 items-center gap-2 px-3">
            <i class="mdi mdi-magnify text-[#D96C2C] text-2xl"></i>
            <input
              :value="search"
              @input="onSearchInput"
              type="text"
              placeholder="ค้นหาคอนเทนต์ เช่น รำมอญ, ที่เที่ยวสังขละบุรี, วัฒนธรรม..."
              class="w-full bg-transparent py-2 text-base font-medium text-[#332820] focus:outline-none placeholder:text-[#786B62]"
              @keyup.enter="onSearchSubmit"
            />
          </div>
          <button
            type="submit"
            class="shrink-0 rounded-xl bg-[#D96C2C] hover:bg-[#BF5720] px-7 py-3 text-sm font-bold text-white transition-all duration-200 shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer border border-[#D96C2C]"
          >
            <i class="mdi mdi-magnify text-lg text-white"></i>
            <span class="!text-white font-bold text-base">ค้นหา</span>
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
