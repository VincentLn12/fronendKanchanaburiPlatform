<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type ShopCategory,
} from '../api/adminShopCategoryApi'
const list = ref<ShopCategory[]>([])
const name = ref('')
const description = ref('')
const status = ref('Active')
const editing = ref<ShopCategory | null>(null)
async function load() {
  list.value = await getCategories()
}
function edit(x: ShopCategory) {
  editing.value = x
  name.value = x.categoryName
  description.value = x.description ?? ''
  status.value = x.status
}
async function save() {
  if (!name.value) return
  if (editing.value) {
    await updateCategory(editing.value.shopCategoryId, {
      categoryName: name.value,
      description: description.value,
      status: status.value,
    })
    await load()
  } else {
    await createCategory({ categoryName: name.value, description: description.value })
    await load()
  }
  editing.value = null
  name.value = ''
  description.value = ''
  status.value = 'Active'
}
async function remove(x: ShopCategory) {
  await deleteCategory(x.shopCategoryId)
  await load()
}
onMounted(load)
</script>
<template>
  <main class="mx-auto max-w-6xl p-8">
    <h1 class="mb-6 text-3xl font-bold">จัดการหมวดหมู่ร้าน</h1>
    <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form class="space-y-3 rounded-2xl bg-white p-5 shadow" @submit.prevent="save">
        <input
          v-model="name"
          class="w-full rounded-lg border p-3"
          placeholder="ชื่อหมวดหมู่"
        /><textarea
          v-model="description"
          class="w-full rounded-lg border p-3"
          placeholder="รายละเอียด"
        />
        <select v-if="editing" v-model="status" class="w-full rounded-lg border p-3">
          <option>Active</option>
          <option>Inactive</option></select
        ><button class="rounded-lg bg-indigo-600 px-4 py-2 text-white">
          {{ editing ? 'บันทึก' : 'เพิ่มหมวดหมู่' }}
        </button>
      </form>
      <table class="w-full bg-white">
        <tr v-for="x in list" :key="x.shopCategoryId" class="border-b">
          <td class="p-4 font-semibold">{{ x.categoryName }}</td>
          <td class="p-4">{{ x.description }}</td>
          <td class="p-4">{{ x.status }}</td>
          <td class="p-4">
            <button class="mr-3 text-indigo-600" @click="edit(x)">แก้ไข</button
            ><button class="text-red-600" @click="remove(x)">ปิดใช้งาน</button>
          </td>
        </tr>
      </table>
    </div>
  </main>
</template>
