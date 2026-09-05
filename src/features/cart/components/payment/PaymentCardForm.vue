<script setup lang="ts">
interface Props {
  cardNumber: string
  cardExpiry: string
  cardCvc: string
  cardName: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:cardNumber': [val: string]
  'update:cardExpiry': [val: string]
  'update:cardCvc': [val: string]
  'update:cardName': [val: string]
}>()
</script>

<template>
  <div class="rounded-2xl border-2 border-[#E8D9C9] bg-white p-5 space-y-4 shadow-sm">
    <div class="flex items-center justify-between border-b border-[#E8D9C9] pb-3">
      <span class="text-xs font-black text-[#332820] flex items-center gap-1.5">
        <i class="mdi mdi-credit-card-outline text-[#D96C2C] text-base"></i>
        กรอกข้อมูลบัตรเครดิต / เดบิต
      </span>
      <div class="flex items-center gap-1 text-slate-400">
        <i class="mdi mdi-credit-card text-xl text-blue-900"></i>
        <i class="mdi mdi-credit-card text-xl text-red-600"></i>
        <i class="mdi mdi-credit-card text-xl text-amber-600"></i>
      </div>
    </div>

    <div class="space-y-3 text-xs">
      <div>
        <label class="block font-black text-[#332820] mb-1">หมายเลขบัตร (Card Number)</label>
        <input
          :value="cardNumber"
          type="text"
          class="w-full rounded-xl border-2 border-[#E8D9C9] bg-[#F7F0E6] p-3 font-mono font-black text-[#332820] outline-none focus:border-[#D96C2C]"
          placeholder="4242 4242 4242 4242"
          @input="emit('update:cardNumber', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-black text-[#332820] mb-1">วันหมดอายุ (MM/YY)</label>
          <input
            :value="cardExpiry"
            type="text"
            class="w-full rounded-xl border-2 border-[#E8D9C9] bg-[#F7F0E6] p-3 font-mono font-black text-[#332820] outline-none focus:border-[#D96C2C]"
            placeholder="12/28"
            @input="emit('update:cardExpiry', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div>
          <label class="block font-black text-[#332820] mb-1">รหัส CVC / CVV</label>
          <input
            :value="cardCvc"
            type="text"
            class="w-full rounded-xl border-2 border-[#E8D9C9] bg-[#F7F0E6] p-3 font-mono font-black text-[#332820] outline-none focus:border-[#D96C2C]"
            placeholder="123"
            @input="emit('update:cardCvc', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <div>
        <label class="block font-black text-[#332820] mb-1">ชื่อบนบัตร (Cardholder Name)</label>
        <input
          :value="cardName"
          type="text"
          class="w-full rounded-xl border-2 border-[#E8D9C9] bg-[#F7F0E6] p-3 font-black text-[#332820] outline-none focus:border-[#D96C2C]"
          placeholder="NAME ON CARD"
          @input="emit('update:cardName', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </div>
</template>
