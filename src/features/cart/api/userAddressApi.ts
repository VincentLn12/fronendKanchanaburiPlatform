import http from '@/shared/api/http'

export interface UserAddress {
  userAddressId: string
  recipientName: string
  recipientPhone: string
  addressLine: string
  subDistrict?: string
  district?: string
  province?: string
  postalCode?: string
  isDefault: boolean
}

export async function getUserAddresses() {
  const { data } = await http.get<UserAddress[]>('/user-addresses')
  return data
}
