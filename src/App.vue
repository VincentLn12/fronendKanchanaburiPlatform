<template>
  <Notivue v-slot="item">
    <Notification :item="item" />
  </Notivue>

  <AppConfirmModal />

  <Navbar v-if="!isShopManage" />
  <RouterView />
  <Footer v-if="!isShopManage" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Notivue, Notification } from 'notivue'
import AppConfirmModal from './components/common/AppConfirmModal.vue'
import Navbar from './views/Navbar.vue'
import Footer from './views/Footer.vue'

const route = useRoute()
const isShopManage = computed(
  () => route.path.startsWith('/my-shop') || route.path.startsWith('/admin'),
)
</script>
