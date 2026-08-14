import api from '@/shared/services/api'
import type { Course, CoursePayload } from '../type/course'

export const adminCourseService = {
  async getAll(): Promise<Course[]> {
    const response = await api.get<Course[]>('/courses')
    return response.data
  },

  async create(payload: CoursePayload): Promise<Course> {
    const response = await api.post<Course>('/courses', payload)
    return response.data
  },

  async update(id: string | number, payload: CoursePayload): Promise<Course> {
    const response = await api.put<Course>(`/courses/${id}`, payload)
    return response.data
  },

  async remove(id: string | number): Promise<void> {
    await api.delete(`/courses/${id}`)
  },
}

