<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { archiveMyContent, getMyContents, type UserContent } from '../api/userContentApi'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const contents = ref<UserContent[]>([])
const loading = ref(true)
const swal = useSwal()

function statusLabel(status: UserContent['status']) {
  return status === 'Pending' ? 'รอตรวจสอบ' : status === 'Published' ? 'เผยแพร่แล้ว' : 'เก็บถาวร'
}

function statusClass(status: UserContent['status']) {
  return status === 'Pending'
    ? 'bg-amber-100 text-amber-800'
    : status === 'Published'
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-slate-200 text-slate-700'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

async function load() {
  loading.value = true
  try {
    contents.value = (await getMyContents({ page: 1, pageSize: 100 })).items
  } catch (error) {
    await swal.error('โหลดคอนเทนต์ไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
}

async function archive(content: UserContent) {
  const result = await swal.confirm('ต้องการยกเลิกคอนเทนต์นี้หรือไม่?', content.title)
  if (!result.isConfirmed) return
  try {
    await archiveMyContent(content.contentId)
    await swal.success('ยกเลิกคอนเทนต์แล้ว')
    await load()
  } catch (error) {
    await swal.error('ดำเนินการไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  }
}

onMounted(load)
</script>

<template>
  <main class="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
    <section class="rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 p-6 text-white sm:p-9">
      <div class="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p class="text-sm font-bold text-emerald-200">Community content</p>
          <h1 class="mt-2 text-3xl font-black sm:text-4xl">คอนเทนต์ของฉัน</h1>
          <p class="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-50/85">เผยแพร่เรื่องราว สถานที่ หรือวิดีโอของคุณให้ทุกคนค้นพบได้ทันที</p>
        </div>
        <RouterLink to="/create" class="rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-50">
          <i class="mdi mdi-plus-circle-outline mr-1" /> สร้างคอนเทนต์
        </RouterLink>
      </div>
    </section>

    <section class="mt-7">
      <div v-if="loading" class="grid gap-4 sm:grid-cols-2"><div v-for="index in 4" :key="index" class="h-44 animate-pulse rounded-2xl bg-slate-200" /></div>
      <div v-else-if="!contents.length" class="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <i class="mdi mdi-text-box-plus-outline text-5xl text-emerald-500" />
        <h2 class="mt-4 text-xl font-bold text-slate-900">ยังไม่มีคอนเทนต์ที่ส่ง</h2>
        <p class="mt-2 text-slate-500">เริ่มแบ่งปันเรื่องราวของกาญจนบุรีได้เลย</p>
        <RouterLink to="/create" class="mt-6 inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700">สร้างคอนเทนต์</RouterLink>
      </div>
      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="content in contents" :key="content.contentId" class="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-start justify-between gap-3"><span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="statusClass(content.status)">{{ statusLabel(content.status) }}</span><span class="text-xs text-slate-400">{{ formatDate(content.updatedAt) }}</span></div>
          <h2 class="mt-4 line-clamp-2 text-lg font-bold text-slate-900">{{ content.title }}</h2>
          <p class="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500">{{ content.summary || 'ไม่มีคำอธิบายย่อ' }}</p>
          <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <RouterLink v-if="content.status !== 'Archived'" :to="`/my-contents/${content.contentId}/edit`" class="font-bold text-emerald-700 hover:text-emerald-800">แก้ไข</RouterLink>
            <span v-else class="text-sm text-slate-400">ไม่สามารถแก้ไขได้</span>
            <button v-if="content.status !== 'Archived'" class="text-sm font-bold text-rose-600 hover:text-rose-700" @click="archive(content)">ยกเลิก</button>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
