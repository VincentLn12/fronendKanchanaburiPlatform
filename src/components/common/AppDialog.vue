<script setup lang="ts">
interface Props {
  title?: string
  maxWidth?: string | number
  persistent?: boolean
  scrollable?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  maxWidth: 600,
  persistent: false,
  scrollable: false,
})

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <v-dialog
    v-model="model"
    :max-width="maxWidth"
    :persistent="persistent"
    :scrollable="scrollable"
    v-bind="$attrs"
  >
    <template #activator="activatorProps">
      <slot name="activator" v-bind="activatorProps" />
    </template>

    <v-card>
      <v-card-title v-if="title">{{ title }}</v-card-title>
      <v-card-text>
        <slot />
      </v-card-text>
      <v-card-actions>
        <slot name="actions" :close="() => (model = false)">
          <v-spacer />
          <v-btn variant="text" @click="model = false">ปิด</v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
