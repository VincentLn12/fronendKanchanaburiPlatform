import api from '@/shared/services/api'
import type { Teacher, TeacherPayload } from '../type/teacher'

export const teacherService = {
  async getAll() {
    const response = await api.get<Teacher[]>('/teachers')
    return response.data
  },

  async create(payload: TeacherPayload) {
    const response = await api.post<Teacher>('/teachers', payload)
    return response.data
  },

  async update(id: string | number, payload: TeacherPayload) {
    const response = await api.patch<Teacher>(`/teachers/${id}`, payload)
    return response.data
  },

  async remove(id: string | number) {
    await api.delete(`/teachers/${id}`)
  },
}
