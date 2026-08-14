<template>
  <form class="space-y-4" @submit.prevent="submitForm">
    <div>
      <AppTextField
        v-model="form.title"
        label="ชื่อคอร์สเรียน"
        placeholder="กรอกชื่อคอร์สเรียน"
        rounded="lg"
        required
      />
    </div>

    <div>
      <AppTextarea
        v-model="form.description"
        label="รายละเอียด"
        placeholder="กรอกรายละเอียดคอร์ส"
        rows="3"
        rounded="lg"
        required
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <AppSelect
        v-model="form.level"
        label="ระดับคอร์ส"
        :items="['ระดับพื้นฐาน', 'ระดับกลาง', 'ระดับสูง']"
        rounded="lg"
      />
      <AppTextField
        v-model.number="form.price"
        label="ราคา (บาท)"
        type="number"
        min="0"
        rounded="lg"
        required
      />
    </div>

    <div>
      <AppTextField
        v-model="form.image"
        label="รูปภาพคอร์ส (URL)"
        placeholder="https://..."
        type="url"
        rounded="lg"
      />
    </div>

    <div>
      <AppSelect
        v-model="form.teacherId"
        label="อาจารย์ผู้สอน"
        placeholder="เลือกอาจารย์ผู้สอน"
        :items="teacherOptions"
        :loading="isLoadingTeachers"
        :disabled="isLoadingTeachers || teachers.length === 0"
        rounded="lg"
        required
      />
      <p v-if="!isLoadingTeachers && teachers.length === 0" class="mt-1 text-xs text-rose-600">
        ยังไม่มีอาจารย์ผู้สอน กรุณาเพิ่มข้อมูลอาจารย์ก่อนสร้างคอร์ส
      </p>
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
import { computed, onMounted, ref } from 'vue'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppTextarea from '@/components/common/input/AppTextarea.vue'
import AppSelect from '@/components/common/input/AppSelect.vue'
import type { Course, CoursePayload } from '../type/course'
import { teacherService } from '@/features/teacher/services/teacher.service'
import type { Teacher } from '@/features/teacher/type/teacher'

interface Props {
  course?: Course | null
}

const props = withDefaults(defineProps<Props>(), {
  course: null,
})

const emit = defineEmits<{
  save: [payload: CoursePayload]
  close: []
}>()

const teachers = ref<Teacher[]>([])
const isLoadingTeachers = ref(false)

const form = ref({
  title: props.course?.title ?? '',
  description: props.course?.description ?? '',
  level: props.course?.level ?? 'ระดับพื้นฐาน',
  price: props.course?.price ?? 0,
  image: props.course?.image ?? '',
  teacherId: props.course?.instructor?.id ?? '',
})

const teacherOptions = computed(() =>
  teachers.value.map((teacher) => ({
    title: `${teacher.name} — ${teacher.specialty}`,
    value: teacher.id,
  })),
)

async function fetchTeachers() {
  isLoadingTeachers.value = true
  try {
    teachers.value = await teacherService.getAll()

    if (!form.value.teacherId && props.course?.instructor?.name) {
      const currentTeacher = teachers.value.find(
        (teacher) => teacher.name === props.course?.instructor?.name,
      )
      form.value.teacherId = currentTeacher?.id ?? ''
    }
  } catch (error) {
    console.error(error)
  } finally {
    isLoadingTeachers.value = false
  }
}

function submitForm() {
  const teacher = teachers.value.find((item) => item.id === form.value.teacherId)
  if (!teacher) return

  const payload: CoursePayload = {
    title: form.value.title,
    description: form.value.description,
    level: form.value.level,
    price: form.value.price,
    image: form.value.image,
    instructor: {
      id: teacher.id,
      name: teacher.name,
      role: teacher.specialty,
      bio: teacher.bio,
      image: teacher.image,
    },
  }
  emit('save', payload)
}

onMounted(fetchTeachers)
</script>
