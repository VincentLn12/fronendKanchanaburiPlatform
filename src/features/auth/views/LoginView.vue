<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useSwal } from '@/plugins/sweetalert'

const email = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()
const auth = useAuthStore()
const swal = useSwal()

async function submit() {
  if (!email.value || !password.value) {
    await swal.warning('กรอกข้อมูลไม่ครบ', 'กรุณากรอกอีเมลและรหัสผ่าน')
    return
  }

  loading.value = true
  try {
    await auth.signIn(email.value, password.value)
    await swal.success('เข้าสู่ระบบสำเร็จ')
    await router.replace('/')
  } catch {
    await swal.error('เข้าสู่ระบบไม่สำเร็จ', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-10">
    <v-card class="w-full max-w-md rounded-3xl p-4 shadow-xl" elevation="0">
      <v-card-title class="pt-5 text-center text-3xl font-bold text-slate-900"
        >เข้าสู่ระบบ</v-card-title
      >
      <v-card-subtitle class="pb-5 text-center">กาญจน์ชวนดู</v-card-subtitle>
      <v-card-text>
        <form class="space-y-2" @submit.prevent="submit">
          <v-text-field
            v-model="email"
            label="อีเมล"
            type="email"
            autocomplete="email"
            variant="outlined"
          />
          <v-text-field
            v-model="password"
            label="รหัสผ่าน"
            type="password"
            autocomplete="current-password"
            variant="outlined"
          />
          <v-btn type="submit" color="primary" block size="large" :loading="loading"
            >เข้าสู่ระบบ</v-btn
          >
        </form>
      </v-card-text>
    </v-card>
  </main>
</template>
