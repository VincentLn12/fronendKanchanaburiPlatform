<script setup lang="ts">
import { computed } from 'vue'
import type { Product, ProductCategory, Shop } from '@/features/shops/api'

const props = defineProps<{
  shop: Shop
  products: Product[]
  categories: ProductCategory[]
  filteredProducts: Product[]
  productCategoryName: (id: string) => string
  imageUrl: (url?: string) => string | undefined
  formatPrice: (value: number) => string
  getProductImage: (prod: Product, index: number) => string
}>()

const selectedCategory = defineModel<string | null>('selectedCategory', { default: null })
const productSearchInput = defineModel<string>('productSearchInput', { default: '' })
const productSearch = defineModel<string>('productSearch', { default: '' })

const productCategories = computed(() => [
  { id: null, name: 'ทั้งหมด', count: props.products.length },
  ...props.categories
    .filter((category) =>
      props.products.some((product) => product.productCategoryId === category.productCategoryId),
    )
    .map((category) => ({
      id: category.productCategoryId,
      name: category.categoryName,
      count: props.products.filter((p) => p.productCategoryId === category.productCategoryId).length,
    })),
])

function clearSearch() {
  productSearchInput.value = ''
  productSearch.value = ''
}

function clearFilters() {
  clearSearch()
  selectedCategory.value = null
}
</script>

<template>
  <section class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 sm:p-7 shadow-xs space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#E8D9C9] pb-4">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D96C2C] text-white shadow-xs font-bold">
          <i class="mdi mdi-store-search-outline text-xl text-white"></i>
        </div>
        <div>
          <h2 class="text-xl font-black text-[#332820]">สินค้าในร้าน</h2>
          <p class="text-xs text-[#786B62]">
            แสดง {{ Math.min(filteredProducts.length, 6) }} จาก {{ products.length }} รายการ
          </p>
        </div>
      </div>

      <!-- Search Input inside Shop -->
      <div class="relative w-full sm:w-64">
        <input
          v-model="productSearchInput"
          type="text"
          placeholder="ค้นหาสินค้าในร้านนี้..."
          class="w-full rounded-2xl border-2 border-[#E8D9C9] bg-white pl-9 pr-8 py-2 text-xs font-bold outline-none focus:border-[#D96C2C] transition"
        />
        <i class="mdi mdi-magnify absolute left-3 top-1/2 -translate-y-1/2 text-[#D96C2C] text-base"></i>
        <button
          v-if="productSearchInput"
          type="button"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#786B62] hover:text-[#332820]"
          @click="clearSearch"
        >
          <i class="mdi mdi-close-circle text-base"></i>
        </button>
      </div>
    </div>

    <!-- Category Filter Pills -->
    <div v-if="productCategories.length > 1" class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        v-for="cat in productCategories"
        :key="cat.name"
        type="button"
        class="px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer border-2"
        :class="
          selectedCategory === cat.id
            ? 'border-[#D96C2C] bg-[#D96C2C] text-white shadow-xs'
            : 'border-[#E8D9C9] bg-white text-[#332820] hover:border-[#D96C2C]'
        "
        @click="selectedCategory = cat.id"
      >
        <span>{{ cat.name }}</span>
        <span
          class="text-[10px] rounded-full px-1.5 py-0.5"
          :class="
            selectedCategory === cat.id
              ? 'bg-white text-[#D96C2C] font-bold'
              : 'bg-[#F7F0E6] text-[#786B62]'
          "
        >{{ cat.count }}</span>
      </button>
    </div>

    <!-- Products Grid (Show maximum 6 items on main detail page) -->
    <div v-if="filteredProducts.length" class="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
      <RouterLink
        v-for="(prod, idx) in filteredProducts.slice(0, 6)"
        :key="prod.productId"
        :to="`/products/${prod.productId}`"
        class="group bg-white rounded-3xl overflow-hidden border-2 border-[#E8D9C9] p-3.5 shadow-2xs hover:shadow-xl hover:border-[#D96C2C] hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
      >
        <div>
          <div class="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#171412] mb-3">
            <img
              :src="getProductImage(prod, idx)"
              :alt="prod.productName"
              loading="lazy"
              class="w-full h-full object-cover group-hover:scale-108 transition duration-500"
            />
            <span class="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#D96C2C] text-white shadow-md">
              พร้อมส่ง
            </span>
          </div>

          <span class="text-[10px] font-black text-[#D96C2C] bg-[#D96C2C]/10 px-2 py-0.5 rounded-md border border-[#D96C2C]/20 inline-block mb-1">
            {{ productCategoryName(prod.productCategoryId) }}
          </span>
          <h3 class="font-black text-[#332820] text-xs sm:text-sm group-hover:text-[#D96C2C] transition line-clamp-1">
            {{ prod.productName }}
          </h3>
          <p v-if="prod.description" class="text-xs text-[#786B62] mt-1 line-clamp-2 font-medium leading-relaxed">
            {{ prod.description }}
          </p>
        </div>

        <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-[#E8D9C9]">
          <div>
            <span class="block text-[10px] text-[#786B62] font-black uppercase">ราคา</span>
            <span class="font-black text-[#D96C2C] text-sm sm:text-base">{{ formatPrice(prod.price) }}</span>
          </div>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D96C2C] text-white hover:bg-[#BF5720] transition shadow-xs cursor-pointer border border-[#D96C2C]"
          >
            <i class="mdi mdi-cart-plus text-base text-white"></i>
          </button>
        </div>
      </RouterLink>
    </div>

    <!-- Empty Products Match -->
    <div v-else class="rounded-2xl border-2 border-dashed border-[#E8D9C9] bg-[#F7F0E6] p-10 text-center space-y-2">
      <i class="mdi mdi-package-variant-remove text-3xl text-[#786B62]"></i>
      <p class="text-xs font-black text-[#332820]">ไม่พบสินค้าตามเงื่อนไขการค้นหา</p>
      <button
        v-if="productSearch || selectedCategory"
        type="button"
        class="text-xs font-bold text-[#D96C2C] hover:underline"
        @click="clearFilters"
      >
        ล้างตัวกรองทั้งหมด
      </button>
    </div>

    <!-- View All Products CTA Button -->
    <div v-if="products.length > 0" class="pt-2">
      <RouterLink
        :to="`/shops/${shop.shopId}/products`"
        class="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#D96C2C]/10 hover:bg-[#D96C2C] text-[#D96C2C] hover:text-white border-2 border-[#D96C2C] font-black text-xs sm:text-sm shadow-xs transition duration-200 cursor-pointer group"
      >
        <i class="mdi mdi-grid text-lg group-hover:text-white"></i>
        <span class="group-hover:text-white">ดูสินค้าทั้งหมดของร้านนี้ ({{ products.length }} รายการ)</span>
        <i class="mdi mdi-arrow-right text-base group-hover:text-white"></i>
      </RouterLink>
    </div>
  </section>
</template>
