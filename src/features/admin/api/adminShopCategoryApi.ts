import http from '@/shared/api/http'
export interface ShopCategory { shopCategoryId: string; categoryName: string; description?: string; status: string }
export async function getCategories() { const { data } = await http.get<ShopCategory[]>('/shop-categories'); return data }
export async function createCategory(data: { categoryName: string; description: string }) { const { data: result } = await http.post<ShopCategory>('/shop-categories', data); return result }
export async function updateCategory(id: string, data: { categoryName: string; description: string; status: string }) { await http.put(`/shop-categories/${id}`, data) }
export async function deleteCategory(id: string) { await http.delete(`/shop-categories/${id}`) }
