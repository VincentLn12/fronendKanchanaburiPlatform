<script setup lang="ts">
import { ref } from 'vue'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppSelect from '@/components/common/input/AppSelect.vue'
import AppButton from '@/components/common/AppButton.vue'
import type { CourseOption, Lesson, LessonPayload } from '../type/lesson'
const props = withDefaults(defineProps<{ lesson?: Lesson | null; courses: CourseOption[] }>(), { lesson: null })
const emit = defineEmits<{ save: [payload: LessonPayload]; close: [] }>()
const form = ref<LessonPayload>({ courseId: props.lesson?.courseId ?? props.courses[0]?.id ?? '', title: props.lesson?.title ?? '', duration: props.lesson?.duration ?? '15:00', videoId: props.lesson?.videoId ?? '', isFree: props.lesson?.isFree ?? true })
</script>
<template>
  <form class="space-y-4" @submit.prevent="emit('save', form)"><AppSelect v-model="form.courseId" label="เลือกคอร์สเรียน" :items="courses" item-title="title" item-value="id" required /><AppTextField v-model="form.title" label="หัวข้อบทเรียน" required /><div class="grid grid-cols-2 gap-4"><AppTextField v-model="form.duration" label="ความยาวบทเรียน" placeholder="15:00" required /><AppTextField v-model="form.videoId" label="YouTube Video ID" /></div><v-checkbox v-model="form.isFree" label="อนุญาตให้ทดลองเรียนฟรี" density="compact" hide-details /><div class="flex justify-end gap-2 pt-4 border-t border-slate-100"><AppButton variant="text" color="grey" @click="emit('close')">ยกเลิก</AppButton><AppButton type="submit">บันทึกข้อมูล</AppButton></div></form>
</template>
