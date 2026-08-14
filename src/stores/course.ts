import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getCourses } from '@/features/courses/services/courseService'
import { categoryService } from '@/features/admin/AdminCategoriesView/services/category.service'
import type { Course } from '@/features/courses/types/course'
import type { Category } from '@/features/admin/AdminCategoriesView/type/category'

export const useCourseStore = defineStore('course', () => {
  const courses = ref<Course[]>([])
  const categories = ref<Category[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string>('')

  const searchQuery = ref<string>('')
  const selectedLevel = ref<string>('ทั้งหมด')
  const sortBy = ref<string>('default')

  const filteredCourses = computed(() => {
    let list = [...courses.value]

    if (selectedLevel.value !== 'ทั้งหมด') {
      list = list.filter((c) => c.level === selectedLevel.value)
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter(
        (c) => c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q),
      )
    }

    if (sortBy.value === 'price-low') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortBy.value === 'price-high') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0))
    }

    return list
  })

  async function fetchCourses(forceRefresh = false) {
    if (courses.value.length > 0 && !forceRefresh) return
    isLoading.value = true
    error.value = ''
    try {
      courses.value = await getCourses()
    } catch (err: unknown) {
      error.value = 'โหลดข้อมูลคอร์สเรียนไม่สำเร็จ'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCategories(forceRefresh = false) {
    if (categories.value.length > 0 && !forceRefresh) return
    try {
      categories.value = await categoryService.getAll()
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  function resetFilters() {
    searchQuery.value = ''
    selectedLevel.value = 'ทั้งหมด'
    sortBy.value = 'default'
  }

  return {
    courses,
    categories,
    isLoading,
    error,
    searchQuery,
    selectedLevel,
    sortBy,
    filteredCourses,
    fetchCourses,
    fetchCategories,
    resetFilters,
  }
})
