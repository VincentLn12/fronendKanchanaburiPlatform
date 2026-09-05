<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  router.replace({ path: '/profile', query: { tab: 'orders' } })
})
</script>

<template>
  <div class="min-h-screen bg-[#F7F0E6] flex items-center justify-center">
    <div class="flex items-center gap-2 text-[#D96C2C] font-black">
      <i class="mdi mdi-loading mdi-spin text-2xl"></i>
      <span>กำลังเปิดรายการคำสั่งซื้อ...</span>
    </div>
  </div>
</template>
