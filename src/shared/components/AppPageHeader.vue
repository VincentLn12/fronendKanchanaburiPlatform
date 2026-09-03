<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    icon?: string
    count?: number
  }>(),
  {
    subtitle: '',
    icon: 'mdi-clipboard-text-clock-outline',
    count: undefined,
  },
)
</script>

<template>
  <div
    class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs"
  >
    <div class="flex items-center gap-4">
      <div
        class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D96C2C] text-white shadow-md shrink-0"
      >
        <i class="mdi text-2xl text-white" :class="icon"></i>
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-black text-[#332820]">{{ title }}</h1>
          <span
            v-if="count !== undefined"
            class="rounded-full bg-[#D96C2C]/10 px-3 py-0.5 text-xs font-black text-[#D96C2C] border border-[#D96C2C]/20"
          >
            {{ count }} รายการ
          </span>
        </div>
        <p v-if="subtitle" class="text-xs text-[#786B62] font-semibold mt-0.5">{{ subtitle }}</p>
      </div>
    </div>

    <div v-if="$slots.actions" class="shrink-0">
      <slot name="actions"></slot>
    </div>
  </div>
</template>
