import api from '@/shared/services/api'
import type { DashboardData } from '../type/dashboard'
const fallback = { data: [] }
export const dashboardService = { async getData(): Promise<DashboardData> { const [courses, lessons, users, enrollments] = await Promise.all([api.get('/courses').catch(() => fallback), api.get('/lessons').catch(() => fallback), api.get('/users').catch(() => fallback), api.get('/enrollments').catch(() => fallback)]); return { courses: courses.data, lessons: lessons.data, users: users.data, enrollments: enrollments.data } } }
