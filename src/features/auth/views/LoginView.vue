<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getApiErrorMessage } from '../api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
import AppTextField from '@/components/common/input/AppTextField.vue'

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
    await router.replace(auth.user?.role === 'Admin' ? '/admin' : '/')
  } catch (error) {
    await swal.error('เข้าสู่ระบบไม่สำเร็จ', getApiErrorMessage(error, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-10">
    <section class="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
      <h1 class="text-center text-3xl font-bold text-slate-900">เข้าสู่ระบบ</h1>
      <p class="pb-5 text-center text-slate-500">กาญจน์ชวนดู</p>
        <form class="space-y-2" @submit.prevent="submit">
          <AppTextField v-model="email" label="อีเมล" placeholder="อีเมล" type="email" autocomplete="email" />
          <AppTextField v-model="password" label="รหัสผ่าน" placeholder="รหัสผ่าน" type="password" autocomplete="current-password" />
          <button type="submit" class="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60" :disabled="loading">{{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}</button>
        </form>
        <p class="mt-5 text-center text-sm text-slate-600">
          ยังไม่มีบัญชี?
          <RouterLink to="/register" class="font-semibold text-indigo-600">สมัครสมาชิก</RouterLink>
        </p>
    </section>
  </main>
</template>
