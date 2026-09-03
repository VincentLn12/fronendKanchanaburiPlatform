import { ref } from 'vue'

export function usePagination(initialPageSize = 9) {
  const page = ref(1)
  const pageSize = ref(initialPageSize)
  const totalCount = ref(0)
  const totalPages = ref(1)

  function setPageResult(count: number, pages: number) {
    totalCount.value = count
    totalPages.value = pages
  }

  function resetPage() {
    page.value = 1
  }

  function prevPage(onLoad?: () => void) {
    if (page.value > 1) {
      page.value--
      onLoad?.()
    }
  }

  function nextPage(onLoad?: () => void) {
    if (page.value < totalPages.value) {
      page.value++
      onLoad?.()
    }
  }

  return {
    page,
    pageSize,
    totalCount,
    totalPages,
    setPageResult,
    resetPage,
    prevPage,
    nextPage,
  }
}
