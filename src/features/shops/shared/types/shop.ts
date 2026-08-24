// Shared shop contracts
export interface Shop {
  shopId: string
  ownerUserId?: string
  shopCategoryId: string
  districtId: string
  subDistrictId: string
  shopName: string
  description?: string
  phone?: string
  email?: string
  address?: string
  status: string
  categoryName?: string
  districtName?: string
  subDistrictName?: string
}

export interface ShopCategory { shopCategoryId: string; categoryName: string; status: string }
export interface District { districtId: string; districtName: string }
export interface SubDistrict { subDistrictId: string; districtId: string; subDistrictName: string; postalCode?: string }

export interface ShopFormData {
  shopName: string
  shopCategoryId: string | null
  districtId: string | null
  subDistrictId: string | null
  description: string
  phone: string
  email: string
  address: string
}
