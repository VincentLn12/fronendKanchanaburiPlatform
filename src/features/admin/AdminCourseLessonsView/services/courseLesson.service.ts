import api from '@/shared/services/api'
import type { CourseLesson, CourseLessonPayload, CourseSummary } from '../type/courseLesson'

export const courseLessonService = {
  async getCourse(id: string | number): Promise<CourseSummary> {
    const response = await api.get<CourseSummary>(`/courses/${id}`)
    return response.data
  },

  async getAll(courseId: string | number): Promise<CourseLesson[]> {
    const response = await api.get<CourseLesson[]>('/lessons', { params: { courseId } })
    return response.data
  },

  async create(payload: CourseLessonPayload): Promise<CourseLesson> {
    const response = await api.post<CourseLesson>('/lessons', payload)
    return response.data
  },

  async update(id: string | number, payload: CourseLessonPayload): Promise<CourseLesson> {
    const response = await api.put<CourseLesson>(`/lessons/${id}`, payload)
    return response.data
  },

  async remove(id: string | number): Promise<void> {
    await api.delete(`/lessons/${id}`)
  },
}

