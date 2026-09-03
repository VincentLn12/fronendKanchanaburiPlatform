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
import { archiveMyContent, getMyContents, type UserContent } from '@/features/contents/user/api/userContentApi'

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
    ? 'bg-emerald-600 text-white shadow-xs'
    : status === 'Pending'
      ? 'bg-amber-500 text-white shadow-xs'
      : 'bg-[#E8D9C9] text-[#786B62]'
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
  if (!profile.firstName.trim() || !profile.lastName.trim()) {
    await swal.warning('กรอกข้อมูลไม่ครบ', 'กรุณาระบุชื่อและนามสกุล')
    return
  }
  saving.value = true
  try {
    const updated = await updateProfile(profile)
    Object.assign(profile, updated)
    if (auth.user) {
      auth.user = { ...auth.user, name: updated.name }
      localStorage.setItem('authUser', JSON.stringify(auth.user))
    }
    await swal.success('บันทึกข้อมูลส่วนตัวสำเร็จ', 'ข้อมูลส่วนตัวของคุณได้รับการอัปเดตเรียบร้อยแล้ว')
  } catch (error) {
    await swal.error('บันทึกโปรไฟล์ไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    saving.value = false
  }
}

async function deleteContent(item: UserContent) {
  const result = await swal.confirm(`ลบคอนเทนต์ "${item.title}"?`, 'เรื่องราวนี้จะไม่แสดงต่อสาธารณะบนแพลตฟอร์มอีกต่อไป')
  if (!result.isConfirmed) return
  try {
    await archiveMyContent(item.contentId)
    myContents.value = myContents.value.filter((c) => c.contentId !== item.contentId)
    await swal.success('ลบคอนเทนต์เรียบร้อยแล้ว')
  } catch (error) {
    await swal.error('ลบไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
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
  <div class="min-h-screen bg-[#F7F0E6] text-[#332820] pb-16 font-sans">
    <!-- HERO HEADER BANNER SECTION -->
    <section class="relative bg-[#171412] text-white py-12 sm:py-16 overflow-hidden">
      <!-- Ambient Glow Decorative Elements -->
      <div class="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#D96C2C]/20 blur-3xl" />
      <div class="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-[#F2A65A]/15 blur-3xl" />

      <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D96C2C]/30 text-[#F2A65A] text-xs font-black border border-white/20">
              <i class="mdi mdi-account-circle-outline text-[#F2A65A]"></i>
              <span>ศูนย์จัดการบัญชีผู้ใช้</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight">
              โปรไฟล์และผลงานของฉัน
            </h1>
            <p class="text-xs sm:text-sm text-[#F7F0E6]/80 max-w-xl font-semibold leading-relaxed">
              จัดการข้อมูลส่วนตัว แก้ไขบทความที่ลงไว้ ติดตามรายการโปรด และประวัติการรับชม
            </p>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <RouterLink
              to="/create"
              class="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-black text-xs sm:text-sm shadow-lg transition border border-[#D96C2C] active:scale-95"
            >
              <i class="mdi mdi-plus-circle-outline text-lg text-white"></i>
              <span class="!text-white font-black">+ เขียนเรื่องราวใหม่</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- MAIN CONTAINER -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div class="h-96 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]" />
        <div class="h-96 animate-pulse rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9]" />
      </div>

      <div v-else class="grid items-start gap-8 lg:grid-cols-12">

        <!-- LEFT SIDEBAR: USER PROFILE CARD & INFO EDIT -->
        <div class="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <!-- Profile Card Box -->
          <div class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 shadow-xs space-y-6">
            <div class="flex flex-col items-center text-center space-y-3">
              <!-- Circle Avatar Initials Frame -->
              <div class="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#D96C2C] via-[#BF5720] to-[#171412] text-white text-3xl font-black shadow-xl border-4 border-white ring-4 ring-[#D96C2C]/30">
                {{ initials() }}
                <div class="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-[#D96C2C] border-2 border-white flex items-center justify-center text-white text-xs">
                  <i class="mdi mdi-check"></i>
                </div>
              </div>

              <div>
                <h2 class="text-xl font-black text-[#332820]">
                  {{ `${profile.firstName} ${profile.lastName}`.trim() || 'ผู้ใช้งาน' }}
                </h2>
                <p class="text-xs text-[#786B62] mt-0.5 font-semibold">{{ profile.email }}</p>
              </div>

              <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D96C2C]/10 text-[#D96C2C] font-black text-xs border border-[#D96C2C]/20">
                <i class="mdi mdi-shield-check-outline text-[#D96C2C]"></i>
                {{ profile.role === 'Admin' ? 'ผู้ดูแลระบบ (Admin)' : 'สมาชิกทั่วไป' }}
              </span>
            </div>

            <!-- Quick Stats Bar (3 Metrics) -->
            <div class="grid grid-cols-3 gap-2 py-3 border-y-2 border-[#E8D9C9] text-center font-extrabold">
              <div class="p-1">
                <span class="block text-lg font-black text-[#332820]">{{ myContents.length }}</span>
                <span class="text-[11px] text-[#786B62]">คอนเทนต์</span>
              </div>
              <div class="p-1 border-x-2 border-[#E8D9C9]">
                <span class="block text-lg font-black text-rose-600">{{ favorites.length }}</span>
                <span class="text-[11px] text-[#786B62]">รายการโปรด</span>
              </div>
              <div class="p-1">
                <span class="block text-lg font-black text-[#D96C2C]">{{ history.length }}</span>
                <span class="text-[11px] text-[#786B62]">ประวัติการดู</span>
              </div>
            </div>

            <!-- Personal Info Edit Form -->
            <form class="space-y-4 pt-1" @submit.prevent="save">
              <h3 class="text-base font-black text-[#332820] flex items-center gap-2 border-b-2 border-[#E8D9C9] pb-2">
                <i class="mdi mdi-account-edit-outline text-[#D96C2C] text-lg"></i>
                <span>แก้ไขข้อมูลส่วนตัว</span>
              </h3>

              <div class="space-y-3">
                <AppTextField v-model="profile.firstName" label="ชื่อ *" placeholder="พิมพ์ชื่อของคุณ" />
                <AppTextField v-model="profile.lastName" label="นามสกุล *" placeholder="พิมพ์นามสกุลของคุณ" />
                <AppTextField v-model="profile.email" label="อีเมลบัญชีผู้ใช้" type="email" disabled />
              </div>

              <button
                type="submit"
                class="w-full py-3 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-black text-xs sm:text-sm shadow-md transition disabled:opacity-50 border border-[#D96C2C] cursor-pointer active:scale-95"
                :disabled="saving"
              >
                <i class="mdi text-base text-white mr-1" :class="saving ? 'mdi-loading animate-spin' : 'mdi-content-save-outline'"></i>
                <span class="!text-white font-black">{{ saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลส่วนตัว' }}</span>
              </button>
            </form>

            <!-- Quick Links -->
            <div class="pt-4 border-t-2 border-[#E8D9C9] space-y-2">
              <RouterLink
                to="/orders"
                class="flex items-center justify-between p-3 rounded-2xl bg-[#F7F0E6] hover:bg-[#E8D9C9]/50 text-xs font-black text-[#332820] transition border-2 border-[#E8D9C9]"
              >
                <span class="flex items-center gap-2">
                  <i class="mdi mdi-shopping-outline text-[#D96C2C] text-base"></i>
                  ประวัติการสั่งซื้อของฉัน
                </span>
                <i class="mdi mdi-chevron-right text-[#786B62]"></i>
              </RouterLink>

              <RouterLink
                to="/my-shop"
                class="flex items-center justify-between p-3 rounded-2xl bg-[#F7F0E6] hover:bg-[#E8D9C9]/50 text-xs font-black text-[#332820] transition border-2 border-[#E8D9C9]"
              >
                <span class="flex items-center gap-2">
                  <i class="mdi mdi-storefront-outline text-[#D96C2C] text-base"></i>
                  ศูนย์จัดการร้านค้าของฉัน
                </span>
                <i class="mdi mdi-chevron-right text-[#786B62]"></i>
              </RouterLink>

              <button
                type="button"
                class="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-xs font-black text-rose-600 transition border-2 border-rose-200 cursor-pointer"
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
          <div class="rounded-3xl bg-[#FFF9F2] border-2 border-[#E8D9C9] p-6 shadow-xs space-y-6">
            <!-- Tabs Navigation Header -->
            <div class="flex items-center justify-between border-b-2 border-[#E8D9C9] pb-4">
              <div>
                <h2 class="text-2xl font-black text-[#332820]">กิจกรรมและคอนเทนต์ของคุณ</h2>
                <p class="text-xs text-[#786B62] font-semibold mt-0.5">รวมเรื่องราวที่คุณลง สามารถกดแก้ไขเรื่องราว ดูบทความ หรือจัดการรายการโปรดได้ทันที</p>
              </div>
            </div>

            <!-- Tab Buttons Strip -->
            <div class="flex items-center gap-2 border-b-2 border-[#E8D9C9] overflow-x-auto scrollbar-none pb-0.5">
              <button
                type="button"
                class="py-3 px-4 text-xs sm:text-sm font-black border-b-4 transition shrink-0 flex items-center gap-2 cursor-pointer"
                :class="activeTab === 'published' ? 'border-[#D96C2C] text-[#D96C2C]' : 'border-transparent text-[#786B62] hover:text-[#332820]'"
                @click="activeTab = 'published'"
              >
                <i class="mdi mdi-file-document-outline text-base"></i>
                <span>คอนเทนต์ที่ลงไว้</span>
                <span class="px-2 py-0.5 rounded-full text-[11px]" :class="activeTab === 'published' ? 'bg-[#D96C2C] text-white font-black' : 'bg-[#F7F0E6] text-[#786B62]'">
                  {{ myContents.length }}
                </span>
              </button>

              <button
                type="button"
                class="py-3 px-4 text-xs sm:text-sm font-black border-b-4 transition shrink-0 flex items-center gap-2 cursor-pointer"
                :class="activeTab === 'favorites' ? 'border-[#D96C2C] text-[#D96C2C]' : 'border-transparent text-[#786B62] hover:text-[#332820]'"
                @click="activeTab = 'favorites'"
              >
                <i class="mdi mdi-heart-outline text-base"></i>
                <span>รายการโปรด</span>
                <span class="px-2 py-0.5 rounded-full text-[11px]" :class="activeTab === 'favorites' ? 'bg-[#D96C2C] text-white font-black' : 'bg-[#F7F0E6] text-[#786B62]'">
                  {{ favorites.length }}
                </span>
              </button>

              <button
                type="button"
                class="py-3 px-4 text-xs sm:text-sm font-black border-b-4 transition shrink-0 flex items-center gap-2 cursor-pointer"
                :class="activeTab === 'history' ? 'border-[#D96C2C] text-[#D96C2C]' : 'border-transparent text-[#786B62] hover:text-[#332820]'"
                @click="activeTab = 'history'"
              >
                <i class="mdi mdi-history text-base"></i>
                <span>ประวัติการดู</span>
                <span class="px-2 py-0.5 rounded-full text-[11px]" :class="activeTab === 'history' ? 'bg-[#D96C2C] text-white font-black' : 'bg-[#F7F0E6] text-[#786B62]'">
                  {{ history.length }}
                </span>
              </button>
            </div>

            <!-- TAB 1: คอนเทนต์ที่เคยลง (MY CONTENTS WITH EDIT ACTION) -->
            <div v-if="activeTab === 'published'">
              <div v-if="!myContents.length" class="py-14 text-center space-y-3">
                <div class="flex h-16 w-16 items-center justify-center rounded-full bg-[#D96C2C]/15 text-[#D96C2C] mx-auto border border-[#D96C2C]/30">
                  <i class="mdi mdi-file-document-plus-outline text-3xl"></i>
                </div>
                <h4 class="font-black text-[#332820] text-base">ยังไม่มีคอนเทนต์ที่ลงไว้</h4>
                <p class="text-xs text-[#786B62] max-w-sm mx-auto font-semibold">เริ่มต้นบอกเล่าเรื่องราวดี ๆ วัฒนธรรม หรือสถานที่น่าสนใจในกาญจนบุรีได้ทันที</p>
                <RouterLink
                  to="/create"
                  class="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-black text-xs transition border border-[#D96C2C]"
                >
                  <i class="mdi mdi-plus text-white text-base"></i>
                  <span class="text-white font-black">เขียนเรื่องราวใหม่</span>
                </RouterLink>
              </div>

              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <article
                  v-for="item in myContents"
                  :key="item.contentId"
                  class="group bg-white rounded-3xl overflow-hidden border-2 border-[#E8D9C9] shadow-2xs hover:shadow-xl hover:border-[#D96C2C] hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div class="relative aspect-16/10 bg-[#171412] overflow-hidden">
                      <img
                        v-if="youtubeThumbnail(item.youtubeUrl)"
                        :src="youtubeThumbnail(item.youtubeUrl)"
                        :alt="item.title"
                        class="w-full h-full object-cover group-hover:scale-108 transition duration-500"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#D96C2C] to-[#171412] text-white">
                        <i class="mdi mdi-file-document-outline text-5xl opacity-40"></i>
                      </div>
                      <span
                        class="absolute top-2.5 right-2.5 px-3 py-0.5 rounded-full text-[10px] font-black border"
                        :class="statusClass(item.status)"
                      >
                        {{ statusLabel(item.status) }}
                      </span>
                    </div>

                    <div class="p-5 space-y-2">
                      <h4 class="font-black text-[#332820] text-base group-hover:text-[#D96C2C] transition line-clamp-1 leading-snug">
                        {{ item.title }}
                      </h4>
                      <p class="text-xs text-[#786B62] line-clamp-2 leading-relaxed font-semibold">
                        {{ item.summary || 'เรื่องราวจากกาญจนบุรี' }}
                      </p>
                    </div>
                  </div>

                  <!-- ACTION BUTTONS BAR FOR THE AUTHOR -->
                  <div class="px-5 pb-4 pt-3 border-t-2 border-[#E8D9C9] flex items-center justify-between text-xs font-bold">
                    <RouterLink
                      :to="`/contents/${item.contentId}`"
                      target="_blank"
                      class="inline-flex items-center gap-1 font-bold text-[#786B62] hover:text-[#D96C2C]"
                      title="ดูหน้าบทความสาธารณะ"
                    >
                      <i class="mdi mdi-eye-outline text-sm text-[#D96C2C]"></i>
                      <span>ดูบทความ</span>
                    </RouterLink>

                    <div class="flex items-center gap-2">
                      <!-- EDIT BUTTON FOR THE AUTHOR -->
                      <RouterLink
                        :to="item.shopId ? `/my-shop/contents/${item.contentId}/edit` : `/my-contents/${item.contentId}/edit`"
                        class="inline-flex items-center gap-1 rounded-xl border border-[#D96C2C]/30 bg-[#D96C2C]/10 px-3 py-1.5 font-black text-[#D96C2C] hover:bg-[#D96C2C] hover:text-white transition shadow-2xs"
                      >
                        <i class="mdi mdi-pencil-outline text-xs"></i>
                        <span>แก้ไข</span>
                      </RouterLink>

                      <!-- DELETE BUTTON FOR THE AUTHOR -->
                      <button
                        type="button"
                        class="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 font-black text-rose-600 hover:bg-rose-600 hover:text-white transition shadow-2xs cursor-pointer"
                        @click="deleteContent(item)"
                      >
                        <i class="mdi mdi-trash-can-outline text-xs"></i>
                        <span>ลบ</span>
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <!-- TAB 2: รายการโปรด (FAVORITES) -->
            <div v-else-if="activeTab === 'favorites'">
              <div v-if="!favorites.length" class="py-14 text-center space-y-3">
                <div class="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 mx-auto border border-rose-200">
                  <i class="mdi mdi-heart-outline text-3xl"></i>
                </div>
                <h4 class="font-black text-[#332820] text-base">ยังไม่มีคอนเทนต์ในรายการโปรด</h4>
                <p class="text-xs text-[#786B62] max-w-sm mx-auto font-semibold">เมื่อคุณกดหัวใจบันทึกคอนเทนต์ที่ชอบ จะมาปรากฏที่นี่</p>
                <RouterLink
                  to="/contents"
                  class="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-black text-xs transition border border-[#D96C2C]"
                >
                  <i class="mdi mdi-compass-outline text-white text-base"></i>
                  <span class="text-white font-black">สำรวจคอนเทนต์</span>
                </RouterLink>
              </div>

              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <RouterLink
                  v-for="item in favorites"
                  :key="item.contentId"
                  :to="`/contents/${item.contentId}`"
                  class="group bg-white rounded-3xl overflow-hidden border-2 border-[#E8D9C9] shadow-2xs hover:shadow-xl hover:border-[#D96C2C] hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div class="relative aspect-16/10 bg-[#171412] overflow-hidden">
                      <img
                        v-if="youtubeThumbnail(item.youtubeUrl)"
                        :src="youtubeThumbnail(item.youtubeUrl)"
                        :alt="item.title"
                        class="w-full h-full object-cover group-hover:scale-108 transition duration-500"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#D96C2C] to-[#171412] text-white">
                        <i class="mdi mdi-heart-outline text-5xl opacity-40"></i>
                      </div>
                      <span class="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/95 text-rose-500 shadow-xs flex items-center justify-center">
                        <i class="mdi mdi-heart"></i>
                      </span>
                    </div>

                    <div class="p-5 space-y-2">
                      <h4 class="font-black text-[#332820] text-base group-hover:text-[#D96C2C] transition line-clamp-1 leading-snug">
                        {{ item.title }}
                      </h4>
                      <p class="text-xs text-[#786B62] line-clamp-2 leading-relaxed font-semibold">
                        {{ item.summary || 'คอนเทนต์วัฒนธรรมกาญจนบุรี' }}
                      </p>
                    </div>
                  </div>

                  <div class="px-5 pb-4 pt-3 border-t-2 border-[#E8D9C9] flex items-center justify-between text-xs font-bold">
                    <span class="text-[#D96C2C] font-black text-[11px]"><i class="mdi mdi-heart-outline mr-1"></i>บันทึกแล้ว</span>
                    <span class="font-black text-[#D96C2C]">เข้าดูเรื่องราว</span>
                  </div>
                </RouterLink>
              </div>
            </div>

            <!-- TAB 3: ประวัติการดู (WATCH HISTORY) -->
            <div v-else-if="activeTab === 'history'">
              <div v-if="!history.length" class="py-14 text-center space-y-3">
                <div class="flex h-16 w-16 items-center justify-center rounded-full bg-[#F7F0E6] text-[#786B62] mx-auto border border-[#E8D9C9]">
                  <i class="mdi mdi-history text-3xl"></i>
                </div>
                <h4 class="font-black text-[#332820] text-base">ยังไม่มีประวัติการเข้าชม</h4>
                <p class="text-xs text-[#786B62] max-w-sm mx-auto font-semibold">คอนเทนต์ที่คุณเปิดเข้าดูจะถูกบันทึกไว้อัตโนมัติที่นี่</p>
                <RouterLink
                  to="/contents"
                  class="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-black text-xs transition border border-[#D96C2C]"
                >
                  <i class="mdi mdi-compass-outline text-white text-base"></i>
                  <span class="text-white font-black">สำรวจคอนเทนต์</span>
                </RouterLink>
              </div>

              <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <RouterLink
                  v-for="item in history"
                  :key="item.contentId"
                  :to="`/contents/${item.contentId}`"
                  class="group bg-white rounded-3xl overflow-hidden border-2 border-[#E8D9C9] shadow-2xs hover:shadow-xl hover:border-[#D96C2C] hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div class="relative aspect-16/10 bg-[#171412] overflow-hidden">
                      <img
                        v-if="youtubeThumbnail(item.youtubeUrl)"
                        :src="youtubeThumbnail(item.youtubeUrl)"
                        :alt="item.title"
                        class="w-full h-full object-cover group-hover:scale-108 transition duration-500"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#D96C2C] to-[#171412] text-white">
                        <i class="mdi mdi-eye-outline text-5xl opacity-40"></i>
                      </div>
                    </div>

                    <div class="p-5 space-y-2">
                      <h4 class="font-black text-[#332820] text-base group-hover:text-[#D96C2C] transition line-clamp-1 leading-snug">
                        {{ item.title }}
                      </h4>
                      <p class="text-xs text-[#786B62] line-clamp-2 leading-relaxed font-semibold">
                        {{ item.summary || 'คอนเทนต์จากกาญจนบุรี' }}
                      </p>
                    </div>
                  </div>

                  <div class="px-5 pb-4 pt-3 border-t-2 border-[#E8D9C9] flex items-center justify-between text-xs font-bold">
                    <span class="text-[#786B62] text-[11px]"><i class="mdi mdi-clock-outline mr-1"></i>ดูเมื่อ {{ formatDate(item.viewedAt) }}</span>
                    <span class="font-black text-[#D96C2C]">เข้าดูอีกครั้ง</span>
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
