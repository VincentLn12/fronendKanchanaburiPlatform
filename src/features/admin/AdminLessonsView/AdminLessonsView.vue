<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          จัดการบทเรียน (Lessons Management)
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          ระบบจัดการเพิ่ม แก้ไข ค้นหา และลบบทเรียนสำหรับแต่ละคอร์ส (ใช้งานตารางกลาง AppDataTable)
        </p>
      </div>

      <button
        @click="openAddModal"
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        เพิ่มบทเรียนใหม่
      </button>
    </div>

    <!-- Search & Filter Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
      <div class="relative flex-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหาชื่อบทเรียน..."
          class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
        />
      </div>

      <select v-model="selectedCourseId" class="border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-500">
        <option value="">-- คอร์สเรียนทั้งหมด --</option>
        <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.title }}</option>
      </select>

      <span class="text-xs font-semibold text-slate-500 hidden sm:inline">
        ทั้งหมด {{ filteredLessons.length }} บท
      </span>
    </div>

    <!-- REUSABLE CENTRAL DATA TABLE -->
    <AppDataTable
      :headers="headers"
      :items="filteredLessons"
      :search="searchQuery"
      :loading="isLoading"
    >
      <template #item.title="{ item }">
        <span class="font-bold text-slate-900">{{ item.title }}</span>
      </template>

      <template #item.courseId="{ item }">
        <span class="text-slate-600 font-medium">{{ getCourseTitle(item.courseId) }}</span>
      </template>

      <template #item.duration="{ item }">
        <span class="font-semibold text-indigo-600">{{ item.duration }} นาที</span>
      </template>

      <template #item.isFree="{ item }">
        <span
          class="px-2.5 py-1 rounded-full text-xs font-semibold"
          :class="[item.isFree ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700']"
        >
          {{ item.isFree ? 'ทดลองเรียนฟรี' : 'สำหรับสมาชิก' }}
        </span>
      </template>

      <template #item.actions="{ item }">
        <div class="flex justify-end gap-2">
          <button
            @click="openEditModal(item)"
            class="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
            title="แก้ไขบทเรียน"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            @click="deleteLesson(item.id)"
            class="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
            title="ลบบทเรียน"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </template>
    </AppDataTable>

    <!-- CREATE / EDIT LESSON MODAL -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-lg font-bold text-slate-900">
            {{ isEditing ? 'แก้ไขข้อมูลบทเรียน' : 'เพิ่มบทเรียนใหม่' }}
          </h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form @submit.prevent="saveLesson" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">เลือกคอร์สเรียน *</label>
            <select v-model="form.courseId" required class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
              <option value="" disabled>-- เลือกคอร์ส --</option>
              <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.title }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">หัวข้อบทเรียน *</label>
            <input v-model="form.title" required type="text" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ความยาวบทเรียน *</label>
              <input v-model="form.duration" required type="text" placeholder="15:00" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">YouTube Video ID</label>
              <input v-model="form.videoId" type="text" placeholder="dQw4w9WgXcQ" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <input v-model="form.isFree" id="isFreeCheck" type="checkbox" class="w-4 h-4 text-indigo-600 rounded" />
            <label for="isFreeCheck" class="text-xs font-bold text-slate-700 cursor-pointer">อนุญาตให้ทดลองเรียนฟรี (Is Free)</label>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" @click="showModal = false" class="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100">
              ยกเลิก
            </button>
            <button type="submit" class="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20">
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminLessonService } from './services/lesson.service'
import AppDataTable, { type DataTableHeader } from '@/components/common/AppDataTable.vue'

const lessons = ref<any[]>([])
const courses = ref<any[]>([])
const searchQuery = ref('')
const selectedCourseId = ref('')
const isLoading = ref(false)

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | number | null>(null)

const headers: DataTableHeader[] = [
  { title: 'ชื่อบทเรียน', key: 'title', align: 'start' },
  { title: 'คอร์สเรียน', key: 'courseId', align: 'start' },
  { title: 'ความยาว', key: 'duration', align: 'start' },
  { title: 'สถานะการเรียนฟรี', key: 'isFree', align: 'start' },
  { title: 'จัดการ', key: 'actions', align: 'end', sortable: false },
]

const form = ref({
  courseId: '',
  title: '',
  duration: '10:00',
  videoId: '',
  isFree: true
})

const filteredLessons = computed(() => {
  let list = lessons.value
  if (selectedCourseId.value) {
    list = list.filter(l => String(l.courseId) === String(selectedCourseId.value))
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(l => l.title?.toLowerCase().includes(q))
  }
  return list
})

function getCourseTitle(cId: string | number) {
  const found = courses.value.find(c => String(c.id) === String(cId))
  return found ? found.title : `คอร์ส #${cId}`
}

async function fetchData() {
  isLoading.value = true
  try {
    const [lessonData, courseData] = await Promise.all([
      adminLessonService.getAll(),
      adminLessonService.getCourses(),
    ])
    lessons.value = lessonData
    courses.value = courseData
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  form.value = {
    courseId: courses.value[0]?.id || '',
    title: '',
    duration: '15:00',
    videoId: '9j537584dI0',
    isFree: true
  }
  showModal.value = true
}

function openEditModal(lesson: any) {
  isEditing.value = true
  editingId.value = lesson.id
  form.value = {
    courseId: lesson.courseId || '',
    title: lesson.title || '',
    duration: lesson.duration || '10:00',
    videoId: lesson.videoId || '',
    isFree: !!lesson.isFree
  }
  showModal.value = true
}

async function saveLesson() {
  const payload = {
    courseId: form.value.courseId,
    title: form.value.title,
    duration: form.value.duration,
    videoId: form.value.videoId,
    isFree: form.value.isFree
  }

  try {
    if (isEditing.value && editingId.value !== null) {
      const res = await adminLessonService.update(editingId.value, payload)
      const idx = lessons.value.findIndex(l => l.id === editingId.value)
      if (idx !== -1) lessons.value[idx] = res
    } else {
      lessons.value.push(await adminLessonService.create(payload))
    }
    showModal.value = false
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการบันทึกบทเรียน')
  }
}

async function deleteLesson(id: string | number) {
  if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบทเรียนนี้?')) return
  try {
    await adminLessonService.remove(id)
    lessons.value = lessons.value.filter(l => l.id !== id)
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการลบ')
  }
}

onMounted(() => {
  fetchData()
})
</script>
