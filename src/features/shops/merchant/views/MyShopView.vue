<script setup lang="ts">
// Merchant area - Emerald Nature My Shop Settings View
import axios from 'axios'
import { onMounted, ref, watch } from 'vue'
import {
  closeShop,
  createShop,
  getDistricts,
  getMyShop,
  getShopCategories,
  getSubDistricts,
  updateShop,
  updateShopStatus,
  uploadShopCoverImage,
} from '../api/shopApi'
import type {
  District,
  Shop,
  ShopCategory,
  ShopFormData,
  SubDistrict,
} from '../../shared/types/shop'
import AppSelect from '@/components/common/input/AppSelect.vue'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppTextarea from '@/components/common/input/AppTextarea.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const shop = ref<Shop | null>(null)
const categories = ref<ShopCategory[]>([])
const districts = ref<District[]>([])
const subDistricts = ref<SubDistrict[]>([])
const loading = ref(true)
const saving = ref(false)
const uploadingCover = ref(false)
const swal = useSwal()
const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(/\/api$/, '')

const form = ref<ShopFormData>({
  shopName: '',
  shopCategoryId: null,
  districtId: null,
  subDistrictId: null,
  description: '',
  phone: '',
  email: '',
  address: '',
})

function applyShop(data: Shop) {
  shop.value = data
  form.value = {
    shopName: data.shopName,
    shopCategoryId: data.shopCategoryId,
    districtId: data.districtId,
    subDistrictId: data.subDistrictId,
    description: data.description ?? '',
    phone: data.phone ?? '',
    email: data.email ?? '',
    address: data.address ?? '',
  }
}

function imageUrl(url?: string) {
  return url?.startsWith('/') ? `${apiOrigin}${url}` : url
}

async function loadSubDistricts(districtId: string | null, keepValue = false) {
  if (!districtId) {
    subDistricts.value = []
    form.value.subDistrictId = null
    return
  }
  subDistricts.value = await getSubDistricts(districtId)
  if (!keepValue) form.value.subDistrictId = null
}

watch(
  () => form.value.districtId,
  (value, oldValue) => {
    if (value && value !== oldValue) loadSubDistricts(value)
  },
)

async function submit() {
  if (
    !form.value.shopName ||
    !form.value.shopCategoryId ||
    !form.value.districtId ||
    !form.value.subDistrictId
  ) {
    await swal.warning('กรอกข้อมูลไม่ครบ', 'กรุณากรอกชื่อร้าน หมวดหมู่ เขต และตำบล ให้ครบถ้วน')
    return
  }
  saving.value = true
  try {
    if (shop.value) {
      await updateShop(shop.value.shopId, form.value)
      await swal.success('บันทึกข้อมูลร้านแล้ว', 'ข้อมูลร้านค้าของคุณได้รับการอัปเดตเรียบร้อยแล้ว')
    } else {
      applyShop(await createShop(form.value))
      await swal.success('สร้างร้านสำเร็จ', 'ขอยินดีต้อนรับสู่แพลตฟอร์มร้านค้าเมืองกาญจน์!')
    }
  } catch (error) {
    await swal.error('บันทึกร้านไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    saving.value = false
  }
}

async function removeShop() {
  if (!shop.value) return
  const result = await swal.confirm('ยืนยันปิดบริการร้านนี้?', 'ร้านจะไม่แสดงต่อสาธารณะบนแพลตฟอร์ม แต่ข้อมูลของคุณจะไม่ถูกลบ')
  if (!result.isConfirmed) return
  try {
    await closeShop(shop.value.shopId)
    shop.value.status = 'Closed'
    await swal.success('ปิดบริการร้านค้าแล้ว')
  } catch (error) {
    await swal.error('ปิดร้านไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

async function reopenShop() {
  if (!shop.value) return
  const result = await swal.confirm('เปิดบริการร้านค้าอีกครั้ง?', 'ร้านจะแสดงต่อสาธารณะและสามารถรับคำสั่งซื้อได้อีกครั้ง')
  if (!result.isConfirmed) return
  try {
    await updateShopStatus(shop.value.shopId, 'Active')
    shop.value.status = 'Active'
    await swal.success('เปิดบริการร้านค้าเรียบร้อยแล้ว')
  } catch (error) {
    await swal.error('เปิดร้านไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

async function uploadCoverImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !shop.value) return

  uploadingCover.value = true
  try {
    shop.value = await uploadShopCoverImage(shop.value.shopId, file)
    await swal.success('อัปโหลดรูปหน้าปกร้านแล้ว')
  } catch (error) {
    await swal.error('อัปโหลดรูปไม่สำเร็จ', getApiErrorMessage(error, 'รองรับไฟล์ภาพ JPG, PNG, WEBP ขนาดไม่เกิน 5 MB'))
  } finally {
    input.value = ''
    uploadingCover.value = false
  }
}

onMounted(async () => {
  try {
    ;[categories.value, districts.value] = await Promise.all([getShopCategories(), getDistricts()])
    try {
      const myShop = await getMyShop()
      applyShop(myShop)
      await loadSubDistricts(myShop.districtId, true)
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error
    }
  } catch (error) {
    await swal.error('โหลดข้อมูลไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="mx-auto w-full max-w-5xl xl:max-w-6xl py-4 space-y-6">
    <!-- Skeleton Loading -->
    <div v-if="loading" class="space-y-6">
      <div class="h-28 w-full animate-pulse rounded-3xl bg-slate-200/70"></div>
      <div class="h-96 w-full animate-pulse rounded-3xl bg-slate-200/70"></div>
    </div>

    <template v-else>
      <!-- Page Title & Status Header Card -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div class="flex items-center gap-3.5">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <i class="mdi mdi-store-cog text-2xl"></i>
          </div>
          <div>
            <h1 class="text-xl font-extrabold text-slate-900">
              {{ shop ? 'ตั้งค่าข้อมูลร้านค้า' : 'ลงทะเบียนเปิดร้านค้าใหม่' }}
            </h1>
            <p class="text-xs text-slate-500">จัดการข้อมูลร้าน รูปหน้าปก และช่องทางติดต่อบนแพลตฟอร์ม</p>
          </div>
        </div>

        <div v-if="shop" class="flex items-center gap-3">
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border"
            :class="shop.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
          >
            <span class="h-2 w-2 rounded-full" :class="shop.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'"></span>
            {{ shop.status === 'Active' ? 'เปิดบริการต่อสาธารณะ' : 'ปิดบริการชั่วคราว' }}
          </span>

          <RouterLink
            :to="`/shops/${shop.shopId}`"
            target="_blank"
            class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition"
          >
            <i class="mdi mdi-open-in-new text-sm"></i>
            <span>ดูหน้าร้านของคุณ</span>
          </RouterLink>
        </div>
      </div>

      <!-- Main Form Card -->
      <div class="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <form class="space-y-8 p-6 sm:p-8 lg:p-10" @submit.prevent="submit">
          <!-- General Info Section -->
          <div class="space-y-6">
            <div class="flex items-center gap-2 border-b border-slate-100 pb-3">
              <i class="mdi mdi-text-box-outline text-emerald-600 text-xl"></i>
              <h2 class="text-base font-bold text-slate-900">ข้อมูลทั่วไปของร้านค้า</h2>
            </div>

            <AppTextField
              v-model="form.shopName"
              label="ชื่อร้านค้า *"
              placeholder="ระบุชื่อร้านค้าของคุณ"
            />

            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AppSelect
                v-model="form.shopCategoryId"
                label="หมวดหมู่ร้านค้า *"
                :items="categories"
                item-title="categoryName"
                item-value="shopCategoryId"
                placeholder="เลือกหมวดหมู่ร้าน"
                clearable
              />
              <AppSelect
                v-model="form.districtId"
                label="เขต / อำเภอ *"
                :items="districts"
                item-title="districtName"
                item-value="districtId"
                placeholder="เลือกเขต / อำเภอ"
                clearable
              />
              <AppSelect
                v-model="form.subDistrictId"
                label="ตำบล / แขวง *"
                :items="subDistricts"
                item-title="subDistrictName"
                item-value="subDistrictId"
                placeholder="เลือกตำบล / แขวง"
                clearable
                :disabled="!form.districtId"
                class="sm:col-span-2 lg:col-span-1"
              />
            </div>

            <AppTextarea
              v-model="form.description"
              label="รายละเอียดร้านค้า"
              placeholder="อธิบายจุดเด่น สินค้าแนะนำ หรือประวัติความเป็นมาของร้านคุณ..."
            />

            <!-- Cover Image Upload Box -->
            <div v-if="shop" class="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-5 sm:p-6 space-y-4">
              <div>
                <h3 class="font-bold text-slate-900 flex items-center gap-2">
                  <i class="mdi mdi-image-outline text-emerald-600 text-lg"></i>
                  รูปหน้าปกร้านค้า (Cover Image)
                </h3>
                <p class="mt-0.5 text-xs text-slate-500">
                  ภาพปกจะแสดงบนการ์ดร้านค้าในหน้ารวมร้านค้าและส่วนหัวของหน้าร้านคุณ (รองรับ JPG, PNG, WEBP ขนาดไม่เกิน 5 MB)
                </p>
              </div>

              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div class="relative h-28 w-48 shrink-0 overflow-hidden rounded-2xl bg-slate-200 border border-slate-200 shadow-xs">
                  <img
                    v-if="shop.coverImageUrl"
                    :src="imageUrl(shop.coverImageUrl)"
                    alt="รูปหน้าปกร้าน"
                    class="h-full w-full object-cover"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center text-slate-400">
                    <i class="mdi mdi-storefront text-3xl"></i>
                  </div>
                </div>

                <label class="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition active:scale-95">
                  <i class="mdi mdi-upload text-base" :class="{ 'animate-spin mdi-loading': uploadingCover }"></i>
                  <span>{{ uploadingCover ? 'กำลังอัปโหลด...' : 'เลือกและอัปโหลดรูปหน้าปก' }}</span>
                  <input
                    class="sr-only"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    :disabled="uploadingCover"
                    @change="uploadCoverImage"
                  />
                </label>
              </div>
            </div>
          </div>

          <!-- Contact & Location Section -->
          <div class="space-y-6 pt-4">
            <div class="flex items-center gap-2 border-b border-slate-100 pb-3">
              <i class="mdi mdi-card-account-phone-outline text-emerald-600 text-xl"></i>
              <h2 class="text-base font-bold text-slate-900">ช่องทางการติดต่อและที่อยู่</h2>
            </div>

            <div class="grid gap-6 sm:grid-cols-2">
              <AppTextField
                v-model="form.phone"
                label="เบอร์โทรศัพท์ติดต่อ"
                placeholder="เช่น 0812345678"
              />
              <AppTextField
                v-model="form.email"
                label="อีเมลติดต่อร้านค้า"
                type="email"
                placeholder="shop@example.com"
              />
            </div>

            <AppTextarea
              v-model="form.address"
              label="ที่อยู่ตั้งร้านค้าอย่างละเอียด"
              placeholder="บ้านเลขที่ อาคาร ซอย ถนน..."
            />
          </div>

          <!-- Action Buttons Bar -->
          <div class="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
            <button
              v-if="shop && shop.status !== 'Closed'"
              type="button"
              class="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold text-rose-600 border border-rose-100 bg-rose-50 transition hover:bg-rose-600 hover:text-white"
              @click="removeShop"
            >
              <i class="mdi mdi-store-off-outline text-base"></i>
              <span>ปิดบริการร้านค้าชั่วคราว</span>
            </button>

            <button
              v-if="shop?.status === 'Closed'"
              type="button"
              class="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold text-emerald-700 border border-emerald-200 bg-emerald-50 transition hover:bg-emerald-600 hover:text-white"
              @click="reopenShop"
            >
              <i class="mdi mdi-store-check-outline text-base"></i>
              <span>เปิดบริการร้านค้าอีกครั้ง</span>
            </button>

            <div class="ml-auto flex items-center gap-3">
              <button
                type="submit"
                class="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-60"
                :disabled="saving || shop?.status === 'Closed'"
              >
                <i class="mdi mdi-content-save-outline text-lg" :class="{ 'animate-spin mdi-loading': saving }"></i>
                <span>{{
                  saving ? 'กำลังบันทึก...' : shop ? 'บันทึกการเปลี่ยนแปลง' : 'ยืนยันสร้างร้านค้า'
                }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </template>
  </div>
</template>
