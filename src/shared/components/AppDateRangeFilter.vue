<script setup lang="ts">
export type DatePreset = 'all' | 'today' | '7days' | '30days' | 'custom'

const preset = defineModel<DatePreset>('preset', { default: 'all' })
const startDate = defineModel<string>('startDate', { default: '' })
const endDate = defineModel<string>('endDate', { default: '' })

const emit = defineEmits<{
  (e: 'clear'): void
}>()

function handleClear() {
  preset.value = 'all'
  startDate.value = ''
  endDate.value = ''
  emit('clear')
}
</script>

<template>
  <div
    class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
  >
    <div class="flex items-center gap-2 flex-wrap">
      <span class="font-black text-[#332820] flex items-center gap-1.5 mr-1">
        <i class="mdi mdi-calendar-range text-[#D96C2C] text-base"></i>
        <span>ช่วงเวลา:</span>
      </span>

      <!-- Date Preset Quick Buttons -->
      <button
        type="button"
        class="px-3 py-1.5 rounded-xl font-black transition border-2 cursor-pointer"
        :class="
          preset === 'all'
            ? 'bg-[#D96C2C] text-white border-[#D96C2C]'
            : 'bg-white text-[#332820] border-[#E8D9C9] hover:border-[#D96C2C]'
        "
        @click="handleClear"
      >
        ทุกช่วงเวลา
      </button>

      <button
        type="button"
        class="px-3 py-1.5 rounded-xl font-black transition border-2 cursor-pointer"
        :class="
          preset === 'today'
            ? 'bg-[#D96C2C] text-white border-[#D96C2C]'
            : 'bg-white text-[#332820] border-[#E8D9C9] hover:border-[#D96C2C]'
        "
        @click="preset = 'today'"
      >
        วันนี้
      </button>

      <button
        type="button"
        class="px-3 py-1.5 rounded-xl font-black transition border-2 cursor-pointer"
        :class="
          preset === '7days'
            ? 'bg-[#D96C2C] text-white border-[#D96C2C]'
            : 'bg-white text-[#332820] border-[#E8D9C9] hover:border-[#D96C2C]'
        "
        @click="preset = '7days'"
      >
        7 วันล่าสุด
      </button>

      <button
        type="button"
        class="px-3 py-1.5 rounded-xl font-black transition border-2 cursor-pointer"
        :class="
          preset === '30days'
            ? 'bg-[#D96C2C] text-white border-[#D96C2C]'
            : 'bg-white text-[#332820] border-[#E8D9C9] hover:border-[#D96C2C]'
        "
        @click="preset = '30days'"
      >
        30 วันล่าสุด
      </button>

      <button
        type="button"
        class="px-3 py-1.5 rounded-xl font-black transition border-2 cursor-pointer"
        :class="
          preset === 'custom'
            ? 'bg-[#D96C2C] text-white border-[#D96C2C]'
            : 'bg-white text-[#332820] border-[#E8D9C9] hover:border-[#D96C2C]'
        "
        @click="preset = 'custom'"
      >
        ระบุช่วงวันที่...
      </button>
    </div>

    <!-- Custom Date Input Controls -->
    <div
      v-if="preset === 'custom'"
      class="flex items-center gap-2 bg-white p-2 rounded-2xl border-2 border-[#E8D9C9] shadow-2xs"
    >
      <input
        v-model="startDate"
        type="date"
        class="rounded-xl border border-[#E8D9C9] px-2.5 py-1 text-xs font-black outline-none focus:border-[#D96C2C]"
      />
      <span class="font-bold text-[#786B62]">ถึง</span>
      <input
        v-model="endDate"
        type="date"
        class="rounded-xl border border-[#E8D9C9] px-2.5 py-1 text-xs font-black outline-none focus:border-[#D96C2C]"
      />
      <button
        type="button"
        class="text-xs font-black text-rose-600 hover:underline px-1 cursor-pointer"
        @click="handleClear"
      >
        ล้าง
      </button>
    </div>
  </div>
</template>
