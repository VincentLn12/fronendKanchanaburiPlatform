<script setup lang="ts">
import type { UserAddress } from '../../api/userAddressApi'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppTextarea from '@/components/common/input/AppTextarea.vue'

interface Props {
  addresses: UserAddress[]
  selectedAddressId: string | null
}

defineProps<Props>()

const shippingMethod = defineModel<'Delivery' | 'Pickup'>('shippingMethod', { default: 'Delivery' })
const receiverName = defineModel<string>('receiverName', { default: '' })
const receiverPhone = defineModel<string>('receiverPhone', { default: '' })
const shippingAddress = defineModel<string>('shippingAddress', { default: '' })

const emit = defineEmits<{
  'select-address': [addr: UserAddress]
}>()
</script>

<template>
  <div class="space-y-3 border-b-2 border-[#E8D9C9] pb-5">
    <p class="text-sm font-black text-[#332820]">วิธีรับสินค้า</p>

    <!-- Delivery Option -->
    <label
      class="flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition"
      :class="
        shippingMethod === 'Delivery'
          ? 'border-[#D96C2C] bg-[#D96C2C]/10 font-black'
          : 'border-[#E8D9C9] bg-white'
      "
    >
      <input v-model="shippingMethod" value="Delivery" type="radio" class="accent-[#D96C2C]" />
      <span class="text-sm font-extrabold text-[#332820]">
        จัดส่งถึงที่อยู่
        <span class="font-semibold text-[#786B62]">(+50 บาท)</span>
      </span>
    </label>

    <!-- Pickup Option -->
    <label
      class="flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition"
      :class="
        shippingMethod === 'Pickup'
          ? 'border-[#D96C2C] bg-[#D96C2C]/10 font-black'
          : 'border-[#E8D9C9] bg-white'
      "
    >
      <input v-model="shippingMethod" value="Pickup" type="radio" class="accent-[#D96C2C]" />
      <span class="text-sm font-extrabold text-[#332820]">
        รับสินค้าที่ร้าน <span class="font-semibold text-[#786B62]">(ฟรี)</span>
      </span>
    </label>

    <!-- Address Details (Only when Delivery) -->
    <div v-if="shippingMethod === 'Delivery'" class="space-y-3 pt-1">
      <!-- Saved Addresses Selector -->
      <div v-if="addresses.length" class="space-y-2">
        <p class="text-sm font-black text-[#332820]">เลือกที่อยู่ที่บันทึกไว้</p>
        <button
          v-for="address in addresses"
          :key="address.userAddressId"
          type="button"
          class="w-full rounded-xl border-2 p-3 text-left text-sm cursor-pointer transition"
          :class="
            selectedAddressId === address.userAddressId
              ? 'border-[#D96C2C] bg-[#D96C2C]/10'
              : 'border-[#E8D9C9] bg-white'
          "
          @click="emit('select-address', address)"
        >
          <span class="font-black text-[#332820]"
            >{{ address.recipientName }} · {{ address.recipientPhone }}</span
          >
          <span class="mt-1 block text-xs text-[#786B62] font-semibold">{{
            [
              address.addressLine,
              address.subDistrict,
              address.district,
              address.province,
              address.postalCode,
            ]
              .filter(Boolean)
              .join(' ')
          }}</span>
        </button>
      </div>

      <!-- Address Input Fields using v-model with defineModel -->
      <AppTextField v-model="receiverName" label="ชื่อผู้รับ *" placeholder="ชื่อ-นามสกุล" />
      <AppTextField v-model="receiverPhone" label="เบอร์โทรศัพท์ *" placeholder="08xxxxxxxx" />
      <AppTextarea
        v-model="shippingAddress"
        label="ที่อยู่จัดส่ง *"
        placeholder="บ้านเลขที่ หมู่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
        :rows="3"
      />
    </div>
  </div>
</template>
