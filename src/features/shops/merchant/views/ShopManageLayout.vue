<script setup lang="ts">
// Merchant area layout - Emerald Nature Modern Redesign
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getMyShop } from '../api/shopApi'
import type { Shop } from '../../shared/types/shop'

const route = useRoute()
const isOpen = ref(false)
const shop = ref<Shop | null>(null)

const statusBadgeClass = computed(() => {
  if (!shop.value) return ''
  return shop.value.status === 'Active'
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
})

const active = (path: string) =>
  path === '/my-shop' ? route.path === path : route.path.startsWith(path)

const closeMenu = () => {
  isOpen.value = false
}

onMounted(async () => {
  try {
    shop.value = await getMyShop()
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) console.error(error)
  }
})
</script>

<template>
  <div class="flex min-h-screen bg-slate-50/70 font-sans antialiased">
    <!-- Floating Mobile Toggle Button -->
    <button
      class="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-900/30 transition-all hover:bg-emerald-800 active:scale-95 lg:hidden"
      @click="isOpen = true"
    >
      <i class="mdi mdi-menu text-xl"></i>
      <span>เมนูจัดการร้านค้า</span>
    </button>

    <!-- Backdrop for Mobile Sidebar -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        @click="closeMenu"
      />
    </Transition>

    <!-- Sidebar Navigation -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0 lg:translate-x-0 shadow-sm"
      :class="isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div class="flex items-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/25"
          >
            <i class="mdi mdi-store-cog text-2xl"></i>
          </div>
          <div>
            <p class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
              Merchant Center
            </p>
            <h2 class="text-base font-bold text-slate-900">ศูนย์จัดการร้านค้า</h2>
          </div>
        </div>

        <button
          class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          @click="closeMenu"
        >
          <i class="mdi mdi-close text-xl"></i>
        </button>
      </div>

      <!-- Shop Summary Banner Card -->
      <div class="p-4">
        <div
          class="relative overflow-hidden rounded-2xl border border-emerald-800/40 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 p-4 text-white shadow-md"
        >
          <!-- Ambient Glow Blob -->
          <div class="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-emerald-500/20 blur-xl"></div>

          <div class="relative">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <i class="mdi mdi-storefront text-emerald-400 text-lg shrink-0"></i>
                <p
                  class="truncate text-sm font-extrabold text-white"
                  :title="shop?.shopName ?? 'สร้างร้านของคุณ'"
                >
                  {{ shop?.shopName ?? 'สร้างร้านของคุณ' }}
                </p>
              </div>

              <span
                v-if="shop"
                class="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold backdrop-blur-md"
                :class="statusBadgeClass"
              >
                {{ shop.status === 'Active' ? 'เปิดบริการ' : shop.status }}
              </span>
            </div>

            <p class="mt-1.5 truncate text-xs text-emerald-100/70">
              {{ shop?.categoryName ?? 'เปิดร้านค้าท้องถิ่นบนแพลตฟอร์ม' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 space-y-1 px-3 py-2">
        <div class="px-3 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          เมนูการจัดการ
        </div>

        <!-- My Shop Info -->
        <RouterLink
          to="/my-shop"
          class="group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all"
          :class="
            active('/my-shop')
              ? 'bg-emerald-50 text-emerald-800 font-bold border-r-4 border-emerald-600 shadow-xs'
              : 'text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-900'
          "
          @click="closeMenu"
        >
          <i
            class="mdi mdi-store-cog-outline text-xl transition-colors"
            :class="active('/my-shop') ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'"
          ></i>
          <span>ข้อมูลร้านค้า</span>
        </RouterLink>

        <!-- Product Management -->
        <RouterLink
          to="/my-shop/products"
          class="group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all"
          :class="
            active('/my-shop/products')
              ? 'bg-emerald-50 text-emerald-800 font-bold border-r-4 border-emerald-600 shadow-xs'
              : 'text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-900'
          "
          @click="closeMenu"
        >
          <i
            class="mdi mdi-package-variant-closed text-xl transition-colors"
            :class="active('/my-shop/products') ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'"
          ></i>
          <span>จัดการสินค้า</span>
        </RouterLink>

        <!-- Customer Orders -->
        <RouterLink
          to="/my-shop/orders"
          class="group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all"
          :class="
            active('/my-shop/orders')
              ? 'bg-emerald-50 text-emerald-800 font-bold border-r-4 border-emerald-600 shadow-xs'
              : 'text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-900'
          "
          @click="closeMenu"
        >
          <i
            class="mdi mdi-clipboard-text-clock-outline text-xl transition-colors"
            :class="active('/my-shop/orders') ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'"
          ></i>
          <span>ออเดอร์ลูกค้า</span>
        </RouterLink>
      </nav>

      <!-- Footer / Back Link -->
      <div class="border-t border-slate-100 p-4">
        <RouterLink
          to="/shops"
          class="group flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-500 transition-all hover:bg-emerald-50 hover:text-emerald-700"
          @click="closeMenu"
        >
          <i class="mdi mdi-arrow-left text-base text-slate-400 transition-transform group-hover:-translate-x-1 group-hover:text-emerald-600"></i>
          <span>กลับไปหน้าร้านค้าทั้งหมด</span>
        </RouterLink>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="min-w-0 flex-1 p-6 lg:p-10">
      <RouterView />
    </main>
  </div>
</template>
