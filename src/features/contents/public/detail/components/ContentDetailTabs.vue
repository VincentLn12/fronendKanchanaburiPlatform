<script setup lang="ts">
type DetailTab = 'details' | 'schedules' | 'location' | 'shops' | 'products'

interface Props {
  activeTab: DetailTab
  hasSchedules?: boolean
  hasLocation?: boolean
  hasShops?: boolean
  hasProducts?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:activeTab': [tab: DetailTab]
}>()
</script>

<template>
  <section class="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        class="flex items-center gap-2 sm:gap-3 py-3 overflow-x-auto text-xs sm:text-sm font-bold scrollbar-none"
      >
        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2 rounded-xl transition duration-200 shrink-0 cursor-pointer"
          :class="
            activeTab === 'details'
              ? 'bg-[#1c4d3e] text-white shadow-md shadow-[#1c4d3e]/20 scale-102 font-extrabold'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80'
          "
          @click="emit('update:activeTab', 'details')"
        >
          <i class="mdi mdi-compass-rose text-base" :class="activeTab === 'details' ? 'text-white' : 'text-[#1c4d3e]'"></i>
          <span>รายละเอียด</span>
        </button>

        <button
          v-if="hasSchedules"
          type="button"
          class="flex items-center gap-2 px-4 py-2 rounded-xl transition duration-200 shrink-0 cursor-pointer"
          :class="
            activeTab === 'schedules'
              ? 'bg-[#1c4d3e] text-white shadow-md shadow-[#1c4d3e]/20 scale-102 font-extrabold'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80'
          "
          @click="emit('update:activeTab', 'schedules')"
        >
          <i class="mdi mdi-calendar-clock text-base" :class="activeTab === 'schedules' ? 'text-white' : 'text-[#1c4d3e]'"></i>
          <span>รอบการแสดง</span>
        </button>

        <button
          v-if="hasLocation"
          type="button"
          class="flex items-center gap-2 px-4 py-2 rounded-xl transition duration-200 shrink-0 cursor-pointer"
          :class="
            activeTab === 'location'
              ? 'bg-[#1c4d3e] text-white shadow-md shadow-[#1c4d3e]/20 scale-102 font-extrabold'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80'
          "
          @click="emit('update:activeTab', 'location')"
        >
          <i class="mdi mdi-map-marker-radius text-base" :class="activeTab === 'location' ? 'text-white' : 'text-[#1c4d3e]'"></i>
          <span>พิกัดสถานที่</span>
        </button>

        <button
          v-if="hasShops"
          type="button"
          class="flex items-center gap-2 px-4 py-2 rounded-xl transition duration-200 shrink-0 cursor-pointer"
          :class="
            activeTab === 'shops'
              ? 'bg-[#1c4d3e] text-white shadow-md shadow-[#1c4d3e]/20 scale-102 font-extrabold'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80'
          "
          @click="emit('update:activeTab', 'shops')"
        >
          <i class="mdi mdi-storefront text-base" :class="activeTab === 'shops' ? 'text-white' : 'text-[#1c4d3e]'"></i>
          <span>ร้านค้าที่เกี่ยวข้อง</span>
        </button>

        <button
          v-if="hasProducts"
          type="button"
          class="flex items-center gap-2 px-4 py-2 rounded-xl transition duration-200 shrink-0 cursor-pointer"
          :class="
            activeTab === 'products'
              ? 'bg-[#1c4d3e] text-white shadow-md shadow-[#1c4d3e]/20 scale-102 font-extrabold'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80'
          "
          @click="emit('update:activeTab', 'products')"
        >
          <i class="mdi mdi-shopping text-base" :class="activeTab === 'products' ? 'text-white' : 'text-[#1c4d3e]'"></i>
          <span>สินค้าที่เกี่ยวข้อง</span>
        </button>
      </div>
    </div>
  </section>
</template>
