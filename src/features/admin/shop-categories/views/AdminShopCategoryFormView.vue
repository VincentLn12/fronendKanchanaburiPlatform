<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createCategory, getCategory, updateCategory } from '../api/adminShopCategoryApi'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppTextarea from '@/components/common/input/AppTextarea.vue'
import AppSelect from '@/components/common/input/AppSelect.vue'

const route = useRoute()
const router = useRouter()
const categoryId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const isEdit = computed(() => Boolean(categoryId.value))
const loading = ref(isEdit.value)
const saving = ref(false)
const statusOptions = ['Active', 'Inactive']
const form = reactive({ categoryName: '', description: '', status: 'Active' })

async function load() {
  if (!isEdit.value) return
  loading.value = true
  try {
    const category = await getCategory(categoryId.value)
    form.categoryName = category.categoryName
    form.description = category.description ?? ''
    form.status = category.status
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!form.categoryName.trim()) return
  saving.value = true
  try {
    if (isEdit.value) await updateCategory(categoryId.value, form)
    else await createCategory({ categoryName: form.categoryName, description: form.description })
    router.push('/admin/categories')
  } finally {
    saving.value = false
  }
}
onMounted(load)
</script>
<template>
  <main class="mx-auto w-full max-w-2xl px-6 py-10">
    <RouterLink to="/admin/categories" class="text-sm font-semibold text-indigo-600"
      >← กลับไปหน้ารายการ</RouterLink
    >
    <h1 class="mt-4 text-3xl font-bold text-slate-900">
      {{ isEdit ? 'แก้ไขหมวดหมู่ร้าน' : 'เพิ่มหมวดหมู่ร้าน' }}
    </h1>
    <form
      v-if="!loading"
      class="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      @submit.prevent="save"
    >
      <AppTextField
        v-model="form.categoryName"
        label="ชื่อหมวดหมู่"
        placeholder="เช่น ร้านอาหาร"
      /><AppTextarea
        v-model="form.description"
        label="รายละเอียด"
        placeholder="รายละเอียดของหมวดหมู่"
      /><AppSelect v-if="isEdit" v-model="form.status" label="สถานะ" :items="statusOptions" />
      <div class="flex justify-end gap-3">
        <RouterLink
          to="/admin/categories"
          class="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-600"
          >ยกเลิก</RouterLink
        ><button
          type="submit"
          class="rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
          :disabled="saving"
        >
          {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
        </button>
      </div>
    </form>
    <div v-else class="mt-6 h-1 animate-pulse rounded bg-indigo-600" />
  </main>
</template>
