<template>
  <form class="space-y-4" @submit.prevent="submitForm">
    <div>
      <AppTextField
        v-model="form.title"
        label="หัวข้อบทเรียน"
        placeholder="กรอกหัวข้อบทเรียน"
        rounded="lg"
        required
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <AppTextField
        v-model="form.duration"
        label="ความยาวบทเรียน"
        placeholder="15:00"
        rounded="lg"
        required
      />
      <AppTextField
        v-model="form.videoId"
        label="YouTube Video ID"
        placeholder="dQw4w9WgXcQ"
        rounded="lg"
      />
    </div>

    <div class="pt-1">
      <v-checkbox
        v-model="form.isFree"
        label="อนุญาตให้เรียนทดลองฟรี"
        density="compact"
        hide-details
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
import type { CourseLesson, CourseLessonPayload } from '../type/courseLesson'

interface Props {
  lesson?: CourseLesson | null
  courseId: string | number
}

const props = withDefaults(defineProps<Props>(), {
  lesson: null,
})

const emit = defineEmits<{
  save: [payload: CourseLessonPayload]
  close: []
}>()

const form = ref<CourseLessonPayload>({
  courseId: props.courseId,
  title: props.lesson?.title ?? '',
  duration: props.lesson?.duration ?? '15:00',
  videoId: props.lesson?.videoId ?? '',
  isFree: props.lesson?.isFree ?? true,
})

function submitForm() {
  emit('save', form.value)
}
</script>

