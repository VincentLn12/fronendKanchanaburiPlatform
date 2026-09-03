<script setup lang="ts">
interface Props {
  totalCount: number
  unitLabel?: string
  displayMode?: 'grid' | 'list'
  showDisplayToggle?: boolean
}

withDefaults(defineProps<Props>(), {
  unitLabel: 'รายการ',
  displayMode: 'grid',
  showDisplayToggle: true,
})

const emit = defineEmits<{
  (e: 'update:displayMode', mode: 'grid' | 'list'): void
}>()
</script>

<template>
  <div
    class="flex flex-wrap items-center justify-between gap-4 bg-[#FFF9F2] px-6 py-4 rounded-2xl border-2 border-[#E8D9C9] shadow-xs"
  >
    <div class="text-sm font-extrabold text-[#332820]">
      พบ <span class="text-[#D96C2C] font-black text-base">{{ totalCount }}</span> {{ unitLabel }}
    </div>

    <div
      v-if="showDisplayToggle"
      class="flex items-center gap-1 border-2 border-[#E8D9C9] bg-[#F7F0E6] p-1 rounded-xl shadow-2xs"
    >
      <button
        type="button"
        class="flex h-8 w-8 items-center justify-center text-xs font-bold rounded-lg transition cursor-pointer"
        :class="
          displayMode === 'grid'
            ? 'bg-[#D96C2C] text-white shadow-xs'
            : 'text-[#786B62] hover:bg-[#E8D9C9]/60'
        "
        @click="emit('update:displayMode', 'grid')"
        title="แสดงแบบตาราง"
      >
        <i class="mdi mdi-view-grid-outline" />
      </button>
      <button
        type="button"
        class="flex h-8 w-8 items-center justify-center text-xs font-bold rounded-lg transition cursor-pointer"
        :class="
          displayMode === 'list'
            ? 'bg-[#D96C2C] text-white shadow-xs'
            : 'text-[#786B62] hover:bg-[#E8D9C9]/60'
        "
        @click="emit('update:displayMode', 'list')"
        title="แสดงแบบรายการ"
      >
        <i class="mdi mdi-format-list-bulleted" />
      </button>
    </div>
  </div>
</template>
