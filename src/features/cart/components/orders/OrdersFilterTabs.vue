<script setup lang="ts">
export interface OrderFilterCounts {
  all: number
  to_pay: number
  to_receive: number
  completed: number
  cancelled: number
}

interface Props {
  selectedFilter: string
  counts: OrderFilterCounts
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:selectedFilter': [filter: string]
}>()
</script>

<template>
  <div class="mb-6 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-2 shadow-md">
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      <!-- 1. ทั้งหมด -->
      <button
        type="button"
        class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer text-center"
        :class="
          props.selectedFilter === 'all'
            ? 'bg-[#D96C2C] text-white shadow-md shadow-[#D96C2C]/30 scale-[1.02] border border-[#D96C2C]'
            : 'bg-[#F7F0E6] border border-[#E8D9C9] text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C]'
        "
        @click="emit('update:selectedFilter', 'all')"
      >
        <i class="mdi mdi-format-list-bulleted text-base"></i>
        <span>ทั้งหมด</span>
        <span
          class="rounded-full px-2 py-0.5 text-xs font-black"
          :class="props.selectedFilter === 'all' ? 'bg-white/25 text-white' : 'bg-[#E8D9C9] text-[#332820]'"
        >
          {{ props.counts.all }}
        </span>
      </button>

      <!-- 2. ที่ต้องชำระ -->
      <button
        type="button"
        class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer text-center"
        :class="
          props.selectedFilter === 'to_pay'
            ? 'bg-[#D96C2C] text-white shadow-md shadow-[#D96C2C]/30 scale-[1.02] border border-[#D96C2C]'
            : 'bg-[#F7F0E6] border border-[#E8D9C9] text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C]'
        "
        @click="emit('update:selectedFilter', 'to_pay')"
      >
        <i class="mdi mdi-wallet-outline text-base"></i>
        <span>ที่ต้องชำระ</span>
        <span
          class="rounded-full px-2 py-0.5 text-xs font-black"
          :class="props.selectedFilter === 'to_pay' ? 'bg-white/25 text-white' : 'bg-[#E8D9C9] text-[#332820]'"
        >
          {{ props.counts.to_pay }}
        </span>
      </button>

      <!-- 3. ที่ต้องได้รับ -->
      <button
        type="button"
        class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer text-center"
        :class="
          props.selectedFilter === 'to_receive'
            ? 'bg-[#D96C2C] text-white shadow-md shadow-[#D96C2C]/30 scale-[1.02] border border-[#D96C2C]'
            : 'bg-[#F7F0E6] border border-[#E8D9C9] text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C]'
        "
        @click="emit('update:selectedFilter', 'to_receive')"
      >
        <i class="mdi mdi-truck-fast-outline text-base"></i>
        <span>ที่ต้องได้รับ</span>
        <span
          class="rounded-full px-2 py-0.5 text-xs font-black"
          :class="props.selectedFilter === 'to_receive' ? 'bg-white/25 text-white' : 'bg-[#E8D9C9] text-[#332820]'"
        >
          {{ props.counts.to_receive }}
        </span>
      </button>

      <!-- 4. สำเร็จแล้ว -->
      <button
        type="button"
        class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer text-center"
        :class="
          props.selectedFilter === 'completed'
            ? 'bg-[#D96C2C] text-white shadow-md shadow-[#D96C2C]/30 scale-[1.02] border border-[#D96C2C]'
            : 'bg-[#F7F0E6] border border-[#E8D9C9] text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C]'
        "
        @click="emit('update:selectedFilter', 'completed')"
      >
        <i class="mdi mdi-check-circle-outline text-base"></i>
        <span>สำเร็จแล้ว</span>
        <span
          class="rounded-full px-2 py-0.5 text-xs font-black"
          :class="props.selectedFilter === 'completed' ? 'bg-white/25 text-white' : 'bg-[#E8D9C9] text-[#332820]'"
        >
          {{ props.counts.completed }}
        </span>
      </button>

      <!-- 5. ยกเลิกแล้ว -->
      <button
        type="button"
        class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer text-center col-span-2 sm:col-span-1"
        :class="
          props.selectedFilter === 'cancelled'
            ? 'bg-[#D96C2C] text-white shadow-md shadow-[#D96C2C]/30 scale-[1.02] border border-[#D96C2C]'
            : 'bg-[#F7F0E6] border border-[#E8D9C9] text-[#332820] hover:border-[#D96C2C] hover:text-[#D96C2C]'
        "
        @click="emit('update:selectedFilter', 'cancelled')"
      >
        <i class="mdi mdi-close-circle-outline text-base"></i>
        <span>ยกเลิกแล้ว</span>
        <span
          class="rounded-full px-2 py-0.5 text-xs font-black"
          :class="props.selectedFilter === 'cancelled' ? 'bg-white/25 text-white' : 'bg-[#E8D9C9] text-[#332820]'"
        >
          {{ props.counts.cancelled }}
        </span>
      </button>
    </div>
  </div>
</template>
