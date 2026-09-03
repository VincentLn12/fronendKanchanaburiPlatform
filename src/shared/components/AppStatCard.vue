<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    value: number | string
    icon: string
    colorScheme?: 'default' | 'emerald' | 'amber' | 'sky'
    active?: boolean
  }>(),
  {
    colorScheme: 'default',
    active: false,
  },
)

defineEmits<{
  (e: 'click'): void
}>()

const cardClasses = computed(() => {
  if (props.colorScheme === 'emerald') {
    return props.active
      ? 'border-emerald-500 bg-emerald-100 ring-2 ring-emerald-500/30'
      : 'border-emerald-300 bg-emerald-50/60 hover:border-emerald-500'
  }
  if (props.colorScheme === 'amber') {
    return props.active
      ? 'border-amber-500 bg-amber-100 ring-2 ring-amber-500/30'
      : 'border-amber-300 bg-amber-50/60 hover:border-amber-500'
  }
  if (props.colorScheme === 'sky') {
    return props.active
      ? 'border-sky-500 bg-sky-100 ring-2 ring-sky-500/30'
      : 'border-sky-300 bg-sky-50/60 hover:border-sky-500'
  }
  return props.active
    ? 'border-[#D96C2C] bg-[#FFF9F2] ring-2 ring-[#D96C2C]/30'
    : 'border-[#E8D9C9] bg-[#FFF9F2] hover:border-[#D96C2C]'
})

const iconClasses = computed(() => {
  if (props.colorScheme === 'emerald') return 'bg-emerald-600 text-white'
  if (props.colorScheme === 'amber') return 'bg-amber-500 text-white'
  if (props.colorScheme === 'sky') return 'bg-sky-600 text-white'
  return 'bg-[#332820]/10 text-[#332820]'
})

const textTitleClasses = computed(() => {
  if (props.colorScheme === 'emerald') return 'text-emerald-800'
  if (props.colorScheme === 'amber') return 'text-amber-800'
  if (props.colorScheme === 'sky') return 'text-sky-800'
  return 'text-[#786B62]'
})

const textValueClasses = computed(() => {
  if (props.colorScheme === 'emerald') return 'text-emerald-700'
  if (props.colorScheme === 'amber') return 'text-amber-700'
  if (props.colorScheme === 'sky') return 'text-sky-700'
  return 'text-[#332820]'
})
</script>

<template>
  <div
    class="rounded-3xl border-2 p-4 shadow-2xs transition cursor-pointer"
    :class="cardClasses"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-between">
      <span class="text-xs font-bold" :class="textTitleClasses">{{ title }}</span>
      <div
        class="flex h-8 w-8 items-center justify-center rounded-xl shadow-xs shrink-0"
        :class="iconClasses"
      >
        <i class="mdi text-base" :class="icon"></i>
      </div>
    </div>
    <p class="text-2xl font-black mt-2" :class="textValueClasses">{{ value }}</p>
  </div>
</template>
