import api from '@/shared/services/api'
import type { PurchaseRecord } from '../type/purchase'

export const purchaseService = {
  async getAll(): Promise<PurchaseRecord[]> {
    const response = await api.get<PurchaseRecord[]>('/enrollments')
    return response.data
  },
}

