import api from '@/shared/services/api'
import type { Course, Lesson } from '../types/course'

export async function getCourses() {
  const response = await api.get<Course[]>('/courses')
  return response.data
}

export async function getCoursesById(id: number | string) {
  try {
    const response = await api.get<Course>(`/courses/${id}`)
    return response.data
  } catch (err) {
    const res = await api.get<Course[]>('/courses', { params: { id: String(id) } })
    if (res.data && res.data[0]) {
      return res.data[0]
    }
    throw err
  }
}

export async function getLessonsByCourseId(courseId: number | string) {
  try {
    const response = await api.get<Lesson[]>('/lessons', {
      params: { courseId: String(courseId) },
    })
    if (response.data && response.data.length > 0) {
      return response.data
    }

    // Fallback search with number
    const numRes = await api.get<Lesson[]>('/lessons', {
      params: { courseId: Number(courseId) },
    })
    return numRes.data
  } catch (err) {
    console.error(err)
    return []
  }
}
