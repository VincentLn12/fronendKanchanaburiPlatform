<template>
  <main class="min-h-screen bg-slate-50/80 pb-24 text-slate-800">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 pt-6">
      
      <!-- Enterprise Executive Header Banner -->
      <div
        class="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-indigo-950/20 border border-slate-800 overflow-hidden space-y-6"
      >
        <div class="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-3">
            <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-lg text-[11px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/25 uppercase tracking-widest">
              <i class="mdi mdi-shield-check-outline text-indigo-400 text-sm"></i>
              <span>Enterprise Learning Dashboard</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight">คอร์สเรียนของฉัน</h1>
            <p class="text-slate-300 text-sm font-medium max-w-xl leading-relaxed">
              ศูนย์รวมหลักสูตรพัฒนาทักษะวิชาชีพและวิศวกรรมซอฟต์แวร์ที่คุณได้รับสิทธิ์การเข้าถึง
            </p>
          </div>

          <!-- User Account Information Card -->
          <div class="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shrink-0 shadow-sm">
            <div class="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md border border-indigo-400/30">
              {{ auth.user?.name?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <div>
              <p class="text-[10px] text-indigo-300 font-extrabold uppercase tracking-wider">บัญชีผู้เรียนชำระเงิน</p>
              <p class="text-sm font-black text-white leading-tight">{{ auth.user?.name || 'ผู้ใช้งานระบบ' }}</p>
              <p class="text-xs text-slate-300 font-medium mt-0.5">{{ auth.user?.email || 'user@gmail.com' }}</p>
            </div>
          </div>
        </div>

        <!-- Corporate KPI Metrics Bar -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 relative z-10">
          <div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 flex items-center justify-center text-xl shrink-0">
              <i class="mdi mdi-book-open-page-variant"></i>
            </div>
            <div>
              <p class="text-2xl font-black text-white leading-none mb-1">{{ enrolledCourses.length }}</p>
              <p class="text-xs text-slate-300 font-bold">หลักสูตรในครอบครอง</p>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/20 flex items-center justify-center text-xl shrink-0">
              <i class="mdi mdi-certificate-outline"></i>
            </div>
            <div>
              <p class="text-2xl font-black text-white leading-none mb-1">{{ enrolledCourses.length }}</p>
              <p class="text-xs text-slate-300 font-bold">ใบประกาศนียบัตรสถาบัน</p>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 col-span-2 sm:col-span-1">
            <div class="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/20 flex items-center justify-center text-xl shrink-0">
              <i class="mdi mdi-clock-outline"></i>
            </div>
            <div>
              <p class="text-2xl font-black text-white leading-none mb-1">{{ enrolledCourses.length * 40 }} ชม.</p>
              <p class="text-xs text-slate-300 font-bold">ชั่วโมงการเรียนรู้อนุมัติ</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Professional Search & Toolbar -->
      <div v-if="enrolledCourses.length > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div class="relative w-full sm:w-96">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหารายชื่อหลักสูตรที่ลงทะเบียน..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
          <i class="mdi mdi-magnify absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
        </div>
        <div class="text-xs font-extrabold text-slate-500 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
          <span>แสดง <strong class="text-indigo-600 text-sm font-black">{{ filteredEnrolledCourses.length }}</strong> จากทั้งหมด {{ enrolledCourses.length }} หลักสูตร</span>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div v-if="isLoading" class="py-20 text-center space-y-4">
        <div class="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-slate-500 text-xs font-extrabold uppercase tracking-wider">กำลังโหลดข้อมูลระบบสิทธิ์การเรียน...</p>
      </div>

      <!-- Empty State Card -->
      <div
        v-else-if="enrolledCourses.length === 0"
        class="py-16 px-6 bg-white border border-slate-200 rounded-3xl text-center space-y-5 shadow-xs max-w-lg mx-auto"
      >
        <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-2xl font-black mx-auto shadow-xs">
          <i class="mdi mdi-folder-open-outline"></i>
        </div>
        <div class="space-y-1.5">
          <h3 class="text-xl font-black text-slate-900">ยังไม่มีรายการคอร์สเรียนในบัญชีนี้</h3>
          <p class="text-xs text-slate-500 leading-relaxed font-medium max-w-sm mx-auto">
            คุณสามารถเลือกสมัครเรียนในคอร์สเรียนที่ต้องการเพื่อปลดล็อกสิทธิ์การเข้าถึงเนื้อหาวิดีโอทั้งหมด
          </p>
        </div>
        <RouterLink
          to="/courses"
          class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          <span>สำรวจคอร์สเรียนทั้งหมด</span>
          <i class="mdi mdi-arrow-right"></i>
        </RouterLink>
      </div>

      <!-- Corporate Enrolled Courses Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <article
          v-for="item in filteredEnrolledCourses"
          :key="item.id"
          class="group overflow-hidden rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-400/60 shadow-xs hover:shadow-xl hover:shadow-indigo-950/5 transition-all duration-300 flex flex-col hover:-translate-y-1"
        >
          <!-- Thumbnail Image Header -->
          <div class="relative overflow-hidden aspect-video bg-slate-950 group">
            <img
              :src="
                item.courseImage ||
                'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=640'
              "
              :alt="item.courseTitle"
              class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

            <span
              class="absolute top-3.5 left-3.5 rounded-lg px-3 py-1 text-[11px] font-black bg-emerald-600 text-white shadow-md flex items-center gap-1.5 uppercase tracking-wider"
            >
              <i class="mdi mdi-check-circle"></i>
              <span>อนุมัติสิทธิ์เข้าเรียน</span>
            </span>

            <span
              class="absolute top-3.5 right-3.5 rounded-lg px-2.5 py-1 text-[10px] font-extrabold bg-slate-900/90 text-indigo-300 border border-white/10 backdrop-blur-md"
            >
              {{ item.paymentMethod || 'การชำระเงินเสร็จสมบูรณ์' }}
            </span>
          </div>

          <!-- Content Details -->
          <div class="p-6 flex flex-col flex-grow space-y-4">
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <span>วันที่เริ่มอนุมัติ:</span>
                <span class="font-mono text-slate-500">{{ formatDate(item.createdAt) }}</span>
              </div>
              <h3
                class="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 leading-snug"
              >
                {{ item.courseTitle || 'หลักสูตรซอฟต์แวร์วิชาชีพ' }}
              </h3>
            </div>

            <!-- Progress Bar Barcode -->
            <div class="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div class="flex justify-between text-xs font-bold text-slate-600">
                <span>สถานะการเรียนรู้</span>
                <span class="text-indigo-600 font-extrabold">ปลดล็อกบทเรียนแล้ว</span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div class="h-full bg-indigo-600 w-full rounded-full"></div>
              </div>
            </div>

            <!-- Action Button -->
            <div class="pt-2 mt-auto">
              <RouterLink
                :to="`/courses/${item.courseId}`"
                class="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.01]"
              >
                <i class="mdi mdi-play-circle-outline text-base"></i>
                <span>เข้าสู่ห้องเรียน</span>
              </RouterLink>
            </div>
          </div>
        </article>
      </div>

    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

interface Enrollment {
  id: string
  userId: string
  courseId: string
  courseTitle: string
  courseImage?: string
  price: number
  paymentMethod: string
  status: string
  createdAt: string
}

const auth = useAuthStore()
const enrolledCourses = ref<Enrollment[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

const filteredEnrolledCourses = computed(() => {
  if (!searchQuery.value.trim()) return enrolledCourses.value
  const q = searchQuery.value.toLowerCase()
  return enrolledCourses.value.filter(item => 
    item.courseTitle?.toLowerCase().includes(q)
  )
})

function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function fetchMyCourses() {
  isLoading.value = true
  try {
    const res = await fetch('http://localhost:3000/enrollments')
    if (res.ok) {
      const data: Enrollment[] = await res.json()
      // Filter enrollments for current user or all if guest test
      enrolledCourses.value = data
        .filter((item) => !auth.user?.id || item.userId === auth.user.id)
        .reverse()
    }
  } catch (err) {
    console.error('Failed to fetch enrolled courses:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchMyCourses)
</script>
