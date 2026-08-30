import http from '@/shared/api/http'
import type { Product, ProductCategory } from '../../shared/types/product'

export async function getPublicProducts() {
  const { data } = await http.get<Product[]>('/products')
  return data
}

export async function getShopProducts(shopId: string) {
  return (await getPublicProducts()).filter((product) => product.shopId === shopId)
}

export async function getProductCategories() {
  const { data } = await http.get<{ items: ProductCategory[] }>('/product-categories', { params: { page: 1, pageSize: 100 } })
  return data.items.filter((category) => category.status === 'Active')
}

export async function getPublicProduct(id: string) {
  const { data } = await http.get<Product>(`/products/${id}`)
  return data
}

export interface ProductReview {
  reviewId: string
  userName: string
  rating: number
  comment: string
  reply?: string | null
  createdAt: string
}

export interface ProductReviews {
  totalCount: number
  averageRating: number
  reviews: ProductReview[]
}

export async function getProductReviews(productId: string) {
  const { data } = await http.get<ProductReviews>(`/product-reviews/${productId}`)
  return data
}
