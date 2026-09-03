<script setup lang="ts">
interface Props {
  page: number
  totalPages: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:page', page: number): void
  (e: 'change', page: number): void
}>()

function goToPage(newPage: number) {
  if (newPage >= 1 && newPage <= props.totalPages && newPage !== props.page) {
    emit('update:page', newPage)
    emit('change', newPage)
  }
}
</script>

<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 pt-6">
    <button
      type="button"
      class="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#E8D9C9] bg-[#FFF9F2] text-xs font-bold transition hover:border-[#D96C2C] disabled:opacity-40 cursor-pointer shadow-2xs text-[#332820]"
      :disabled="page <= 1"
      @click="goToPage(page - 1)"
      title="หน้าก่อนหน้า"
    >
      <i class="mdi mdi-chevron-left text-base" />
    </button>

    <span
      class="px-4 py-2 rounded-xl bg-[#FFF9F2] border-2 border-[#E8D9C9] text-xs font-black text-[#D96C2C] shadow-2xs"
    >
      หน้า {{ page }} จาก {{ totalPages }}
    </span>

    <button
      type="button"
      class="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#E8D9C9] bg-[#FFF9F2] text-xs font-bold transition hover:border-[#D96C2C] disabled:opacity-40 cursor-pointer shadow-2xs text-[#332820]"
      :disabled="page >= totalPages"
      @click="goToPage(page + 1)"
      title="หน้าถัดไป"
    >
      <i class="mdi mdi-chevron-right text-base" />
    </button>
  </div>
</template>
