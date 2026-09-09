<script setup lang="ts">
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

function clearSearch() {
  emit('update:search', '')
  emit('search')
}
</script>

<template>
  <div class="border-b border-[#E8D9C9] bg-[#FFF9F2] px-4 py-4 sm:px-6 lg:px-8">
    <div
      class="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <!-- Page Title -->
      <div class="flex items-center ml-10 gap-10">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-[#332820] leading-tight">
            เรื่องราวกาญจนบุรี
          </h1>
          <p class="text-xs text-[#735D4D]">สำรวจคอนเทนต์ท่องเที่ยว วัฒนธรรม และสถานที่น่าสนใจ</p>
        </div>
      </div>

      <!-- Search & View Mode Controls (Clean Compact Row) -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search Input -->
        <form
          @submit.prevent="onSearchSubmit"
          class="flex items-center gap-2 rounded-xl border border-[#E8D9C9] bg-white px-3 py-1.5 shadow-2xs focus-within:border-[#D96C2C] focus-within:ring-2 focus-within:ring-[#D96C2C]/20"
        >
          <i class="mdi mdi-magnify text-[#D96C2C] text-lg"></i>
          <input
            :value="search"
            @input="onSearchInput"
            type="text"
            placeholder="ค้นหาเรื่องราว..."
            class="w-44 sm:w-60 bg-transparent py-1 text-sm font-medium text-[#332820] focus:outline-none placeholder:text-[#A69385]"
            @keyup.enter="onSearchSubmit"
          />
          <button
            v-if="search"
            type="button"
            @click="clearSearch"
            class="text-[#A69385] hover:text-[#332820] cursor-pointer"
          >
            <i class="mdi mdi-close-circle text-base"></i>
          </button>
        </form>

        <!-- View Mode Segmented Control -->
        <div class="inline-flex border border-[#E8D9C9] bg-white p-1 rounded-xl shadow-2xs">
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer"
            :class="
              viewMode === 'contents'
                ? 'bg-[#D96C2C] text-white shadow-2xs'
                : 'text-[#735D4D] hover:bg-[#F7F0E6] hover:text-[#332820]'
            "
            @click="emit('update:viewMode', 'contents')"
          >
            <i class="mdi mdi-play-box-multiple-outline text-sm"></i>
            <span>วิดีโอ</span>
          </button>
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer"
            :class="
              viewMode === 'map'
                ? 'bg-[#D96C2C] text-white shadow-2xs'
                : 'text-[#735D4D] hover:bg-[#F7F0E6] hover:text-[#332820]'
            "
            @click="emit('update:viewMode', 'map')"
          >
            <i class="mdi mdi-map-marker-radius-outline text-sm"></i>
            <span>แผนที่</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
