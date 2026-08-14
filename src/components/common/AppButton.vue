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
  <v-btn
    :color="color"
    :variant="variant"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :block="block"
    :type="type"
    v-bind="$attrs"
  >
    <slot />
  </v-btn>
</template>
