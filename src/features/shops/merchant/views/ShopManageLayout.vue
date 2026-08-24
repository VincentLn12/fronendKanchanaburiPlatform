<script setup lang="ts">
// Merchant area layout
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
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
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
      class="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-slate-900 px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-slate-800 active:scale-95 lg:hidden"
      @click="isOpen = true"
    >
      <svg class="h-6 w-6 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
      <span>เมนูจัดการ</span>
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
        class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        @click="closeMenu"
      />
    </Transition>

    <!-- Sidebar Navigation -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0 lg:translate-x-0"
      :class="isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 px-6 py-6">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <svg class="h-6 w-6 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.25A2.25 2.25 0 0 1 0 18.75V10.5M13.5 21h8.25A2.25 2.25 0 0 0 24 18.75V10.5M12 3v18m0-18L3 7.5m9-4.5l9 4.5" />
            </svg>
          </div>
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-indigo-600">Merchant Center</p>
            <h2 class="text-lg font-bold text-slate-900">จัดการร้านค้า</h2>
          </div>
        </div>
        <button
          class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          @click="closeMenu"
        >
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Shop Summary Card -->
      <div class="p-5">
        <div class="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 text-white shadow-md">
          <div class="absolute -right-4 -top-4 h-28 w-28 rounded-full bg-indigo-500/10 blur-xl"></div>
          <div class="relative">
            <div class="flex items-start justify-between gap-2">
              <p class="truncate text-base font-bold text-slate-100" :title="shop?.shopName ?? 'สร้างร้านของคุณ'">
                {{ shop?.shopName ?? 'สร้างร้านของคุณ' }}
              </p>
              <span
                v-if="shop"
                class="shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                :class="statusBadgeClass"
              >
                {{ shop.status }}
              </span>
            </div>
            <p class="mt-1.5 truncate text-sm text-slate-400">
              {{ shop?.categoryName ?? 'เริ่มต้นเปิดร้านค้าใหม่บนแพลตฟอร์ม' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 space-y-1.5 px-4 py-2">
        <div class="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          เมนูหลัก
        </div>

        <RouterLink
          to="/my-shop"
          class="group flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-base font-medium transition-all"
          :class="
            active('/my-shop')
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          "
          @click="closeMenu"
        >
          <svg
            class="h-6 w-6 stroke-[1.75] transition-colors"
            :class="active('/my-shop') ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.25A2.25 2.25 0 0 1 0 18.75V10.5M13.5 21h8.25A2.25 2.25 0 0 0 24 18.75V10.5M12 3v18m0-18L3 7.5m9-4.5l9 4.5" />
          </svg>
          <span>ข้อมูลร้านค้า</span>
        </RouterLink>

        <RouterLink
          to="/my-shop/products"
          class="group flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-base font-medium transition-all"
          :class="
            active('/my-shop/products')
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          "
          @click="closeMenu"
        >
          <svg
            class="h-6 w-6 stroke-[1.75] transition-colors"
            :class="active('/my-shop/products') ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <span>จัดการสินค้า</span>
        </RouterLink>

        <RouterLink to="/my-shop/orders" class="group flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-base font-medium transition-all" :class="active('/my-shop/orders') ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'" @click="closeMenu">
          <svg class="h-6 w-6 stroke-[1.75] text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M7.5 3.75h9A2.25 2.25 0 0 1 18.75 6v12A2.25 2.25 0 0 1 16.5 20.25h-9A2.25 2.25 0 0 1 5.25 18V6A2.25 2.25 0 0 1 7.5 3.75Z" /></svg>
          <span>ออเดอร์ลูกค้า</span>
        </RouterLink>
      </nav>

      <!-- Footer / Back link -->
      <div class="border-t border-slate-100 p-4">
        <RouterLink
          to="/shops"
          class="group flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-500 transition-all hover:bg-slate-50 hover:text-indigo-600"
          @click="closeMenu"
        >
          <svg
            class="h-5 w-5 stroke-[2] text-slate-400 transition-transform group-hover:-translate-x-0.5 group-hover:text-indigo-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>กลับไปหน้าร้านค้า</span>
        </RouterLink>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="min-w-0 flex-1 p-6 lg:p-10">
      <RouterView />
    </main>
  </div>
</template>
