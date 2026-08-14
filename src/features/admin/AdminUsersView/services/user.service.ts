import api from '@/shared/services/api'
import type { AdminUser, UserPayload } from '../type/user'

export const adminUserService = {
  async getAll(): Promise<AdminUser[]> {
    const response = await api.get<AdminUser[]>('/users')
    return response.data
  },

  async create(payload: UserPayload): Promise<AdminUser> {
    const response = await api.post<AdminUser>('/users', payload)
    return response.data
  },

  async update(id: string | number, payload: Partial<UserPayload>): Promise<AdminUser> {
    const response = await api.patch<AdminUser>(`/users/${id}`, payload)
    return response.data
  },

  async remove(id: string | number): Promise<void> {
    await api.delete(`/users/${id}`)
  },
}

