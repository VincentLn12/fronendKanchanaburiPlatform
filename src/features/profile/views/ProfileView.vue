<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
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
const router = useRouter()
const swal = useSwal()

const loading = ref(true)
const saving = ref(false)
const history = ref<ContentViewHistory[]>([])
const myContents = ref<UserContent[]>([])
const favorites = ref<FavoriteContent[]>([])
const activeTab = ref<'published' | 'favorites' | 'history'>('published')
const profile = reactive({ firstName: '', lastName: '', email: '', role: '' })

function initials() {
  const f = profile.firstName?.slice(0, 1) || ''
  const l = profile.lastName?.slice(0, 1) || ''
  return `${f}${l}`.toUpperCase() || 'U'
}

function formatDate(value: string) {
  if (!value) return '-'
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
      getContentViewHistory().catch(() => []),
      getMyContents({ page: 1, pageSize: 100 }).catch(() => ({ items: [] })),
      getFavoriteContents().catch(() => []),
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
    await swal.success('บันทึกข้อมูลแล้ว', 'ข้อมูลส่วนตัวของคุณถูกอัปเดตเรียบร้อยแล้ว')
  } catch (error) {
    await swal.error('บันทึกโปรไฟล์ไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    saving.value = false
  }
}

async function handleLogout() {
  const result = await swal.confirm('ออกจากระบบหรือไม่?', 'คุณต้องการออกจากระบบบัญชีผู้ใช้นี้ใช่หรือไม่')
  if (result.isConfirmed) {
    auth.logout()
    await router.push('/')
  }
}

onMounted(load)
</script>

<template>
  <div class="min-h-screen bg-[#f8faf9] text-slate-800 pb-16">
    <!-- HERO HEADER BANNER SECTION -->
    <section class="relative bg-[#0d3831] text-white py-12 sm:py-16 overflow-hidden">
      <!-- Ambient Glow Decorative Elements -->
      <div class="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
      <div class="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-teal-500/15 blur-3xl" />

      <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-400/30">
              <i class="mdi mdi-account-circle-outline text-emerald-300"></i>
              <span>ศูนย์จัดการบัญชีผู้ใช้</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              โปรไฟล์ของฉัน
            </h1>
            <p class="text-xs sm:text-sm text-emerald-100/80 max-w-xl font-normal leading-relaxed">
              จัดการข้อมูลส่วนตัว ติดตามผลงานคอนเทนต์ที่ลง รายการโปรด และประวัติการรับชมเนื้อหา
            </p>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <RouterLink
              to="/create"
              class="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-[#1c4d3e] font-bold text-xs sm:text-sm shadow-lg transition"
            >
              <i class="mdi mdi-plus-circle-outline text-base"></i>
              <span>สร้างคอนเทนต์ใหม่</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- MAIN CONTAINER -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div class="h-96 animate-pulse rounded-3xl bg-white border border-slate-200" />
        <div class="h-96 animate-pulse rounded-3xl bg-white border border-slate-200" />
      </div>

      <div v-else class="grid items-start gap-8 lg:grid-cols-12">

        <!-- LEFT SIDEBAR: USER PROFILE CARD & INFO EDIT -->
        <div class="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <!-- Profile Card Box -->
          <div class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div class="flex flex-col items-center text-center space-y-3">
              <!-- Circle Avatar Initials Frame -->
              <div class="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#1c4d3e] to-[#0d3831] text-white text-3xl font-black shadow-xl border-4 border-white ring-4 ring-emerald-50">
                {{ initials() }}
                <div class="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-xs">
                  <i class="mdi mdi-check"></i>
                </div>
              </div>

              <div>
                <h2 class="text-xl font-bold text-slate-900">
                  {{ `${profile.firstName} ${profile.lastName}`.trim() || 'ผู้ใช้งาน' }}
                </h2>
                <p class="text-xs text-slate-500 mt-0.5">{{ profile.email }}</p>
              </div>

              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#1c4d3e] font-bold text-xs border border-emerald-100">
                <i class="mdi mdi-shield-check-outline text-emerald-600"></i>
                {{ profile.role === 'Admin' ? 'ผู้ดูแลระบบ (Admin)' : 'สมาชิกทั่วไป' }}
              </span>
            </div>

            <!-- Quick Stats Bar (3 Metrics) -->
            <div class="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
              <div class="p-1">
                <span class="block text-lg font-black text-slate-900">{{ myContents.length }}</span>
                <span class="text-[11px] text-slate-400">คอนเทนต์</span>
              </div>
              <div class="p-1 border-x border-slate-100">
                <span class="block text-lg font-black text-rose-600">{{ favorites.length }}</span>
                <span class="text-[11px] text-slate-400">รายการโปรด</span>
              </div>
              <div class="p-1">
                <span class="block text-lg font-black text-[#1c4d3e]">{{ history.length }}</span>
                <span class="text-[11px] text-slate-400">ประวัติการดู</span>
              </div>
            </div>

            <!-- Personal Info Edit Form -->
            <form class="space-y-4 pt-1" @submit.prevent="save">
              <h3 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <i class="mdi mdi-account-edit-outline text-[#1c4d3e]"></i>
                <span>แก้ไขข้อมูลส่วนตัว</span>
              </h3>

              <div class="space-y-3">
                <AppTextField v-model="profile.firstName" label="ชื่อ" placeholder="พิมพ์ชื่อของคุณ" />
                <AppTextField v-model="profile.lastName" label="นามสกุล" placeholder="พิมพ์นามสกุลของคุณ" />
                <AppTextField v-model="profile.email" label="อีเมล" type="email" disabled />
              </div>

              <button
                type="submit"
                class="w-full py-3 rounded-xl bg-[#1c4d3e] hover:bg-[#14392e] text-white font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50"
                :disabled="saving"
              >
                {{ saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลส่วนตัว' }}
              </button>
            </form>

            <!-- Quick Links -->
            <div class="pt-4 border-t border-slate-100 space-y-2">
              <RouterLink
                to="/orders"
                class="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
              >
                <span class="flex items-center gap-2">
                  <i class="mdi mdi-shopping-outline text-[#1c4d3e] text-base"></i>
                  ประวัติการสั่งซื้อของฉัน
                </span>
                <i class="mdi mdi-chevron-right text-slate-400"></i>
              </RouterLink>

              <RouterLink
                to="/my-shop"
                class="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
              >
                <span class="flex items-center gap-2">
                  <i class="mdi mdi-storefront-outline text-[#1c4d3e] text-base"></i>
                  ร้านค้าของฉัน
                </span>
                <i class="mdi mdi-chevron-right text-slate-400"></i>
              </RouterLink>

              <button
                type="button"
                class="w-full flex items-center justify-between p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-600 transition"
                @click="handleLogout"
              >
                <span class="flex items-center gap-2">
                  <i class="mdi mdi-logout text-base"></i>
                  ออกจากระบบ
                </span>
                <i class="mdi mdi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT CONTENT: TABS CONTAINER -->
        <div class="lg:col-span-8 space-y-6">
          <div class="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-6">
            <!-- Tabs Navigation Header -->
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 class="text-xl font-bold text-slate-900">กิจกรรมคอนเทนต์</h2>
                <p class="text-xs text-slate-500 mt-0.5">รวมผลงานที่คุณเคยสร้าง รายการที่ถูกใจ และประวัติการเข้าชม</p>
              </div>
            </div>

            <!-- Tab Buttons Strip -->
            <div class="flex items-center gap-2 border-b border-slate-200 overflow-x-auto scrollbar-none pb-0.5">
              <button
                type="button"
                class="py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition shrink-0 flex items-center gap-2"
                :class="activeTab === 'published' ? 'border-[#1c4d3e] text-[#1c4d3e]' : 'border-transparent text-slate-500 hover:text-slate-900'"
                @click="activeTab = 'published'"
              >
                <i class="mdi mdi-file-document-outline text-base"></i>
                <span>คอนเทนต์ที่เคยลง</span>
                <span class="px-2 py-0.5 rounded-full text-[11px]" :class="activeTab === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'">
                  {{ myContents.length }}
                </span>
              </button>

              <button
                type="button"
                class="py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition shrink-0 flex items-center gap-2"
                :class="activeTab === 'favorites' ? 'border-[#1c4d3e] text-[#1c4d3e]' : 'border-transparent text-slate-500 hover:text-slate-900'"
                @click="activeTab = 'favorites'"
              >
                <i class="mdi mdi-heart-outline text-base"></i>
                <span>รายการโปรด</span>
                <span class="px-2 py-0.5 rounded-full text-[11px]" :class="activeTab === 'favorites' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'">
                  {{ favorites.length }}
                </span>
              </button>

              <button
                type="button"
                class="py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition shrink-0 flex items-center gap-2"
                :class="activeTab === 'history' ? 'border-[#1c4d3e] text-[#1c4d3e]' : 'border-transparent text-slate-500 hover:text-slate-900'"
                @click="activeTab = 'history'"
              >
                <i class="mdi mdi-history text-base"></i>
                <span>ประวัติการดู</span>
                <span class="px-2 py-0.5 rounded-full text-[11px]" :class="activeTab === 'history' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'">
                  {{ history.length }}
                </span>
              </button>
            </div>

            <!-- TAB 1: คอนเทนต์ที่เคยลง (PUBLISHED CONTENTS) -->
            <div v-if="activeTab === 'published'">
              <div v-if="!myContents.length" class="py-14 text-center space-y-3">
                <div class="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mx-auto">
                  <i class="mdi mdi-file-document-plus-outline text-3xl"></i>
                </div>
                <h4 class="font-bold text-slate-800 text-base">ยังไม่มีคอนเทนต์ที่ลงไว้</h4>
                <p class="text-xs text-slate-500 max-w-sm mx-auto">เริ่มต้นบอกเล่าเรื่องราวดี ๆ วัฒนธรรม หรือสถานที่น่าสนใจในกาญจนบุรีได้ทันที</p>
                <RouterLink
                  to="/create"
                  class="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1c4d3e] hover:bg-[#14392e] text-white font-bold text-xs transition"
                >
                  <i class="mdi mdi-plus"></i>
                  <span>สร้างคอนเทนต์ใหม่</span>
                </RouterLink>
              </div>

              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <article
                  v-for="item in myContents"
                  :key="item.contentId"
                  class="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div class="relative aspect-16/10 bg-slate-900 overflow-hidden">
                      <img
                        v-if="youtubeThumbnail(item.youtubeUrl)"
                        :src="youtubeThumbnail(item.youtubeUrl)"
                        :alt="item.title"
                        class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1c4d3e] to-[#0d3831] text-white">
                        <i class="mdi mdi-file-document-outline text-4xl opacity-40"></i>
                      </div>
                      <span
                        class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-[11px] font-bold shadow-xs"
                        :class="statusClass(item.status)"
                      >
                        {{ statusLabel(item.status) }}
                      </span>
                    </div>

                    <div class="p-4 space-y-1.5">
                      <h4 class="font-bold text-slate-900 text-sm group-hover:text-[#1c4d3e] transition line-clamp-1">
                        {{ item.title }}
                      </h4>
                      <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {{ item.summary || 'คอนเทนต์จากกาญจนบุรี' }}
                      </p>
                    </div>
                  </div>

                  <div class="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span class="text-slate-400 text-[11px]">อัปเดต {{ formatDate(item.updatedAt) }}</span>
                    <RouterLink
                      :to="item.status === 'Published' ? `/contents/${item.contentId}` : `/my-contents/${item.contentId}/edit`"
                      class="font-bold text-[#1c4d3e] hover:underline"
                    >
                      {{ item.status === 'Published' ? 'ดูคอนเทนต์' : 'แก้ไข' }}
                    </RouterLink>
                  </div>
                </article>
              </div>
            </div>

            <!-- TAB 2: รายการโปรด (FAVORITES) -->
            <div v-else-if="activeTab === 'favorites'">
              <div v-if="!favorites.length" class="py-14 text-center space-y-3">
                <div class="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 mx-auto">
                  <i class="mdi mdi-heart-outline text-3xl"></i>
                </div>
                <h4 class="font-bold text-slate-800 text-base">ยังไม่มีคอนเทนต์ในรายการโปรด</h4>
                <p class="text-xs text-slate-500 max-w-sm mx-auto">เมื่อคุณกดหัวใจบันทึกคอนเทนต์ที่ชอบ จะมาปรากฏที่นี่</p>
                <RouterLink
                  to="/contents"
                  class="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1c4d3e] hover:bg-[#14392e] text-white font-bold text-xs transition"
                >
                  <i class="mdi mdi-compass-outline"></i>
                  <span>สำรวจคอนเทนต์</span>
                </RouterLink>
              </div>

              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RouterLink
                  v-for="item in favorites"
                  :key="item.contentId"
                  :to="`/contents/${item.contentId}`"
                  class="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div class="relative aspect-16/10 bg-slate-900 overflow-hidden">
                      <img
                        v-if="youtubeThumbnail(item.youtubeUrl)"
                        :src="youtubeThumbnail(item.youtubeUrl)"
                        :alt="item.title"
                        class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1c4d3e] to-[#0d3831] text-white">
                        <i class="mdi mdi-heart-outline text-4xl opacity-40"></i>
                      </div>
                      <span class="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/95 text-rose-500 shadow-xs flex items-center justify-center">
                        <i class="mdi mdi-heart"></i>
                      </span>
                    </div>

                    <div class="p-4 space-y-1.5">
                      <h4 class="font-bold text-slate-900 text-sm group-hover:text-[#1c4d3e] transition line-clamp-1">
                        {{ item.title }}
                      </h4>
                      <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {{ item.summary || 'คอนเทนต์วัฒนธรรมกาญจนบุรี' }}
                      </p>
                    </div>
                  </div>

                  <div class="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span class="text-[#1c4d3e] font-bold text-[11px]"><i class="mdi mdi-heart-outline mr-1"></i>บันทึกเมื่อ {{ formatDate(item.createdAt) }}</span>
                    <span class="font-bold text-[#1c4d3e]">เข้าดู</span>
                  </div>
                </RouterLink>
              </div>
            </div>

            <!-- TAB 3: ประวัติการดู (WATCH HISTORY) -->
            <div v-else-if="activeTab === 'history'">
              <div v-if="!history.length" class="py-14 text-center space-y-3">
                <div class="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mx-auto">
                  <i class="mdi mdi-history text-3xl"></i>
                </div>
                <h4 class="font-bold text-slate-800 text-base">ยังไม่มีประวัติการเข้าชม</h4>
                <p class="text-xs text-slate-500 max-w-sm mx-auto">คอนเทนต์ที่คุณเปิดเข้าดูจะถูกบันทึกไว้อัตโนมัติที่นี่</p>
                <RouterLink
                  to="/contents"
                  class="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1c4d3e] hover:bg-[#14392e] text-white font-bold text-xs transition"
                >
                  <i class="mdi mdi-compass-outline"></i>
                  <span>สำรวจคอนเทนต์</span>
                </RouterLink>
              </div>

              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RouterLink
                  v-for="item in history"
                  :key="item.contentId"
                  :to="`/contents/${item.contentId}`"
                  class="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div class="relative aspect-16/10 bg-slate-900 overflow-hidden">
                      <img
                        v-if="youtubeThumbnail(item.youtubeUrl)"
                        :src="youtubeThumbnail(item.youtubeUrl)"
                        :alt="item.title"
                        class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1c4d3e] to-[#0d3831] text-white">
                        <i class="mdi mdi-eye-outline text-4xl opacity-40"></i>
                      </div>
                    </div>

                    <div class="p-4 space-y-1.5">
                      <h4 class="font-bold text-slate-900 text-sm group-hover:text-[#1c4d3e] transition line-clamp-1">
                        {{ item.title }}
                      </h4>
                      <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {{ item.summary || 'คอนเทนต์จากกาญจนบุรี' }}
                      </p>
                    </div>
                  </div>

                  <div class="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span class="text-slate-400 text-[11px]"><i class="mdi mdi-clock-outline mr-1"></i>ดูเมื่อ {{ formatDate(item.viewedAt) }}</span>
                    <span class="font-bold text-[#1c4d3e]">เข้าดูอีกครั้ง</span>
                  </div>
                </RouterLink>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
