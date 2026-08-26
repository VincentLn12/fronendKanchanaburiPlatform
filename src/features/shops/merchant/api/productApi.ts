import http from '@/shared/api/http'
import type { Product, ProductCategory, ProductFormData } from '../../shared/types/product'

export async function getProducts() {
  const { data } = await http.get<Product[]>('/products')
  return data
}

export async function getProduct(id: string) {
  const { data } = await http.get<Product>(`/products/${id}`)
  return data
}

export async function getProductCategories() {
  const { data } = await http.get<{ items: ProductCategory[] }>('/product-categories', { params: { page: 1, pageSize: 100 } })
  return data.items.filter((item) => item.status === 'Active')
}

export async function createProduct(data: ProductFormData) {
  const { data: product } = await http.post<Product>('/products', data)
  return product
}

export async function updateProduct(id: string, data: ProductFormData) {
  await http.put(`/products/${id}`, data)
}

export async function removeProduct(id: string) {
  await http.delete(`/products/${id}`)
}

export async function uploadCoverImage(id: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await http.post<Product>(`/products/${id}/cover-image`, formData)
  return data
}

export async function uploadDetailImages(id: string, files: File[]) {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  await http.post(`/products/${id}/detail-images`, formData)
}
