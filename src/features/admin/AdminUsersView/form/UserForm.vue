<template>
  <form class="space-y-4" @submit.prevent="submitForm">
    <div>
      <AppTextField
        v-model="form.name"
        label="ชื่อ-นามสกุล"
        placeholder="กรอกชื่อ-นามสกุล"
        rounded="lg"
        required
      />
    </div>

    <div>
      <AppTextField
        v-model="form.email"
        label="อีเมล (Email)"
        placeholder="example@mail.com"
        type="email"
        rounded="lg"
        required
      />
    </div>

    <div v-if="!user">
      <AppTextField
        v-model="form.password"
        label="รหัสผ่าน"
        placeholder="••••••••"
        type="password"
        rounded="lg"
        required
      />
    </div>

    <div>
      <AppSelect
        v-model="form.role"
        label="สิทธิ์การใช้งาน (Role)"
        :items="[
          { title: 'User (ผู้เรียนทั่วไป)', value: 'user' },
          { title: 'Administrator (ผู้ดูแลระบบ)', value: 'admin' },
        ]"
        rounded="lg"
      />
    </div>

    <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
      <button
        type="button"
        class="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
        @click="emit('close')"
      >
        ยกเลิก
      </button>

      <button
        type="submit"
        class="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
      >
        บันทึกข้อมูล
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppSelect from '@/components/common/input/AppSelect.vue'
import type { AdminUser, UserPayload } from '../type/user'

interface Props {
  user?: AdminUser | null
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
})

const emit = defineEmits<{
  save: [payload: UserPayload]
  close: []
}>()

const form = ref({
  name: props.user?.name ?? '',
  email: props.user?.email ?? '',
  password: '',
  role: props.user?.role ?? 'user',
})

function submitForm() {
  const payload = {
    ...form.value,
    ...(props.user ? { password: undefined } : {}),
  } as UserPayload

  emit('save', payload)
}
</script>

