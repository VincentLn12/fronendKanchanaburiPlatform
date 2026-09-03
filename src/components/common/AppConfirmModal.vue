<script setup lang="ts">
import { confirmState, resolveConfirm } from '@/plugins/confirmState'
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="confirmState.isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        @click.self="resolveConfirm(false)"
      >
        <div
          class="w-full max-w-md rounded-3xl bg-[#FFFDF9] border border-[#E8E2D5] p-6 shadow-2xl space-y-5 text-slate-800 transform transition-all"
        >
          <!-- Header Icon & Title -->
          <div class="flex items-start gap-3.5">
            <div
              class="h-11 w-11 rounded-2xl bg-amber-100 text-[#D99A32] flex items-center justify-center font-bold shrink-0 shadow-2xs border border-amber-200/80"
            >
              <i class="mdi mdi-alert-circle-outline text-2xl"></i>
            </div>
            <div class="space-y-1">
              <h3 class="text-lg font-black text-[#1C4D3E] leading-tight">
                {{ confirmState.title }}
              </h3>
              <p v-if="confirmState.text" class="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {{ confirmState.text }}
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-3 pt-2 border-t border-[#E8E2D5]/80">
            <button
              type="button"
              class="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-extrabold text-xs hover:bg-slate-100 transition cursor-pointer active:scale-95 shadow-2xs"
              @click="resolveConfirm(false)"
            >
              {{ confirmState.cancelText }}
            </button>

            <button
              type="button"
              class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1C4D3E] to-[#14392E] hover:brightness-105 text-white font-extrabold text-xs shadow-md shadow-[#1C4D3E]/20 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              @click="resolveConfirm(true)"
            >
              <i class="mdi mdi-check text-amber-300"></i>
              <span>{{ confirmState.confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
