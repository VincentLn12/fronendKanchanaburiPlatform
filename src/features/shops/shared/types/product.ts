// Shared product contracts
export interface Product {
  productId: string
  shopId: string
  productCategoryId: string
  productName: string
  description?: string
  price: number
  imageUrl?: string
  status: string
  detailImages?: string[]
}

export interface ProductCategory { productCategoryId: string; categoryName: string; status: string }

export interface ProductFormData {
  shopId: string
  productCategoryId: string | null
  productName: string
  description: string
  price: number | null
  imageUrl: string
  status: string
}
