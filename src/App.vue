<template>
  <Navbar v-if="!isShopManage" />
  <RouterView />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './views/Navbar.vue'

const route = useRoute()
const isShopManage = computed(
  () => route.path.startsWith('/my-shop') || route.path.startsWith('/admin'),
)
</script>
