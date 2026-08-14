<template>
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm"
    >
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          จัดการหมวดหมู่คอร์ส
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          ระบบจัดการเพิ่ม แก้ไข ค้นหา และลบหมวดหมู่ของคอร์สเรียน
        </p>
      </div>
      <!-- Create -->
      <AppButton
        type="button"
        color="indigo"
        variant="flat"
        size="default"
        class="!rounded-xl !px-5 font-bold normal-case shadow-md shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        title="เพิ่มหมวดหมู่ใหม่"
        @click="openAddModal"
      >
        <div class="flex items-center gap-2">
          <v-icon icon="mdi-plus" size="20" />
          <span> เพิ่มหมวดหมู่ใหม่ </span>
        </div>
      </AppButton>
    </div>
    <!-- Search -->
    <AppSearch
      v-model="searchQuery"
      placeholder="ค้นหาหมวดหมู่..."
      :count="filteredCategories.length"
      count-label="หมวดหมู่"
    />
    <!-- Table -->
    <AppDataTable
      :headers="headers"
      :items="filteredCategories"
      :search="searchQuery"
      :loading="isLoading"
    >
      <template #item.name="{ item }">
        <div class="font-bold text-slate-900 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-indigo-500" />

          {{ item.name }}
        </div>
      </template>

      <template #item.slug="{ item }">
        <span
          class="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-100 text-slate-600 border border-slate-200"
        >
          {{ item.slug }}
        </span>
      </template>

      <template #item.description="{ item }">
        <span class="text-slate-600">
          {{ item.description }}
        </span>
      </template>

      <template #item.actions="{ item }">
        <div class="flex justify-end gap-2">
          <AppButton
            type="button"
            variant="tonal"
            size="small"
            class="!text-yellow-600 !bg-indigo-50 hover:!bg-yellow-600 hover:!text-white"
            title="แก้ไขหมวดหมู่"
            @click="openEditModal(item)"
          >
            แก้ไข
          </AppButton>
          <AppButton
            type="button"
            variant="tonal"
            size="small"
            class="!text-red-600 !bg-indigo-50 hover:!bg-red-600 hover:!text-white"
            title="ลบ"
            @click="deleteCategory(item.id)"
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
import CategoryForm from './form/CategoryForm.vue'
import { useModal } from '@/composables/useModal'
import { useSwal } from '@/plugins/sweetalert'
import AppButton from '@/components/common/AppButton.vue'
import AppSearch from '@/components/common/AppSearch.vue'
import type { Category, CategoryPayload } from './type/category'
import { categoryService } from './services/category.service'

const categories = ref<Category[]>([])
const searchQuery = ref('')
const isLoading = ref(false)

const swal = useSwal()
const { openModal, closeModal } = useModal()

const headers: DataTableHeader[] = [
  {
    title: 'ชื่อหมวดหมู่',
    key: 'name',
    align: 'start',
  },
  {
    title: 'Slug',
    key: 'slug',
    align: 'start',
  },
  {
    title: 'รายละเอียด',
    key: 'description',
    align: 'start',
  },
  {
    title: 'จัดการ',
    key: 'actions',
    align: 'end',
    sortable: false,
  },
]
const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) {
    return categories.value
  }

  const q = searchQuery.value.trim().toLowerCase()

  return categories.value.filter((category) => {
    return category.name.toLowerCase().includes(q) || category.slug.toLowerCase().includes(q)
  })
})
async function fetchCategories() {
  isLoading.value = true
  try {
    categories.value = await categoryService.getAll()
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
function openAddModal() {
  openModal({
    title: 'เพิ่มหมวดหมู่ใหม่',

    component: CategoryForm,

    props: {
      onSave: createCategory,
    },
  })
}
function openEditModal(category: Category) {
  openModal({
    title: 'แก้ไขหมวดหมู่คอร์ส',

    component: CategoryForm,

    props: {
      category,

      onSave: (payload: CategoryPayload) => {
        updateCategory(category.id, payload)
      },
    },
  })
}
async function createCategory(payload: CategoryPayload) {
  try {
    const category = await categoryService.create(payload)

    categories.value.push(category)

    closeModal()
    swal.success('บันทึกข้อมูลสำเร็จ')
  } catch (err) {
    console.error(err)
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
  }
}
async function updateCategory(id: string | number, payload: CategoryPayload) {
  try {
    const updatedCategory = await categoryService.update(id, payload)

    const index = categories.value.findIndex((category) => category.id === id)

    if (index !== -1) {
      categories.value[index] = updatedCategory
    }
    closeModal()
    swal.success('แก้ไขข้อมูลสำเร็จ')
  } catch (err) {
    console.error(err)
    alert('เกิดข้อผิดพลาดในการแก้ไขข้อมูล')
  }
}
async function deleteCategory(id: string | number) {
  const result = await swal.confirm('ยืนยันการลบ?', 'รายการนี้จะไม่สามารถกู้คืนได้')

  try {
    if (result.isConfirmed) {
      await categoryService.remove(id)
      categories.value = categories.value.filter((category) => category.id !== id)
    }
  } catch (err) {
    console.error(err)
    alert('เกิดข้อผิดพลาดในการลบ')
  }
}
onMounted(() => {
  fetchCategories()
})
</script>
