<template>
  <main class="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-slate-50 px-4 py-10">
    <form class="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm" @submit.prevent="submit">
      <h1 class="text-2xl font-bold text-slate-900">
        {{ isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ' }}
      </h1>
      <p class="mt-2 text-sm text-slate-500">
        {{ isRegister ? 'สร้างบัญชีเพื่อเริ่มเรียน' : 'ยินดีต้อนรับกลับมา' }}
      </p>

      <label v-if="isRegister" class="mt-6 block text-sm font-medium"
        >ชื่อผู้ใช้
        <input
          v-model="name"
          required
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>
      <label class="mt-4 block text-sm font-medium"
        >อีเมล
        <input
          v-model="email"
          type="email"
          required
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>
      <label class="mt-4 block text-sm font-medium"
        >รหัสผ่าน
        <input
          v-model="password"
          type="password"
          minlength="6"
          required
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>
      <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
      <button
        :disabled="loading"
        class="mt-6 w-full rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white disabled:opacity-60"
      >
        {{ loading ? 'กำลังดำเนินการ...' : isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ' }}
      </button>
      <RouterLink
        :to="isRegister ? '/login' : '/register'"
        class="mt-5 block text-center text-sm text-blue-700"
      >
        {{ isRegister ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก' }}
      </RouterLink>
    </form>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const isRegister = computed(() => route.name === 'register')
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    if (isRegister.value) await auth.register(name.value, email.value, password.value)
    else await auth.login(email.value, password.value)
    if (auth.user?.role === 'admin') {
      await router.push('/admin')
    } else {
      await router.push('/')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่'
  } finally {
    loading.value = false
  }
}
</script>
