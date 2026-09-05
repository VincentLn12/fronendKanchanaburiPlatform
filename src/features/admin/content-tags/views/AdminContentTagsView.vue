<template>
  <main class="mx-auto w-full max-w-3xl px-6 py-10">
    <div class="mb-8">
      <p class="font-semibold text-indigo-600">Content management</p>
      <h1 class="mt-1 text-3xl font-bold text-slate-900">ผูกแท็กกับคอนเทนต์</h1>
      <p class="mt-2 text-slate-500">เลือกคอนเทนต์ แล้วกำหนดแท็กที่ใช้สำหรับจัดกลุ่มและค้นหา</p>
    </div>

    <section v-if="loading" class="h-48 animate-pulse rounded-2xl bg-slate-200" />
    <section v-else class="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <AppSelect
        v-model="selectedContentId"
        label="เลือกคอนเทนต์"
        :items="contents"
        item-title="title"
        item-value="contentId"
        placeholder="เลือกคอนเทนต์ที่ต้องการจัดการแท็ก"
        clearable
      />
      <template v-if="selectedContentId">
        <div v-if="loadingTags" class="h-1 animate-pulse rounded bg-indigo-600" />
        <template v-else>
          <AppSelect
            v-model="selectedTagIds"
            label="แท็ก"
            :items="tags"
            item-title="tagName"
            item-value="tagId"
            multiple
            class="min-h-40"
          />
          <p class="text-xs text-slate-500">
            กด Ctrl (Windows) หรือ Command (Mac) เพื่อเลือกมากกว่าหนึ่งแท็ก
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tagId in selectedTagIds"
              :key="tagId"
              class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
              >#{{ tags.find((tag) => tag.tagId === tagId)?.tagName }}</span
            >
            <span v-if="!selectedTagIds.length" class="text-sm text-slate-400"
              >ยังไม่ได้เลือกแท็ก</span
            >
          </div>
          <button
            class="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            :disabled="saving"
            @click="save"
          >
            {{ saving ? 'กำลังบันทึก...' : 'บันทึกแท็ก' }}
          </button>
        </template>
      </template>
      <p v-else class="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
        เลือกคอนเทนต์เพื่อเริ่มจัดการแท็ก
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import {
  getContentTags,
  getContents,
  getTags,
  replaceContentTags,
  type ContentOption,
  type TagOption,
} from '../api/adminContentTagApi'
import AppSelect from '@/components/common/input/AppSelect.vue'
import { getApiErrorMessage } from '@/features/auth/api/getApiErrorMessage'
import { useSwal } from '@/plugins/sweetalert'

const contents = ref<ContentOption[]>([])
const tags = ref<TagOption[]>([])
const selectedContentId = ref<string | null>(null)
const selectedTagIds = ref<string[]>([])
const loading = ref(true)
const loadingTags = ref(false)
const saving = ref(false)
const swal = useSwal()

async function loadTagAssignments() {
  if (!selectedContentId.value) {
    selectedTagIds.value = []
    return
  }
  loadingTags.value = true
  try {
    const assignedTags = await getContentTags(selectedContentId.value)
    selectedTagIds.value = assignedTags.map((tag) => tag.tagId)
  } catch (error) {
    selectedTagIds.value = []
    await swal.error(
      'โหลดแท็กของคอนเทนต์ไม่สำเร็จ',
      getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'),
    )
  } finally {
    loadingTags.value = false
  }
}

async function save() {
  if (!selectedContentId.value) return
  saving.value = true
  try {
    await replaceContentTags(selectedContentId.value, selectedTagIds.value)
    await swal.success('บันทึกแท็กของคอนเทนต์แล้ว')
  } catch (error) {
    await swal.error('บันทึกไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    saving.value = false
  }
}

watch(selectedContentId, loadTagAssignments)
onMounted(async () => {
  try {
    ;[contents.value, tags.value] = await Promise.all([getContents(), getTags()])
  } catch (error) {
    await swal.error('โหลดข้อมูลไม่สำเร็จ', getApiErrorMessage(error, 'กรุณาลองใหม่อีกครั้ง'))
  } finally {
    loading.value = false
  }
})
</script>
