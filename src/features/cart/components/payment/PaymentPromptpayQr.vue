<script setup lang="ts">
interface Props {
  paying: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'confirm': []
}>()
</script>

<template>
  <div class="space-y-5 text-center">
    <div class="rounded-2xl border-2 border-[#E8D9C9] bg-white p-6 shadow-inner space-y-4">
      <div class="flex items-center justify-center gap-2">
        <span class="text-xs font-black bg-blue-900 text-white px-3 py-1 rounded-md tracking-wider">PromptPay</span>
        <span class="text-xs font-black text-[#332820]">สแกนเพื่อชำระเงิน</span>
      </div>

      <!-- Thai QR Code Graphic Container -->
      <div class="relative mx-auto w-52 h-52 bg-white p-3 rounded-2xl border-2 border-[#D96C2C] shadow-md flex items-center justify-center">
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020101021230480016A0000006770101110113006680000000053037645802TH5912Kanchanaburi6007Bangkok63041234"
          alt="PromptPay QR Code"
          class="w-full h-full object-contain"
        />
      </div>

      <div class="text-xs text-[#786B62] font-semibold space-y-1">
        <p class="font-black text-[#332820] text-sm">สแกนจ่ายผ่านแอปพลิเคชันธนาคารทุกแห่ง</p>
        <p>รองรับ K PLUS, SCB EASY, Krungthai NEXT, TTB ฯลฯ</p>
      </div>
    </div>

    <button
      type="button"
      class="w-full py-4 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-black text-sm shadow-xl transition active:scale-95 border-2 border-[#D96C2C] cursor-pointer flex items-center justify-center gap-2"
      :disabled="paying"
      @click="emit('confirm')"
    >
      <i class="mdi mdi-check-circle text-lg text-white"></i>
      <span class="!text-white font-black text-base">{{ paying ? 'กำลังดำเนินการยืนยัน...' : 'ยืนยันการชำระเงินเรียบร้อยแล้ว' }}</span>
    </button>
  </div>
</template>
