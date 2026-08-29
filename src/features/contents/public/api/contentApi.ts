import http from '@/shared/api/http'
import type { PagedResult } from '@/shared/interface/PagedResult'

export interface ContentTag { tagId: string; tagName: string; status: string }
export interface PublicContent { contentId: string; shopId?: string; contentCategoryId: string; contentCategoryName?: string; districtId?: string; districtName?: string; subDistrictName?: string; shopName?: string; title: string; summary?: string; latitude?: number | null; longitude?: number | null; youtubeUrl?: string; status: string; publishedAt?: string; createdAt: string; tags: ContentTag[] }
export interface ContentCategory { contentCategoryId: string; categoryName: string }
export interface District { districtId: string; districtName: string }
export interface Tag { tagId: string; tagName: string }

export async function getPublicContents(params: { search?: string; categoryId?: string; districtId?: string; tagId?: string; page?: number; pageSize?: number }) { const { data } = await http.get<PagedResult<PublicContent>>('/contents', { params }); return data }
export async function getPublicContent(id: string) { const { data } = await http.get<PublicContent>(`/contents/${id}`); return data }
export async function getContentCategories() { const { data } = await http.get<PagedResult<ContentCategory>>('/content-categories', { params: { page: 1, pageSize: 100 } }); return data.items }
export async function getDistricts() { const { data } = await http.get<District[]>('/locations/districts'); return data }
export async function getTags() { const { data } = await http.get<Tag[]>('/tags'); return data }
export interface ContentSchedule { scheduleId: string; title: string; startDateTime: string; endDateTime?: string | null; address?: string | null; latitude?: number | null; longitude?: number | null; description?: string | null; status: string }
export async function getContentSchedules(contentId: string) { const { data } = await http.get<ContentSchedule[]>('/schedules', { params: { contentId } }); return data }
export interface ContentShopProduct { productId: string; shopId: string; productName: string; description?: string; price: number; quantity: number; imageUrl?: string }
export async function getContentShopProducts(contentId: string) { const { data } = await http.get<ContentShopProduct[]>(`/contents/${contentId}/shop-products`, { params: { take: 4 } }); return data }
export async function recordContentView(contentId: string) { await http.post(`/content-views/${contentId}`) }
export async function getContentFavoriteStatus(contentId: string) { const { data } = await http.get<{ isFavorite: boolean }>(`/content-favorites/${contentId}`); return data.isFavorite }
export async function addContentFavorite(contentId: string) { await http.post(`/content-favorites/${contentId}`) }
export async function removeContentFavorite(contentId: string) { await http.delete(`/content-favorites/${contentId}`) }
export interface ContentReview { reviewId: string; comment: string; userName: string; createdAt: string }
export interface ContentReviews { totalCount: number; reviews: ContentReview[] }
export async function getContentReviews(contentId: string) { const { data } = await http.get<ContentReviews>(`/content-reviews/${contentId}`); return data }
export async function getMyContentReview(contentId: string) { const { data } = await http.get<ContentReview>(`/content-reviews/mine/${contentId}`); return data }
export async function saveContentReview(contentId: string, data: { comment: string }) { const { data: result } = await http.post<ContentReview>(`/content-reviews/${contentId}`, data); return result }
export async function deleteContentReview(reviewId: string) { await http.delete(`/content-reviews/${reviewId}`) }
export async function createReport(data: { contentId?: string; reviewId?: string; reason: string; description?: string }) { await http.post('/reports', data) }
