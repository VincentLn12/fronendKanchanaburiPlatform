<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  getContentViewHistory,
  getFavoriteContents,
  getProfile,
  updateProfile,
  type ContentViewHistory,
  type FavoriteContent,
} from '../api/profileApi'
import AppTextField from '@/components/common/input/AppTextField.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'
import { useAuthStore } from '@/features/auth/stores/auth'
import { getMyContents, type UserContent } from '@/features/contents/user/api/userContentApi'

const auth = useAuthStore()
const swal = useSwal()
const loading = ref(true)
const saving = ref(false)
const history = ref<ContentViewHistory[]>([])
const myContents = ref<UserContent[]>([])
const favorites = ref<FavoriteContent[]>([])
const activeTab = ref<'published' | 'favorites' | 'history'>('published')
const profile = reactive({ firstName: '', lastName: '', email: '', role: '' })

function initials() {
  return `${profile.firstName.slice(0, 1)}${profile.lastName.slice(0, 1)}`.toUpperCase() || 'U'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )
}

function statusLabel(status: UserContent['status']) {
  return status === 'Published' ? 'เผยแพร่แล้ว' : status === 'Pending' ? 'รอตรวจสอบ' : 'เก็บถาวร'
}

function statusClass(status: UserContent['status']) {
  return status === 'Published'
    ? 'bg-emerald-100 text-emerald-800'
    : status === 'Pending'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-slate-200 text-slate-700'
}

function youtubeThumbnail(url?: string | null) {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    const id = parsed.hostname.includes('youtu.be')
      ? parsed.pathname.slice(1)
      : (parsed.searchParams.get('v') ?? '')
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''
  } catch {
    return ''
  }
}

async function load() {
  loading.value = true
  try {
    const [data, views, submitted, saved] = await Promise.all([
      getProfile(),
      getContentViewHistory(),
      getMyContents({ page: 1, pageSize: 100 }),
      getFavoriteContents(),
    ])
    Object.assign(profile, data)
    history.value = views
    myContents.value = submitted.items
    favorites.value = saved
  } catch (error) {
    await swal.error('โหลดโปรไฟล์ไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    const updated = await updateProfile(profile)
    Object.assign(profile, updated)
    if (auth.user) {
      auth.user = { ...auth.user, name: updated.name }
      localStorage.setItem('authUser', JSON.stringify(auth.user))
    }
    await swal.success('บันทึกโปรไฟล์แล้ว')
  } catch (error) {
    await swal.error('บันทึกโปรไฟล์ไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <main
    class="min-h-screen bg-[radial-gradient(circle_at_top_right,_#d1fae5_0,_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#f0fdf4_100%)] py-6 sm:py-10"
  >
    <div class="mx-auto max-w-[1440px] px-4 sm:px-6 xl:px-10">
      <section
        class="relative mb-7 overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 px-6 py-8 text-white shadow-2xl shadow-emerald-950/15 sm:px-9 sm:py-10"
      >
        <div class="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div class="absolute bottom-0 left-1/3 h-40 w-96 rounded-full bg-cyan-300/10 blur-3xl" />
        <div class="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <p class="text-sm font-bold tracking-wide text-emerald-200">
              <i class="mdi mdi-account-circle-outline mr-1" />ACCOUNT CENTER
            </p>
            <h1 class="mt-3 text-3xl font-black tracking-tight sm:text-4xl">โปรไฟล์ของฉัน</h1>
            <p class="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50/80 sm:text-base">
              จัดการข้อมูลบัญชี ติดตามผลงานที่เคยลง และกลับไปดูคอนเทนต์ที่คุณสนใจได้ง่าย ๆ
            </p>
          </div>
          <RouterLink
            to="/create"
            class="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-emerald-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50"
            ><i class="mdi mdi-plus-circle-outline text-lg" />สร้างคอนเทนต์</RouterLink
          >
        </div>
      </section>
      <div v-if="loading" class="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div class="h-72 animate-pulse rounded-3xl bg-slate-200" />
        <div class="h-96 animate-pulse rounded-3xl bg-slate-200" />
      </div>
      <div v-else class="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section
          class="overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-900/5 backdrop-blur xl:sticky xl:top-24"
        >
          <div
            class="flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 text-3xl font-black text-white shadow-lg shadow-emerald-700/30 ring-4 ring-emerald-50"
          >
            {{ initials() }}
          </div>
          <h2 class="mt-5 text-2xl font-black tracking-tight text-slate-900">
            {{ `${profile.firstName} ${profile.lastName}`.trim() || 'ผู้ใช้งาน' }}
          </h2>
          <p class="mt-1 text-sm text-slate-500">{{ profile.email }}</p>
          <span
            class="mt-4 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
            ><i class="mdi mdi-shield-check-outline" />{{
              profile.role === 'Admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก'
            }}</span
          >
          <form class="mt-7 space-y-4 border-t border-slate-100 pt-6" @submit.prevent="save">
            <div class="flex items-center gap-2">
              <span
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600"
                ><i class="mdi mdi-account-edit-outline"
              /></span>
              <p class="text-sm font-black text-slate-800">ข้อมูลส่วนตัว</p>
            </div>
            <AppTextField v-model="profile.firstName" label="ชื่อ" placeholder="ชื่อ" />
            <AppTextField v-model="profile.lastName" label="นามสกุล" placeholder="นามสกุล" />
            <AppTextField v-model="profile.email" label="อีเมล" type="email" disabled />
            <button
              type="submit"
              class="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-3 font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:shadow-emerald-700/30 disabled:opacity-50"
              :disabled="saving"
            >
              {{ saving ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์' }}
            </button>
          </form>
        </section>
        <section
          class="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-7"
        >
          <div class="border-b border-slate-100 pb-1">
            <div class="flex items-center gap-3">
              <span
                class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700"
                ><i class="mdi mdi-file-document-multiple-outline text-2xl"
              /></span>
              <div>
                <h2 class="text-2xl font-black tracking-tight text-slate-900">กิจกรรมคอนเทนต์</h2>
                <p class="mt-0.5 text-sm text-slate-500">ผลงานที่คุณเผยแพร่และรายการที่เคยเปิดดู</p>
              </div>
            </div>
            <div class="mt-6 inline-flex w-full gap-1 rounded-2xl bg-slate-100 p-1.5 sm:w-auto">
              <button
                type="button"
                class="flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition sm:flex-none"
                :class="
                  activeTab === 'published'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                "
                @click="activeTab = 'published'"
              >
                <i class="mdi mdi-upload-outline mr-1" />คอนเทนต์ที่เคยลง
                <span
                  class="ml-1 rounded-full px-2 py-0.5 text-xs"
                  :class="
                    activeTab === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200'
                  "
                  >{{ myContents.length }}</span
                >
              </button>
              <button
                type="button"
                class="flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition sm:flex-none"
                :class="activeTab === 'favorites' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
                @click="activeTab = 'favorites'"
              >
                <i class="mdi mdi-heart-outline mr-1" />รายการโปรด
                <span class="ml-1 rounded-full px-2 py-0.5 text-xs" :class="activeTab === 'favorites' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200'">{{ favorites.length }}</span>
              </button>
              <button
                type="button"
                class="flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition sm:flex-none"
                :class="
                  activeTab === 'history'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                "
                @click="activeTab = 'history'"
              >
                <i class="mdi mdi-history mr-1" />ประวัติการดู
                <span
                  class="ml-1 rounded-full px-2 py-0.5 text-xs"
                  :class="
                    activeTab === 'history' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200'
                  "
                  >{{ history.length }}</span
                >
              </button>
            </div>
          </div>

          <div v-if="activeTab === 'published' && !myContents.length" class="py-16 text-center">
            <i class="mdi mdi-file-document-plus-outline text-5xl text-slate-300" />
            <p class="mt-3 text-slate-500">คุณยังไม่ได้เผยแพร่คอนเทนต์</p>
            <RouterLink
              to="/create"
              class="mt-5 inline-flex font-bold text-emerald-700 hover:text-emerald-800"
              >สร้างคอนเทนต์ <i class="mdi mdi-arrow-right ml-1"
            /></RouterLink>
          </div>
          <div v-else-if="activeTab === 'published'" class="mt-6 grid gap-5 sm:grid-cols-2">
            <article
              v-for="item in myContents"
              :key="item.contentId"
              class="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/10"
            >
              <div
                class="relative h-36 overflow-hidden bg-gradient-to-br from-emerald-800 to-teal-950"
              >
                <img
                  v-if="youtubeThumbnail(item.youtubeUrl)"
                  :src="youtubeThumbnail(item.youtubeUrl)"
                  :alt="item.title"
                  class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent" />
              </div>
              <div class="p-4">
                <div class="flex items-start justify-between gap-3">
                  <h3 class="line-clamp-1 font-bold text-slate-900">{{ item.title }}</h3>
                  <span
                    class="shrink-0 rounded-full px-2 py-1 text-xs font-bold"
                    :class="statusClass(item.status)"
                    >{{ statusLabel(item.status) }}</span
                  >
                </div>
                <p class="mt-1 line-clamp-2 text-sm text-slate-500">
                  {{ item.summary || 'คอนเทนต์จากกาญจนบุรี' }}
                </p>
                <div class="mt-3 flex items-center justify-between">
                  <span class="text-xs text-slate-500">อัปเดต {{ formatDate(item.updatedAt) }}</span
                  ><RouterLink
                    :to="
                      item.status === 'Published'
                        ? `/contents/${item.contentId}`
                        : `/my-contents/${item.contentId}/edit`
                    "
                    class="text-sm font-bold text-emerald-700 hover:text-emerald-800"
                    >{{ item.status === 'Published' ? 'ดูคอนเทนต์' : 'แก้ไข' }}</RouterLink
                  >
                </div>
              </div>
            </article>
          </div>

          <div v-else-if="activeTab === 'favorites' && !favorites.length" class="py-16 text-center">
            <i class="mdi mdi-heart-outline text-5xl text-slate-300" />
            <p class="mt-3 text-slate-500">ยังไม่มีคอนเทนต์ในรายการโปรด</p>
            <RouterLink to="/contents" class="mt-5 inline-flex font-bold text-emerald-700 hover:text-emerald-800">ไปสำรวจคอนเทนต์ <i class="mdi mdi-arrow-right ml-1" /></RouterLink>
          </div>
          <div v-else-if="activeTab === 'favorites'" class="mt-6 grid gap-5 sm:grid-cols-2">
            <RouterLink v-for="item in favorites" :key="item.contentId" :to="`/contents/${item.contentId}`" class="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/10">
              <div class="relative h-36 overflow-hidden bg-gradient-to-br from-emerald-800 to-teal-950"><img v-if="youtubeThumbnail(item.youtubeUrl)" :src="youtubeThumbnail(item.youtubeUrl)" :alt="item.title" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div class="absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent" /><span class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-rose-500 shadow"><i class="mdi mdi-heart" /></span></div>
              <div class="p-4"><h3 class="line-clamp-1 font-bold text-slate-900">{{ item.title }}</h3><p class="mt-1 line-clamp-2 text-sm text-slate-500">{{ item.summary || 'คอนเทนต์จากกาญจนบุรี' }}</p><p class="mt-3 text-xs font-semibold text-emerald-700"><i class="mdi mdi-heart-outline mr-1" />บันทึกเมื่อ {{ formatDate(item.createdAt) }}</p></div>
            </RouterLink>
          </div>
          <div v-else-if="!history.length" class="py-16 text-center">
            <i class="mdi mdi-book-open-page-variant-outline text-5xl text-slate-300" />
            <p class="mt-3 text-slate-500">ยังไม่มีประวัติการดูคอนเทนต์</p>
            <RouterLink
              to="/contents"
              class="mt-5 inline-flex font-bold text-emerald-700 hover:text-emerald-800"
              >ไปสำรวจคอนเทนต์ <i class="mdi mdi-arrow-right ml-1"
            /></RouterLink>
          </div>
          <div v-else class="mt-6 grid gap-5 sm:grid-cols-2">
            <RouterLink
              v-for="item in history"
              :key="item.contentId"
              :to="`/contents/${item.contentId}`"
              class="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/10"
            >
              <div
                class="relative h-36 overflow-hidden bg-gradient-to-br from-emerald-800 to-teal-950"
              >
                <img
                  v-if="youtubeThumbnail(item.youtubeUrl)"
                  :src="youtubeThumbnail(item.youtubeUrl)"
                  :alt="item.title"
                  class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent" />
              </div>
              <div class="p-4">
                <h3 class="line-clamp-1 font-bold text-slate-900">{{ item.title }}</h3>
                <p class="mt-1 line-clamp-2 text-sm text-slate-500">
                  {{ item.summary || 'คอนเทนต์จากกาญจนบุรี' }}
                </p>
                <p class="mt-3 text-xs font-semibold text-emerald-700">
                  <i class="mdi mdi-clock-outline mr-1" />ดูเมื่อ {{ formatDate(item.viewedAt) }}
                </p>
              </div>
            </RouterLink>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
