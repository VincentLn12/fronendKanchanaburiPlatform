<script setup lang="ts">
interface ReportTarget {
  contentId?: string
  reviewId?: string
  label: string
}

interface Props {
  target: ReportTarget | null
  reason: string
  description: string
  reporting: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:reason': [value: string]
  'update:description': [value: string]
  close: []
  submit: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="target"
      class="fixed inset-0 z-[100] flex items-end bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center sm:justify-center"
      @click.self="emit('close')"
    >
      <form
        class="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
        @submit.prevent="emit('submit')"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-bold text-rose-600">
              <i class="mdi mdi-flag-outline mr-1"></i>รายงานรายการ
            </p>
            <h2 class="mt-1 text-xl font-black text-slate-900">{{ target.label }}</h2>
          </div>
          <button
            type="button"
            class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            @click="emit('close')"
          >
            <i class="mdi mdi-close text-2xl"></i>
          </button>
        </div>
        <label class="mt-6 block text-sm font-bold text-slate-700">เหตุผล</label>
        <select
          :value="reason"
          @change="(e) => emit('update:reason', (e.target as HTMLSelectElement).value)"
          class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
        >
          <option>ข้อมูลไม่ถูกต้อง</option>
          <option>เนื้อหาไม่เหมาะสม</option>
          <option>สแปมหรือโฆษณา</option>
          <option>ละเมิดลิขสิทธิ์</option>
          <option>อื่น ๆ</option>
        </select>
        <label class="mt-4 block text-sm font-bold text-slate-700"
          >รายละเอียดเพิ่มเติม (ถ้ามี)</label
        >
        <textarea
          :value="description"
          @input="(e) => emit('update:description', (e.target as HTMLTextAreaElement).value)"
          rows="3"
          maxlength="2000"
          class="mt-2 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
          placeholder="อธิบายสิ่งที่พบเพื่อช่วยให้ทีมงานตรวจสอบ"
        />
        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            @click="emit('close')"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            class="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
            :disabled="reporting"
          >
            {{ reporting ? 'กำลังส่ง...' : 'ส่งรายงาน' }}
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>
