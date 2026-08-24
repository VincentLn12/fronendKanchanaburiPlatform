<script setup lang="ts">
// Merchant area
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
const swal = useSwal()
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
    await swal.warning('กรอกข้อมูลไม่ครบ', 'กรุณากรอกชื่อร้าน หมวดหมู่ เขต และตำบล')
    return
  }
  saving.value = true
  try {
    if (shop.value) {
      await updateShop(shop.value.shopId, form.value)
      await swal.success('บันทึกข้อมูลร้านแล้ว')
    } else {
      applyShop(await createShop(form.value))
      await swal.success('สร้างร้านสำเร็จ')
    }
  } catch (error) {
    await swal.error('บันทึกร้านไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่'))
  } finally {
    saving.value = false
  }
}

async function removeShop() {
  if (!shop.value) return
  const result = await swal.confirm('ปิดร้านนี้?', 'ร้านจะไม่แสดงต่อสาธารณะ แต่ข้อมูลจะไม่ถูกลบ')
  if (!result.isConfirmed) return
  try {
    await closeShop(shop.value.shopId)
    shop.value.status = 'Closed'
    await swal.success('ปิดร้านแล้ว')
  } catch (error) {
    await swal.error('ปิดร้านไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่'))
  }
}

async function reopenShop() {
  if (!shop.value) return
  const result = await swal.confirm('เปิดร้านอีกครั้ง?', 'ร้านจะแสดงต่อสาธารณะอีกครั้ง')
  if (!result.isConfirmed) return
  try {
    await updateShopStatus(shop.value.shopId, 'Active')
    shop.value.status = 'Active'
    await swal.success('เปิดร้านแล้ว')
  } catch (error) {
    await swal.error('เปิดร้านไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่'))
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
    await swal.error('โหลดข้อมูลไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่'))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="mx-auto w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl py-2">
    <!-- Skeleton Loading -->
    <div v-if="loading" class="space-y-6">
      <div class="h-28 w-full animate-pulse rounded-2xl bg-slate-200/70"></div>
      <div class="h-96 w-full animate-pulse rounded-2xl bg-slate-200/70"></div>
    </div>

    <template v-else>
      <!-- Main Form Card -->
      <div class="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
        <!-- Form Header Section -->
        <div class="border-b border-slate-100 bg-slate-50/50 px-6 py-5 sm:px-8">
          <h2 class="text-lg font-bold text-slate-900">รายละเอียดข้อมูลร้านค้า</h2>
          <p class="text-xs text-slate-500">กรุณาตรวจสอบและอัปเดตข้อมูลให้ถูกต้องแม่นยำ</p>
        </div>

        <form class="space-y-8 p-6 sm:p-8 2xl:p-10" @submit.prevent="submit">
          <!-- General Info Section -->
          <div class="space-y-6">
            <h3 class="text-xs font-bold uppercase tracking-wider text-indigo-600">ข้อมูลทั่วไป</h3>

            <AppTextField
              v-model="form.shopName"
              label="ชื่อร้านค้า *"
              placeholder="ระบุชื่อร้านค้าของคุณ"
            />

            <div class="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
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
                class="sm:col-span-2 2xl:col-span-1"
              />
            </div>

            <AppTextarea
              v-model="form.description"
              label="รายละเอียดร้านค้า"
              placeholder="อธิบายจุดเด่น สินค้า หรือบริการของร้านคุณ..."
            />
          </div>

          <hr class="border-slate-100" />

          <!-- Contact & Location Section -->
          <div class="space-y-6">
            <h3 class="text-xs font-bold uppercase tracking-wider text-indigo-600">
              ช่องทางการติดต่อและที่อยู่
            </h3>

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
          <div
            class="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6"
          >
            <button
              v-if="shop && shop.status !== 'Closed'"
              type="button"
              class="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
              @click="removeShop"
            >
              <svg class="h-4 w-4 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              <span>ปิดบริการร้านนี้</span>
            </button>
            <button
              v-if="shop?.status === 'Closed'"
              type="button"
              class="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              @click="reopenShop"
            >
              <span>เปิดร้านอีกครั้ง</span>
            </button>

            <div class="ml-auto flex items-center gap-3">
              <button
                type="submit"
                class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-60"
                :disabled="saving || shop?.status === 'Closed'"
              >
                <svg
                  v-if="saving"
                  class="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <svg
                  v-else
                  class="h-5 w-5 stroke-[2]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
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
