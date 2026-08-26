import http from '@/shared/api/http'
export interface ProductCategory { productCategoryId: string; categoryName: string; description?: string; status: string }
export interface PagedProductCategories { items: ProductCategory[]; page: number; pageSize: number; totalCount: number; totalPages: number }
export async function getProductCategories(params: { page: number; pageSize: number }) { const { data } = await http.get<PagedProductCategories>('/product-categories', { params }); return data }
export async function getProductCategory(id: string) { const { data } = await http.get<ProductCategory>(`/product-categories/${id}`); return data }
export async function createProductCategory(data: { categoryName: string; description: string }) { await http.post('/product-categories', data) }
export async function updateProductCategory(id: string, data: { categoryName: string; description: string; status: string }) { await http.put(`/product-categories/${id}`, data) }
export async function deleteProductCategory(id: string) { await http.delete(`/product-categories/${id}`) }
