<script setup lang="ts">
import { useModal } from '@/composables/useModal'

const {
  isOpen,
  title,
  component,
  props,
  closeModal
} = useModal()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div
        class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200"
      >
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-3"
        >
          <h3 class="text-lg font-bold text-slate-900">
            {{ title }}
          </h3>

          <button
            type="button"
            class="text-slate-400 hover:text-slate-600"
            @click="closeModal"
          >
            ✕
          </button>
        </div>

        <component
          :is="component"
          v-bind="props"
          @close="closeModal"
        />
      </div>
    </div>
  </Teleport>
</template>