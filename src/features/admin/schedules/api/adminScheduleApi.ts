import http from '@/shared/api/http'

export type ScheduleStatus = 'Active' | 'Inactive' | 'Cancelled'

export interface Schedule {
  scheduleId: string
  contentId: string
  contentTitle?: string
  title: string
  startDateTime: string
  endDateTime?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  description?: string | null
  status: ScheduleStatus
  createdAt: string
}

export interface ScheduleFormData {
  contentId: string | null
  title: string
  startDateTime: string
  endDateTime: string
  address: string
  latitude: number | null
  longitude: number | null
  description: string
  status: ScheduleStatus
}

export async function getSchedules(contentId?: string) {
  const { data } = await http.get<Schedule[]>('/schedules/admin', { params: { contentId } })
  return data
}
export async function getSchedule(id: string) {
  const { data } = await http.get<Schedule>(`/schedules/admin/${id}`)
  return data
}
export async function createSchedule(data: Omit<ScheduleFormData, 'status'>) {
  const { data: result } = await http.post<Schedule>('/schedules', data)
  return result
}
export async function updateSchedule(id: string, data: ScheduleFormData) { await http.put(`/schedules/${id}`, data) }
export async function archiveSchedule(id: string) { await http.delete(`/schedules/${id}`) }
