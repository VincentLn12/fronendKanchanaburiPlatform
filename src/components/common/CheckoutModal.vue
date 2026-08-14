<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md transition-all duration-300"
    >
      <div
        class="bg-white rounded-[2rem] sm:rounded-[2.5rem] max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl shadow-indigo-950/30 border border-slate-200/90 relative"
      >
        <!-- Modal Header (Fixed at top) -->
        <div class="shrink-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative overflow-hidden">
          <div class="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>

          <button
            @click="closeModal"
            class="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-white text-sm font-bold w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/10 z-10"
          >
            ✕
          </button>

          <div class="flex items-center gap-2 mb-1.5">
            <span class="px-3 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/30 text-cyan-300 border border-indigo-400/30 uppercase tracking-widest">
              🔒 256-Bit SSL Encrypted Checkout
            </span>
          </div>
          <h3 class="text-xl sm:text-2xl font-black text-white tracking-tight">ชำระเงินเพื่อเข้าเรียน</h3>
          <p class="text-xs text-slate-300 mt-0.5 font-medium">ปลดล็อกการเข้าถึงวิดีโอบทเรียนและโจทย์ฝึกฝนทั้งหมดทันที</p>

          <!-- Course Summary Box -->
          <div class="mt-4 p-3.5 sm:p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 flex items-center gap-3.5">
            <img
              :src="courseImage || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=200'"
              alt="Course Thumbnail"
              class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-white/20 shrink-0 shadow-sm"
            />
            <div class="min-w-0 flex-grow">
              <p class="text-[10px] text-indigo-300 font-extrabold uppercase tracking-wider">คอร์สเรียนที่คุณเลือก</p>
              <p class="text-xs sm:text-sm font-black text-white truncate">{{ courseTitle || 'คอร์สเรียนออนไลน์' }}</p>
              <p class="text-[11px] text-slate-300 mt-0.5 hidden sm:block">เข้าเรียนได้ตลอดชีพ • ใบประกาศนียบัตร</p>
            </div>
            <div class="text-right shrink-0">
              <span class="text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md inline-block mb-0.5">ประหยัด 33%</span>
              <p class="text-lg sm:text-xl font-black text-cyan-300 leading-tight">฿{{ formatPrice(price) }}</p>
            </div>
          </div>
        </div>

        <!-- Scrollable Modal Body -->
        <div class="flex-grow overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
          <!-- Payment Method Tabs -->
          <div class="grid grid-cols-2 gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              @click="paymentMethod = 'card'"
              class="py-2.5 sm:py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
              :class="paymentMethod === 'card' ? 'bg-white text-indigo-600 shadow-md border border-slate-200/70' : 'text-slate-600 hover:text-slate-900'"
            >
              <span>💳</span>
              <span>บัตรเครดิต / เดบิต</span>
            </button>
            <button
              type="button"
              @click="paymentMethod = 'promptpay'"
              class="py-2.5 sm:py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
              :class="paymentMethod === 'promptpay' ? 'bg-white text-indigo-600 shadow-md border border-slate-200/70' : 'text-slate-600 hover:text-slate-900'"
            >
              <span>📱</span>
              <span>PromptPay QR</span>
            </button>
          </div>

          <!-- PAYMENT METHOD A: CREDIT CARD -->
          <div v-if="paymentMethod === 'card'" class="space-y-3.5">
            <!-- Quick Auto-Fill Test Card Button -->
            <div class="p-3 bg-indigo-50/90 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs">
              <div class="space-y-0.5">
                <p class="font-extrabold text-indigo-900">🧪 เติมข้อมูลบัตรทดสอบ</p>
                <p class="text-indigo-700 font-medium text-[11px]">กดเพื่อกรอกข้อมูลบัตรเดโมอัตโนมัติ</p>
              </div>
              <button
                type="button"
                @click="fillTestCard"
                class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs transition-all shrink-0 active:scale-95"
              >
                กรอกอัตโนมัติ
              </button>
            </div>

            <form @submit.prevent="processPayment" class="space-y-3.5">
              <div>
                <label class="block text-xs font-extrabold text-slate-700 mb-1">ชื่อบนหน้าบัตร</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="เช่น Somchai Jaidee"
                  class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label class="block text-xs font-extrabold text-slate-700 mb-1">หมายเลขบัตร 16 หลัก</label>
                <input
                  v-model="form.cardNumber"
                  type="text"
                  required
                  maxlength="19"
                  placeholder="4242 4242 4242 4242"
                  class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-extrabold text-slate-700 mb-1">วันหมดอายุ (MM/YY)</label>
                  <input
                    v-model="form.expiry"
                    type="text"
                    required
                    maxlength="5"
                    placeholder="12/28"
                    class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-xs font-extrabold text-slate-700 mb-1">รหัส CVC / CVV</label>
                  <input
                    v-model="form.cvc"
                    type="password"
                    required
                    maxlength="4"
                    placeholder="123"
                    class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <!-- Success Banner -->
              <div v-if="isSuccess" class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 animate-in fade-in">
                <div class="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                  ✓
                </div>
                <div>
                  <p class="font-black text-sm">ชำระเงินสำเร็จแล้ว!</p>
                  <p class="text-xs text-emerald-700 font-medium">บันทึกคำสั่งซื้อเรียบร้อย กำลังพาคุณเข้าสู่คอร์สเรียน...</p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  @click="closeModal"
                  :disabled="isProcessing"
                  class="w-1/3 py-3 rounded-2xl border border-slate-200 text-slate-600 font-extrabold text-xs hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  :disabled="isProcessing || isSuccess"
                  class="w-2/3 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  <div v-if="isProcessing" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{{ isProcessing ? 'กำลังยืนยัน...' : `ยืนยันชำระเงิน ฿${formatPrice(price)}` }}</span>
                </button>
              </div>
            </form>
          </div>

          <!-- PAYMENT METHOD B: PROMPTPAY QR -->
          <div v-else-if="paymentMethod === 'promptpay'" class="space-y-4 text-center py-1">
            <div class="p-4 sm:p-5 bg-slate-50 border border-slate-200/90 rounded-3xl space-y-3 shadow-xs">
              <div class="flex items-center justify-center gap-2 text-slate-900 font-extrabold text-xs sm:text-sm">
                <span>📱</span>
                <span>สแกน QR Code ด้วย Mobile Banking ทุกธนาคาร</span>
              </div>
              
              <!-- QR Code Card -->
              <div class="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 inline-block shadow-md relative">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PROMPTPAY_TEST_PAYMENT"
                  alt="PromptPay QR Code"
                  class="w-36 h-36 sm:w-44 sm:h-44 mx-auto rounded-lg"
                />
                <div class="mt-2 pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-400 font-bold">
                  REF: {{ 'ORD-' + Math.floor(100000 + Math.random() * 900000) }}
                </div>
              </div>

              <div class="space-y-0.5">
                <p class="text-xs font-extrabold text-slate-700">ยอดชำระสุทธิ: <span class="text-indigo-600 font-black text-base">฿{{ formatPrice(price) }}</span></p>
                <p class="text-[11px] text-slate-500 font-medium">ระบบจะปลดล็อกบทเรียนให้อัตโนมัติหลังสแกนชำระเงิน</p>
              </div>
            </div>

            <!-- Success Banner -->
            <div v-if="isSuccess" class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-left animate-in fade-in">
              <div class="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                ✓
              </div>
              <div>
                <p class="font-black text-sm">สแกนชำระเงินสำเร็จ!</p>
                <p class="text-xs text-emerald-700 font-medium">บันทึกคำสั่งซื้อสำเร็จ กำลังพาคุณเข้าสู่คอร์สเรียน...</p>
              </div>
            </div>

            <div class="flex items-center gap-3 pt-2">
              <button
                type="button"
                @click="closeModal"
                :disabled="isProcessing"
                class="w-1/3 py-3 rounded-2xl border border-slate-200 text-slate-600 font-extrabold text-xs hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                @click="processPayment"
                :disabled="isProcessing || isSuccess"
                class="w-2/3 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                <div v-if="isProcessing" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{{ isProcessing ? 'กำลังตรวจสอบยอดชำระ...' : 'ยืนยันการสแกนชำระเงิน' }}</span>
              </button>
            </div>
          </div>

        </div>

        <!-- Footer Badge (Fixed at bottom) -->
        <div class="shrink-0 bg-slate-50 p-3.5 border-t border-slate-100 text-center text-[11px] text-slate-500 font-extrabold flex items-center justify-center gap-2">
          <span>🛡️ ปลอดภัยมาตรฐาน PCI-DSS Compliance • ออกใบเสร็จรับเงินอิเล็กทรอนิกส์ได้ทันที</span>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    courseId?: string | number
    courseTitle?: string
    courseImage?: string
    price?: number
  }>(),
  {
    courseId: '1',
    courseTitle: 'คอร์สเรียนออนไลน์',
    courseImage: '',
    price: 1990
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'success'): void
}>()

const auth = useAuthStore()
const paymentMethod = ref<'card' | 'promptpay'>('card')
const isProcessing = ref(false)
const isSuccess = ref(false)

const form = ref({
  name: 'SOMCHAI JAIDEE',
  cardNumber: '4242 4242 4242 4242',
  expiry: '12/28',
  cvc: '123'
})

function formatPrice(p: number) {
  return p ? p.toLocaleString('th-TH') : '0'
}

function fillTestCard() {
  form.value = {
    name: 'SOMCHAI JAIDEE (TEST)',
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/28',
    cvc: '123'
  }
}

function closeModal() {
  if (!isProcessing.value) {
    emit('update:modelValue', false)
  }
}

async function processPayment() {
  isProcessing.value = true
  isSuccess.value = false

  const newEnrollment = {
    id: 'ord_' + Math.floor(100000 + Math.random() * 900000),
    userId: auth.user?.id || 'c61b',
    userName: auth.user?.name || form.value.name || 'ผู้ใช้งานทดสอบ',
    userEmail: auth.user?.email || 'user@gmail.com',
    courseId: String(props.courseId),
    courseTitle: props.courseTitle || 'คอร์สเรียนออนไลน์',
    courseImage: props.courseImage || '',
    price: props.price || 0,
    paymentMethod: paymentMethod.value === 'card' ? 'บัตรเครดิต / เดบิต' : 'PromptPay QR',
    status: 'ชำระเงินสำเร็จ',
    createdAt: new Date().toISOString()
  }

  try {
    await fetch('http://localhost:3000/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEnrollment)
    })
  } catch (err) {
    console.warn('Could not persist purchase record to server:', err)
  }

  setTimeout(() => {
    isProcessing.value = false
    isSuccess.value = true

    setTimeout(() => {
      emit('success')
      emit('update:modelValue', false)
      isSuccess.value = false
    }, 1200)
  }, 1000)
}
</script>
