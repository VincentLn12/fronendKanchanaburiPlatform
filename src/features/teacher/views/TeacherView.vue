<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">จัดการอาจารย์ผู้สอน</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">เพิ่ม แก้ไข ค้นหา และลบข้อมูลอาจารย์ผู้สอนในระบบ</p>
      </div>
      <AppButton type="button" color="indigo" variant="flat" size="default" class="!rounded-xl !px-5 font-bold normal-case shadow-md shadow-indigo-600/20" @click="openAddModal">
        <div class="flex items-center gap-2"><v-icon icon="mdi-plus" size="20" /><span>เพิ่มอาจารย์ผู้สอน</span></div>
      </AppButton>
    </div>

    <AppSearch v-model="searchQuery" placeholder="ค้นหาชื่อ อีเมล หรือความเชี่ยวชาญ..." :count="filteredTeachers.length" count-label="คน" />

    <AppDataTable :headers="headers" :items="filteredTeachers" :search="searchQuery" :loading="isLoading">
      <template #item.name="{ item }">
        <div class="flex items-center gap-3 py-1 font-bold text-slate-900">
          <img v-if="item.image" :src="item.image" :alt="item.name" class="w-10 h-10 rounded-full object-cover bg-slate-100" />
          <div v-else class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white flex items-center justify-center">{{ item.name.charAt(0).toUpperCase() }}</div>
          <span>{{ item.name }}</span>
        </div>
      </template>
      <template #item.email="{ item }"><span class="text-slate-600">{{ item.email }}</span></template>
      <template #item.specialty="{ item }"><span class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">{{ item.specialty }}</span></template>
      <template #item.bio="{ item }"><span class="text-slate-600 line-clamp-2">{{ item.bio || '-' }}</span></template>
      <template #item.actions="{ item }">
        <div class="flex justify-end gap-2">
          <AppButton type="button" variant="tonal" size="small" class="!text-yellow-600 !bg-indigo-50 hover:!bg-yellow-600 hover:!text-white" @click="openEditModal(item)">แก้ไข</AppButton>
          <AppButton type="button" variant="tonal" size="small" class="!text-red-600 !bg-indigo-50 hover:!bg-red-600 hover:!text-white" @click="deleteTeacher(item.id)">ลบ</AppButton>
        </div>
      </template>
    </AppDataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppButton from '@/components/common/AppButton.vue'
import AppDataTable, { type DataTableHeader } from '@/components/common/AppDataTable.vue'
import AppSearch from '@/components/common/AppSearch.vue'
import { useModal } from '@/composables/useModal'
import { useSwal } from '@/plugins/sweetalert'
import TeacherForm from '../form/TeacherForm.vue'
import { teacherService } from '../services/teacher.service'
import type { Teacher, TeacherPayload } from '../type/teacher'

const teachers = ref<Teacher[]>([])
const searchQuery = ref('')
const isLoading = ref(false)
const { openModal, closeModal } = useModal()
const swal = useSwal()
const headers: DataTableHeader[] = [
  { title: 'อาจารย์ผู้สอน', key: 'name', align: 'start' },
  { title: 'อีเมล', key: 'email', align: 'start' },
  { title: 'ความเชี่ยวชาญ', key: 'specialty', align: 'start' },
  { title: 'ประวัติ', key: 'bio', align: 'start' },
  { title: 'จัดการ', key: 'actions', align: 'end', sortable: false },
]
const filteredTeachers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return teachers.value
  return teachers.value.filter((teacher) => [teacher.name, teacher.email, teacher.specialty].some((value) => value.toLowerCase().includes(query)))
})

async function fetchTeachers() {
  isLoading.value = true
  try { teachers.value = await teacherService.getAll() } catch (error) { console.error(error); await swal.error('โหลดข้อมูลอาจารย์ไม่สำเร็จ') } finally { isLoading.value = false }
}
function openAddModal() { openModal({ title: 'เพิ่มอาจารย์ผู้สอน', component: TeacherForm, props: { onSave: createTeacher } }) }
function openEditModal(teacher: Teacher) { openModal({ title: 'แก้ไขข้อมูลอาจารย์ผู้สอน', component: TeacherForm, props: { teacher, onSave: (payload: TeacherPayload) => updateTeacher(teacher.id, payload) } }) }
async function createTeacher(payload: TeacherPayload) {
  try { teachers.value.push(await teacherService.create(payload)); closeModal(); await swal.success('บันทึกข้อมูลสำเร็จ') } catch (error) { console.error(error); await swal.error('บันทึกข้อมูลไม่สำเร็จ') }
}
async function updateTeacher(id: string | number, payload: TeacherPayload) {
  try { const updated = await teacherService.update(id, payload); const index = teachers.value.findIndex((teacher) => teacher.id === id); if (index !== -1) teachers.value[index] = updated; closeModal(); await swal.success('แก้ไขข้อมูลสำเร็จ') } catch (error) { console.error(error); await swal.error('แก้ไขข้อมูลไม่สำเร็จ') }
}
async function deleteTeacher(id: string | number) {
  const result = await swal.confirm('ยืนยันการลบ?', 'รายการนี้จะไม่สามารถกู้คืนได้')
  if (!result.isConfirmed) return
  try { await teacherService.remove(id); teachers.value = teachers.value.filter((teacher) => teacher.id !== id); await swal.success('ลบข้อมูลสำเร็จ') } catch (error) { console.error(error); await swal.error('ลบข้อมูลไม่สำเร็จ') }
}
onMounted(fetchTeachers)
</script>
