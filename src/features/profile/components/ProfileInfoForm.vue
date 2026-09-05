<script setup lang="ts">
import AppTextField from '@/components/common/input/AppTextField.vue'

interface Props {
  profile: {
    firstName: string
    lastName: string
    email: string
    role: string
  }
  saving: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'save': []
}>()

function initials() {
  const f = props.profile.firstName?.slice(0, 1) || ''
  const l = props.profile.lastName?.slice(0, 1) || ''
  return `${f}${l}`.toUpperCase() || 'U'
}
</script>

<template>
  <div class="rounded-3xl border-2 border-[#E8D9C9] bg-[#FFF9F2] p-6 sm:p-8 shadow-xs space-y-6">
    <!-- Section Title -->
    <div class="border-b-2 border-[#E8D9C9] pb-4">
      <h2 class="text-xl sm:text-2xl font-black text-[#332820]">
        ข้อมูลส่วนตัวของฉัน
      </h2>
      <p class="text-xs sm:text-sm text-[#786B62] font-semibold mt-1">
        จัดการข้อมูลส่วนบุคคล อัปเดตชื่อและนามสกุลของคุณเพื่อให้แสดงผลบนแพลตฟอร์มได้อย่างถูกต้อง
      </p>
    </div>

    <!-- Avatar Preview & Header -->
    <div class="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-[#F7F0E6] border-2 border-[#E8D9C9]">
      <div
        class="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D96C2C] via-[#BF5720] to-[#171412] text-white text-3xl font-black shadow-lg border-4 border-white ring-4 ring-[#D96C2C]/20"
      >
        {{ initials() }}
      </div>

      <div class="space-y-1 text-center sm:text-left">
        <h3 class="text-base sm:text-lg font-black text-[#332820]">
          {{ `${props.profile.firstName} ${props.profile.lastName}`.trim() || 'สมาชิกผู้ใช้งาน' }}
        </h3>
        <p class="text-xs text-[#786B62] font-semibold">{{ props.profile.email }}</p>
        <span
          class="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black bg-[#D96C2C]/10 text-[#D96C2C] border border-[#D96C2C]/20 mt-1"
        >
          <i class="mdi mdi-shield-check text-xs"></i>
          {{ props.profile.role === 'Admin' ? 'ผู้ดูแลระบบสูงสุด (Administrator)' : 'สมาชิกยืนยันตัวตน' }}
        </span>
      </div>
    </div>

    <!-- Personal Info Form -->
    <form class="space-y-5 pt-2" @submit.prevent="emit('save')">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppTextField
          v-model="props.profile.firstName"
          label="ชื่อจริง *"
          placeholder="พิมพ์ชื่อของคุณ"
        />
        <AppTextField
          v-model="props.profile.lastName"
          label="นามสกุล *"
          placeholder="พิมพ์นามสกุลของคุณ"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppTextField
          :model-value="props.profile.email"
          label="อีเมลบัญชีผู้ใช้ (ใช้เข้าสู่ระบบ)"
          type="email"
          disabled
        />
        <AppTextField
          :model-value="props.profile.role === 'Admin' ? 'ผู้ดูแลระบบ' : 'สมาชิกทั่วไป'"
          label="ระดับสถานะสมาชิก"
          disabled
        />
      </div>

      <!-- Action Button -->
      <div class="border-t-2 border-[#E8D9C9] pt-5 flex justify-end">
        <button
          type="submit"
          class="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#D96C2C] hover:bg-[#BF5720] text-white font-black text-xs sm:text-sm shadow-xl transition active:scale-95 disabled:opacity-50 border border-[#D96C2C] cursor-pointer"
          :disabled="props.saving"
        >
          <i
            class="mdi text-lg text-white"
            :class="props.saving ? 'mdi-loading animate-spin' : 'mdi-content-save-check'"
          ></i>
          <span class="!text-white font-black">{{ props.saving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการเปลี่ยนแปลง' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
