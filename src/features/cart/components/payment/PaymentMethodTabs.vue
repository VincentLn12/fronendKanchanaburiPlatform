<script setup lang="ts">
interface Props {
  currentTab: 'stripe' | 'qr'
}

defineProps<Props>()

const emit = defineEmits<{
  'update:currentTab': [val: 'stripe' | 'qr']
}>()
</script>

<template>
  <div class="grid grid-cols-2 gap-2 bg-[#F7F0E6] p-1.5 rounded-2xl border-2 border-[#E8D9C9]">
    <button
      type="button"
      class="py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5"
      :class="currentTab === 'stripe' ? 'bg-[#D96C2C] text-white shadow-md' : 'text-[#332820] hover:bg-white/50'"
      @click="emit('update:currentTab', 'stripe')"
    >
      <i class="mdi mdi-credit-card-outline text-sm"></i>
      <span>บัตรเครดิต / เดบิต (Stripe)</span>
    </button>
    <button
      type="button"
      class="py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5"
      :class="currentTab === 'qr' ? 'bg-[#D96C2C] text-white shadow-md' : 'text-[#332820] hover:bg-white/50'"
      @click="emit('update:currentTab', 'qr')"
    >
      <i class="mdi mdi-qrcode-scan text-sm"></i>
      <span>พร้อมเพย์ (PromptPay QR)</span>
    </button>
  </div>
</template>
