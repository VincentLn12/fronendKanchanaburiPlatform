<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  createMyContent,
  getContentCategories,
  getDistricts,
  getMyContent,
  getShops,
  getSubDistricts,
  updateMyContent,
  type ContentCategory,
  type District,
  type SubmissionStatus,
  type SubDistrict,
  type UserContentFormData,
} from '@/features/contents/api'
import AppSelect from '@/components/common/input/AppSelect.vue'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppTextarea from '@/components/common/input/AppTextarea.vue'
import LocationPickerMap from '@/components/common/map/LocationPickerMap.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const route = useRoute()
const router = useRouter()
const swal = useSwal()
const contentId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const isEdit = computed(() => Boolean(contentId.value))
const loading = ref(true)
const saving = ref(false)
const categories = ref<ContentCategory[]>([])
const districts = ref<District[]>([])
const subDistricts = ref<SubDistrict[]>([])
const shops = ref<{ shopId: string; shopName: string }[]>([])

const statusOptions = [
  { title: '🟢 เผยแพร่ทันที', value: 'Published' },
  { title: '📝 บันทึกร่าง', value: 'Draft' },
]

const form = reactive<UserContentFormData>({
  title: '',
  summary: '',
  contentCategoryId: null,
  shopId: null,
  districtId: null,
  subDistrictId: null,
  latitude: null,
  longitude: null,
  youtubeUrl: '',
  status: 'Published',
})

async function loadSubDistricts(districtId: string | null, keepValue = false) {
  if (!districtId) {
    subDistricts.value = []
    form.subDistrictId = null
    return
  }
  subDistricts.value = await getSubDistricts(districtId)
  if (!keepValue) form.subDistrictId = null
}

watch(
  () => form.districtId,
  (value, oldValue) => {
    if (value && value !== oldValue) void loadSubDistricts(value)
  },
)

async function onAddressDetected(data: { districtName?: string; subDistrictName?: string }) {
  if (!data.districtName) return
  const targetDistName = data.districtName.replace(/^(อำเภอ|อ\.)\s*/, '').trim()

  const matchedDistrict = districts.value.find((d) => {
    const dName = d.districtName.replace(/^(อำเภอ|อ\.)\s*/, '').trim()
    return dName.includes(targetDistName) || targetDistName.includes(dName)
  })

  if (matchedDistrict) {
    form.districtId = matchedDistrict.districtId
    await loadSubDistricts(matchedDistrict.districtId, true)

    if (data.subDistrictName) {
      const targetSubName = data.subDistrictName.replace(/^(ตำบล|ต\.)\s*/, '').trim()
      const matchedSub = subDistricts.value.find((s) => {
        const sName = s.subDistrictName.replace(/^(ตำบล|ต\.)\s*/, '').trim()
        return sName.includes(targetSubName) || targetSubName.includes(sName)
      })

      if (matchedSub) {
        form.subDistrictId = matchedSub.subDistrictId
      }
    }
  }
}

function youtubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)
    const videoId = parsed.hostname.includes('youtu.be')
      ? parsed.pathname.slice(1)
      : (parsed.searchParams.get('v') ??
        (parsed.pathname.startsWith('/embed/') ? parsed.pathname.split('/')[2] : ''))
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : ''
  } catch {
    return ''
  }
}

function toNullableNumber(value: number | string | null) {
  if (value === null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

async function load() {
  try {
    ;[categories.value, districts.value, shops.value] = await Promise.all([
      getContentCategories(),
      getDistricts(),
      getShops().catch(() => []),
    ])
    if (isEdit.value) {
      const content = await getMyContent(contentId.value)
      if (content.status === 'Archived') {
        await router.replace('/profile')
        return
      }
      Object.assign(form, {
        title: content.title,
        summary: content.summary ?? '',
        contentCategoryId: content.contentCategoryId,
        shopId: content.shopId ?? null,
        districtId: content.districtId ?? null,
        subDistrictId: content.subDistrictId ?? null,
        latitude: content.latitude ?? null,
        longitude: content.longitude ?? null,
        youtubeUrl: content.youtubeUrl ?? '',
        status: (content.status === 'Draft' ? 'Draft' : 'Published') as SubmissionStatus,
      })
      await loadSubDistricts(form.districtId, true)
    }
  } catch (error) {
    await swal.error('โหลดข้อมูลไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
    if (isEdit.value) await router.replace('/profile')
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!form.title.trim() || !form.contentCategoryId) {
    await swal.warning('กรอกข้อมูลไม่ครบ', 'กรุณาระบุชื่อคอนเทนต์และหมวดหมู่')
    return
  }
  saving.value = true
  try {
    const payload = {
      ...form,
      latitude: toNullableNumber(form.latitude),
      longitude: toNullableNumber(form.longitude),
      status: form.status || 'Published',
    }
    if (isEdit.value) await updateMyContent(contentId.value, payload)
    else await createMyContent(payload)
    await swal.success(
      isEdit.value ? 'บันทึกการแก้ไขแล้ว' : 'บันทึกคอนเทนต์แล้ว',
      form.status === 'Published'
        ? 'คอนเทนต์ของคุณแสดงผลต่อสาธารณะทันที'
        : 'บันทึกเป็นฉบับร่างเรียบร้อยแล้ว',
    )
    await router.push('/profile')
  } catch (error) {
    await swal.error('บันทึกไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-20 font-sans">
    <main class="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:py-10">
      <!-- Skeleton Loading -->
      <div v-if="loading" class="space-y-6">
        <div
          class="h-24 w-full animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
        ></div>
        <div
          class="h-96 w-full animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]"
        ></div>
      </div>

      <template v-else>
        <!-- Header Container with Status Select on Top Right -->
        <div
          class="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#E8D9C9] pb-6 mb-6"
        >
          <div>
            <RouterLink
              to="/profile"
              class="inline-flex items-center gap-1 text-sm font-black text-[#D96C2C] hover:underline"
            >
              <i class="mdi mdi-arrow-left" /> กลับไปหน้าโปรไฟล์
            </RouterLink>
            <h1 class="mt-2 text-2xl sm:text-3xl font-black text-[#332820]">
              {{ isEdit ? 'แก้ไขคอนเทนต์' : 'สร้างคอนเทนต์ใหม่' }}
            </h1>
            <p class="mt-1 text-xs text-[#786B62] font-semibold">
              บอกเล่าเรื่องราว สถานที่ท่องเที่ยว วัฒนธรรม หรือประสบการณ์ในกาญจนบุรี
            </p>
          </div>

          <!-- TOP RIGHT CONTROLS: STATUS SELECT & SAVE BUTTON -->
          <div class="flex items-center gap-3">
            <div class="w-48 sm:w-56">
              <label class="block text-[10px] font-black uppercase text-[#786B62] mb-1">
                สถานะการแสดงผล
              </label>
              <AppSelect
                v-model="form.status"
                :items="statusOptions"
                item-title="title"
                item-value="value"
              />
            </div>

            <div class="pt-4">
              <button
                type="button"
                class="rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] px-6 py-3 font-black text-xs sm:text-sm text-white shadow-md transition active:scale-95 border border-[#D96C2C] cursor-pointer"
                :disabled="saving"
                @click="save"
              >
                <i
                  class="mdi text-base text-white"
                  :class="saving ? 'mdi-loading animate-spin' : 'mdi-publish'"
                />
                <span class="!text-white font-black ml-1">{{
                  saving ? 'กำลังบันทึก...' : 'บันทึกคอนเทนต์'
                }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Form Container -->
        <form
          class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] items-start"
          @submit.prevent="save"
        >
          <div class="space-y-6">
            <!-- Section 1: Details -->
            <section
              class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs space-y-4"
            >
              <h2
                class="text-lg font-black text-[#332820] flex items-center gap-2 border-b-2 border-[#E8D9C9] pb-3"
              >
                <i class="mdi mdi-file-document-outline text-[#D96C2C] text-xl"></i>
                ข้อมูลเนื้อหาเรื่องราว
              </h2>
              <div class="space-y-5">
                <AppTextField
                  v-model="form.title"
                  label="ชื่อคอนเทนต์ *"
                  placeholder="เช่น มนต์เสน่ห์สังขละบุรีและวิถีชีวิตชาวมอญ"
                />

                <AppTextarea
                  v-model="form.summary"
                  label="สรุปเนื้อหาย่อ"
                  placeholder="เขียนสรุปสั้น ๆ ที่น่าสนใจเพื่อดึงดูดผู้อ่าน"
                />
                <AppTextField
                  v-model="form.youtubeUrl"
                  label="URL วิดีโอ YouTube (ถ้ามี)"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <div
                  v-if="youtubeEmbedUrl(form.youtubeUrl)"
                  class="overflow-hidden rounded-2xl border-2 border-[#E8D9C9] bg-[#171412]"
                >
                  <iframe
                    :src="youtubeEmbedUrl(form.youtubeUrl)"
                    title="ตัวอย่างวิดีโอ YouTube"
                    class="aspect-video w-full"
                    allowfullscreen
                  />
                </div>
                <p v-else-if="form.youtubeUrl" class="text-xs text-rose-600 font-bold">
                  กรุณาใส่ลิงก์ YouTube ที่ถูกต้อง
                </p>
              </div>
            </section>

            <!-- Section 2: Category, Link to Shop & Location -->
            <section
              class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 shadow-xs space-y-4"
            >
              <h2
                class="text-lg font-black text-[#332820] flex items-center gap-2 border-b-2 border-[#E8D9C9] pb-3"
              >
                <i class="mdi mdi-storefront-outline text-[#D96C2C] text-xl"></i>
                หมวดหมู่ ร้านค้า และพิกัดสถานที่
              </h2>

              <div class="space-y-5">
                <div class="grid gap-5 sm:grid-cols-2">
                  <AppSelect
                    v-model="form.contentCategoryId"
                    label="หมวดหมู่บทความ *"
                    :items="categories"
                    item-title="categoryName"
                    item-value="contentCategoryId"
                    placeholder="เลือกหมวดหมู่"
                  />

                  <!-- LINK TO SHOP SELECT DROPDOWN -->
                  <AppSelect
                    v-model="form.shopId"
                    label="เชื่อมโยงกับร้านค้า (เลือกร้านค้า)"
                    :items="shops"
                    item-title="shopName"
                    item-value="shopId"
                    placeholder="เลือกร้านค้าที่เกี่ยวข้อง (ถ้ามี)"
                    clearable
                  />
                </div>

                <div class="grid gap-5 sm:grid-cols-2">
                  <AppSelect
                    v-model="form.districtId"
                    label="อำเภอ (เลือกอัตโนมัติจาก GPS)"
                    :items="districts"
                    item-title="districtName"
                    item-value="districtId"
                    placeholder="เลือกอำเภอ"
                    clearable
                  />
                  <AppSelect
                    v-model="form.subDistrictId"
                    label="ตำบล (เลือกอัตโนมัติจาก GPS)"
                    :items="subDistricts"
                    item-title="subDistrictName"
                    item-value="subDistrictId"
                    placeholder="เลือกตำบล"
                    :disabled="!form.districtId"
                    clearable
                  />
                </div>
              </div>

              <div class="mt-5">
                <LocationPickerMap
                  v-model:latitude="form.latitude"
                  v-model:longitude="form.longitude"
                  @address-detected="onAddressDetected"
                />
              </div>
            </section>
          </div>

          <!-- Sidebar Guide -->
          <aside class="space-y-5 lg:sticky lg:top-6">
            <section
              class="rounded-3xl border-2 border-[#D96C2C]/30 bg-[#D96C2C]/10 p-5 text-xs sm:text-sm text-[#332820] space-y-2"
            >
              <div class="flex gap-3">
                <i class="mdi mdi-store-check text-xl text-[#D96C2C] shrink-0" />
                <div>
                  <h2 class="font-black text-[#D96C2C]">เชื่อมโยงเรื่องราวกับร้านค้า</h2>
                  <p class="mt-1 font-semibold leading-relaxed text-[#786B62]">
                    คุณสามารถเลือกเชื่อมบทความนี้เข้ากับร้านค้าเพื่อดึงดูดลูกค้าและแสดงบทความในหน้ารายละเอียดร้านค้านั้น
                    ๆ ได้!
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </form>
      </template>
    </main>
  </div>
</template>
