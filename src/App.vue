<template>
  <div class="flex min-h-screen flex-col relative">
    <Navbar v-if="!isAdminRoute" />
    <div class="min-w-0 flex-1">
      <RouterView />
      <GlobalModal />
    </div>
    <Footer v-if="!isAdminRoute" />

    <!-- Toast Notifications Container (Powered by uiStore) -->
    <div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        class="pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-center justify-between gap-3 text-xs font-bold transition-all animate-in fade-in slide-in-from-bottom-2"
        :class="[
          toast.type === 'success' ? 'bg-emerald-900 text-emerald-100 border-emerald-700' :
          toast.type === 'error' ? 'bg-rose-900 text-rose-100 border-rose-700' :
          toast.type === 'warning' ? 'bg-amber-900 text-amber-100 border-amber-700' :
          'bg-slate-900 text-slate-100 border-slate-700'
        ]"
      >
        <span>{{ toast.message }}</span>
        <button @click="uiStore.removeToast(toast.id)" class="text-slate-400 hover:text-white font-black text-sm">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Navbar from './views/Navbar.vue'
import Footer from './views/Footer.vue'
import GlobalModal from '@/components/GlobalModal.vue'
import { useUiStore } from '@/stores/ui'

const route = useRoute()
const uiStore = useUiStore()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>
