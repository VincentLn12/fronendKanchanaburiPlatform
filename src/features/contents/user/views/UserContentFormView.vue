<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  createMyContent,
  getContentCategories,
  getDistricts,
  getMyContent,
  getSubDistricts,
  updateMyContent,
  type ContentCategory,
  type District,
  type SubDistrict,
  type UserContentFormData,
} from '../api/userContentApi'
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
const form = reactive<UserContentFormData>({
  title: '',
  summary: '',
  contentCategoryId: null,
  districtId: null,
  subDistrictId: null,
  latitude: null,
  longitude: null,
  youtubeUrl: '',
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
    ;[categories.value, districts.value] = await Promise.all([
      getContentCategories(),
      getDistricts(),
    ])
    if (isEdit.value) {
      const content = await getMyContent(contentId.value)
      if (content.status === 'Archived') {
        await router.replace('/my-contents')
        return
      }
      Object.assign(form, {
        title: content.title,
        summary: content.summary ?? '',
        contentCategoryId: content.contentCategoryId,
        districtId: content.districtId ?? null,
        subDistrictId: content.subDistrictId ?? null,
        latitude: content.latitude ?? null,
        longitude: content.longitude ?? null,
        youtubeUrl: content.youtubeUrl ?? '',
      })
      await loadSubDistricts(form.districtId, true)
    }
  } catch (error) {
    await swal.error('โหลดข้อมูลไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
    if (isEdit.value) await router.replace('/my-contents')
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
    }
    if (isEdit.value) await updateMyContent(contentId.value, payload)
    else await createMyContent(payload)
    await swal.success(
      isEdit.value ? 'บันทึกการแก้ไขแล้ว' : 'เผยแพร่คอนเทนต์แล้ว',
      'คอนเทนต์ของคุณแสดงในหน้าสำรวจแล้ว',
    )
    await router.push('/my-contents')
  } catch (error) {
    await swal.error('บันทึกไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <main class="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:py-10">
    <div class="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
      <div>
        <RouterLink
          to="/my-contents"
          class="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          ><i class="mdi mdi-arrow-left" /> กลับไปคอนเทนต์ของฉัน</RouterLink
        >
        <h1 class="mt-3 text-3xl font-black text-slate-900">
          {{ isEdit ? 'แก้ไขคอนเทนต์' : 'สร้างคอนเทนต์' }}
        </h1>
        <p class="mt-2 text-slate-500">กรอกข้อมูลให้ครบ แล้วเผยแพร่คอนเทนต์ของคุณได้ทันที</p>
      </div>
      <button
        v-if="!loading"
        type="button"
        class="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
        :disabled="saving"
        @click="save"
      >
        <i class="mdi mdi-publish mr-1" />{{ saving ? 'กำลังเผยแพร่...' : 'เผยแพร่คอนเทนต์' }}
      </button>
    </div>

    <form
      v-if="!loading"
      class="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
      @submit.prevent="save"
    >
      <div class="space-y-6">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 class="text-lg font-bold text-slate-900">เรื่องราวของคุณ</h2>
          <p class="mt-1 text-sm text-slate-500">
            ระบุข้อมูลให้ชัดเจน เพื่อให้ทีมงานตรวจสอบได้ง่าย
          </p>
          <div class="mt-5 space-y-5">
            <AppTextField
              v-model="form.title"
              label="ชื่อคอนเทนต์ *"
              placeholder="เช่น จุดชมวิวสวย ๆ ในกาญจนบุรี"
            />
            <AppTextarea
              v-model="form.summary"
              label="คำอธิบายย่อ"
              placeholder="เล่าเรื่องราวหรือข้อมูลที่เป็นประโยชน์"
            />
            <AppTextField
              v-model="form.youtubeUrl"
              label="URL วิดีโอ YouTube (ถ้ามี)"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <div
              v-if="youtubeEmbedUrl(form.youtubeUrl)"
              class="overflow-hidden rounded-xl border border-slate-200 bg-slate-950"
            >
              <iframe
                :src="youtubeEmbedUrl(form.youtubeUrl)"
                title="ตัวอย่างวิดีโอ YouTube"
                class="aspect-video w-full"
                allowfullscreen
              />
            </div>
            <p v-else-if="form.youtubeUrl" class="text-xs text-rose-600">
              กรุณาใส่ลิงก์ YouTube ที่ถูกต้อง
            </p>
          </div>
        </section>
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 class="text-lg font-bold text-slate-900">สถานที่และตำแหน่ง</h2>
          <p class="mt-1 text-sm text-slate-500">เลือกพื้นที่หรือค้นหาสถานที่บนแผนที่</p>
          <div class="mt-5 grid gap-5 sm:grid-cols-2">
            <AppSelect
              v-model="form.contentCategoryId"
              label="หมวดหมู่ *"
              :items="categories"
              item-title="categoryName"
              item-value="contentCategoryId"
              placeholder="เลือกหมวดหมู่"
            />
            <AppSelect
              v-model="form.districtId"
              label="อำเภอ"
              :items="districts"
              item-title="districtName"
              item-value="districtId"
              placeholder="ไม่ระบุอำเภอ"
              clearable
            />
            <AppSelect
              v-model="form.subDistrictId"
              label="ตำบล"
              :items="subDistricts"
              item-title="subDistrictName"
              item-value="subDistrictId"
              placeholder="ไม่ระบุตำบล"
              :disabled="!form.districtId"
              clearable
            />
          </div>
          <div class="mt-5">
            <LocationPickerMap
              v-model:latitude="form.latitude"
              v-model:longitude="form.longitude"
            />
          </div>
        </section>
      </div>
      <aside class="space-y-5 lg:sticky lg:top-24">
        <section
          class="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-relaxed text-emerald-900"
        >
          <div class="flex gap-3">
            <i class="mdi mdi-publish-outline text-xl" />
            <div>
              <h2 class="font-bold">เผยแพร่ทันที</h2>
              <p class="mt-1">
                เมื่อกดเผยแพร่ คอนเทนต์จะแสดงให้สาธารณะเห็นทันที และคุณกลับมาแก้ไขได้ภายหลัง
              </p>
            </div>
          </div>
        </section>
        <section class="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          <p class="font-bold text-slate-900">ข้อแนะนำ</p>
          <ul class="mt-3 space-y-2">
            <li>• ใช้ข้อมูลที่ถูกต้องและเป็นประโยชน์</li>
            <li>• หลีกเลี่ยงข้อมูลส่วนบุคคลหรือเนื้อหาละเมิดสิทธิ์</li>
            <li>• คุณกลับมาแก้ไขคอนเทนต์ได้ภายหลัง</li>
          </ul>
        </section>
      </aside>
    </form>
    <div v-else class="mt-7 h-1 animate-pulse rounded bg-emerald-600" />
  </main>
</template>
