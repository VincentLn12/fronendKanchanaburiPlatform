<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createProduct, getProduct, getProductCategories, updateProduct, uploadCoverImage, uploadDetailImages, getProductStock, setProductStock } from '../api/productApi'
import { getMyShop } from '../api/shopApi'
import type { ProductFormData, ProductCategory } from '../../shared/types/product'
import AppSelect from '@/components/common/input/AppSelect.vue'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppTextarea from '@/components/common/input/AppTextarea.vue'
import AppFileInput from '@/components/common/input/AppFileInput.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const route = useRoute()
const router = useRouter()
const categories = ref<ProductCategory[]>([])
const loading = ref(true)
const saving = ref(false)
const swal = useSwal()
const id = route.params.id as string | undefined
const form = ref<ProductFormData>({ shopId: '', productCategoryId: null, productName: '', description: '', price: null, imageUrl: '', status: 'Active' })
const coverFile = ref<File | null>(null)
const detailFiles = ref<File[]>([])
const stockQuantity = ref(0)

async function submit() {
  if (!form.value.productName || !form.value.productCategoryId || form.value.price === null || form.value.price < 0) { await swal.warning('กรอกข้อมูลไม่ครบ', 'กรุณากรอกชื่อสินค้า หมวดหมู่ และราคา'); return }
  saving.value = true
  try {
    const payload = { ...form.value, price: Number(form.value.price) }
    const productId = id ?? (await createProduct(payload)).productId
    if (id) await updateProduct(id, payload)
    await setProductStock(productId, Number(stockQuantity.value))
    if (coverFile.value) await uploadCoverImage(productId, coverFile.value)
    if (detailFiles.value.length) await uploadDetailImages(productId, detailFiles.value)
    await swal.success(id ? 'บันทึกสินค้าแล้ว' : 'เพิ่มสินค้าแล้ว')
    await router.push('/my-shop/products')
  } catch (error) { await swal.error('บันทึกสินค้าไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่')) }
  finally { saving.value = false }
}

onMounted(async () => {
  try {
    const shop = await getMyShop()
    categories.value = await getProductCategories()
    form.value.shopId = shop.shopId
    if (id) {
      const product = await getProduct(id)
      if (product.shopId !== shop.shopId) { await router.replace('/my-shop/products'); return }
      form.value = { shopId: product.shopId, productCategoryId: product.productCategoryId, productName: product.productName, description: product.description ?? '', price: product.price, imageUrl: product.imageUrl ?? '', status: product.status }
      stockQuantity.value = await getProductStock(id)
    }
  } catch (error) { await swal.error('โหลดข้อมูลไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่')); await router.replace('/my-shop/products') }
  finally { loading.value = false }
})
</script>

<template>
  <div class="mx-auto w-full max-w-3xl 2xl:max-w-5xl">
    <div v-if="loading" class="h-1 animate-pulse rounded bg-indigo-600" />
    <form v-else class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" @submit.prevent="submit">
      <div class="mb-7 flex items-center justify-between"><div><p class="font-semibold text-indigo-600">จัดการสินค้า</p><h1 class="mt-1 text-2xl font-bold text-slate-900">{{ id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่' }}</h1></div><RouterLink to="/my-shop/products" class="text-sm font-semibold text-slate-500 hover:text-indigo-600">← กลับรายการ</RouterLink></div>
      <div class="space-y-5">
        <AppTextField v-model="form.productName" label="ชื่อสินค้า" />
        <div class="grid gap-5 sm:grid-cols-2"><AppSelect v-model="form.productCategoryId" label="หมวดหมู่" :items="categories" item-title="categoryName" item-value="productCategoryId" placeholder="เลือกหมวดหมู่" clearable /><AppTextField v-model="form.price" label="ราคา" type="number" min="0" /></div>
        <AppTextField v-model="stockQuantity" label="จำนวนสินค้าในสต็อก" type="number" min="0" />
        <AppFileInput label="รูปหน้าปกสินค้า" @change="coverFile = $event[0] ?? null" />
        <p v-if="coverFile" class="-mt-3 text-sm text-slate-500">เลือกรูป: {{ coverFile.name }}</p>
        <AppFileInput label="รูปรายละเอียดสินค้า (เลือกได้สูงสุด 8 รูปต่อครั้ง)" multiple @change="detailFiles = $event.slice(0, 8)" />
        <p v-if="detailFiles.length" class="-mt-3 text-sm text-slate-500">เลือกรูปแล้ว {{ detailFiles.length }} รูป</p>
        <AppTextarea v-model="form.description" label="รายละเอียด" />
        <div class="flex justify-end gap-3 border-t border-slate-100 pt-5"><RouterLink to="/my-shop/products" class="rounded-xl px-4 py-3 font-semibold text-slate-600">ยกเลิก</RouterLink><button type="submit" class="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60" :disabled="saving">{{ saving ? 'กำลังบันทึก...' : 'บันทึกสินค้า' }}</button></div>
      </div>
    </form>
  </div>
</template>
