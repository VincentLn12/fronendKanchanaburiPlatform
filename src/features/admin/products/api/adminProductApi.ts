import http from '@/shared/api/http'
import type { Product } from '@/features/shops/shared/types/product'

export interface PagedProducts {
  items: Product[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export async function getAdminProducts(params: { shopId: string; status?: string | null; page: number; pageSize: number }) {
  const { data } = await http.get<PagedProducts>('/products/admin', { params })
  return data
}

export async function updateAdminProductStatus(id: string, status: 'Active' | 'Inactive') {
  await http.patch(`/products/${id}/status`, { status })
}
