<template>
  <div class="space-y-6">
    <!-- Back Button & Header Section -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <RouterLink
          to="/admin/courses"
          class="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          ← กลับไปหน้าจัดการคอร์สเรียน
        </RouterLink>
        <span
          class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
        >
          คอร์ส ID #{{ courseId }}
        </span>
      </div>

      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-100 pt-4"
      >
        <div>
          <span class="text-xs font-bold text-indigo-600 uppercase tracking-wider"
            >บทเรียนทั้งหมดในคอร์ส</span
          >
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            {{ courseTitle }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            {{ courseDescription }}
          </p>
        </div>

        <AppButton
          type="button"
          color="indigo"
          variant="flat"
          size="default"
          class="!rounded-xl !px-5 font-bold normal-case shadow-md shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          title="เพิ่มบทเรียนใหม่"
          @click="openAddModal"
        >
          <div class="flex items-center gap-2">
            <v-icon icon="mdi-plus" size="20" />
            <span>เพิ่มบทเรียนใหม่ในคอร์สนี้</span>
          </div>
        </AppButton>
      </div>
    </div>

    <!-- Search Bar -->
    <AppSearch
      v-model="searchQuery"
      placeholder="ค้นหาชื่อบทเรียนในคอร์สนี้..."
      :count="filteredLessons.length"
      count-label="บทเรียน"
    />

    <!-- Data Table -->
    <AppDataTable
      :headers="headers"
      :items="filteredLessons"
      :search="searchQuery"
      :loading="isLoading"
    >
      <template #item.index="{ index }">
        <span class="font-bold text-slate-400">#{{ index + 1 }}</span>
      </template>

      <template #item.title="{ item }">
        <span class="font-bold text-slate-900">{{ item.title }}</span>
      </template>

      <template #item.duration="{ item }">
        <span class="font-semibold text-indigo-600">{{ item.duration }} นาที</span>
      </template>

      <template #item.isFree="{ item }">
        <span
          class="px-2.5 py-1 rounded-full text-xs font-bold"
          :class="[item.isFree ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700']"
        >
          {{ item.isFree ? 'เรียนฟรี' : 'เฉพาะสมาชิก' }}
        </span>
      </template>

      <template #item.video="{ item }">
        <a
          v-if="item.videoId"
          :href="`https://www.youtube.com/watch?v=${item.videoId}`"
          target="_blank"
          class="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-lg transition-colors inline-flex items-center gap-1"
        >
          ดูวิดีโอ YouTube
        </a>
        <span v-else class="text-xs text-slate-400">ไม่มีลิงก์</span>
      </template>

      <template #item.actions="{ item }">
        <div class="flex justify-end gap-2">
          <AppButton
            type="button"
            variant="tonal"
            size="small"
            class="!text-yellow-600 !bg-indigo-50 hover:!bg-yellow-600 hover:!text-white"
            title="แก้ไขบทเรียน"
            @click="openEditModal(item)"
          >
            แก้ไข
          </AppButton>
          <AppButton
            type="button"
            variant="tonal"
            size="small"
            class="!text-red-600 !bg-indigo-50 hover:!bg-red-600 hover:!text-white"
            title="ลบบทเรียน"
            @click="deleteLesson(item.id)"
          >
            ลบ
          </AppButton>
        </div>
      </template>
    </AppDataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import AppDataTable, { type DataTableHeader } from '@/components/common/AppDataTable.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppSearch from '@/components/common/AppSearch.vue'
import CourseLessonForm from './form/CourseLessonForm.vue'
import { useModal } from '@/composables/useModal'
import { useSwal } from '@/plugins/sweetalert'
import type { CourseLesson, CourseLessonPayload } from './type/courseLesson'
import { courseLessonService } from './services/courseLesson.service'

const route = useRoute()
const courseId = computed(() => route.params.courseId as string)

const courseTitle = ref('กำลังโหลดคอร์สเรียน...')
const courseDescription = ref('')

const lessons = ref<CourseLesson[]>([])
const searchQuery = ref('')
const isLoading = ref(false)

const swal = useSwal()
const { openModal, closeModal } = useModal()

const headers: DataTableHeader[] = [
  { title: 'ลำดับ', key: 'index', align: 'start', sortable: false },
  { title: 'ชื่อบทเรียน', key: 'title', align: 'start' },
  { title: 'ความยาว', key: 'duration', align: 'start' },
  { title: 'สถานะการทดลองเรียน', key: 'isFree', align: 'start' },
  { title: 'วิดีโอ', key: 'video', align: 'start', sortable: false },
  { title: 'จัดการ', key: 'actions', align: 'end', sortable: false },
]

const filteredLessons = computed(() => {
  if (!searchQuery.value.trim()) return lessons.value
  const q = searchQuery.value.trim().toLowerCase()
  return lessons.value.filter((l) => l.title?.toLowerCase().includes(q))
})

async function fetchData() {
  isLoading.value = true
  try {
    const [course, lessonData] = await Promise.all([
      courseLessonService.getCourse(courseId.value),
      courseLessonService.getAll(courseId.value),
    ])
    courseTitle.value = course.title || `คอร์ส #${courseId.value}`
    courseDescription.value = course.description || 'ไม่มีคำอธิบาย'
    lessons.value = lessonData
  } catch (err) {
    console.error(err)
    courseTitle.value = `คอร์ส #${courseId.value}`
  } finally {
    isLoading.value = false
  }
}

function openAddModal() {
  openModal({
    title: 'เพิ่มบทเรียนใหม่ในคอร์ส',
    component: CourseLessonForm,
    props: {
      courseId: courseId.value,
      onSave: createLesson,
    },
  })
}

function openEditModal(lesson: CourseLesson) {
  openModal({
    title: 'แก้ไขบทเรียน',
    component: CourseLessonForm,
    props: {
      lesson,
      courseId: courseId.value,
      onSave: (payload: CourseLessonPayload) => updateLesson(lesson.id, payload),
    },
  })
}

async function createLesson(payload: CourseLessonPayload) {
  try {
    const lesson = await courseLessonService.create(payload)
    lessons.value.push(lesson)
    closeModal()
    await swal.success('บันทึกบทเรียนสำเร็จ')
  } catch (err) {
    console.error(err)
    await swal.error('เกิดข้อผิดพลาดในการบันทึกบทเรียน')
  }
}

async function updateLesson(id: string | number, payload: CourseLessonPayload) {
  try {
    const updated = await courseLessonService.update(id, payload)
    const idx = lessons.value.findIndex((l) => l.id === id)
    if (idx !== -1) lessons.value[idx] = updated
    closeModal()
    await swal.success('แก้ไขบทเรียนสำเร็จ')
  } catch (err) {
    console.error(err)
    await swal.error('เกิดข้อผิดพลาดในการแก้ไขบทเรียน')
  }
}

async function deleteLesson(id: string | number) {
  const result = await swal.confirm('ยืนยันการลบ?', 'รายการบทเรียนนี้จะถูกลบออกจากระบบ')
  if (!result.isConfirmed) return

  try {
    await courseLessonService.remove(id)
    lessons.value = lessons.value.filter((l) => l.id !== id)
    await swal.success('ลบบทเรียนสำเร็จ')
  } catch (err) {
    console.error(err)
    await swal.error('เกิดข้อผิดพลาดในการลบ')
  }
}

onMounted(() => {
  fetchData()
})
</script>

