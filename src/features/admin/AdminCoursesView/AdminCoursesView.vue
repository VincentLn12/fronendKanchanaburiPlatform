<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm"
    >
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          จัดการคอร์สเรียน
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          ระบบจัดการเพิ่ม แก้ไข ค้นหา ดูบทเรียนเฉพาะคอร์ส และลบข้อมูลคอร์สเรียน
        </p>
      </div>

      <AppButton
        type="button"
        color="indigo"
        variant="flat"
        size="default"
        class="!rounded-xl !px-5 font-bold normal-case shadow-md shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        title="เพิ่มคอร์สเรียนใหม่"
        @click="openAddModal"
      >
        <div class="flex items-center gap-2">
          <v-icon icon="mdi-plus" size="20" />
          <span>เพิ่มคอร์สเรียนใหม่</span>
        </div>
      </AppButton>
    </div>

    <!-- Search Bar -->
    <AppSearch
      v-model="searchQuery"
      placeholder="ค้นหาชื่อคอร์ส หรือ คำอธิบาย..."
      :count="filteredCourses.length"
      count-label="คอร์ส"
    />

    <!-- Data Table -->
    <AppDataTable
      :headers="headers"
      :items="filteredCourses"
      :search="searchQuery"
      :loading="isLoading"
    >
      <!-- Custom slot: Course Title & Image -->
      <template #item.title="{ item }">
        <div class="flex items-center gap-3.5 py-2">
          <img
            :src="item.image || 'https://via.placeholder.com/150'"
            class="w-12 h-12 rounded-xl object-cover border border-slate-300 shadow-sm flex-shrink-0"
          />
          <div>
            <p class="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors">
              {{ item.title }}
            </p>
            <p class="text-xs text-slate-500 line-clamp-1 max-w-xs">
              {{ item.description }}
            </p>
          </div>
        </div>
      </template>

      <!-- Custom slot: Level Badge -->
      <template #item.level="{ item }">
        <span
          class="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 inline-block"
        >
          {{ item.level || 'ระดับทั่วไป' }}
        </span>
      </template>

      <!-- Custom slot: Price Badge -->
      <template #item.price="{ item }">
        <span
          class="bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100 font-extrabold text-indigo-600 inline-block"
        >
          ฿{{ item.price }}
        </span>
      </template>

      <!-- Custom slot: Instructor -->
      <template #item.instructor="{ item }">
        <span class="font-medium text-slate-700">
          {{ item.instructor?.name || 'ทีมงาน' }}
        </span>
      </template>

      <!-- Custom slot: Actions Buttons -->
      <template #item.actions="{ item }">
        <div class="flex items-center justify-end gap-2">
          <RouterLink
            :to="`/admin/courses/${item.id}/lessons`"
            class="px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-600 hover:text-white transition-all text-xs font-bold inline-flex items-center gap-1 border border-cyan-200 hover:border-cyan-600"
            title="ดูบทเรียนเฉพาะคอร์สนี้"
          >
            ดูบทเรียน
          </RouterLink>

          <AppButton
            type="button"
            variant="tonal"
            size="small"
            class="!text-yellow-600 !bg-indigo-50 hover:!bg-yellow-600 hover:!text-white"
            title="แก้ไขคอร์สเรียน"
            @click="openEditModal(item)"
          >
            แก้ไข
          </AppButton>

          <AppButton
            type="button"
            variant="tonal"
            size="small"
            class="!text-red-600 !bg-indigo-50 hover:!bg-red-600 hover:!text-white"
            title="ลบคอร์สเรียน"
            @click="deleteCourse(item.id)"
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
import { RouterLink } from 'vue-router'
import AppDataTable, { type DataTableHeader } from '@/components/common/AppDataTable.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppSearch from '@/components/common/AppSearch.vue'
import CourseForm from './form/CourseForm.vue'
import { useModal } from '@/composables/useModal'
import { useSwal } from '@/plugins/sweetalert'
import type { Course, CoursePayload } from './type/course'
import { adminCourseService } from './services/course.service'

const courses = ref<Course[]>([])
const searchQuery = ref('')
const isLoading = ref(false)

const swal = useSwal()
const { openModal, closeModal } = useModal()

const headers: DataTableHeader[] = [
  { title: 'รูปภาพ & ชื่อคอร์ส', key: 'title', align: 'start' },
  { title: 'ระดับ', key: 'level', align: 'start' },
  { title: 'ราคา', key: 'price', align: 'start' },
  { title: 'ผู้สอน', key: 'instructor', align: 'start' },
  { title: 'จัดการ', key: 'actions', align: 'end', sortable: false },
]

const filteredCourses = computed(() => {
  if (!searchQuery.value.trim()) return courses.value
  const q = searchQuery.value.trim().toLowerCase()
  return courses.value.filter(
    (c) => c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q),
  )
})

async function fetchCourses() {
  isLoading.value = true
  try {
    courses.value = await adminCourseService.getAll()
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function openAddModal() {
  openModal({
    title: 'เพิ่มคอร์สเรียนใหม่',
    component: CourseForm,
    props: { onSave: createCourse },
  })
}

function openEditModal(course: Course) {
  openModal({
    title: 'แก้ไขข้อมูลคอร์สเรียน',
    component: CourseForm,
    props: {
      course,
      onSave: (payload: CoursePayload) => updateCourse(course.id, payload),
    },
  })
}

async function createCourse(payload: CoursePayload) {
  try {
    const course = await adminCourseService.create(payload)
    courses.value.push(course)
    closeModal()
    await swal.success('บันทึกข้อมูลสำเร็จ')
  } catch (err) {
    console.error(err)
    await swal.error('บันทึกข้อมูลไม่สำเร็จ')
  }
}

async function updateCourse(id: string | number, payload: CoursePayload) {
  try {
    const updated = await adminCourseService.update(id, payload)
    const index = courses.value.findIndex((course) => course.id === id)
    if (index !== -1) courses.value[index] = updated
    closeModal()
    await swal.success('แก้ไขข้อมูลสำเร็จ')
  } catch (err) {
    console.error(err)
    await swal.error('แก้ไขข้อมูลไม่สำเร็จ')
  }
}

async function deleteCourse(id: string | number) {
  const result = await swal.confirm('ยืนยันการลบ?', 'รายการนี้จะไม่สามารถกู้คืนได้')
  if (!result.isConfirmed) return

  try {
    await adminCourseService.remove(id)
    courses.value = courses.value.filter((c) => c.id !== id)
    await swal.success('ลบข้อมูลสำเร็จ')
  } catch (err) {
    console.error(err)
    await swal.error('ลบข้อมูลไม่สำเร็จ')
  }
}

onMounted(() => {
  fetchCourses()
})
</script>

