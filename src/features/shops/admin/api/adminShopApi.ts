import http from '@/shared/api/http'
import type { Shop } from '../../shared/types/shop'

export async function getAdminShops() {
  const { data } = await http.get<Shop[]>('/shops/admin')
  return data
}

export async function updateShopStatus(id: string, status: string) {
  await http.patch(`/shops/${id}/status`, { status })
}
