<script setup lang="ts">
import type { Product, Shop } from '@/features/shops/api'

const props = defineProps<{
  product: Product
  shop: Shop
  adding?: boolean
  buyingNow?: boolean
  maxQuantity: number
  imageUrl: (url?: string) => string | undefined
  formatPrice: (val: number) => string
}>()

const quantity = defineModel<number>('quantity', { default: 1 })

const emit = defineEmits<{
  (e: 'add-to-cart'): void
  (e: 'buy-now'): void
}>()

function increaseQty() {
  if (quantity.value < props.maxQuantity) {
    quantity.value++
  }
}

function decreaseQty() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function validateQty() {
  if (isNaN(quantity.value) || quantity.value < 1) {
    quantity.value = 1
  } else if (quantity.value > props.maxQuantity) {
    quantity.value = props.maxQuantity
  }
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center gap-2">
      <span
        class="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-black bg-[#D96C2C]/10 text-[#D96C2C] border border-[#D96C2C]/20"
      >
        <i class="mdi mdi-tag-outline text-[#D96C2C]"></i>
        {{ shop.categoryName || 'สินค้าชุมชน' }}
      </span>
    </div>

    <h1 class="text-3xl sm:text-4xl font-black text-[#332820] tracking-tight leading-tight">
      {{ product.productName }}
    </h1>

    <!-- Shop Seller Link Box -->
    <div
      class="inline-flex items-center gap-2.5 p-2.5 rounded-2xl bg-[#F7F0E6] border border-[#E8D9C9]"
    >
      <img
        :src="
          imageUrl(shop.coverImageUrl) ||
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'
        "
        :alt="shop.shopName"
        class="w-7 h-7 rounded-full object-cover border border-white"
      />
      <RouterLink
        :to="`/shops/${shop.shopId}`"
        class="text-xs sm:text-sm font-black text-[#D96C2C] hover:underline flex items-center gap-1"
      >
        <span>{{ shop.shopName }}</span>
        <i class="mdi mdi-chevron-right text-xs"></i>
      </RouterLink>
    </div>

    <!-- Rating & Sales Status Bar -->
    <div
      class="flex items-center gap-4 text-xs font-bold text-[#786B62] border-y-2 border-[#E8D9C9] py-2.5"
    >
      <span
        class="flex items-center gap-1.5 text-[#D96C2C] bg-[#D96C2C]/10 px-2.5 py-1 rounded-lg border border-[#D96C2C]/20 font-black"
      >
        <i class="mdi mdi-star text-base text-[#D96C2C]"></i>
        <span>4.8 (120 รีวิว)</span>
      </span>
      <span class="text-[#E8D9C9]">•</span>
      <span class="text-[#786B62] font-semibold">ขายไปแล้ว 320 ชิ้น</span>
    </div>

    <!-- Price Display Box -->
    <div
      class="rounded-2xl bg-[#D96C2C]/10 p-4 border-2 border-[#D96C2C]/30 flex items-baseline justify-between"
    >
      <div>
        <span class="text-xs font-black text-[#786B62] block uppercase">ราคาขาย</span>
        <span class="text-3xl sm:text-4xl font-black text-[#D96C2C] tracking-tight">{{
          formatPrice(product.price)
        }}</span>
      </div>

      <!-- Stock Pill -->
      <span
        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-white text-[#D96C2C] shadow-2xs border border-[#D96C2C]/30"
      >
        <span class="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
        มีสินค้าในสต็อก {{ product.quantity }} ชิ้น
      </span>
    </div>

    <!-- Quantity Selector -->
    <div class="flex items-center gap-4 py-2 text-xs sm:text-sm">
      <span class="font-black text-[#332820] shrink-0">จำนวนที่ต้องการ</span>
      <div
        class="flex items-center rounded-2xl border-2 border-[#E8D9C9] bg-[#F7F0E6] p-1 shadow-2xs"
      >
        <button
          type="button"
          class="h-9 w-9 flex items-center justify-center rounded-xl bg-white font-black text-[#332820] hover:bg-[#E8D9C9]/50 transition shadow-2xs disabled:opacity-40 cursor-pointer"
          :disabled="quantity <= 1"
          @click="decreaseQty"
        >
          -
        </button>
        <input
          v-model.number="quantity"
          type="number"
          class="w-14 text-center font-black text-[#332820] bg-transparent outline-none text-base"
          @blur="validateQty"
        />
        <button
          type="button"
          class="h-9 w-9 flex items-center justify-center rounded-lg bg-white font-black text-[#332820] hover:bg-[#E8D9C9]/50 transition shadow-2xs disabled:opacity-40 cursor-pointer"
          :disabled="quantity >= maxQuantity"
          @click="increaseQty"
        >
          +
        </button>
      </div>
      <span class="text-xs text-[#786B62] font-semibold">(สูงสุด {{ product.quantity }} ชิ้น)</span>
    </div>

    <!-- Action CTA Buttons -->
    <div class="grid grid-cols-2 gap-3 pt-2">
      <button
        type="button"
        class="py-3.5 px-5 rounded-2xl border-2 border-[#D96C2C] text-[#D96C2C] font-black text-xs sm:text-sm hover:bg-[#D96C2C]/10 transition active:scale-95 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        :disabled="adding || product.quantity <= 0"
        @click="emit('add-to-cart')"
      >
        <i class="mdi mdi-cart-outline text-lg text-[#D96C2C]"></i>
        <span>เพิ่มลงตะกร้า</span>
      </button>

      <button
        type="button"
        class="py-3.5 px-5 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-black text-xs sm:text-sm shadow-xl transition active:scale-95 flex items-center justify-center gap-2 border-2 border-[#D96C2C] cursor-pointer"
        :disabled="buyingNow || product.quantity <= 0"
        @click="emit('buy-now')"
      >
        <i class="mdi mdi-lightning-bolt text-lg text-white"></i>
        <span class="!text-white font-black">สั่งซื้อทันที</span>
      </button>
    </div>

    <!-- Guarantee Badges -->
    <div
      class="grid grid-cols-3 gap-2.5 pt-4 border-t-2 border-[#E8D9C9] text-[11px] font-extrabold text-[#332820]"
    >
      <div
        class="flex items-center gap-2 p-2.5 rounded-2xl bg-[#F7F0E6] border border-[#E8D9C9]"
      >
        <i class="mdi mdi-shield-check-outline text-[#D96C2C] text-xl"></i>
        <div>
          <span class="block text-[#332820]">ชำระเงินปลอดภัย</span>
          <span class="text-[#786B62] font-semibold text-[10px]">Secure Payment</span>
        </div>
      </div>
      <div
        class="flex items-center gap-2 p-2.5 rounded-2xl bg-[#F7F0E6] border border-[#E8D9C9]"
      >
        <i class="mdi mdi-truck-delivery-outline text-[#D96C2C] text-xl"></i>
        <div>
          <span class="block text-[#332820]">จัดส่งรวดเร็ว</span>
          <span class="text-[#786B62] font-semibold text-[10px]">1-3 วันทำการ</span>
        </div>
      </div>
      <div
        class="flex items-center gap-2 p-2.5 rounded-2xl bg-[#F7F0E6] border border-[#E8D9C9]"
      >
        <i class="mdi mdi-sync text-[#D96C2C] text-xl"></i>
        <div>
          <span class="block text-[#332820]">คืนสินค้าได้</span>
          <span class="text-[#786B62] font-semibold text-[10px]">ภายใน 7 วัน</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hide spin buttons for number inputs */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
