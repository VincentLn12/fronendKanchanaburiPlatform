<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm"
    >
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          จัดการผู้ใช้งาน
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          ระบบจัดการผู้ใช้งาน เพิ่ม แก้ไข เปลี่ยนสิทธิ์ (Role) และลบบัญชีในระบบ
        </p>
      </div>

      <AppButton
        type="button"
        color="indigo"
        variant="flat"
        size="default"
        class="!rounded-xl !px-5 font-bold normal-case shadow-md shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        title="เพิ่มผู้ใช้งานใหม่"
        @click="openAddModal"
      >
        <div class="flex items-center gap-2">
          <v-icon icon="mdi-plus" size="20" />
          <span>เพิ่มผู้ใช้งานใหม่</span>
        </div>
      </AppButton>
    </div>

    <!-- Search Bar -->
    <AppSearch
      v-model="searchQuery"
      placeholder="ค้นหาชื่อผู้ใช้งาน หรือ อีเมล..."
      :count="filteredUsers.length"
      count-label="คน"
    />

    <!-- Data Table -->
    <AppDataTable
      :headers="headers"
      :items="filteredUsers"
      :search="searchQuery"
      :loading="isLoading"
    >
      <template #item.name="{ item }">
        <div class="font-bold text-slate-900 flex items-center gap-3 py-1">
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold text-sm flex items-center justify-center shadow-sm flex-shrink-0"
          >
            {{ item.name?.charAt(0).toUpperCase() || 'U' }}
          </div>
          <span>{{ item.name }}</span>
        </div>
      </template>

      <template #item.email="{ item }">
        <span class="text-slate-600 font-medium">{{ item.email }}</span>
      </template>

      <template #item.role="{ item }">
        <span
          class="px-3 py-1 rounded-full text-xs font-bold border"
          :class="[
            item.role === 'admin'
              ? 'bg-purple-100 text-purple-800 border-purple-200'
              : 'bg-slate-100 text-slate-700 border-slate-200',
          ]"
        >
          {{ item.role === 'admin' ? '🛡️ Administrator' : '👤 User' }}
        </span>
      </template>

      <template #item.actions="{ item }">
        <div class="flex justify-end gap-2">
          <AppButton
            type="button"
            variant="tonal"
            size="small"
            class="!text-yellow-600 !bg-indigo-50 hover:!bg-yellow-600 hover:!text-white"
            title="แก้ไขสิทธิ์/ข้อมูล"
            @click="openEditModal(item)"
          >
            แก้ไข
          </AppButton>
          <AppButton
            type="button"
            variant="tonal"
            size="small"
            class="!text-red-600 !bg-indigo-50 hover:!bg-red-600 hover:!text-white"
            title="ลบผู้ใช้งาน"
            @click="deleteUser(item.id)"
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
import AppDataTable, { type DataTableHeader } from '@/components/common/AppDataTable.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppSearch from '@/components/common/AppSearch.vue'
import UserForm from './form/UserForm.vue'
import { useModal } from '@/composables/useModal'
import { useSwal } from '@/plugins/sweetalert'
import type { AdminUser, UserPayload } from './type/user'
import { adminUserService } from './services/user.service'

const users = ref<AdminUser[]>([])
const searchQuery = ref('')
const isLoading = ref(false)

const swal = useSwal()
const { openModal, closeModal } = useModal()

const headers: DataTableHeader[] = [
  { title: 'ผู้ใช้งาน', key: 'name', align: 'start' },
  { title: 'อีเมล', key: 'email', align: 'start' },
  { title: 'สิทธิ์การใช้งาน (Role)', key: 'role', align: 'start' },
  { title: 'จัดการ', key: 'actions', align: 'end', sortable: false },
]

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return users.value
  const q = searchQuery.value.trim().toLowerCase()
  return users.value.filter(
    (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
  )
})

async function fetchUsers() {
  isLoading.value = true
  try {
    users.value = await adminUserService.getAll()
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function openAddModal() {
  openModal({
    title: 'เพิ่มผู้ใช้งานใหม่',
    component: UserForm,
    props: { onSave: createUser },
  })
}

function openEditModal(user: AdminUser) {
  openModal({
    title: 'แก้ไขข้อมูลผู้ใช้งาน',
    component: UserForm,
    props: {
      user,
      onSave: (payload: Partial<UserPayload>) => updateUser(user.id, payload),
    },
  })
}

async function createUser(payload: UserPayload) {
  try {
    const newUser = await adminUserService.create(payload)
    users.value.push(newUser)
    closeModal()
    await swal.success('บันทึกข้อมูลสำเร็จ')
  } catch (err) {
    console.error(err)
    await swal.error('บันทึกข้อมูลไม่สำเร็จ')
  }
}

async function updateUser(id: string | number, payload: Partial<UserPayload>) {
  try {
    const updated = await adminUserService.update(id, payload)
    const index = users.value.findIndex((user) => user.id === id)
    if (index !== -1) users.value[index] = updated
    closeModal()
    await swal.success('แก้ไขข้อมูลสำเร็จ')
  } catch (err) {
    console.error(err)
    await swal.error('แก้ไขข้อมูลไม่สำเร็จ')
  }
}

async function deleteUser(id: string | number) {
  const result = await swal.confirm('ยืนยันการลบ?', 'รายการนี้จะไม่สามารถกู้คืนได้')
  if (!result.isConfirmed) return

  try {
    await adminUserService.remove(id)
    users.value = users.value.filter((u) => u.id !== id)
    await swal.success('ลบข้อมูลสำเร็จ')
  } catch (err) {
    console.error(err)
    await swal.error('ลบข้อมูลไม่สำเร็จ')
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

