import http from '@/shared/api/http'
import type { Shop } from '@/features/shops/shared/types/shop'
import type { PagedResult } from '@/shared/interface/PagedResult'

export async function getAdminShops(params: {
  search?: string
  status?: string | null
  page: number
  pageSize: number
}) {
  const { data } = await http.get<PagedResult<Shop>>('/shops/admin', { params })
  return data
}

export async function updateShopStatus(id: string, status: string) {
  await http.patch(`/shops/${id}/status`, { status })
}
