import api from '@/shared/services/api'
import type { Category, CategoryPayload } from '../type/category'

export const categoryService = {
  async getAll() {
    const response = await api.get<Category[]>('/categories')
    return response.data
  },

  async create(payload: CategoryPayload) {
    const response = await api.post<Category>('/categories', payload)
    return response.data
  },

  async update(id: string | number, payload: CategoryPayload) {
    const response = await api.put<Category>(`/categories/${id}`, payload)

    return response.data
  },

  async remove(id: string | number) {
    await api.delete(`/categories/${id}`)
  },
}
