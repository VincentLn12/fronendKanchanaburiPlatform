<script setup lang="ts">
interface Props {
  color?: string
  variant?: 'flat' | 'elevated' | 'outlined' | 'text' | 'tonal' | 'plain'
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  loading?: boolean
  disabled?: boolean
  block?: boolean
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  color: 'primary',
  variant: 'flat',
  size: 'default',
  loading: false,
  disabled: false,
  block: false,
  type: 'button',
})
</script>

<template>
  <button :type="type" :disabled="disabled || loading" class="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60" :class="{ 'w-full': block }" v-bind="$attrs">
    <slot />
  </button>
</template>
