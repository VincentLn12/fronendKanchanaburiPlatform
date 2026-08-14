import api from '@/shared/services/api'

export interface Review {
  id: string | number
  courseId: string | number
  userId: string | number
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  createdAt: string
}

export interface Enrollment {
  id: string | number
  courseId: string | number
  userId: string | number
  userName: string
  userEmail: string
  courseTitle: string
  courseImage: string
  price: number
  paymentMethod: string
  status: string
  createdAt: string
}

export const coursesDetailService = {
  async isEnrolled(courseId: string | number, userId?: string | number) {
    if (!userId) return false
    const response = await api.get<Enrollment[]>('/enrollments', {
      params: { courseId: String(courseId), userId },
    })

    return response.data.length > 0
  },

  async getReviews(courseId: string | number) {
    const response = await api.get<Review[]>('/reviews', {
      params: { courseId: String(courseId) },
    })

    return response.data
  },

  async createReview(payload: Review) {
    const response = await api.post<Review>('/reviews', payload)
    return response.data
  },

  async deleteReview(id: string | number) {
    await api.delete(`/reviews/${id}`)
  },
}
