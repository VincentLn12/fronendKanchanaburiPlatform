<template>
  <div class="space-y-6">
    <!-- Welcome Header Banner -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/10">
      <div class="relative z-10 space-y-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
          Welcome back, {{ userName }}
        </span>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
          ภาพรวมแผงควบคุมระบบ E-Learning
        </h1>
        <p class="text-sm text-indigo-100 max-w-2xl">
          จัดการคอร์สเรียน ติดตามผู้เรียน ตรวจสอบสถิติมุมมองและการลงทะเบียนได้ที่นี่
        </p>
      </div>
      <div class="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
    </div>

    <!-- Quick Stat Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 2xl:gap-6">
      <div v-for="stat in dynamicStats" :key="stat.title" class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ stat.title }}</span>
          <div :class="[stat.iconBg, 'p-2.5 rounded-xl text-white shadow-sm']">
            <component :is="stat.icon" class="w-5 h-5" />
          </div>
        </div>
        <div class="mt-4">
          <h3 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{{ stat.value }}</h3>
          <p class="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            <span>{{ stat.subtext }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Recent Purchases & Course Table Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Recent Purchases Card -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900">รายการสั่งซื้อล่าสุด</h2>
            <p class="text-xs text-slate-500">ประวัติการชำระเงินที่เข้าสู่ระบบ</p>
          </div>
          <RouterLink to="/admin/purchases" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
            ดูทั้งหมด →
          </RouterLink>
        </div>

        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-left text-xs text-slate-700">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th class="px-3.5 py-3">ผู้ซื้อ</th>
                <th class="px-3.5 py-3">คอร์ส</th>
                <th class="px-3.5 py-3">ราคา</th>
                <th class="px-3.5 py-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="recentPurchases.length === 0">
                <td colspan="4" class="px-3.5 py-6 text-center text-slate-400">ยังไม่มีรายการสั่งซื้อในขณะนี้</td>
              </tr>
              <tr v-else v-for="item in recentPurchases.slice(0, 5)" :key="item.id" class="hover:bg-slate-50">
                <td class="px-3.5 py-3 font-semibold text-slate-900">
                  <p class="truncate max-w-[110px]">{{ item.userName || 'ผู้ใช้' }}</p>
                  <p class="text-[10px] text-slate-400 font-normal truncate max-w-[110px]">{{ item.userEmail }}</p>
                </td>
                <td class="px-3.5 py-3 font-medium text-slate-800 max-w-[140px] truncate">
                  {{ item.courseTitle }}
                </td>
                <td class="px-3.5 py-3 font-black text-slate-900">฿{{ formatPrice(item.price || 0) }}</td>
                <td class="px-3.5 py-3 text-center">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    สำเร็จ
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Courses Summary Table -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900">คอร์สเรียนทั้งหมดในระบบ</h2>
            <p class="text-xs text-slate-500">รายการคอร์สที่เปิดสอนปัจจุบัน</p>
          </div>
          <RouterLink to="/admin/courses" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
            จัดการคอร์ส →
          </RouterLink>
        </div>

        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-left text-xs text-slate-700">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th class="px-3.5 py-3">คอร์สเรียน</th>
                <th class="px-3.5 py-3">ระดับ</th>
                <th class="px-3.5 py-3">ราคา</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="courses.length === 0">
                <td colspan="3" class="px-3.5 py-6 text-center text-slate-400">ยังไม่มีคอร์สเรียนในระบบ</td>
              </tr>
              <tr v-else v-for="course in courses" :key="course.id" class="hover:bg-slate-50">
                <td class="px-3.5 py-3 font-semibold text-slate-900 flex items-center gap-2.5">
                  <img :src="course.image" class="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                  <span class="truncate max-w-[150px]">{{ course.title }}</span>
                </td>
                <td class="px-3.5 py-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {{ course.level }}
                  </span>
                </td>
                <td class="px-3.5 py-3 font-bold text-indigo-600">฿{{ formatPrice(course.price || 0) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { dashboardService } from './services/dashboard.service'

const auth = useAuthStore()
const userName = computed(() => auth.user?.name || 'ผู้ดูแลระบบ')

const courses = ref<any[]>([])
const totalLessonsCount = ref(0)
const totalUsersCount = ref(0)
const recentPurchases = ref<any[]>([])
const totalRevenueAmount = ref(0)

const createIcon = (d: string) => h('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2'
}, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d })])

function formatPrice(p: number) {
  return p.toLocaleString('th-TH')
}

const dynamicStats = computed(() => [
  {
    title: 'คอร์สเรียนทั้งหมด',
    value: `${courses.value.length} คอร์ส`,
    subtext: 'ข้อมูลจริงจากระบบ',
    iconBg: 'bg-indigo-600',
    icon: createIcon('M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25')
  },
  {
    title: 'ผู้ใช้งานทั้งหมด',
    value: `${totalUsersCount.value} คน`,
    subtext: 'ผู้สมัครสมาชิกในระบบ',
    iconBg: 'bg-cyan-600',
    icon: createIcon('M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z')
  },
  {
    title: 'บทเรียนในระบบ',
    value: `${totalLessonsCount.value} บท`,
    subtext: 'จำนวนวิดีโอเนื้อหา',
    iconBg: 'bg-purple-600',
    icon: createIcon('M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z')
  },
  {
    title: 'รายได้สะสมจริง',
    value: `฿${formatPrice(totalRevenueAmount.value)}`,
    subtext: `คำสั่งซื้อ ${recentPurchases.value.length} รายการ`,
    iconBg: 'bg-emerald-600',
    icon: createIcon('M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z')
  }
])

async function fetchDashboardData() {
  try {
    const { courses: courseData, lessons, users, enrollments: enrollmentData } = await dashboardService.getData()
    courses.value = courseData || []
    totalLessonsCount.value = lessons.length
    totalUsersCount.value = users.length
    const enrollments = Array.isArray(enrollmentData) ? enrollmentData : []
    recentPurchases.value = [...enrollments].reverse()
    totalRevenueAmount.value = enrollments.reduce((sum: number, item: any) => sum + (item.price || 0), 0)
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
  }
}

onMounted(fetchDashboardData)
</script>
