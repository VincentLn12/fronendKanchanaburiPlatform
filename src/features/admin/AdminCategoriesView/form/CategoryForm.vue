<template>
  <form class="space-y-4" @submit.prevent="submitForm">
    <div>
      <AppTextField
        v-model="form.name"
        label="ชื่อหมวดหมู่"
        placeholder="กรอกชื่อหมวดหมู่"
        rounded="lg"
        required
      />
    </div>
    <div>
      <AppTextField
        v-model="form.slug"
        label="Slug URL"
        placeholder="web-development"
        rounded="lg"
        required
      />
    </div>
    <div>
      <AppTextarea v-model="form.description" label="คำอธิบาย" rows="3" rounded="lg" />
    </div>

    <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
      <button
        type="button"
        class="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
        @click="emit('close')"
      >
        ยกเลิก
      </button>

      <button
        type="submit"
        class="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
      >
        บันทึกข้อมูล
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Category, CategoryPayload } from '../type/category'
import AppTextField from '@/components/common/input/AppTextField.vue'
import AppTextarea from '@/components/common/input/AppTextarea.vue'

interface Props {
  category?: Category | null
}

const props = withDefaults(defineProps<Props>(), {
  category: null,
})

const emit = defineEmits<{
  save: [payload: CategoryPayload]
  close: []
}>()

const form = ref<CategoryPayload>({
  name: props.category?.name ?? '',
  slug: props.category?.slug ?? '',
  description: props.category?.description ?? '',
})

function submitForm() {
  const payload: CategoryPayload = {
    name: form.value.name,
    slug: form.value.slug || form.value.name.toLowerCase().replace(/\s+/g, '-'),
    description: form.value.description,
  }

  emit('save', payload)
}
</script>
