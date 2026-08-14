<template>
  <form class="space-y-4" @submit.prevent="submitForm">
    <AppTextField
      v-model="form.name"
      label="ชื่อ-นามสกุลอาจารย์"
      placeholder="กรอกชื่อ-นามสกุล"
      rounded="lg"
      required
    />
    <AppTextField
      v-model="form.email"
      label="อีเมล"
      placeholder="teacher@example.com"
      type="email"
      rounded="lg"
      required
    />
    <AppTextField
      v-model="form.specialty"
      label="ความเชี่ยวชาญ"
      placeholder="เช่น Web Development"
      rounded="lg"
      required
    />
    <AppTextField
      v-model="form.image"
      label="ลิงก์รูปโปรไฟล์"
      placeholder="https://example.com/profile.jpg"
      type="url"
      rounded="lg"
    />
    <AppTextarea
      v-model="form.bio"
      label="ประวัติโดยย่อ"
      placeholder="แนะนำประสบการณ์และความเชี่ยวชาญ"
      rows="3"
      rounded="lg"
      maxlength="50"
    />

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
import AppTextarea from '@/components/common/input/AppTextarea.vue'
import type { Teacher, TeacherPayload } from '../type/teacher'

interface Props {
  teacher?: Teacher | null
}
const props = withDefaults(defineProps<Props>(), { teacher: null })
const emit = defineEmits<{ save: [payload: TeacherPayload]; close: [] }>()

const form = ref<TeacherPayload>({
  name: props.teacher?.name ?? '',
  email: props.teacher?.email ?? '',
  specialty: props.teacher?.specialty ?? '',
  bio: props.teacher?.bio ?? '',
  image: props.teacher?.image ?? '',
})

function submitForm() {
  emit('save', { ...form.value })
}
</script>
