<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/authApi'
import { getApiErrorMessage } from '../api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
import AppTextField from '@/components/common/input/AppTextField.vue'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const router = useRouter()
const swal = useSwal()

async function submit() {
  if (!email.value || !password.value || !confirmPassword.value) {
    await swal.warning('กรอกข้อมูลไม่ครบ', 'กรุณากรอกอีเมลและรหัสผ่านให้ครบ')
    return
  }
  if (password.value !== confirmPassword.value) {
    await swal.warning('รหัสผ่านไม่ตรงกัน', 'กรุณายืนยันรหัสผ่านอีกครั้ง')
    return
  }

  loading.value = true
  try {
    await register(email.value, password.value)
    await swal.success('สมัครสมาชิกสำเร็จ', 'กรุณาเข้าสู่ระบบเพื่อใช้งาน')
    await router.replace('/login')
  } catch (error) {
    await swal.error('สมัครสมาชิกไม่สำเร็จ', getApiErrorMessage(error, 'ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-10">
    <section class="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
      <h1 class="text-center text-3xl font-bold text-slate-900">สมัครสมาชิก</h1>
      <p class="pb-5 text-center text-slate-500">เริ่มใช้งานกาญจน์ชวนดู</p>
        <form class="space-y-2" @submit.prevent="submit">
          <AppTextField v-model="email" label="อีเมล" placeholder="อีเมล" type="email" autocomplete="email" />
          <AppTextField v-model="password" label="รหัสผ่าน" placeholder="อย่างน้อย 6 ตัวอักษร" type="password" autocomplete="new-password" />
          <AppTextField v-model="confirmPassword" label="ยืนยันรหัสผ่าน" placeholder="ยืนยันรหัสผ่าน" type="password" autocomplete="new-password" />
          <button type="submit" class="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60" :disabled="loading">{{ loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก' }}</button>
        </form>
        <p class="mt-5 text-center text-sm text-slate-600">
          มีบัญชีอยู่แล้ว?
          <RouterLink to="/login" class="font-semibold text-indigo-600">เข้าสู่ระบบ</RouterLink>
        </p>
    </section>
  </main>
</template>
