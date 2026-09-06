<script setup lang="ts">
interface Props {
  currentTab: 'stripe' | 'bank'
}

defineProps<Props>()

const emit = defineEmits<{
  'update:currentTab': [val: 'stripe' | 'bank']
}>()
</script>

<template>
  <div class="grid grid-cols-2 gap-2 bg-[#F7F0E6] p-1.5 rounded-2xl border-2 border-[#E8D9C9]">
    <button
      type="button"
      class="py-3 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5"
      :class="currentTab === 'stripe' ? 'bg-[#D96C2C] text-white shadow-md' : 'text-[#332820] hover:bg-white/50'"
      @click="emit('update:currentTab', 'stripe')"
    >
      <i class="mdi mdi-credit-card-outline text-base"></i>
      <span>บัตรเครดิต / เดบิต (Stripe)</span>
    </button>

    <button
      type="button"
      class="py-3 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5"
      :class="currentTab === 'bank' ? 'bg-[#D96C2C] text-white shadow-md' : 'text-[#332820] hover:bg-white/50'"
      @click="emit('update:currentTab', 'bank')"
    >
      <i class="mdi mdi-bank-transfer text-base"></i>
      <span>โอนผ่านธนาคาร (แนบสลิป)</span>
    </button>
  </div>
</template>
